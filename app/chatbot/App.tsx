import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter(); // Initialize router

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.action === 'goBackToPreviousScreen') {
        router.back(); // Navigate back using expo-router
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