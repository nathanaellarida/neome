import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { collection, query, where, onSnapshot, getDoc, doc, getDocs, updateDoc, Query, QuerySnapshot, DocumentSnapshot } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, storage } from "../firebaseConfig";
import { useRouter } from "expo-router";
import { AppState } from "react-native";

interface Friend {
  id: string;
  name: string;
  avatarUrl: string;
  avatarPath: string;
  online: boolean;
}

const ActiveAvatarList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();

  // Update user's online status

useEffect(() => {
  const updateOnlineStatus = async (isOnline: boolean) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        online: isOnline
      });
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  };

  // Set online status when component mounts
  updateOnlineStatus(true);

  // Setup auth state listener
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      updateOnlineStatus(true);
    }
  });

  // Set up AppState event listener for React Native
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      updateOnlineStatus(false);
    } else if (nextAppState === 'active') {
      updateOnlineStatus(true);
    }
  });

  return () => {
    updateOnlineStatus(false);
    unsubscribeAuth();
    subscription.remove(); // Clean up the AppState listener
  };
}, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // Get current user from Firebase Auth
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          console.warn("No authenticated user found");
          setLoading(false);
          return;
        }
        
        const currentUserId = currentUser.uid;
        const userDocRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        let friendIds: string[] = userData.friends || [];

        if (friendIds.length === 0) {
          setFriends([]);
          setLoading(false);
          return;
        }

        const batchSize = 10;
        const allFriends: Friend[] = [];
        const unsubscribeFns: (() => void)[] = [];

        while (friendIds.length > 0) {
          const batch = friendIds.splice(0, batchSize);
          const friendsQuery = query(
            collection(db, "users"),
            where("__name__", "in", batch)
          );

          const unsubscribe = onSnapshot(friendsQuery, async (snapshot: QuerySnapshot) => {
            const friendsData: Friend[] = await Promise.all(
              snapshot.docs.map(async (docSnap: DocumentSnapshot) => {
                const data = docSnap.data();
                if (!data) {
                  return {
                    id: docSnap.id,
                    name: "Unknown",
                    avatarUrl: "",
                    avatarPath: "",
                    online: false,
                  };
                }
                let avatarUrl = "";
                if (data.avatar) {
                  try {
                    const avatarRef = ref(storage, data.avatar);
                    avatarUrl = await getDownloadURL(avatarRef);
                  } catch (error) {
                    console.warn("Failed to get avatar URL:", error);
                  }
                }

                return {
                  id: docSnap.id,
                  name: data.name || "Unknown",
                  avatarUrl,
                  avatarPath: data.avatar || "",
                  online: data.online || false,
                };
              })
            );

            allFriends.push(...friendsData);

            const sorted = allFriends.sort((a, b) => {
              if (a.online !== b.online) return a.online ? -1 : 1;
              return a.name.localeCompare(b.name);
            });

            setFriends(sorted);
            setLoading(false);
          });

          unsubscribeFns.push(unsubscribe);
        }

        return () => unsubscribeFns.forEach((fn) => fn());
      } catch (error) {
        console.error("Error fetching friends:", error);
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleAvatarPress = async (friend: Friend) => {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        Alert.alert("Error", "You need to be logged in to access chats");
        return;
      }
      
      const currentUserId = currentUser.uid;
      const chatId1 = `${currentUserId}_${friend.id}`;
      const chatId2 = `${friend.id}_${currentUserId}`;

      const chatSnapshot1 = await getDoc(doc(db, "chats", chatId1));
      const chatSnapshot2 = await getDoc(doc(db, "chats", chatId2));

      let existingChatId = null;

      if (chatSnapshot1.exists()) {
        existingChatId = chatId1;
      } else if (chatSnapshot2.exists()) {
        existingChatId = chatId2;
      }

      if (!existingChatId) {
        const chatsQuery = query(
          collection(db, "chats"),
          where("users", "array-contains", currentUserId)
        );

        const chatsSnapshot = await getDocs(chatsQuery);
        chatsSnapshot.forEach((docSnap) => {
          const chatData = docSnap.data();
          if (chatData.users && chatData.users.includes(friend.id)) {
            existingChatId = docSnap.id;
          }
        });
      }

      router.push({
        pathname: "/messaging/ChatScreen",
        params: {
          chatId: existingChatId,
          receiverId: friend.id,
          receiverName: friend.name,
          receiverAvatar: friend.avatarPath,
          senderId: currentUserId,
        },
      } as any);
    } catch (error) {
      console.error("Error handling chat navigation:", error);
      Alert.alert("Error", "Failed to open chat. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#6549FE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleAvatarPress(item)}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                {item.avatarUrl ? (
                  <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.placeholderAvatar]} />
                )}
                {item.online ? (
                  <View style={styles.onlineIndicator} />
                ) : (
                  <View style={styles.offlineIndicator} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.avatar, styles.placeholderAvatar]} />
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    minHeight: 70,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatarWrapper: {
    position: "relative",
    width: 50,
    height: 50,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  placeholderAvatar: {
    backgroundColor: "#E1E1E1",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: "green",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  offlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: "#bbbbbb",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  emptyContainer: {
    opacity: 0.5,
  },
});

export default ActiveAvatarList;