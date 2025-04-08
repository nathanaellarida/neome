import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, StyleSheet,
  Dimensions, KeyboardAvoidingView, ScrollView, Platform, Modal
} from 'react-native';
import { router } from 'expo-router';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

// ✅ Image Imports
const TOP_BORDER = require('../assets/images/forgotBorder.png');
const LOCK_ICON = require('../assets/images/lockPassword.png');
const CHANGE_PASS_TEXT = require('../assets/images/changePassword.png');
const BACK_ICON = require('../assets/images/backPurple.png');
const EMAIL_ICON = require('../assets/images/email.png');
const EMAIL_TEXT = require('../assets/images/emailText.png');

const { width, height } = Dimensions.get('window');

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerificationVisible, setVerificationVisible] = useState(false);

  const handleSend = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      const functions = getFunctions(getApp());
      const sendCode = httpsCallable(functions, 'sendVerificationCode');
      await sendCode({ email });

      setErrorMessage('');
      setVerificationVisible(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to send verification code.');
    }
  };

  const handleBackPress = () => {
    router.push('/loginpage/login');
  };

  const handleVerify = () => {
    setVerificationVisible(false);
    setTimeout(() => {
      router.push('/loginpage/newPassword');
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Image source={TOP_BORDER} style={styles.topBorder} resizeMode="contain" />

        <TouchableOpacity style={styles.backButtonContainer} onPress={handleBackPress}>
          <View style={styles.backButtonRow}>
            <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
            <Text style={styles.backText}>Forgot Password</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <Image source={LOCK_ICON} style={styles.lockIcon} resizeMode="contain" />
          <Image source={CHANGE_PASS_TEXT} style={styles.description} resizeMode="contain" />

          <View style={[styles.inputContainer, errorMessage ? styles.inputError : null]}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#888"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.divider} />

          <TouchableOpacity>
            <Text style={styles.tryAnotherWayText}>Try Another Way</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        <EmailVerificationModal
          isVisible={isVerificationVisible}
          onClose={() => setVerificationVisible(false)}
          onVerify={handleVerify}
          email={email}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const EmailVerificationModal = ({
  isVisible,
  onClose,
  onVerify,
  email
}: {
  isVisible: boolean;
  onClose: () => void;
  onVerify: () => void;
  email: string;
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [isResendVisible, setResendVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isVisible) {
      setVerificationCode('');
      setErrorMessage('');
      setTimer(60);
      setResendVisible(false);
    }
  }, [isVisible]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVisible && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setResendVisible(true);
    }
    return () => clearInterval(interval);
  }, [timer, isVisible]);

  const handleResendCode = async () => {
    setTimer(60);
    setResendVisible(false);
    setErrorMessage('');
    setVerificationCode('');

    try {
      const functions = getFunctions(getApp());
      const sendCode = httpsCallable(functions, 'sendVerificationCode');
      await sendCode({ email });
    } catch (err) {
      console.error(err);
      setErrorMessage('Resend failed.');
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit code');
      return;
    }

    try {
      const functions = getFunctions(getApp());
      const verifyCode = httpsCallable(functions, 'verifyCode');
      const response = await verifyCode({ email, code: verificationCode });

      if ((response.data as any).valid) {
        onVerify(); // Navigate
      } else {
        setErrorMessage('Invalid or expired verification code.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Verification failed.');
    }
  };

  const truncatedEmail = email.length > 15
    ? `${email.substring(0, 7)}...${email.substring(email.lastIndexOf('@'))}`
    : email;

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Image source={EMAIL_ICON} style={styles.emailIcon} resizeMode="contain" />
          <Image source={EMAIL_TEXT} style={styles.emailText} resizeMode="contain" />
          <Text style={styles.emailAddressText}>
            Please enter the 6-digit code sent to {truncatedEmail}
          </Text>

          <View style={[styles.inputContainer, errorMessage ? styles.inputError : null]}>
            <TextInput
              style={styles.input}
              placeholder="Verification Code"
              keyboardType="numeric"
              maxLength={6}
              value={verificationCode}
              onChangeText={(text) => {
                setVerificationCode(text.replace(/[^0-9]/g, ''));
                if (errorMessage) setErrorMessage('');
              }}
            />
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode}>
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
        paddingVertical: 60,
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
      inputContainer: {
        width: '100%',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 5,
        backgroundColor: '#F9F9F9',
      },
      inputError: {
        borderColor: 'red',
        borderWidth: 2,
      },
      input: {
        height: 50,
        fontSize: 16,
        color: '#333',
      },
      errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
      },
      divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 15,
      },
      tryAnotherWayText: {
        fontSize: 14,
        color: '#6549FE',
        fontWeight: 'bold',
      },
      sendButton: {
        width: '100%',
        backgroundColor: '#6549FE',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
      },
      sendButtonText: {
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
    emailIcon: {
      width: 70,
      height: 70,
      marginBottom: 10,
    },
    emailText: {
      width: 220,
      height: 40,
      marginBottom: 10,
    },
    emailAddressText: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      marginBottom: 15,
    },
    verifyButton: {
      width: '100%',
      backgroundColor: '#6549FE',
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
      marginTop: 10,
    },
    verifyButtonText: {
      color: '#fff',
      fontSize: 18,
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
  });