import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView,
  Platform, StyleSheet, Image, Dimensions, ActivityIndicator, Animated, Alert,
  TouchableWithoutFeedback, Keyboard
} from 'react-native';
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp,
  updateDoc, doc, arrayUnion, getDoc, setDoc, getDocs,
} from 'firebase/firestore';
import { auth, db, storage } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getDownloadURL, ref } from 'firebase/storage';
import MessageReactionModal, { REACTIONS, Reaction } from '../../components/MessageReactionModal';
import PhotoGalleryModal from '../messaging/PhotoGalleryModal';
import AudioRecorder from './AudioRecorder';
import { Audio } from 'expo-av';
import PreviewEmojiModal from '../../components/PreviewEmojiModal';
import StickerPreviewModal from './StickerPreviewModal';

const { width } = Dimensions.get('window');
const BACK_BUTTON = require('../assets/images/backPurple.png');
const DEFAULT_AVATAR = require('../../assets/images/default-avatar.png');

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp?: { toDate: () => Date; } | null;
  readBy: string[];
  imageUrl?: string;
  imagePath?: string;
  audioPath?: string;
  reactions?: { [key: string]: string[] };
}

interface FriendProfile {
  id: string;
  name: string;
  avatar: string | null;
  online: boolean;
  lastSeen: { toDate: () => Date; } | null;
}

interface ReactionUser {
  id: string;
  name: string;
  avatar?: string;
  reaction: {
    emoji: string;
    name: string;
  };
}

// Typing indicator (to show when the other user is typing)
const TypingIndicator = () => {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);
    };

    const runAnimation = () => {
      Animated.loop(
        Animated.parallel([
          animateDot(dot1Opacity, 0),
          animateDot(dot2Opacity, 200),
          animateDot(dot3Opacity, 400),
        ])
      ).start();
    };
    runAnimation();

    return () => {
      dot1Opacity.stopAnimation();
      dot2Opacity.stopAnimation();
      dot3Opacity.stopAnimation();
    };
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot3Opacity }]} />
      </View>
    </View>
  );
};

const ChatScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const longPressSoundRef = useRef<Audio.Sound | null>(null);

  const passedChatId = typeof params.chatId === 'string' ? params.chatId : '';
  const receiverId = typeof params.receiverId === 'string' ? params.receiverId : '';
  const receiverName = typeof params.receiverName === 'string' ? params.receiverName : '';
  const receiverAvatar = typeof params.receiverAvatar === 'string' ? params.receiverAvatar : '';
  const passedSenderId = typeof params.senderId === 'string' ? params.senderId : '';
  const existingLastMessage = typeof params.existingLastMessage === 'string' ? params.existingLastMessage : '';
  const imagePath = typeof params.imagePath === 'string' ? params.imagePath : '';
  const imageAction = typeof params.imageAction === 'string' ? params.imageAction : '';

  const [chatId, setChatId] = useState<string>(passedChatId || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [friendProfile, setFriendProfile] = useState<FriendProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  // Debounce typing state
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Reaction modal state
  const [reactionModalVisible, setReactionModalVisible] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState('');
  const [selectedMessageText, setSelectedMessageText] = useState('');
  const [selectedMessageSenderId, setSelectedMessageSenderId] = useState<string>('');
  const [tapPosition, setTapPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Photo gallery modal state
  const [photoGalleryVisible, setPhotoGalleryVisible] = useState(false);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [reactionUsers, setReactionUsers] = useState<ReactionUser[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const [stickerModalVisible, setStickerModalVisible] = useState(false);

  const prevMessageCountRef = useRef<number>(0);

  useEffect(() => {
    const loadLongPressSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/images/longpress.wav'), // your long-press sound file
        { shouldPlay: false }
      );
      longPressSoundRef.current = sound;
    };
  
    loadLongPressSound();
  
    return () => {
      if (longPressSoundRef.current) {
        longPressSoundRef.current.unloadAsync();
      }
    };
  }, []);

  // Listen for authentication changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        router.replace('/loginpage/login');
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize chat and profile
  useEffect(() => {
    if (currentUserId) {
      const initialize = async () => {
        try {
          if (passedChatId) {
            setChatId(passedChatId);
          } else if (currentUserId && receiverId) {
            const potentialChatId = [currentUserId, receiverId].sort().join('_');
            const chatDocRef = doc(db, 'chats', potentialChatId);
            const chatDocSnap = await getDoc(chatDocRef);
            if (chatDocSnap.exists()) {
              setChatId(potentialChatId);
            } else {
              await setDoc(chatDocRef, {
                users: [currentUserId, receiverId],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessage: '',
                lastSender: '',
                unreadCounts: {
                  [currentUserId]: 0,
                  [receiverId]: 0
                },
                typingUsers: {}
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
    }
  }, [passedChatId, receiverId, currentUserId]);

  // Handle incoming image data
  useEffect(() => {
    if (imagePath && imageAction === 'send' && chatId && currentUserId && receiverId) {
      handleSendImage(imagePath);
    }
  }, [imagePath, imageAction, chatId, currentUserId, receiverId]);

  // Fetch messages and subscribe for updates
  useEffect(() => {
    if (chatId && currentUserId) {
      fetchMessages();
      const unsubscribeMessages = subscribeToMessages();
      const unsubscribeTyping = subscribeToTypingStatus();
      return () => {
        if (unsubscribeMessages) unsubscribeMessages();
        if (unsubscribeTyping) unsubscribeTyping();
        updateTypingStatus(false);
      };
    }
  }, [chatId, currentUserId]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (
      messages.length > 0 &&
      flatListRef.current &&
      !isLoadingMessages &&
      messages.length > prevMessageCountRef.current // Only if new message
    ) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 300);
      prevMessageCountRef.current = messages.length;
      return () => clearTimeout(timer);
    }
    // Always update the ref to the latest count
    prevMessageCountRef.current = messages.length;
  }, [messages, isLoadingMessages]);

  // Send image from the photo gallery
  const handleSendImage = async (imagePath: string) => {
    try {
      // Get the download URL
      const imageRef = ref(storage, imagePath);
      const downloadURL = await getDownloadURL(imageRef);
      
      // Update the chat document
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        lastMessage: '📷 Image',
        lastSender: currentUserId,
        updatedAt: serverTimestamp(),
        [`unreadCounts.${receiverId}`]: 1,
        [`typingUsers.${currentUserId}`]: false
      });
      
      // Add message document with image reference
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: '',
        imageUrl: downloadURL, 
        imagePath: imagePath,
        senderId: currentUserId,
        timestamp: serverTimestamp(),
        readBy: [currentUserId]
      });
    } catch (err) {
      console.error('Error sending image:', err);
      Alert.alert('Error', 'Failed to send image');
    }
  };

  // Subscribe to friend's typing status
  const subscribeToTypingStatus = () => {
    if (!chatId || !currentUserId || !receiverId) return;
    const chatDocRef = doc(db, 'chats', chatId);
    return onSnapshot(chatDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.typingUsers) {
          setIsTyping(!!data.typingUsers[receiverId]);
        }
      }
    });
  };

  // Update our own typing status in Firestore
  const updateTypingStatus = async (isCurrentlyTyping: boolean) => {
    if (!chatId || !currentUserId) return;
    try {
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        [`typingUsers.${currentUserId}`]: isCurrentlyTyping
      });
    } catch (err) {
      console.error('Error updating typing status:', err);
    }
  };

  // Handle changes to the text input
  const handleTextInputChange = (text: string) => {
    setInputText(text);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    updateTypingStatus(text.trim().length > 0);
    const timeout = setTimeout(() => {
      updateTypingStatus(false);
    }, 3000);
    setTypingTimeout(timeout);
  };

  // Focus the input when needed
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Setup friend profile and additional info
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
        if (receiverAvatar && (receiverAvatar.startsWith('http') || receiverAvatar.startsWith('data:'))) {
          setAvatarUrl(receiverAvatar);
          setAvatarError(false);
        } else if (receiverAvatar && receiverAvatar.length > 0) {
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
        setFriendProfile(prev => prev ? {
          ...prev,
          online: userData.online || false,
          lastSeen: userData.lastSeen || null,
          avatar: prev.avatar || userData.avatar || null,
        } : null);
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
    if (!chatId || !currentUserId) return;
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
        name: userData.name || '',
        avatar: userData.avatar || null,
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
    if (!chatId || !currentUserId) return;
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
            text: data.text || '',
            senderId: data.senderId || '',
            timestamp: data.timestamp,
            readBy: data.readBy || [],
            imageUrl: data.imageUrl || undefined,
            imagePath: data.imagePath || undefined,
            audioPath: data.audioPath || undefined,
            reactions: data.reactions || {},
          };
        });
        setMessages(msgs);
        if (msgs.length > 0) {
          await markMessagesAsRead(querySnapshot.docs);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoadingMessages(false);
      const scrollToEndWithDelay = (delay: number) => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, delay);
      };
      scrollToEndWithDelay(100);
      scrollToEndWithDelay(300);
      scrollToEndWithDelay(500);
    }
  };

  const subscribeToMessages = () => {
    if (!chatId || !currentUserId) return;
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs: Message[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text || '',
          senderId: data.senderId || '',
          timestamp: data.timestamp,
          readBy: data.readBy || [],
          imageUrl: data.imageUrl || undefined,
          imagePath: data.imagePath || undefined,
          audioPath: data.audioPath || undefined,
          reactions: data.reactions || {},
        };
      });
      setMessages(msgs);
      if (msgs.length > 0) {
        markMessagesAsRead(snapshot.docs);
      }
    });
    return unsubscribe;
  };

  const markMessagesAsRead = async (messageDocs: any[]) => {
    if (!chatId || !currentUserId) return;
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
    if (inputText.trim() === '' || !chatId || !currentUserId || !receiverId) return;
    try {
      updateTypingStatus(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        lastMessage: inputText.trim(),
        lastSender: currentUserId,
        updatedAt: serverTimestamp(),
        [`unreadCounts.${receiverId}`]: 1,
        [`typingUsers.${currentUserId}`]: false
      });
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: inputText.trim(),
        senderId: currentUserId,
        timestamp: serverTimestamp(),
        readBy: [currentUserId]
      });
      setInputText('');
      // Re-focus the input after sending
      setTimeout(() => {
        focusInput();
      }, 100);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Format timestamp for messages
  const formatTime = (timestamp: any): string => {
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

  // Handle long press for message reactions
  const handleMessageLongPress = (messageId: string, messageText: string, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setTapPosition({ x: pageX, y: pageY });
    setSelectedMessageId(messageId);
    setSelectedMessageText(messageText);
    // Find the senderId from messages
    const msg = messages.find(m => m.id === messageId);
    setSelectedMessageSenderId(msg ? msg.senderId : '');
    setReactionModalVisible(true);
  };

  // Open the photo gallery modal
  const openPhotoGallery = () => {
    setPhotoGalleryVisible(true);
  };

  // Handle image selection from the modal
  const handleImageSelected = (imagePath: string) => {
    handleSendImage(imagePath);
  };

  const handleAudioRecordingComplete = async (audioPath: string) => {
    try {
      // Update the chat document
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        lastMessage: '🎤 Audio message',
        lastSender: currentUserId,
        updatedAt: serverTimestamp(),
        [`unreadCounts.${receiverId}`]: 1
      });
      
      // Add message document with audio reference
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: '',
        audioPath: audioPath,
        senderId: currentUserId,
        timestamp: serverTimestamp(),
        readBy: [currentUserId]
      });
    } catch (err) {
      console.error('Error sending audio message:', err);
      Alert.alert('Error', 'Failed to send audio message');
    }
  };

  const handlePlayAudio = async (audioPath: string | undefined) => {
    if (!audioPath) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: await getDownloadURL(ref(storage, audioPath)) }
      );
      await sound.playAsync();
    } catch (err) {
      console.error('Error playing audio:', err);
      Alert.alert('Error', 'Failed to play audio message');
    }
  };

  // Render each message
  const renderItem = ({ item }: { item: Message }) => {
    const hasReactions = item.reactions && 
      Object.values(item.reactions).some(users => users && users.length > 0);
    
    // Detect if this is a sticker (Googleapis URL and from sticker modal)
    const isSticker = item.imageUrl && item.imageUrl.includes('firebasestorage.googleapis.com') &&
      (item.imageUrl.includes('neome_stickers') || item.imageUrl.includes('stickers'));

    if (isSticker) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={(event) => handleMessageLongPress(item.id, '', event)}
        >
          <View
            style={[
              styles.stickerContainer,
              item.senderId === currentUserId
                ? { alignSelf: 'flex-end', marginLeft: 0, marginRight: 0 }
                : { alignSelf: 'flex-start', marginLeft: 0, marginRight: 0 }
            ]}
          >
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.stickerImage}
              resizeMode="contain"
            />
            {/* Reactions Display for stickers */}
            {hasReactions && (
              <TouchableOpacity 
                onPress={() => handleShowReactions(item.reactions || {})}
                style={[
                  styles.reactionsContainer,
                  item.senderId === currentUserId ? styles.myReactionsContainer : styles.otherReactionsContainer
                ]}
              >
                <View style={[styles.reactionBubble, { borderRadius: 16 }]}> 
                  {Object.entries(item.reactions || {}).map(([reactionName, users]) => {
                    if (users && users.length > 0) {
                      const reaction = REACTIONS.find((r: Reaction) => r.name === reactionName);
                      return (
                        <Text key={reactionName} style={styles.reactionEmoji}>
                          {reaction?.emoji}
                        </Text>
                      );
                    }
                    return null;
                  })}
                  <Text style={styles.reactionCount}>
                    {Object.values(item.reactions || {}).reduce((total, users) => total + (users?.length || 0), 0)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={(event) => handleMessageLongPress(item.id, item.text, event)}
      >
        <View style={[
          styles.messageBubble,
          item.senderId === currentUserId ? styles.myMessage : styles.otherMessage
        ]}>
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
          ) : item.audioPath ? (
            <TouchableOpacity 
              style={styles.audioButton}
              onPress={() => handlePlayAudio(item.audioPath)}
            >
              <Ionicons name="play-circle-outline" size={24} color={item.senderId === currentUserId ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
          ) : (
            <Text style={[
              styles.messageText,
              item.senderId === currentUserId ? styles.myMessageText : styles.otherMessageText
            ]}>
              {item.text}
            </Text>
          )}
          <Text style={[
            styles.timeText,
            item.senderId === currentUserId ? styles.myTimeText : styles.otherTimeText
          ]}>
            {formatTime(item.timestamp)}
          </Text>

          {/* Reactions Display */}
          {hasReactions && (
            <TouchableOpacity 
              onPress={() => handleShowReactions(item.reactions || {})}
              style={[
                styles.reactionsContainer,
                item.senderId === currentUserId ? styles.myReactionsContainer : styles.otherReactionsContainer
              ]}
            >
              <View style={[styles.reactionBubble, { borderRadius: 16 }]}>
                {Object.entries(item.reactions || {}).map(([reactionName, users]) => {
                  if (users && users.length > 0) {
                    const reaction = REACTIONS.find((r: Reaction) => r.name === reactionName);
                    return (
                      <Text key={reactionName} style={styles.reactionEmoji}>
                        {reaction?.emoji}
                      </Text>
                    );
                  }
                  return null;
                })}
                <Text style={styles.reactionCount}>
                  {Object.values(item.reactions || {}).reduce((total, users) => total + (users?.length || 0), 0)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  // Handle call button press
  const handleVoiceCall = () => {
    alert('Voice call feature coming soon!');
  };

  // Handle video call button press
  const handleVideoCall = () => {
    alert('Video call feature coming soon!');
  };

  const handleShowReactions = async (messageReactions: { [key: string]: string[] } | undefined) => {
    try {
      const users: ReactionUser[] = [];
      
      // Check if there are any reactions
      if (!messageReactions || Object.keys(messageReactions).length === 0) {
        return;
      }

      // Get all users who reacted
      for (const [reactionName, userIds] of Object.entries(messageReactions)) {
        const reaction = REACTIONS.find(r => r.name === reactionName);
        if (!reaction || !userIds || userIds.length === 0) continue;

        for (const userId of userIds) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            let avatarUrl: string | undefined = undefined;
            
            // Get download URL if avatar exists
            if (userData.avatar) {
              try {
                const avatarRef = ref(storage, userData.avatar);
                avatarUrl = await getDownloadURL(avatarRef);
              } catch (err) {
                console.error('Error getting avatar URL:', err);
              }
            }

            users.push({
              id: userId,
              name: userData.name || 'Unknown User',
              avatar: avatarUrl,
              reaction: reaction
            });
          }
        }
      }
      
      // Only show the modal if there are reactions to display
      if (users.length > 0) {
        setReactionUsers(users);
        setShowPreviewModal(true);
      }
    } catch (err) {
      console.error('Error fetching reaction users:', err);
    }
  };

  const handleStickerSelected = async (stickerUrl: string) => {
    if (!chatId || !currentUserId || !receiverId) return;
    try {
      // Update the chat document
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        lastMessage: '🖼️ Sticker',
        lastSender: currentUserId,
        updatedAt: serverTimestamp(),
        [`unreadCounts.${receiverId}`]: 1,
        [`typingUsers.${currentUserId}`]: false
      });
      // Add message document with sticker image URL
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: '',
        imageUrl: stickerUrl,
        senderId: currentUserId,
        timestamp: serverTimestamp(),
        readBy: [currentUserId]
      });
      setStickerModalVisible(false);
    } catch (err) {
      console.error('Error sending sticker:', err);
      Alert.alert('Error', 'Failed to send sticker');
    }
  };

  if (!currentUserId) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
        <ActivityIndicator size="large" color="#6549FE" />
        <Text style={styles.loaderText}>Loading chat...</Text>
      </View>
    );
  }

  const getReceiverNameSafe = () => {
    return friendProfile?.name || receiverName || 'Friend';
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Header */}
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
              <Text style={styles.headerText}>{getReceiverNameSafe()}</Text>
            </View>
          </View>
          <View style={styles.callButtonsContainer}>
            <TouchableOpacity style={styles.callButton} onPress={handleVoiceCall}>
              <Ionicons name="call" size={24} color="#6549FE" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.callButton} onPress={handleVideoCall}>
              <Ionicons name="videocam" size={24} color="#6549FE" />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {/* Messages */}
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
                  contentContainerStyle={[styles.messageContainer, { paddingBottom: 70 }]}
                  keyboardShouldPersistTaps="never"
                  onContentSizeChange={() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                  }}
                  onLayout={() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                  }}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        Start your conversation with {getReceiverNameSafe()}. Say hello!
                      </Text>
                    </View>
                  }
                  ListFooterComponent={() => (
                    <View>
                      {isTyping && <TypingIndicator />}
                      <View style={{ height: 20 }} />
                    </View>
                  )}
                />
              )}
            </View>
          </TouchableWithoutFeedback>

          {/* Footer Input Area */}
          <View style={styles.footerWrapper}>
            <View style={styles.inputContainer}>
              {inputText.trim().length === 0 && (
                <TouchableOpacity style={styles.cameraButton}>
                  <Ionicons name="camera" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              
              <TextInput
                ref={inputRef}
                value={inputText}
                onChangeText={handleTextInputChange}
                placeholder={inputText.trim().length > 0 ? "Typing..." : "Message..."}
                placeholderTextColor="#999"
                style={styles.input}
                multiline
                blurOnSubmit={false}
                autoCapitalize="none"
                spellCheck={false}
                autoCorrect={false}
                keyboardType="default"
                returnKeyType="default"
                onFocus={() => {
                  if (inputText.trim().length > 0) {
                    updateTypingStatus(true);
                  }
                }}
              />
              
              {inputText.trim().length > 0 ? (
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <View style={styles.rightIconsContainer}>
                  <AudioRecorder 
                    onRecordingComplete={handleAudioRecordingComplete}
                    chatId={chatId}
                  />
                  <TouchableOpacity style={styles.iconButton} onPress={openPhotoGallery}>
                    <Ionicons name="image-outline" size={24} color="#000000" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => setStickerModalVisible(true)}>
                    <MaterialCommunityIcons name="sticker-emoji" size={24} color="#000000" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="add-circle-outline" size={24} color="#000000" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>

        <StickerPreviewModal
          visible={stickerModalVisible}
          onClose={() => setStickerModalVisible(false)}
          onStickerSelect={handleStickerSelected}
        />

        {/* Message Reaction Modal */}
        <MessageReactionModal
          visible={reactionModalVisible}
          onClose={() => setReactionModalVisible(false)}
          messageId={selectedMessageId}
          chatId={chatId}
          currentUserId={currentUserId}
          position={tapPosition}
          messageText={selectedMessageText}
          senderId={selectedMessageSenderId}
        />

        {/* Photo Gallery Modal */}
        <PhotoGalleryModal
          visible={photoGalleryVisible}
          onClose={() => setPhotoGalleryVisible(false)}
          chatId={chatId}
          onImageSelected={handleImageSelected}
        />

        {/* Preview Emoji Modal */}
        <PreviewEmojiModal
          visible={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          reactionUsers={reactionUsers}
        />
      </View>
    </TouchableWithoutFeedback>
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
  callButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    padding: 8,
    marginLeft: 10,
  },
  messageContainer: { 
    padding: 16, 
    paddingBottom: 30 
  },
  messageBubble: {
    maxWidth: '75%', 
    padding: 12, 
    marginVertical: 10,
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
  // Footer
  footerWrapper: {
    backgroundColor: '#F3F6FF', // Changed to match the background color
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    paddingHorizontal: 10,
  },
  cameraButton: {
    width: 40,
    height: 40,
    backgroundColor: '#6549FE', // Purple background for camera
    borderRadius: 20, // Circular button
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#6549FE', // Purple background for send button
    borderRadius: 20, // Circular button
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: '#333333',
    marginRight: 8,
  },
  // Typing indicator styles
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    alignItems: 'flex-start',
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#6549FE',
    marginHorizontal: 3,
  },

  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  reactionsContainer: {
    position: 'absolute',
    bottom: -15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: '100%',
    gap: 4,
    zIndex: 1,
  },
  myReactionsContainer: {
    right: 10,
  },
  otherReactionsContainer: {
    left: 10,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 2,
  },
  reactionCount: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginLeft: 4,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  stickerContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: 255,
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  stickerImage: {
    width: 120,
    height: 120,
    backgroundColor: 'transparent',
  },
});

export default ChatScreen;