import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VerificationStatusModalProps {
  visible: boolean;
  status: 'verifying' | 'success';
  onContinue: () => void;
}

const { width } = Dimensions.get('window');

const VerificationStatusModal: React.FC<VerificationStatusModalProps> = ({
  visible,
  status,
  onContinue,
}) => {
  // Animation value for the loading dots
  const dotOpacity = new Animated.Value(0);

  useEffect(() => {
    if (status === 'verifying') {
      // Create loading animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
          Animated.timing(dotOpacity, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
        ])
      ).start();
    }
  }, [status]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {status === 'verifying' ? (
            <>
              {/* Email Icon */}
              <View style={[styles.iconContainer, styles.emailIconContainer]}>
                <Ionicons name="mail" size={40} color="#6549FE" />
              </View>

              <Text style={styles.title}>Verifying Account</Text>
              <Text style={styles.subtitle}>
                We are currently verifying your{'\n'}account. Please wait.
              </Text>

              {/* Animated Loading Dots */}
              <View style={styles.loadingContainer}>
                <Animated.View 
                  style={[
                    styles.dot, 
                    { opacity: dotOpacity }
                  ]} 
                />
                <Animated.View 
                  style={[
                    styles.dot, 
                    { opacity: dotOpacity, marginHorizontal: 8 }
                  ]} 
                />
                <Animated.View 
                  style={[
                    styles.dot, 
                    { opacity: dotOpacity }
                  ]} 
                />
              </View>
            </>
          ) : (
            <>
              {/* Success Icon */}
              <View style={[styles.iconContainer, styles.successIconContainer]}>
                <Ionicons name="checkmark" size={40} color="#6549FE" />
              </View>

              <Text style={styles.title}>Successfully Created{'\n'}Account!</Text>
              <Text style={styles.subtitle}>
                Welcome to NeoME! Where your{'\n'}well-being comes to life.
              </Text>

              {/* Continue Button */}
              <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </>
          )}
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
    minHeight: 300,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emailIconContainer: {
    backgroundColor: '#F0EEFF',
  },
  successIconContainer: {
    backgroundColor: '#E8FFE8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6549FE',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6549FE',
  },
  continueButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6549FE',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerificationStatusModal; 