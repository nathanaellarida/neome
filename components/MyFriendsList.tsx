import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Animated, Alert } from 'react-native';
import { getDoc, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { getDownloadURL, ref } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface UserData {
  id: string;
  name?: string;
  avatar?: string;
  avatarUrl?: string;
  level?: number;
  friends?: string[];
  [key: string]: any;
}

interface MyFriendsListProps {
  currentUserId: string;
  onViewProfile?: (userId: string) => void;
  onRemoveFriend?: (userId: string) => void;
}

const MyFriendsList: React.FC<MyFriendsListProps> = ({ 
  currentUserId, 
  onViewProfile, 
  onRemoveFriend
}) => {
  const router = useRouter();
  const [friends, setFriends] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [selectedFriendData, setSelectedFriendData] = useState<UserData | null>(null);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const slideAnimation = useState(new Animated.Value(0))[0];
  const fadeAnimation = useState(new Animated.Value(0))[0];

  const getAvatarUrl = async (avatarPath: string): Promise<string | undefined> => {
    try {
      const storageRef = ref(storage, avatarPath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error fetching avatar URL:', error);
      return undefined;
    }
  };

  const processUserData = async (userId: string, userData: any): Promise<UserData> => {
    const avatarUrl = userData.avatar ? await getAvatarUrl(userData.avatar) : undefined;
    return {
      id: userId,
      name: userData.name || '',
      avatar: userData.avatar || '',
      avatarUrl,
      level: userData.level || 0,
    };
  };

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
      if (!currentUserDoc.exists()) return;

      const userData = currentUserDoc.data();
      const friendIds: string[] = userData.friends || [];

      const friendPromises = friendIds.map(async (friendId) => {
        const friendDoc = await getDoc(doc(db, 'users', friendId));
        if (friendDoc.exists()) {
          return await processUserData(friendId, friendDoc.data());
        }
        return null;
      });

      const friendsDataRaw = await Promise.all(friendPromises);
      const friendsData = friendsDataRaw.filter((friend): friend is UserData => friend !== null);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [currentUserId]);

  useEffect(() => {
    if (menuVisible) {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      slideAnimation.setValue(0);
      fadeAnimation.setValue(0);
    }
  }, [menuVisible]);

  const handleMenuPress = (friendId: string) => {
    const friendData = friends.find(friend => friend.id === friendId) || null;
    setSelectedFriend(friendId);
    setSelectedFriendData(friendData);
    setMenuVisible(true);
  };

  const handleRemoveFriend = async () => {
    if (!selectedFriend) return;
    
    try {
      setIsRemoving(true);
      
      Alert.alert(
        "Remove Friend",
        `Are you sure you want to remove ${selectedFriendData?.name || 'this friend'}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setIsRemoving(false)
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              await updateDoc(doc(db, 'users', currentUserId), {
                friends: arrayRemove(selectedFriend)
              });
              
              await updateDoc(doc(db, 'users', selectedFriend), {
                friends: arrayRemove(currentUserId)
              });
              
              setFriends(prev => prev.filter(friend => friend.id !== selectedFriend));
              
              if (onRemoveFriend) {
                onRemoveFriend(selectedFriend);
              }
              
              Alert.alert("Success", "Friend removed successfully");
              setIsRemoving(false);
              setMenuVisible(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error removing friend:', error);
      Alert.alert("Error", "Failed to remove friend. Please try again.");
      setIsRemoving(false);
    }
  };

  const handleViewProfile = () => {
    if (selectedFriend && onViewProfile) {
      onViewProfile(selectedFriend);
    }
    setMenuVisible(false);
  };

  const handleSendMessage = async () => {
    if (!selectedFriend) {
      Alert.alert("Error", "Cannot send message at this time");
      return;
    }
  
    try {
      // Generate consistent chat ID (sorted user IDs)
      const sortedIds = [currentUserId, selectedFriend].sort();
      const potentialChatId = sortedIds.join('_');
      
      // Navigate with all necessary parameters
      router.push({
        pathname: '/messaging/ChatScreen',
        params: {
          chatId: potentialChatId,
          receiverId: selectedFriend,
          receiverName: selectedFriendData?.name || 'Friend',
          receiverAvatar: selectedFriendData?.avatarUrl || '',
          senderId: currentUserId,
          // Explicitly indicate we expect existing messages
          isExistingChat: 'true' 
        }
      });
      
      setMenuVisible(false);
    } catch (error) {
      console.error("Error preparing chat:", error);
      Alert.alert("Error", "Failed to start chat. Please try again.");
    }
  };

  const renderFriend = ({ item }: { item: UserData }) => {
    return (
      <View style={styles.friendItem}>
        <View style={styles.userInfo}>
          <Image
            source={item.avatarUrl ? { uri: item.avatarUrl } : require('../assets/images/default-avatar.png')}
            style={styles.avatar}
          />
          <View style={styles.userText}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userLevel}>Lv. {item.level}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => handleMenuPress(item.id)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#888" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6549FE" />
      </View>
    );
  }

  const translateY = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const opacity = fadeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>You have no friends yet 😢</Text>}
      />

      <Modal
        animationType="none"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={[
            styles.modalOverlay,
            { opacity: fadeAnimation }
          ]} 
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              { transform: [{ translateY }] }
            ]}
          >
            <View style={styles.menuHandle} />
            <View style={styles.menuContent}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={handleSendMessage}
                disabled={isRemoving}
              >
                <Ionicons name="chatbubble-outline" size={24} color="#6549FE" />
                <Text style={styles.menuText}>Send message</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={handleRemoveFriend}
                disabled={isRemoving}
              >
                <Ionicons name="person-remove-outline" size={24} color="#6549FE" />
                <Text style={styles.menuText}>
                  {isRemoving ? "Removing..." : "Remove friend"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={handleViewProfile}
                disabled={isRemoving}
              >
                <Ionicons name="person-outline" size={24} color="#6549FE" />
                <Text style={styles.menuText}>View profile</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAEAEA',
  },
  userText: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userLevel: {
    fontSize: 14,
    color: '#999',
    marginTop: 3,
  },
  menuButton: {
    padding: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 25,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    marginVertical: 15,
    alignSelf: 'center',
  },
  menuContent: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#444',
  },
});

export default MyFriendsList;