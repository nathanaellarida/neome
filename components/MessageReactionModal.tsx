import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import PreviewEmojiModal from './PreviewEmojiModal';

const { width } = Dimensions.get('window');

export interface Reaction {
  emoji: string;
  name: string;
}

// Define available reactions
export const REACTIONS: Reaction[] = [
  { emoji: '❤️', name: 'heart' },
  { emoji: '😂', name: 'laugh' },
  { emoji: '😮', name: 'wow' },
  { emoji: '😢', name: 'sad' },
  { emoji: '😡', name: 'angry' },
  { emoji: '👍', name: 'like' }
];

// List of options for the message
const MESSAGE_OPTIONS = [
  { text: 'Reply', icon: '↩️' },
  { text: 'Copy', icon: '📋' },
  { text: 'Translate', icon: '🌐' },
  { text: 'More', icon: '⋯' }
];

interface MessageReactionModalProps {
  visible: boolean;
  onClose: () => void;
  messageId: string;
  chatId: string;
  currentUserId: string;
  position: { x: number; y: number } | null;
  messageText: string;
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

const MessageReactionModal: React.FC<MessageReactionModalProps> = ({
  visible,
  onClose,
  messageId,
  chatId,
  currentUserId,
  position,
  messageText
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [messageReactions, setMessageReactions] = useState<{ [key: string]: string[] }>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [reactionUsers, setReactionUsers] = useState<ReactionUser[]>([]);
  
  useEffect(() => {
    if (visible) {
      // Start entrance animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true
      }).start();
      
      // Fetch current reactions for this message
      fetchMessageReactions();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);
  
  const fetchMessageReactions = async () => {
    if (!chatId || !messageId) return;
    
    try {
      const messageDocRef = doc(db, 'chats', chatId, 'messages', messageId);
      const messageDocSnap = await getDoc(messageDocRef);
      
      if (messageDocSnap.exists()) {
        const data = messageDocSnap.data();
        setMessageReactions(data.reactions || {});
      }
    } catch (err) {
      console.error('Error fetching message reactions:', err);
    }
  };
  
  const handleAddReaction = async (reactionName: string) => {
    if (!chatId || !messageId || !currentUserId) return;
    
    try {
      const messageDocRef = doc(db, 'chats', chatId, 'messages', messageId);
      const messageDocSnap = await getDoc(messageDocRef);
      
      if (messageDocSnap.exists()) {
        const data = messageDocSnap.data();
        const currentReactions = data.reactions || {};
        const updatedReactions = { ...currentReactions };
        
        // Check if user has already reacted with this emoji
        const hasReactedWithThisEmoji = updatedReactions[reactionName]?.includes(currentUserId);
        
        // Remove user's previous reactions from all emojis
        Object.keys(updatedReactions).forEach(key => {
          if (updatedReactions[key]) {
            updatedReactions[key] = updatedReactions[key].filter((id: string) => id !== currentUserId);
            if (updatedReactions[key].length === 0) {
              delete updatedReactions[key];
            }
          }
        });
        
        // If user hadn't reacted with this emoji, add the new reaction
        // If they had, we've already removed it above
        if (!hasReactedWithThisEmoji) {
          if (!updatedReactions[reactionName]) {
            updatedReactions[reactionName] = [];
          }
          updatedReactions[reactionName].push(currentUserId);
        }
        
        // Update the document with the new reactions
        await updateDoc(messageDocRef, {
          reactions: updatedReactions
        });
        
        // Close the modal after reacting
        onClose();
      }
    } catch (err) {
      console.error('Error adding/removing reaction:', err);
    }
  };
  
  const handleOptionPress = (option: string) => {
    // Handle different message options
    switch (option) {
      case 'Reply':
        // Implement reply functionality
        break;
      case 'Copy':
        // Copy to clipboard functionality
        if (messageText) {
          // Use clipboard API here
        }
        break;
      case 'Translate':
        // Implement translation functionality
        break;
      default:
        // More options
        break;
    }
    
    onClose();
  };
  
  const handleShowReactions = async () => {
    // Don't show reactions modal if it's the user's own message and they're the only one who reacted
    const totalReactions = Object.values(messageReactions).reduce((total, users) => total + users.length, 0);
    const onlySelfReacted = totalReactions === 1 && Object.values(messageReactions).some(users => 
      users.length === 1 && users.includes(currentUserId)
    );

    if (onlySelfReacted) {
      return;
    }

    try {
      const users: ReactionUser[] = [];
      
      // Get all users who reacted
      if (messageReactions) {
        for (const [reactionName, userIds] of Object.entries(messageReactions)) {
          const reaction = REACTIONS.find(r => r.name === reactionName);
          if (!reaction || !userIds) continue;

          for (const userId of userIds) {
            // Skip if it's the current user's own message and reaction
            if (userId === currentUserId) continue;

            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              users.push({
                id: userId,
                name: userData.name || 'Unknown User',
                avatar: userData.avatar,
                reaction: reaction
              });
            }
          }
        }
      }
      
      // Only show the modal if there are other users' reactions
      if (users.length > 0) {
        setReactionUsers(users);
        setShowPreviewModal(true);
      }
    } catch (err) {
      console.error('Error fetching reaction users:', err);
    }
  };
  
  if (!position) return null;
  
  // Calculate position based on tap location
  const modalYPosition = position.y - 180; // Position above the tap point
  
  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          {/* Use BlurView as the background */}
          <BlurView 
            intensity={Platform.OS === 'ios' ? 60 : 80} 
            tint="dark" 
            style={StyleSheet.absoluteFill} 
          />
          
          {/* Main container with animation */}
          <Animated.View
            style={[
              styles.mainContainer,
              {
                transform: [{ scale: scaleAnim }],
                top: modalYPosition,
              }
            ]}
          >
            {/* Reaction Emoji Section with Blur Background */}
            <BlurView intensity={80} tint="dark" style={styles.reactionsContainerBlur}>
              <View style={styles.reactionsContainerInner}>
                {REACTIONS.map((reaction) => {
                  const reactionUsers = messageReactions[reaction.name] || [];
                  const hasReacted = reactionUsers.includes(currentUserId);
                  
                  return (
                    <TouchableOpacity
                      key={reaction.name}
                      style={[
                        styles.reactionButton,
                        hasReacted && styles.selectedReaction
                      ]}
                      onPress={() => handleAddReaction(reaction.name)}
                    >
                      <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                    </TouchableOpacity>
                  );
                })}
                
                {/* Add reaction button */}
                <TouchableOpacity style={styles.addReactionButton}>
                  <Text style={styles.addReactionIcon}>+</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
            
            {/* Message bubble with Blur Background */}
            <TouchableOpacity onPress={handleShowReactions}>
              <BlurView intensity={70} tint="dark" style={styles.messageBubbleBlur}>
                <Text style={styles.messageText} numberOfLines={1}>
                  {messageText}
                </Text>
              </BlurView>
            </TouchableOpacity>
            
            {/* Options Section with Blur Background */}
            <BlurView intensity={80} tint="dark" style={styles.optionsContainerBlur}>
              {MESSAGE_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={option.text}
                  style={[
                    styles.optionButton,
                    index === MESSAGE_OPTIONS.length - 1 ? styles.lastOptionButton : null
                  ]}
                  onPress={() => handleOptionPress(option.text)}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                </TouchableOpacity>
              ))}
            </BlurView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <PreviewEmojiModal
        visible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        reactionUsers={reactionUsers}
      />
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Lighter background since we have blur now
  },
  mainContainer: {
    position: 'absolute',
    alignSelf: 'center',
    width: width * 0.85, // Use screen width to calculate container width
    alignItems: 'center',
  },
  reactionsContainerBlur: {
    borderRadius: 30, // Large value for pill shape
    overflow: 'hidden',
    marginBottom: 12,
  },
  reactionsContainerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(51, 51, 51, 0.5)', // Semi-transparent background
  },
  reactionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  selectedReaction: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  reactionEmoji: {
    fontSize: 24,
  },
  addReactionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(68, 68, 68, 0.7)', // Semi-transparent background
    marginLeft: 4,
  },
  addReactionIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  messageBubbleBlur: {
    borderRadius: 18,
    marginBottom: 12,
    alignSelf: 'center',
    maxWidth: '90%',
    overflow: 'hidden',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    padding: 12,
    backgroundColor: 'rgba(51, 51, 51, 0.5)', // Semi-transparent background
  },
  optionsContainerBlur: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(68, 68, 68, 0.7)',
    backgroundColor: 'rgba(34, 34, 34, 0.5)', // Semi-transparent background
  },
  lastOptionButton: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default MessageReactionModal;