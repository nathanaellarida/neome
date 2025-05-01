import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

const { width } = Dimensions.get('window');

interface UserData {
  id: string;
  name?: string;
  avatar?: string;
  avatarUrl?: string;
  level?: number;
  online?: boolean;
  lastSeen?: any;
  friends?: string[];
  [key: string]: any;
}

interface FindFriendsProps {
  currentUserId: string;
  searchQuery: string;
}

const FindFriends: React.FC<FindFriendsProps> = ({ currentUserId, searchQuery }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);

  const getAvatarUrl = async (avatarPath: string) => {
    if (!avatarPath) return null;
    try {
      const storageRef = ref(storage, avatarPath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting avatar URL:', error);
      return null;
    }
  };

  const processUserData = async (userId: string, userData: any): Promise<UserData> => {
    let avatarUrl = null;
    if (userData.avatar) {
      avatarUrl = await getAvatarUrl(userData.avatar);
    }

    return {
      id: userId,
      name: userData.name || '',
      avatar: userData.avatar || '',
      avatarUrl: avatarUrl,
      level: userData.level || 0,
      friends: userData.friends || [],
      ...userData,
    };
  };

  const fetchSentFriendRequests = async () => {
    try {
      const sentRequestsIds: string[] = [];

      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const otherUsers = usersSnapshot.docs.filter(docSnap => docSnap.id !== currentUserId);

      const checkPromises = otherUsers.map(async (userDoc) => {
        const friendRequestsRef = collection(db, 'users', userDoc.id, 'friendRequests');
        const requestsSnapshot = await getDocs(friendRequestsRef);

        if (!requestsSnapshot.empty) {
          requestsSnapshot.forEach((requestDoc) => {
            const requestData = requestDoc.data();
            if (requestData.from === currentUserId && requestData.status === 'pending') {
              sentRequestsIds.push(userDoc.id);
            }
          });
        }
      });

      await Promise.all(checkPromises);
      setPendingRequests(sentRequestsIds);
    } catch (error) {
      console.error('Error fetching sent friend requests:', error);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (!currentUserId) {
          console.error("No current user ID provided");
          return;
        }
        
        console.log("Fetching current user with ID:", currentUserId);
        const userDoc = await getDoc(doc(db, 'users', currentUserId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const processedUser = await processUserData(currentUserId, userData);
          setCurrentUser(processedUser);
          console.log("Current user set:", processedUser.name);
        } else {
          console.error("Current user document not found");
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    if (currentUserId) {
      fetchCurrentUser();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUser) {
      fetchPotentialFriends();
      fetchSentFriendRequests();
    }
  }, [currentUser]);

  useEffect(() => {
    if (searchQuery && currentUser) {
      handleSearch();
    } else if (currentUser) {
      fetchPotentialFriends();
    }
  }, [searchQuery, currentUser]);

  const fetchPotentialFriends = async () => {
    setLoading(true);
    try {
      if (!currentUserId) {
        console.error("No current user ID available for fetching potential friends");
        return;
      }
      
      console.log("Fetching potential friends, excluding current user:", currentUserId);
      
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      const friendsList = currentUser?.friends || [];

      const potentialFriendsPromises: Promise<UserData>[] = [];
      snapshot.forEach((docSnap) => {
        // Explicitly filter out the current user
        if (docSnap.id !== currentUserId && !friendsList.includes(docSnap.id)) {
          potentialFriendsPromises.push(processUserData(docSnap.id, docSnap.data()));
        }
      });

      const potentialFriends = await Promise.all(potentialFriendsPromises);
      console.log(`Found ${potentialFriends.length} potential friends`);
      setUsers(potentialFriends);
    } catch (error) {
      console.error('Error fetching potential friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (!currentUserId) {
        console.error("No current user ID available for search");
        return;
      }
      
      console.log("Searching users with query:", searchQuery);
      
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      const friendsList = currentUser?.friends || [];
      const query = searchQuery.toLowerCase();

      const filteredUsersPromises: Promise<UserData>[] = [];
      snapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        if (
          docSnap.id !== currentUserId &&  // Ensure current user is excluded
          !friendsList.includes(docSnap.id) &&
          userData.name &&
          userData.name.toLowerCase().includes(query)
        ) {
          filteredUsersPromises.push(processUserData(docSnap.id, userData));
        }
      });

      const filteredUsers = await Promise.all(filteredUsersPromises);
      console.log(`Found ${filteredUsers.length} users matching search query`);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (recipientUserId: string) => {
    try {
      const friendRequestsRef = collection(db, 'users', recipientUserId, 'friendRequests');
      await addDoc(friendRequestsRef, {
        from: currentUserId,
        status: 'pending',
        sentAt: serverTimestamp(),
      });

      setPendingRequests(prev => [...prev, recipientUserId]);
      console.log(`Friend request sent to ${recipientUserId}`);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const cancelFriendRequest = async (recipientUserId: string) => {
    try {
      const friendRequestsRef = collection(db, 'users', recipientUserId, 'friendRequests');
      const q = query(friendRequestsRef, where('from', '==', currentUserId), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);

      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);

      setPendingRequests(prev => prev.filter(id => id !== recipientUserId));
      console.log(`Friend request to ${recipientUserId} cancelled.`);
    } catch (error) {
      console.error('Error cancelling friend request:', error);
    }
  };

  const renderUserItem = ({ item }: { item: UserData }) => {
    const isFriend = currentUser?.friends?.includes(item.id) || false;
    const isPending = pendingRequests.includes(item.id);
    const level = item.level || 0;

    return (
      <View style={styles.userItemContainer}>
        <View style={styles.userInfo}>
          <Image
            source={
              item.avatarUrl
                ? { uri: item.avatarUrl }
                : require('../assets/images/default-avatar.png')
            }
            style={styles.avatar}
          />
          <View style={styles.userTextInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userLevel}>Lv. {level}</Text>
          </View>
        </View>

        {!isFriend && !isPending && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => sendFriendRequest(item.id)}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}

        {isPending && (
          <TouchableOpacity
            style={styles.requestedButton}
            onPress={() => cancelFriendRequest(item.id)}>
            <Text style={styles.requestedButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        {isFriend && (
          <View style={styles.addedButton}>
            <Text style={styles.addedButtonText}>Added</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6549FE" />
      </View>
    );
  }

  if (!currentUserId) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.emptyListText}>No authenticated user found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      renderItem={renderUserItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <Text style={styles.emptyListText}>No users found</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  userItemContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
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
  userTextInfo: {
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
  addButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addedButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6549FE',
  },
  addedButtonText: {
    color: '#6549FE',
    fontWeight: 'bold',
    fontSize: 14,
  },
  requestedButton: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestedButtonText: {
    color: '#999',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});

export default FindFriends;