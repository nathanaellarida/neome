import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, FlatList, 
  ActivityIndicator, Alert, AppState, Animated 
} from 'react-native';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, storage } from '../firebaseConfig';
import { debounce } from 'lodash';

// Type declarations for lodash
import * as _ from 'lodash';

// New component for typing indicator animation
const TypingIndicator = () => {
  // Create animation values for each dot
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  // Function to animate the dots
  const animateDots = useCallback(() => {
    // Reset all dots to low opacity
    dot1Opacity.setValue(0.3);
    dot2Opacity.setValue(0.3);
    dot3Opacity.setValue(0.3);

    // Sequence of animations
    Animated.sequence([
      // First dot
      Animated.timing(dot1Opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      // Second dot
      Animated.timing(dot2Opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      // Third dot
      Animated.timing(dot3Opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      // Loop the animation
      animateDots();
    });
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  // Start animation on component mount
  useEffect(() => {
    animateDots();
    
    // Cleanup
    return () => {
      dot1Opacity.stopAnimation();
      dot2Opacity.stopAnimation();
      dot3Opacity.stopAnimation();
    };
  }, [animateDots]);

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, { opacity: dot1Opacity }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot2Opacity }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot3Opacity }]} />
    </View>
  );
};

interface ChatItem {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  avatarUrl: string;
  lastMessage: string;
  time: string;
  timestamp: Date;
  unread: number;
  online: boolean;
  
  // New field for typing indicator
  isTyping?: boolean;
}

interface ChatListProps {
  onChatPress?: (chat: ChatItem) => void;
  searchQuery?: string;
}

