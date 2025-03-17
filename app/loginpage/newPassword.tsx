import React, { useState } from 'react';
import { 
  View, Text, TextInput, Image, TouchableOpacity, StyleSheet, 
  Dimensions, KeyboardAvoidingView, ScrollView, Platform, Modal 
} from 'react-native';
import { router } from 'expo-router';

// ✅ Image Imports
const TOP_BORDER = require('../assets/images/forgotBorder.png');
const LOCK_ICON = require('../assets/images/lockPassword.png');
const NEW_PASSWORD_TEXT = require('../assets/images/newPasswordText.png');
const BACK_ICON = require('../assets/images/backPurple.png');
const CHECK_ICON = require('../assets/images/check.png');
const PASSWORD_CHANGED_TEXT = require('../assets/images/passwordChangedText.png');
const OPEN_EYE = require('../assets/images/openEyes.png');
const CLOSE_EYE = require('../assets/images/eyeOff.png');

const { width, height } = Dimensions.get('window');

export default function NewPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  const handleSave = () => {
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setErrorMessage('');
    setSuccessModalVisible(true); // ✅ Open success modal
  };

  const handleConfirm = () => {
    setSuccessModalVisible(false);
    router.push('/loginpage/login'); // ✅ Redirect to Login Page
  };

  const handleBackPress = () => {
    router.push('/loginpage/forgotPassword'); // ✅ Redirect back to Forgot Password Page
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
      >
        {/* Top White Border */}
        <Image source={TOP_BORDER} style={styles.topBorder} resizeMode="contain" />

        {/* Back Button */}
        <TouchableOpacity style={styles.backButtonContainer} onPress={handleBackPress}>
          <View style={styles.backButtonRow}> 
            <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
            <Text style={styles.backText}>Forgot Password</Text>
          </View>
        </TouchableOpacity>

        {/* Card Container */}
        <View style={styles.card}>
          {/* Lock Icon */}
          <Image source={LOCK_ICON} style={styles.lockIcon} resizeMode="contain" />

          {/* Change Password Text */}
          <Image source={NEW_PASSWORD_TEXT} style={styles.description} resizeMode="contain" />

          {/* New Password Field */}
          <View style={[styles.inputContainer, errorMessage ? styles.inputError : null]}>
            <TextInput 
              style={styles.input} 
              placeholder="New password"
              placeholderTextColor="#888"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
              <Image source={showNewPassword ? OPEN_EYE : CLOSE_EYE} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Field */}
          <View style={[styles.inputContainer, errorMessage ? styles.inputError : null]}>
            <TextInput 
              style={styles.input} 
              placeholder="Confirm password"
              placeholderTextColor="#888"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Image source={showConfirmPassword ? OPEN_EYE : CLOSE_EYE} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          {/* Show Error Message Below Input Field */}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Password Successfully Changed Modal */}
        <SuccessModal
          isVisible={isSuccessModalVisible}
          onConfirm={handleConfirm}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ✅ Success Modal Component
const SuccessModal = ({ isVisible, onConfirm }: { isVisible: boolean; onConfirm: () => void }) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Image source={CHECK_ICON} style={styles.checkIcon} resizeMode="contain" />
          <Image source={PASSWORD_CHANGED_TEXT} style={styles.successText} resizeMode="contain" />
          <Text style={styles.successMessage}>Your password has been updated. You can now use your new password to log in.</Text>
          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FF',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBorder: {
    width: width,
    height: height * 0.20, 
    position: 'absolute',
    top: 0,
  },
  backButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    marginTop: 30
  },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  backText: {
    fontSize: 16,
    color: '#6549FE',
    fontWeight: 'bold',
    marginLeft: 10,
  },  
  card: {
    width: width * 0.85,
    backgroundColor: '#fff',
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginTop: height * 0.15,
  },
  lockIcon: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  description: {
    width: '100%',
    height: 60,
    marginBottom: 20,
  },
  checkIcon: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginBottom: 25,
    marginTop: 20,
  },
  successText: {
    width: 250,
    height: 45,
    marginBottom: 10,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#6549FE',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },  
  inputContainer: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#6549FE',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
});
