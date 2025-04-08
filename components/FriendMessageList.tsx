import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  avatarUrl: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface ChatListProps {
  onChatPress?: (chat: ChatItem) => void;
  searchQuery?: string;
}

const FriendMessageList: React.FC<ChatListProps> = ({ onChatPress, searchQuery }) => {
  const [chatData, setChatData] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded current user ID
  const currentUserId = '835YwhuoxRfs7y1g2DIQ';

  useEffect(() => {
    const q = query(collection(db, 'chats'), where('users', 'array-contains', currentUserId));
  
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsPromises = snapshot.docs.map(async (docSnap) => {
        const chat = docSnap.data();
        const chatId = docSnap.id;
  
        // Only show chats that have a lastMessage
        if (!chat.lastMessage) return null;

        // Find the other user in the chat
        const otherUserId = chat.users.find((id: string) => id !== currentUserId);
        if (!otherUserId) return null;

        try {
          // Get the other user's document
          const userDocRef = doc(db, 'users', otherUserId);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            console.warn('User document not found:', otherUserId);
            return null;
          }
          
          const userData = userDocSnap.data();
          
          // Get avatar URL from storage if available
          let avatarUrl = '';
          if (userData.avatar) {
            try {
              // Using the relative path directly as per your schema
              const avatarRef = ref(storage, userData.avatar);
              avatarUrl = await getDownloadURL(avatarRef);
            } catch (error) {
              console.warn('Failed to get avatar URL:', error);
            }
          }
          
          return {
            id: chatId,
            name: userData.name || 'Unknown',
            avatar: userData.avatar || '',
            avatarUrl,
            lastMessage: chat.lastMessage || '',
            time: chat.updatedAt?.toDate().toLocaleString() || '',
            unread: chat.unreadCounts?.[currentUserId] || 0,
            online: userData.online || false,
          };
        } catch (error) {
          console.error('Error fetching user data:', error);
          return null;
        }
      });

      // Wait for all promises to resolve
      const resolvedChats = await Promise.all(chatsPromises);
      
      // Filter out null values and set the chat data
      setChatData(resolvedChats.filter(chat => chat !== null) as ChatItem[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredChats = chatData.filter(chat =>
    chat.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const renderItem = ({ item }: { item: ChatItem }) => (
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
        {item.online && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.messageContainer}>
        <View style={styles.nameTimeRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={styles.message} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
});

export default FriendMessageList;