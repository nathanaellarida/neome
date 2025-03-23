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
  Modal,
} from "react-native";
import { router } from "expo-router";
import Checkbox from "expo-checkbox";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

// ✅ Image Paths
const BACKGROUND_IMG = require("../assets/images/upper_page_design.png");
const WHITE_LOGO = require("../assets/images/neomeLogo.png");
const USER_ICON = require("../assets/images/user.png");
const MAIL_ICON = require("../assets/images/mail.png");
const LOCK_ICON = require("../assets/images/lock.png");
const CREATE_ACCOUNT_TITLE = require("../assets/images/createAccount.png");
const OPEN_EYE = require("../assets/images/openEyes.png");
const CLOSE_EYE = require("../assets/images/eyeOff.png");
const BACK_ICON = require("../assets/images/leftBack.png");
const EMAIL_ICON = require("../assets/images/email.png");
const EMAIL_TEXT = require("../assets/images/emailText.png");
const CHECK_ICON = require("../assets/images/check.png");
const CREATED_ACCOUNT_TEXT = require("../assets/images/createAccount.png");

const { width, height } = Dimensions.get("window");

export default function SignIn() {
  const [isChecked, setChecked] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerificationVisible, setVerificationVisible] = useState(false);
  const [isAccountCreatedVisible, setAccountCreatedVisible] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSignIn = async () => {
    if (!isChecked) {
      Alert.alert("Error", "You must agree to the Terms and Conditions.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      Alert.alert("Success", "Registration Successful! 🎉");
      setVerificationVisible(true); // Show verification modal
    } catch (error) {
      Alert.alert("Registration Failed", (error as any)?.message || "Unknown error");
    }
  };

  const handleVerify = (code: string) => {
    if (code.length === 6) {
      setVerificationVisible(false);
      setTimeout(() => {
        setAccountCreatedVisible(true);
      }, 500);
    } else {
      alert("Please enter a valid 6-digit code.");
    }
  };

  const handleContinue = () => {
    setAccountCreatedVisible(false);
    router.push('/onboarding/OnboardingScreen');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Image source={BACKGROUND_IMG} style={styles.topBackground} resizeMode="cover" />

          <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.push("/loginpage/login")}>
            <View style={styles.backButton}>
              <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
            </View>
          </TouchableOpacity>

          <Image source={WHITE_LOGO} style={styles.logo} resizeMode="contain" />

          <View style={styles.card}>
            <Image source={CREATE_ACCOUNT_TITLE} style={styles.title} resizeMode="contain" />

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

            <View style={styles.inputContainer}>
              <Image source={LOCK_ICON} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor="#888"
                secureTextEntry={!showConfirmPassword}
                value={form.confirmPassword}
                onChangeText={(text) => handleInputChange("confirmPassword", text)}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Image source={showConfirmPassword ? OPEN_EYE : CLOSE_EYE} style={styles.eyeIcon} />
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxContainer}>
              <Checkbox value={isChecked} onValueChange={setChecked} color={isChecked ? "#6549FE" : undefined} />
              <Text style={styles.checkboxText}>
                I agree to the <Text style={styles.link}>Terms and Conditions</Text>.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Already have an account?</Text>
            <Text style={styles.link} onPress={() => router.push("/loginpage/login")}>Login here</Text>
          </View>

          <EmailVerificationModal
            isVisible={isVerificationVisible}
            onClose={() => setVerificationVisible(false)}
            onVerify={handleVerify}
          />

          <AccountCreatedModal
            isVisible={isAccountCreatedVisible}
            onContinue={handleContinue}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// 🔹 Email Verification Modal Component
const EmailVerificationModal = ({ isVisible, onClose, onVerify }: { isVisible: boolean; onClose: () => void; onVerify: (code: string) => void }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [isResendVisible, setResendVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setResendVisible(true);
    }
  }, [timer]);

  const handleResendCode = () => {
    setTimer(60);
    setResendVisible(false);
    console.log("New verification code sent!");
    setErrorMessage('');
    setVerificationCode('');
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      setErrorMessage('');
      onVerify(verificationCode);
    } else {
      setErrorMessage('Please enter a valid 6-digit code');
    }
  };

  const handleTextChange = (text: string) => {
    setVerificationCode(text.replace(/[^0-9]/g, ''));
    if (errorMessage) setErrorMessage('');
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Image source={EMAIL_ICON} style={styles.emailIcon} resizeMode="contain" />
          <Image source={EMAIL_TEXT} style={styles.emailText} resizeMode="contain" />
          <View style={[styles.inputContainer, errorMessage ? styles.inputError : null]}>
            <Image source={MAIL_ICON} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Verification Code"
              keyboardType="numeric"
              maxLength={6}
              value={verificationCode}
              onChangeText={handleTextChange}
            />
          </View>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>
          {!isResendVisible ? (
            <Text style={styles.timerText}>Resend Code in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendText}>Resend Verification Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// 🔹 Account Created Modal Component
const AccountCreatedModal = ({ isVisible, onContinue }: { isVisible: boolean; onContinue: () => void }) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Image source={CHECK_ICON} style={styles.checkIcon} resizeMode="contain" />
          <Image source={CREATED_ACCOUNT_TEXT} style={styles.accountText} resizeMode="contain" />
          <Text style={styles.successMessage}>Welcome to NeoMe! Where your well-being comes to life.</Text>
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
    color: '#333',
    backgroundColor: '#f9f9f9',
    position: 'relative',
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
    marginTop: 5, // Adds spacing between the two lines
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
    //marginTop: 25,
    //backgroundColor: 'rgba(255,255,255,0.3)', // Semi-transparent white background
    borderRadius: 25, // Circular background
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  emailIcon: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  emailText: {
    width: 220,
    height: 45,
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red', // ✅ Turns red when invalid
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#6549FE',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#6549FE',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  checkIcon: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  accountText: {
    width: 250,
    height: 45,
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginBottom: 25,
    marginTop: 20,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#6549FE',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },  
});