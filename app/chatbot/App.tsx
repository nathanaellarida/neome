import { useRouter } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Audio } from 'expo-av';
import { db, auth } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter(); // Initialize router
  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/images/tap.wav'),
        { shouldPlay: false }
      );
      soundRef.current = sound;
    };

    loadSound();

    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setCurrentUser(user);
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      unsubscribe();
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
    const messageData = event.nativeEvent.data;
    try {
      const data = JSON.parse(messageData);
      if (data.action === 'goBackToPreviousScreen') {
        await playTapSound();
        router.back();
      } else if (data.action === 'saveConversation' && currentUser) {
        if (Array.isArray(data.messages)) {
          data.messages.forEach((msg: any) => {
            if (msg.isUser) {
              console.log('User message:', msg.text);
            }
          });
        }
        await addDoc(collection(db, 'chatbot'), {
          user: currentUser.uid,
          messages: data.messages,
          createdAt: serverTimestamp(),
        });
        console.log('Conversation saved to Firestore!');
      } else {
        console.log('Bot replied:', data);
      }
    } catch (error) {
      console.warn('Invalid message from WebView:', messageData);
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