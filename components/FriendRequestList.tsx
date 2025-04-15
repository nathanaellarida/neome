import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import { db, storage } from '../firebaseConfig'; // Your Firebase config

interface FriendRequest {
  id: string;
  from: string;
  status: string;
  sentAt: Timestamp;
}

interface UserData {
  name: string;
  avatar: string;
  level?: number;
  friends?: string[];
}

interface FriendRequestListProps {
  currentUserId: string;
}

const FriendRequestList: React.FC<FriendRequestListProps> = ({ currentUserId }) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        console.log("Fetching friend requests for user:", currentUserId);
        const ref = collection(db, 'users', currentUserId, 'friendRequests');
        const snapshot = await getDocs(ref);
        console.log("Total documents found:", snapshot.docs.length);
        
        const reqs: FriendRequest[] = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          console.log("Request data:", data);
          if (data.status === 'pending') {
            reqs.push({ id: docSnap.id, ...data } as FriendRequest);
          }
        }

        console.log("Filtered pending requests:", reqs.length);
        setRequests(reqs);

        const userMap: Record<string, UserData> = {};

        await Promise.all(
          reqs.map(async (req) => {
            try {
              const userDocRef = doc(db, 'users', req.from);
              const userDocSnap = await getDoc(userDocRef);

              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const avatarPath = userData.avatar;
                
                try {
                  const avatarUrl = await getDownloadURL(storageRef(storage, avatarPath));
                  
                  userMap[req.from] = {
                    name: userData.name,
                    avatar: avatarUrl,
                    friends: userData.friends || [],
                    level: userData.level || Math.floor(Math.random() * 100), // Use real level if exists
                  };
                } catch (storageError) {
                  console.error("Error getting avatar URL:", storageError);
                  // Use a placeholder if avatar can't be loaded
                  userMap[req.from] = {
                    name: userData.name || 'Unknown User',
                    avatar: 'https://via.placeholder.com/100',
                    friends: userData.friends || [],
                    level: userData.level || Math.floor(Math.random() * 100),
                  };
                }
              }
            } catch (userError) {
              console.error("Error fetching user data:", userError);
            }
          })
        );

        setUsers(userMap);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
        setError("Failed to load friend requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentUserId]);

  const handleConfirm = async (request: FriendRequest) => {
    try {
      const fromId = request.from;

      const userRef = doc(db, 'users', currentUserId);
      const fromRef = doc(db, 'users', fromId);

      const currentUserSnap = await getDoc(userRef);
      const fromUserSnap = await getDoc(fromRef);

      const currentFriends = currentUserSnap.exists() ? currentUserSnap.data().friends || [] : [];
      const fromFriends = fromUserSnap.exists() ? fromUserSnap.data().friends || [] : [];

      await updateDoc(userRef, {
        friends: [...new Set([...currentFriends, fromId])],
      });

      await updateDoc(fromRef, {
        friends: [...new Set([...fromFriends, currentUserId])],
      });

      const reqDocRef = doc(db, 'users', currentUserId, 'friendRequests', request.id);
      await deleteDoc(reqDocRef);

      setRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (error) {
      console.error("Error confirming friend request:", error);
      // Optionally show an error message to the user
    }
  };

  const renderItem = ({ item }: { item: FriendRequest }) => {
    const user = users[item.from];
    if (!user) return null;
    
    return (
      <View style={styles.card}>
        <Image source={{ uri: user?.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.level}>Lv. {user?.level}</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm(item)}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
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

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No friend requests at this time</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  level: {
    fontSize: 14,
    color: '#999',
  },
  confirmButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default FriendRequestList;