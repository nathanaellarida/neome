import React, { useRef, useEffect } from 'react';
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
  const opacity = useRef(new Animated.Value(1)).current;

  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    hideTimeout.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0.1, 
        useNativeDriver: true,
      }).start(); 
    }, 3000);
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => resetHideTimer(),
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.moveX - ICON_SIZE / 2);
        translateY.setValue(gesture.moveY - ICON_SIZE / 2);
      },
      onPanResponderRelease: (_, gesture) => {
        const isLeft = gesture.moveX < width / 2;
        const snapToX = isLeft ? SIDE_PADDING : width - ICON_SIZE - SIDE_PADDING;
      
        const snapToY = Math.min(
          Math.max(gesture.moveY - ICON_SIZE / 2, SIDE_PADDING),           // Top padding
          height - ICON_SIZE - SIDE_PADDING                                // Bottom padding now equal
        );
      
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: snapToX,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: snapToY,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      
        resetHideTimer();
      }      
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.floatingIcon,
        {
          transform: [{ translateX }, { translateY }],
          opacity: opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity onPress={() => {
        resetHideTimer();
        router.push('/chatbot/App');
      }}>
        <Image
          source={require('../assets/images/chatbotImage.png')}
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
    resizeMode: 'contain',
    borderRadius: 30,
  },
});