const FriendMessageList: React.FC<ChatListProps> = ({ onChatPress, searchQuery }) => {
  const [chatData, setChatData] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  
  // Reference to store the latest chatData to avoid stale closure issues
  const chatDataRef = useRef<ChatItem[]>([]);
  useEffect(() => {
    chatDataRef.current = chatData;
  }, [chatData]);

  // Debounced setChatData to prevent flickering
  const debouncedSetChatData = useCallback(
    debounce((newData: ChatItem[]) => {
      setChatData(newData);
    }, 100),
    []
  );

  // Update user's online status
  useEffect(() => {
    const updateOnlineStatus = async (isOnline: boolean) => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { online: isOnline });
      } catch (error) {
        console.error("Error updating online status:", error);
      }
    };
  
    // Set online status when component mounts
    updateOnlineStatus(true);
  
    // Setup auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) updateOnlineStatus(true);
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
      subscription.remove();
    };
  }, [auth]);

  // Cache for user data to avoid too many Firestore reads
  const userDataCache = useRef<Record<string, any>>({}).current;

  // Helper function to get user data (with caching)
  const getUserData = async (userId: string) => {
    if (userDataCache[userId]) return userDataCache[userId];
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      console.warn('User document not found:', userId);
      return null;
    }
    const userData = userDocSnap.data();
    userDataCache[userId] = userData;
    return userData;
  };

  // Helper function to get avatar URL
  const getAvatarUrl = async (avatarPath: string) => {
    if (!avatarPath) return '';
    try {
      const avatarRef = ref(storage, avatarPath);
      return await getDownloadURL(avatarRef);
    } catch (error) {
      console.warn('Failed to get avatar URL:', error);
      return '';
    }
  };

  // Fetch chats data using Firestore onSnapshot
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn("No authenticated user found");
      setLoading(false);
      Alert.alert("Authentication Error", "Please sign in to view your messages");
      return () => {};
    }
    const currentUserId = currentUser.uid;
    
    // This set will track all users we need to monitor
    const usersToTrack = new Set<string>();
    
    // Query for chats
    const q = query(collection(db, 'chats'), where('users', 'array-contains', currentUserId));
    
    // Main snapshot listener for chats
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          // Process document changes (added or modified)
          const changedDocs = snapshot.docChanges().filter(
            change => change.type === 'modified' || change.type === 'added'
          );
          
          // Track if we need to update our usersToTrack set
          let userListChanged = false;
          
          if (changedDocs.length > 0) {
            const updatedChats = [...chatDataRef.current];
            
            for (const change of changedDocs) {
              const chatDoc = change.doc;
              const chatDataFirestore = chatDoc.data();
              const chatId = chatDoc.id;
              
              // Use empty string fallback if lastMessage doesn't exist
              const lastMessageText = chatDataFirestore.lastMessage || "";
              
              // Determine the other user (in a 1-on-1 chat)
              const otherUserId = chatDataFirestore.users.find((id: string) => id !== currentUserId);
              if (!otherUserId) continue;
              
              // Track this user
              if (!usersToTrack.has(otherUserId)) {
                usersToTrack.add(otherUserId);
                userListChanged = true;
              }
              
              // Retrieve user data and avatar URL
              const userData = await getUserData(otherUserId);
              if (!userData) continue;
              const avatarUrl = await getAvatarUrl(userData.avatar || '');
              const timestamp = chatDataFirestore.updatedAt ? chatDataFirestore.updatedAt.toDate() : new Date(0);
              
              // Check typing status from Firestore
              const typingUsers = chatDataFirestore.typingUsers || {};
              const isTyping = !!typingUsers[otherUserId];
              
              const newChatItem: ChatItem = {
                id: chatId,
                userId: otherUserId,
                name: userData.name || 'Unknown',
                avatar: userData.avatar || '',
                avatarUrl,
                lastMessage: lastMessageText,
                time: timestamp.toLocaleString(),
                timestamp: timestamp,
                unread: chatDataFirestore.unreadCounts?.[currentUserId] || 0,
                online: userData.online || false,
                isTyping: isTyping,
              };
              
              const existingIndex = updatedChats.findIndex(chat => chat.id === chatId);
              if (existingIndex !== -1) {
                updatedChats[existingIndex] = newChatItem;
              } else {
                updatedChats.push(newChatItem);
              }
            }
            
            // Sort chats by timestamp (most recent first)
            const sortedChats = updatedChats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            debouncedSetChatData(sortedChats);
          }
          
          // Full refresh logic
          const processAllDocs = async () => {
            const allUserIds = new Set<string>();
            const chatsPromises = snapshot.docs.map(async (docSnap) => {
              const chat = docSnap.data();
              const chatId = docSnap.id;
              // Use empty string fallback if lastMessage doesn't exist
              const lastMessageText = chat.lastMessage || "";
              const otherUserId = chat.users.find((id: string) => id !== currentUserId);
              if (!otherUserId) return null;
              
              // Track this user
              allUserIds.add(otherUserId);
              
              try {
                const userData = await getUserData(otherUserId);
                if (!userData) return null;
                const avatarUrl = await getAvatarUrl(userData.avatar || '');
                const timestamp = chat.updatedAt ? chat.updatedAt.toDate() : new Date(0);
                const typingUsers = chat.typingUsers || {};
                const isTyping = !!typingUsers[otherUserId];
                return {
                  id: chatId,
                  userId: otherUserId,
                  name: userData.name || 'Unknown',
                  avatar: userData.avatar || '',
                  avatarUrl,
                  lastMessage: lastMessageText,
                  time: timestamp.toLocaleString(),
                  timestamp: timestamp,
                  unread: chat.unreadCounts?.[currentUserId] || 0,
                  online: userData.online || false,
                  isTyping: isTyping,
                } as ChatItem;
              } catch (error) {
                console.error('Error fetching user data:', error);
                return null;
              }
            });
            
            const resolvedChats = await Promise.all(chatsPromises);
            const filteredChats = resolvedChats.filter(chat => chat !== null) as ChatItem[];
            const sortedChats = filteredChats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setChatData(sortedChats);
            
            // Update users to track
            allUserIds.forEach(id => usersToTrack.add(id));
            return Array.from(allUserIds).length > 0;
          };
          
          if (chatDataRef.current.length === 0 || snapshot.metadata.fromCache) {
            userListChanged = await processAllDocs() || userListChanged;
          }
          
          setLoading(false);
          
          // If our user list changed, we need to refresh our online status listener
          if (userListChanged) {
            refreshOnlineStatusListener(); // Call the function directly
          }
        } catch (error) {
          console.error("Error in chat snapshot processing:", error);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error in chat snapshot listener:", error);
        setLoading(false);
      }
    );
    
    // Function to set up the online status listener
    let unsubscribeUsers: (() => void) | null = null;
    
    const setupOnlineStatusListener = () => {
      // Clean up previous listener if exists
      if (unsubscribeUsers) {
        unsubscribeUsers();
        unsubscribeUsers = null;
      }
      
      const userIds = Array.from(usersToTrack);
      if (userIds.length === 0) return null;
      
      // Firestore supports up to 10 items in an 'in' query, so batch as needed
      const listeners: (() => void)[] = [];
      
      for (let i = 0; i < userIds.length; i += 10) {
        const batch = userIds.slice(i, i + 10);
        if (batch.length === 0) continue;
        
        const usersQuery = query(collection(db, 'users'), where('__name__', 'in', batch));
        const unsubscribe = onSnapshot(usersQuery, (usersSnapshot) => {
          if (usersSnapshot.empty) return;
          
          // Get updated chat data to merge with online status
          const currentChats = [...chatDataRef.current];
          let hasUpdates = false;
          
          usersSnapshot.forEach(userDoc => {
            const userData = userDoc.data();
            const userId = userDoc.id;
            const online = userData.online || false;
            
            // Update in cache
            if (userDataCache[userId]) {
              userDataCache[userId].online = online;
            }
            
            // Update in chat data
            const affectedChats = currentChats.filter(chat => chat.userId === userId);
            affectedChats.forEach(chat => {
              if (chat.online !== online) {
                chat.online = online;
                hasUpdates = true;
              }
            });
          });
          
          // Only update state if there were actual changes
          if (hasUpdates) {
            const sortedChats = [...currentChats].sort((a, b) => 
              b.timestamp.getTime() - a.timestamp.getTime()
            );
            debouncedSetChatData(sortedChats);
          }
        }, 
        (error) => {
          console.error("Error in online status listener:", error);
        });
        
        listeners.push(unsubscribe);
      }
      
      // Return function to clean up all listeners
      if (listeners.length > 0) {
        return () => {
          listeners.forEach(unsubscribe => unsubscribe());
        };
      }
      
      return null;
    };
    
    // Function to refresh online status listener when user list changes
    const refreshOnlineStatusListener = () => {
      if (unsubscribeUsers) {
        unsubscribeUsers();
      }
      unsubscribeUsers = setupOnlineStatusListener();
    };
    
    // Clean up all listeners when component unmounts
    return () => {
      unsubscribe();
      if (unsubscribeUsers) {
        unsubscribeUsers();
      }
    };
  }, [auth, debouncedSetChatData]);

  // Filter chats based on search query (if provided)
  const filteredChats = searchQuery 
    ? chatData.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : chatData;

  const renderItem = ({ item }: { item: ChatItem }) => {
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => onChatPress && onChatPress(item)}
      >
        <View style={styles.avatarContainer}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
          )}
          {item.online ? (
            <View style={styles.onlineIndicator} />
          ) : (
            <View style={styles.offlineIndicator} />
          )}
        </View>

        <View style={styles.messageContainer}>
          <View style={styles.nameTimeRow}>
            <Text style={[styles.name, item.unread > 0 && styles.unreadName]}>
              {item.name}
            </Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          
          <View style={styles.messageRow}>
            {item.isTyping ? (
              <TypingIndicator />
            ) : (
              <Text 
                style={[styles.message, item.unread > 0 && styles.unreadMessage]} 
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            )}
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6549FE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredChats}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No chats found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    backgroundColor: 'green',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  offlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    backgroundColor: '#bbbbbb',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  unreadName: {
    color: '#000000',
    fontWeight: '900',
  },
  time: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666666',
    width: '85%',
  },
  unreadMessage: {
    color: '#000000',
    fontWeight: 'bold',
  },
  unreadBadge: {
    backgroundColor: '#6549FE',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#A0A0A0',
    marginTop: 20,
    fontSize: 16,
  },
  // New styles for typing indicator
  typingContainer: {
    left: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666666',
    marginRight: 4
  }
});

export default FriendMessageList;