import React, { useRef, useEffect } from 'react';
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Image } from 'expo-image';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');
const ICON_SIZE = 60;
const SIDE_PADDING = 20;

export default function FloatingChatbot() {
  const router = useRouter();
  const pathname = usePathname();
  const soundRef = useRef<Audio.Sound | null>(null);

  const translateX = useRef(new Animated.Value(width - ICON_SIZE - SIDE_PADDING)).current;
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const excludedRoutes = [
    '/loginpage/login',
    '/loginpage/register',
    '/loginpage/SignUp',
    '/loginpage/forgotPassword',
    '/loginpage/newPassword',
    '/onboarding/OnboardingScreen',
    '/neome_userdata_app/activitylevel',
    '/neome_userdata_app/bodytype',
    '/neome_userdata_app/heightandweight',
    '/neome_userdata_app/medicalconditions',
    '/neome_userdata_app/mentalstressinfo',
    '/neome_userdata_app/selectAvatar',
    '/neome_userdata_app/selectBirthdate',
    '/neome_userdata_app/UserDataScreen1',
    '/neome_userdata_app/wellnessgoals',
  ];

  const resetHideTimer = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    hideTimeout.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0.1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 4000);
  };

  useEffect(() => {
    resetHideTimer();

    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/images/tap.wav'),
        { shouldPlay: false }
      );
      soundRef.current = sound;
    };

    loadSound();

    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playTapSound = async () => {
    try {
      const sound = soundRef.current;
      if (sound) {
        await sound.stopAsync(); // Ensure sound starts clean
        await sound.playFromPositionAsync(0); // No delay, plays from start
      }
    } catch (error) {
      console.warn('Failed to play sound', error);
    }
  };

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
          Math.max(gesture.moveY - ICON_SIZE / 2, SIDE_PADDING),
          height - ICON_SIZE - SIDE_PADDING
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
      },
    })
  ).current;

  if (excludedRoutes.includes(pathname)) {
    return <></>;
  }

  return (
    <Animated.View
      style={[
        styles.floatingIcon,
        {
          transform: [{ translateX }, { translateY }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        onPress={async () => {
          resetHideTimer();
          await playTapSound(); // ✅ Improved smooth playback
          router.push('/chatbot/App');
        }}
      >
        <Image
          source={require('../assets/images/whitebot.gif')}
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
    width: 60,
    height: 60,
    resizeMode: 'contain',
    borderRadius: 30,
  },
});
