import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';

type Friend = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  level?: number;
  online?: boolean;
  lastSeen?: { toDate: () => Date; } | null;
  avatarUrl?: string;
};

type FriendSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectFriends: (selectedFriends: Friend[]) => void;
  currentFriends: Friend[];
};

const { width } = Dimensions.get('window');

export default function FriendSelectionModal({
  visible,
  onClose,
  onSelectFriends,
  currentFriends,
}: FriendSelectionModalProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>(currentFriends);
  const [loading, setLoading] = useState(true);

  const getAvatarUrl = async (avatarPath: string): Promise<string | undefined> => {
    if (!avatarPath || avatarPath.startsWith('http')) return avatarPath;
    try {
      const storageRef = ref(storage, avatarPath);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error getting avatar URL:', error);
      return undefined;
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.error('No current user found');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        console.error('User document not found');
        return;
      }

      const userData = userDoc.data();
      const friendIds = userData.friends || [];

      const fetchedFriends: Friend[] = [];
      for (const friendId of friendIds) {
        const friendDoc = await getDoc(doc(db, 'users', friendId));
        if (friendDoc.exists()) {
          const friendData = friendDoc.data();
          const avatarUrl = await getAvatarUrl(friendData.avatar);
          fetchedFriends.push({
            id: friendDoc.id,
            name: friendData.name,
            avatar: friendData.avatar || '',
            avatarUrl: avatarUrl,
            email: friendData.email || '',
            level: friendData.level || Math.floor(Math.random() * 100) + 1,
            online: friendData.online || false,
            lastSeen: friendData.lastSeen || null,
          });
        }
      }

      setFriends(fetchedFriends);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friend: Friend) => {
    setSelectedFriends((prev) => {
      const isSelected = prev.some((f) => f.id === friend.id);
      if (isSelected) {
        return prev.filter((f) => f.id !== friend.id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const handleConfirm = () => {
    onSelectFriends(selectedFriends);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Friends</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading friends...</Text>
            </View>
          ) : friends.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text>No friends found</Text>
            </View>
          ) : (
            <ScrollView style={styles.friendsList}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => toggleFriendSelection(friend)}
                >
                  <View style={styles.friendInfo}>
                    <Image
                      source={
                        friend.avatarUrl
                          ? { uri: friend.avatarUrl }
                          : require('../../assets/images/default-avatar.png')
                      }
                      style={styles.avatar}
                      defaultSource={require('../../assets/images/default-avatar.png')}
                    />
                    <View style={styles.profileInfo}>
                      <View style={styles.onlineStatus}>
                        <View style={[styles.onlineIndicator, { backgroundColor: friend.online ? '#4CAF50' : '#757575' }]} />
                        <Text style={styles.onlineText}>
                          {friend.online ? 'Online' : friend.lastSeen ? `Last seen ${formatLastSeen(friend.lastSeen.toDate())}` : 'Offline'}
                        </Text>
                      </View>
                      <View style={styles.nameContainer}>
                        <Text style={styles.friendName}>{friend.name}</Text>
                        <Text style={styles.levelText}>Lv.{friend.level}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.checkmarkContainer}
                    onPress={() => toggleFriendSelection(friend)}
                  >
                    <Ionicons 
                      name={selectedFriends.some((f) => f.id === friend.id) ? "checkmark-circle" : "checkmark-circle-outline"} 
                      size={28} 
                      color="#6549FE" 
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const formatLastSeen = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return `${days}d ago`;
  }
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: width * 0.9,
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6549FE',
    marginBottom: 20,
    textAlign: 'left',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  friendsList: {
    maxHeight: 400,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: '#666666',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  levelText: {
    fontSize: 14,
    color: '#666666',
  },
  checkmarkContainer: {
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6549FE',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#6549FE',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6549FE',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 