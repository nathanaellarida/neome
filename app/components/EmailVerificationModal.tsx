import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import { sendEmailVerification } from 'firebase/auth';

interface EmailVerificationModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerificationComplete: () => void;
}

const { width } = Dimensions.get('window');

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  visible,
  email,
  onClose,
  onVerificationComplete,
}) => {
  const handleResendEmail = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        Alert.alert('Success', 'Verification email has been resent');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend verification email');
    }
  };

  const handleOpenEmail = async () => {
    try {
      await Linking.openURL('mailto:');
    } catch (error) {
      Alert.alert('Error', 'Could not open email app');
    }
  };

  const checkVerificationStatus = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          onVerificationComplete();
        } else {
          Alert.alert('Not Verified', 'Please click the verification link in your email first');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check verification status');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Email Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={40} color="#6549FE" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Email Verification Sent!</Text>

          {/* Instructions */}
          <Text style={styles.emailText}>
            We've sent a verification link to:{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <Text style={styles.instructions}>
            1. Open your email app{'\n'}
            2. Check your inbox (and spam folder){'\n'}
            3. Click the verification link{'\n'}
            4. Return here and press "I've Verified"
          </Text>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.verifyButton} onPress={checkVerificationStatus}>
            <Text style={styles.verifyButtonText}>I've Verified</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emailButton} onPress={handleOpenEmail}>
            <Text style={styles.emailButtonText}>Open Email App</Text>
          </TouchableOpacity>

          {/* Resend Link */}
          <TouchableOpacity onPress={handleResendEmail}>
            <Text style={styles.resendText}>Resend Verification Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width * 0.85,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F0EEFF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6549FE',
    textAlign: 'center',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  emailHighlight: {
    color: '#6549FE',
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 24,
    alignSelf: 'flex-start',
    paddingLeft: 20,
  },
  verifyButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6549FE',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#F0EEFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  emailButtonText: {
    color: '#6549FE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendText: {
    color: '#6549FE',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default EmailVerificationModal; 