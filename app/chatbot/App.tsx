import { useRouter } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Audio } from 'expo-av';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter(); // Initialize router
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/images/tap.wav'),
        { shouldPlay: false }
      );
      soundRef.current = sound;
    };

    loadSound();

    return () => {
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
  
  const handleWebViewMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
  
      if (data.action === 'goBackToPreviousScreen') {
        await playTapSound(); // Waits for the sound to finish
        router.back(); 
      } else {
        console.log('Bot replied:', data);
      }
    } catch (error) {
      console.warn('Invalid message from WebView:', event.nativeEvent.data);
    }
  };  
 
  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={require('../assets/chatbot.html')}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#8B5CF6"
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
});