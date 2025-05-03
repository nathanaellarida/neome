import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState([false, false, false]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleCheckboxToggle = (index: number) => {
    const newChecked = [...isChecked];
    newChecked[index] = !newChecked[index];
    setIsChecked(newChecked);
  };

  const handleDeleteAccount = () => {
    if (!isChecked.every(check => check)) {
      Alert.alert('Error', 'Please acknowledge all statements');
      return;
    }
    
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
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
        <Text style={styles.headerTitle}>Delete Account</Text>
        <Ionicons name="trash-outline" size={24} color="#6549FE" />
      </View>

      {/* Content */}
      <View style={styles.card}>
        {/* Warning Statements */}
        <View style={styles.statementsContainer}>
          {[
            "I understand that this will permanently delete my NeoME account, that my information can't be recovered, and that this action can't be undone.",
            "I understand that I will permanently lose access to all of the data associated with my profile.",
            "I understand that if I choose to rejoin NeoME my username will not be available"
          ].map((statement, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.statementItem}
              onPress={() => handleCheckboxToggle(index)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                {isChecked[index] && (
                  <Ionicons name="checkmark" size={16} color="#6549FE" />
                )}
              </View>
              <Text style={styles.statementText}>{statement}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter your password to delete your account</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
            />
            <View style={styles.passwordActions}>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#6549FE" 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Forgot Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Delete Account Button */}
      <TouchableOpacity 
        style={[
          styles.deleteButton,
          { opacity: isChecked.every(check => check) && password ? 1 : 0.6 }
        ]}
        onPress={handleDeleteAccount}
        disabled={!isChecked.every(check => check) || !password}
      >
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Large Trash Icon */}
            <View style={styles.trashCircle}>
              <Ionicons name="trash" size={48} color="white" />
            </View>
            
            <Text style={styles.successTitle}>Account Deleted</Text>
            <Text style={styles.successSubtitle}>Successfully!</Text>
            
            <Text style={styles.successText}>
              Your account and all associated data have been permanently deleted.
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
  statementsContainer: {
    marginBottom: 20,
  },
  statementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6549FE',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statementText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  passwordInputWrapper: {
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  input: {
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  forgotPasswordButton: {
    padding: 5,
  },
  forgotPasswordText: {
    color: '#6549FE',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 60,
    marginTop: 25,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  deleteButtonText: {
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
  trashCircle: {
    backgroundColor: '#FF3B30',
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