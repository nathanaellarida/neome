import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView,
  Platform, StyleSheet, Image, Dimensions, ActivityIndicator,
} from 'react-native';
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp,
  updateDoc, doc, arrayUnion, getDoc, setDoc, DocumentReference, getDocs,
} from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getDownloadURL, ref } from 'firebase/storage';

const { width } = Dimensions.get('window');
const BACK_BUTTON = require('../assets/images/backPurple.png');
const DEFAULT_AVATAR = require('../../assets/images/default-avatar.png');

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp?: { toDate: () => Date; } | null;
  readBy: string[];
}

interface FriendProfile {
  id: string;
  name: string;
  avatar: string | null;
  online: boolean;
  lastSeen: { toDate: () => Date; } | null;
}

const ChatScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const passedChatId = params.chatId as string;
  const receiverId = params.receiverId as string;
  const receiverName = params.receiverName as string;
  const receiverAvatar = params.receiverAvatar as string;
  const senderId = params.senderId as string;
  const existingLastMessage = params.existingLastMessage as string;

  const [chatId, setChatId] = useState<string>(passedChatId || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [friendProfile, setFriendProfile] = useState<FriendProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const currentUserId = senderId || '835YwhuoxRfs7y1g2DIQ';

  useEffect(() => {
    const initialize = async () => {
      try {
        // If chatId was passed in params, use it directly
        if (passedChatId) {
          setChatId(passedChatId);
        } 
        // Otherwise, find or create a chat between these users
        else if (currentUserId && receiverId) {
          const potentialChatId = [currentUserId, receiverId].sort().join('_');
          const chatDocRef = doc(db, 'chats', potentialChatId);
          const chatDocSnap = await getDoc(chatDocRef);
          
          if (chatDocSnap.exists()) {
            setChatId(potentialChatId);
          } else {
            // Create new chat if it doesn't exist
            await setDoc(chatDocRef, {
              users: [currentUserId, receiverId],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              lastMessage: '',
              lastSender: '',
              unreadCounts: {
                [currentUserId]: 0,
                [receiverId]: 0
              }
            });
            setChatId(potentialChatId);
          }
        }
        
        await setupProfile();
      } catch (err) {
        console.error("Error during initialization:", err);
      }
    };

    initialize();
  }, [passedChatId, receiverId, currentUserId]);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [chatId]);

  const setupProfile = async () => {
    try {
      if (receiverId && receiverName) {
        setFriendProfile({
          id: receiverId,
          name: receiverName,
          avatar: receiverAvatar || null,
          online: false,
          lastSeen: null,
        });

        if (receiverAvatar && (receiverAvatar.startsWith('http') || receiverAvatar.startsWith('data:')))
          {
          setAvatarUrl(receiverAvatar);
          setAvatarError(false);
        } 
        else if (receiverAvatar && receiverAvatar.length > 0) {
          try {
            const avatarRef = ref(storage, receiverAvatar);
            const url = await getDownloadURL(avatarRef);
            setAvatarUrl(url);
            setAvatarError(false);
          } catch (err) {
            console.error("Error getting avatar download URL:", err);
            setAvatarError(true);
          }
        }

        await fetchAdditionalProfileInfo();
      } else if (chatId) {
        await fetchFriendProfile();
      }
    } catch (err) {
      console.error('Error setting up profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAdditionalProfileInfo = async () => {
    if (!receiverId) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', receiverId));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        setFriendProfile(prev => ({
          ...prev!,
          online: userData.online || false,
          lastSeen: userData.lastSeen || null,
          avatar: prev?.avatar || userData.avatar || null,
        }));

        if (!avatarUrl && !avatarError && userData.avatar) {
          try {
            const avatarRef = ref(storage, userData.avatar);
            const url = await getDownloadURL(avatarRef);
            setAvatarUrl(url);
          } catch (err) {
            console.error("Error getting avatar from additional info:", err);
            setAvatarError(true);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching additional profile info:', err);
    }
  };

  const fetchFriendProfile = async () => {
    if (!chatId) return;

    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) return;

      const chatData = chatDoc.data();
      const friendId = chatData.users.find((userId: string) => userId !== currentUserId);

      if (!friendId) return;

      const userDoc = await getDoc(doc(db, 'users', friendId));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();

      setFriendProfile({
        id: friendId,
        name: userData.name,
        avatar: userData.avatar,
        online: userData.online || false,
        lastSeen: userData.lastSeen || null,
      });

      if (userData.avatar) {
        try {
          const avatarRef = ref(storage, userData.avatar);
          const url = await getDownloadURL(avatarRef);
          setAvatarUrl(url);
          setAvatarError(false);
        } catch (err) {
          console.error("Error getting avatar from friend profile:", err);
          setAvatarError(true);
        }
      }
    } catch (err) {
      console.error('Error fetching friend profile:', err);
    }
  };

  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const chatDocRef = doc(db, 'chats', chatId);
      const chatDocSnap = await getDoc(chatDocRef);
      
      if (chatDocSnap.exists()) {
        const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const msgs: Message[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            timestamp: data.timestamp,
            readBy: data.readBy || [],
          };
        });
        
        setMessages(msgs);
        
        if (msgs.length > 0) {
          await markMessagesAsRead(querySnapshot.docs);
          
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const subscribeToMessages = () => {
    if (!chatId) return;

    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs: Message[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          timestamp: data.timestamp,
          readBy: data.readBy || [],
        };
      });

      setMessages(msgs);

      if (msgs.length > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        
        markMessagesAsRead(snapshot.docs);
      }
    });

    return unsubscribe;
  };

  const markMessagesAsRead = async (messageDocs: any[]) => {
    if (!chatId) return;

    try {
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        [`unreadCounts.${currentUserId}`]: 0
      });

      for (const messageDoc of messageDocs) {
        const data = messageDoc.data();
        if (
          data.senderId !== currentUserId &&
          (!data.readBy || !data.readBy.includes(currentUserId))
        ) {
          await updateDoc(doc(db, 'chats', chatId, 'messages', messageDoc.id), {
            readBy: arrayUnion(currentUserId)
          });
        }
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    try {
      const chatDocRef = doc(db, 'chats', chatId);

      // Update chat metadata
      await updateDoc(chatDocRef, {
        lastMessage: inputText.trim(),
        lastSender: currentUserId,
        updatedAt: serverTimestamp(),
        [`unreadCounts.${receiverId}`]: 1
      });

      // Add message to chat
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: inputText.trim(),
        senderId: currentUserId,
        timestamp: serverTimestamp(),
        readBy: [currentUserId]
      });

      setInputText('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Sending...';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Invalid time';
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.senderId === currentUserId ? styles.myMessage : styles.otherMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.senderId === currentUserId ? styles.myMessageText : styles.otherMessageText
      ]}>
        {item.text}
      </Text>
      <Text style={[
        styles.timeText,
        item.senderId === currentUserId ? styles.myTimeText : styles.otherTimeText
      ]}>
        {formatTime(item.timestamp)}
      </Text>
    </View>
  );

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={BACK_BUTTON} style={styles.backButton} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.nameAvatarContainer}>
          <View style={styles.avatarWrapper}>
            {profileLoading ? (
              <ActivityIndicator size="small" color="#6549FE" style={styles.headerAvatar} />
            ) : (
              <Image
                source={avatarUrl && !avatarError ? { uri: avatarUrl } : DEFAULT_AVATAR}
                style={styles.headerAvatar}
                onError={handleAvatarError}
              />
            )}
            {!profileLoading && friendProfile?.online && (
              <View style={styles.statusDot} />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.headerText}>
              {friendProfile?.name || receiverName || 'Chat'}
            </Text>
          </View>
        </View>

        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {isLoadingMessages ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#6549FE" />
            <Text style={styles.loaderText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messageContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Start your conversation with {friendProfile?.name || receiverName || 'Friend'}. Say hello!
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            style={styles.input}
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F6FF' 
  },
  keyboardView: { 
    flex: 1 
  },
  headerContainer: {
    width: width, 
    height: 80, 
    backgroundColor: '#FFFFFF', 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, 
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: { 
    width: 30,
    height: 30 
  },
  nameAvatarContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
    justifyContent: 'flex-start',
    marginLeft: 20,
  },
  avatarWrapper: {
    position: 'relative',
    width: 35,
    height: 35,
  },
  headerAvatar: {
    width: 35, 
    height: 35, 
    borderRadius: 17.5,
    borderWidth: 2, 
    borderColor: '#6549FE',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginLeft: 10,
  },
  headerText: {
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#6549FE',
  },
  placeholder: { 
    width: 30 
  },
  messageContainer: { 
    padding: 16, 
    paddingBottom: 30 
  },
  messageBubble: {
    maxWidth: '75%', 
    padding: 12, 
    marginVertical: 5,
    borderRadius: 18,
  },
  myMessage: {
    alignSelf: 'flex-end', 
    backgroundColor: '#6549FE',
    borderTopRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, 
    shadowRadius: 2, 
    elevation: 2,
  },
  messageText: { 
    fontSize: 16 
  },
  myMessageText: { 
    color: '#FFFFFF' 
  },
  otherMessageText: { 
    color: '#333333' 
  },
  timeText: { 
    fontSize: 11, 
    marginTop: 4, 
    alignSelf: 'flex-end' 
  },
  myTimeText: { 
    color: 'rgba(255, 255, 255, 0.7)' 
  },
  otherTimeText: {
    color: '#A0A0A0' 
  },
  inputContainer: {
    flexDirection: 'row', 
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1, 
    borderColor: '#EEEEEE', 
    alignItems: 'center',
  },
  input: {
    flex: 1, 
    padding: 10, 
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5', 
    borderRadius: 24,
    borderWidth: 1, 
    borderColor: '#EEEEEE', 
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6549FE', 
    borderRadius: 50,
    width: 45, 
    height: 45, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#6549FE', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, 
    shadowRadius: 3, 
    elevation: 3,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: '#6549FE',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ChatScreen;