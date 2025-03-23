import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Redirect, router } from 'expo-router';

// Import assets
const BACKGROUND_IMG = require('./assets/images/bottompage.png'); // ✅ Ensure this exists
const LOGO = require('./assets/images/logo.png'); // ✅ Ensure this exists
const TITLE = require('./assets/images/neome.png'); // ✅ Ensure this exists

const { width, height } = Dimensions.get('window');

export default function Index() {
  const handlePress = () => {
    router.push('/loginpage/login'); // ✅ Navigate to SignIn.tsx when tapped
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>    
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Image source={TITLE} style={styles.title} resizeMode="contain" />
        <Text style={styles.motto}>Improve the Real You</Text>
        <Image source={BACKGROUND_IMG} style={styles.bottomDesign} resizeMode="contain" />
        <StatusBar backgroundColor='ffffff' style='light' />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200, // Ensured same width as title
    height: 150, // Proportional height
    marginTop: 120, // Space at the top
    marginBottom: 5, // Space between logo and title
  },
  title: {
    width: 200, // Matches logo width
    height: 50, // Adjusted height
    marginBottom: 5, // Space before motto
  },
  motto: {
    fontSize: 20,
    color: '#6549FE',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30, // Space before bottom design
  },
  bottomDesign: {
    position: 'absolute', 
    bottom: -0.5, // Fixed to the bottom
    width: width, // Full width
    height: height * 0.46, // Adjusted height to prevent touching motto
  },
});

