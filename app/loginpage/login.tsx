import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

// ✅ Image Paths
const BACKGROUND_IMG = require("../assets/images/upper_page_design.png");
const WHITE_LOGO = require("../assets/images/neomeLogo.png");
const MAIL_ICON = require("../assets/images/mail.png");
const LOCK_ICON = require("../assets/images/lock.png");
const LOGIN_TITLE = require("../assets/images/welcomeBack.png");
const OPEN_EYE = require("../assets/images/openEyes.png");
const CLOSE_EYE = require("../assets/images/eyeOff.png");
const BACK_ICON = require("../assets/images/leftBack.png");

const { width, height } = Dimensions.get("window");

export default function Login() {
  const router = useRouter(); // ✅ instantiate the router from context

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Check if the user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/onboarding/OnboardingScreen");
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Handle Input Change
  const handleInputChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  // 🔹 Login Function
  const handleLoginPress = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      
      // Update lastActive timestamp after successful login
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          lastActive: serverTimestamp()
        });
      }
      
      Alert.alert("Success", "Login Successful! 🎉");
      router.push("/homescreen/HomeScreen");
    } catch (error) {
      const errorMessage = (error as any)?.message || "An unknown error occurred.";
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Background Image */}
          <Image source={BACKGROUND_IMG} style={styles.topBackground} resizeMode="cover" />

          {/* Back Button */}
          <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.push("/loginpage/register")}>
            <View style={styles.backButton}>
              <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
            </View>
          </TouchableOpacity>

          {/* Logo */}
          <Image source={WHITE_LOGO} style={styles.logo} resizeMode="contain" />

          {/* Card Container */}
          <View style={styles.card}>
            <Image source={LOGIN_TITLE} style={styles.title} resizeMode="contain" />

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Image source={MAIL_ICON} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(text) => handleInputChange("email", text)}
              />
            </View>

            {/* Password Field with Eye Toggle */}
            <View style={styles.inputContainer}>
              <Image source={LOCK_ICON} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(text) => handleInputChange("password", text)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image source={showPassword ? OPEN_EYE : CLOSE_EYE} style={styles.eyeIcon} />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity onPress={() => router.push("/loginpage/forgotPassword")}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
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
  backButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    marginTop: 18,
  },
  backIcon: {
    width: 24,
    height: 24,
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
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    zIndex: 2,
    minHeight: height * 0.45, 
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
    marginTop: 12,
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
    marginRight: 10,
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#AEAEAE',
  },
  loginButton: {
    width: '100%',
    borderColor: '#6549FE',
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#6549FE',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  link: {
    color: '#6549FE',
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    fontSize: 14,
    color: '#AEAEAE',
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 1,
  },
  otherLoginText: {
    fontSize: 14,
    color: '#6549FE',
    fontWeight: 'bold',
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },  
});
