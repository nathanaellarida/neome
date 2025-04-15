import User from './messaging/ConnectFriends';

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Redirect, router } from 'expo-router';

// Import assets
const BACKGROUND_IMG = require('./assets/images/bottompage.png');
const LOGO = require('./assets/images/logo.png');
const TITLE = require('./assets/images/neome.png');

const { width, height } = Dimensions.get('window');

export default function Index() {
  // Uncomment the line below to redirect directly from index.js instead of _layout.js
  // return <Redirect href="/loginpage/register" />;
  
  const handlePress = () => {
    router.push('/loginpage/register');
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
    width: 200,
    height: 150,
    marginTop: 120,
    marginBottom: 5,
  },
  title: {
    width: 200,
    height: 50,
    marginBottom: 5,
  },
  motto: {
    fontSize: 20,
    color: '#6549FE',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  bottomDesign: {
    position: 'absolute', 
    bottom: -0.5,
    width: width,
    height: height * 0.46,
  },
});