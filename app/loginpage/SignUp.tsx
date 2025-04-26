import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import Checkbox from 'expo-checkbox';

import { auth, db } from '../../firebaseConfig'; // 🔁 Adjust this import path if needed
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// ✅ Image Paths
const BACKGROUND_IMG = require('../assets/images/upper_page_design.png');  
const WHITE_LOGO = require('../assets/images/neomeLogo.png');  
const USER_ICON = require('../assets/images/user.png');  
const MAIL_ICON = require('../assets/images/mail.png');  
const LOCK_ICON = require('../assets/images/lock.png');  
const CREATE_ACCOUNT_TITLE = require('../assets/images/createAccount.png');  
const OPEN_EYE = require('../assets/images/openEyes.png');  
const CLOSE_EYE = require('../assets/images/eyeOff.png');  
const BACK_ICON = require('../assets/images/leftBack.png'); 

const { width, height } = Dimensions.get('window');

export default function SignIn() {
  const [isChecked, setChecked] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSignIn = async () => {
    if (!isChecked) {
      alert("You must agree to the Terms and Conditions.");
      return;
    }

    const { username, email, password, confirmPassword } = form;

    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill all the fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user profile
      await updateProfile(user, { displayName: username });

      // Create a user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: username,
        email: email,
        avatar: "",
        online: true,
        lastSeen: serverTimestamp(),
        friends: [],
        gender: null  // Initialize gender as null
      });

      console.log("User created:", user.uid);
      router.push('/neome_userdata_app/UserDataScreen1');

    } catch (error: any) {
      console.error("Sign up error:", error);
      
      // Handle specific Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already registered. Please try logging in instead.");
      } else {
        // For other errors, show the error message
        alert(error.message);
      }
    }
  };

  const handleBackPress = () => {
    router.push('/loginpage/register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>    
          <Image source={BACKGROUND_IMG} style={styles.topBackground} resizeMode="cover" />

          <TouchableOpacity style={styles.backButtonContainer} onPress={handleBackPress}>
            <View style={styles.backButton}>
              <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
            </View>
          </TouchableOpacity>

          <Image source={WHITE_LOGO} style={styles.logo} resizeMode="contain" />

          <View style={styles.card}>
            <Image source={CREATE_ACCOUNT_TITLE} style={styles.title} resizeMode="contain" />

            {/* Username */}
            <View style={styles.inputContainer}>
              <Image source={USER_ICON} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Enter full name"
                placeholderTextColor="#888"
                value={form.username}
                onChangeText={(text) => handleInputChange('username', text)}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Image source={MAIL_ICON} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Enter email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(text) => handleInputChange('email', text)}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Image source={LOCK_ICON} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Enter password"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(text) => handleInputChange('password', text)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image source={showPassword ? OPEN_EYE : CLOSE_EYE} style={styles.eyeIcon} />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Image source={LOCK_ICON} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Confirm password"
                placeholderTextColor="#888"
                secureTextEntry={!showConfirmPassword}
                value={form.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Image source={showConfirmPassword ? OPEN_EYE : CLOSE_EYE} style={styles.eyeIcon} />
              </TouchableOpacity>
            </View>

            {/* Checkbox */}
            <View style={styles.checkboxContainer}>
              <Checkbox value={isChecked} onValueChange={setChecked} color={isChecked ? "#6549FE" : undefined} />
              <Text style={styles.checkboxText}>I agree to the <Text style={styles.link}>Terms and Conditions</Text>.</Text>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Redirect to Login */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Already have an account?</Text>
            <Text style={styles.link} onPress={() => router.push('/loginpage/login')}>Login from here</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    width: '100%',
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height * 0.65, 
  },
  logo: {
    width: 100, 
    height: 100, 
    marginTop: 85, 
    marginBottom: 10, 
    zIndex: 2,
  },
  card: {
    width: width * 0.85,
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    zIndex: 2,
    minHeight: height * 0.5, 
  },
  title: {
    width: 200, 
    height: 50, 
    marginBottom: 20, 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 10,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    marginRight: 3,
  },
  checkboxContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxText: {
    fontSize: 14,
    color: '#AEAEAE',
    marginLeft: 10,
  },
  link: {
    color: '#6549FE',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
  },
  signInButton: {
    width: '85%',
    backgroundColor: '#6549FE',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 15,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  backButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    marginTop: 18,
  },
  backButton: {
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
});