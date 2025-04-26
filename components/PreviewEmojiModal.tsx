import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_AVATAR = require('../assets/images/default-avatar.png');

interface ReactionUser {
  id: string;
  name: string;
  avatar?: string;
  reaction: {
    emoji: string;
    name: string;
  };
}

interface PreviewEmojiModalProps {
  visible: boolean;
  onClose: () => void;
  reactionUsers: ReactionUser[];
}

const PreviewEmojiModal: React.FC<PreviewEmojiModalProps> = ({
  visible,
  onClose,
  reactionUsers
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      slideIn();
    } else {
      slideOut();
    }
  }, [visible]);

  const slideIn = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start();
  };

  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={slideOut}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 60 : 80}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handleBar} />
            <Text style={styles.headerTitle}>Reactions</Text>
          </View>

          {/* Reaction Users List */}
          <View style={styles.content}>
            {reactionUsers.map((user, index) => (
              <View key={user.id + index} style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Image
                    source={user.avatar ? { uri: user.avatar } : DEFAULT_AVATAR}
                    style={styles.avatar}
                  />
                  <Text style={styles.userName}>{user.name}</Text>
                </View>
                <Text style={styles.reactionEmoji}>{user.reaction.emoji}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 450,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  reactionEmoji: {
    fontSize: 24,
  },
});

export default PreviewEmojiModal; 