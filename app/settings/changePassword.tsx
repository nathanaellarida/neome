import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      router.push('/settings/CheckYourMail');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <Ionicons name="lock-closed" size={24} color="#6549FE" />
      </View>

      {/* Instruction Text */}
      <Text style={styles.instructionText}>
        Enter the email associated with your account and we'll send an email with instructions to reset your password.
      </Text>

      {/* Email Field */}
      <View style={styles.inputContainerNoCard}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.emailInput}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email address"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Send Instructions Button */}
      <TouchableOpacity 
        style={styles.sendInstructionsButton}
        onPress={handleSendResetEmail}
      >
        <Text style={styles.sendInstructionsText}>Send Instructions</Text>
      </TouchableOpacity>
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
  instructionText: {
    fontSize: 14,
    color: '#444',
    marginHorizontal: 30,
    marginTop: 30,
    marginBottom: 18,
    textAlign: 'left',
  },
  inputContainerNoCard: {
    marginHorizontal: 30,
    marginBottom: 10,
  },
  emailInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginTop: 6,
  },
  sendInstructionsButton: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: 30,
    marginTop: 18,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendInstructionsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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