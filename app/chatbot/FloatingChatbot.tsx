import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const ICON_SIZE = 60;
const SIDE_PADDING = 20;

export default function FloatingChatbot() {
  const router = useRouter();

  const translateX = useRef(new Animated.Value(width - ICON_SIZE - SIDE_PADDING)).current;
  const translateY = useRef(new Animated.Value(100)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.moveX - ICON_SIZE / 2);
        translateY.setValue(gesture.moveY - ICON_SIZE / 2);
      },
      onPanResponderRelease: (_, gesture) => {
        const isLeft = gesture.moveX < width / 2;
        const snapToX = isLeft ? SIDE_PADDING : width - ICON_SIZE - SIDE_PADDING;

        const snapToY = Math.min(
          Math.max(gesture.moveY - ICON_SIZE / 2, SIDE_PADDING),
          height - ICON_SIZE - 100
        );

        Animated.parallel([
          Animated.timing(translateX, {
            toValue: snapToX,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(translateY, {
            toValue: snapToY,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.floatingIcon,
        {
          transform: [{ translateX }, { translateY }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity onPress={() => router.push('/chatbot/App')}>
        {/* 👇 Replace Ionicons with Image */}
        <Image
          source={require('../assets/images/chatbot-icon.png')} // ← replace with your chatbot image path
          style={styles.iconImage}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingIcon: {
    position: 'absolute',
    zIndex: 999,
    backgroundColor: '#6549FE',
    borderRadius: 30,
    elevation: 10,
  },
  iconImage: {
    width: 50,
    height: 50,
    resizeMode: 'stretch',
    borderRadius: 30,
  },
});
