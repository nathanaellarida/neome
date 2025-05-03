import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChangePassword = () => {
    // Add your password validation logic here
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    
    // If validation passes, show success modal
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.back(); // Navigate back after closing modal
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <Ionicons name="lock-closed" size={24} color="#6549FE" />
      </View>

      {/* Password Fields */}
      <View style={styles.card}>
        {/* Old Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Old Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showOldPassword}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter your current password"
            />
            <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
              <Ionicons 
                name={showOldPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#6549FE" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter your new password"
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
              <Ionicons 
                name={showNewPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#6549FE" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.hintText}>Must be at least 8 characters</Text>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your new password"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons 
                name={showConfirmPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#6549FE" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Change Password Button */}
      <TouchableOpacity 
        style={styles.changePasswordButton}
        onPress={handleChangePassword}
      >
        <Text style={styles.changePasswordText}>Change Password</Text>
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Large Checkmark Icon */}
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={48} color="white" />
            </View>
            
            <Text style={styles.successTitle}>Successfully Changed</Text>
            <Text style={styles.successSubtitle}>Password!</Text>
            
            <Text style={styles.successText}>
              Password changed. You can now use your new password to log in.
            </Text>
            
            <TouchableOpacity 
              style={styles.okButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.okButtonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF2FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginLeft: 5,
  },
  changePasswordButton: {
    backgroundColor: '#6549FE',
    marginHorizontal: 60,
    marginTop: 25,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  changePasswordText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  checkmarkCircle: {
    backgroundColor: '#4CAF50', // Green color for success
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6549FE',
    marginBottom: 5,
  },
  successSubtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6549FE',
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  okButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  okButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});