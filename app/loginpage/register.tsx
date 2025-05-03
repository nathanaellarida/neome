import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert } from "react-native";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";

// ✅ Image Paths
const BACKGROUND_IMG = require("../assets/images/bottompage.png");
const LOGO = require("../assets/images/logo.png");
const WELCOME = require("../assets/images/Welcome.png");

const { width, height } = Dimensions.get("window");

export default function Register() {
  
  // 🔹 Check if the user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        Alert.alert("Info", "You are already logged in.");
        router.push("/onboarding/OnboardingScreen"); // ✅ Redirect if logged in
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={BACKGROUND_IMG} style={styles.bottomDesign} resizeMode="contain" />

      {/* Logo */}
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />

      {/* Card Container */}
      <View style={styles.card}>
        <Image source={WELCOME} style={styles.welcome} resizeMode="contain" />

        {/* Sign-Up (Create Account) Button */}
        <TouchableOpacity style={styles.createButton} onPress={() => router.push("/loginpage/SignUp")}>
          <Text style={styles.createButtonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/loginpage/login")}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: 20, 
    zIndex: 2, // ✅ Keeps the logo above the background
  },
  card: {
    width: width * 0.85,
    backgroundColor: '#fff',
    padding: 50, // ✅ Increase padding to make it taller
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5, // ✅ Keeps the card above the background
    zIndex: 2,
    minHeight: height * 0.4, // ✅ Adds a minimum height (increase for more length)
  },
  
  welcome: {
    width: 200, 
    height: 50, 
    marginBottom: 40, 
  },
  createButton: {
    width: '120%',
    backgroundColor: '#6549FE',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    width: '120%',
    borderColor: '#6549FE',
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#6549FE',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomDesign: {
    position: 'absolute', 
    bottom: -0.5, // Fixed to the bottom
    width: width, // Full width
    height: height * 0.46, // Adjusted height to prevent touching motto
  },
});

//export default SignIn;
