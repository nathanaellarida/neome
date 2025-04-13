import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const ChallengeTimerScreen: React.FC = () => {
  const { challengeTitle, duration } = useLocalSearchParams<{
    challengeTitle: string;
    duration: string;
  }>();

  const parsedDuration = parseInt(duration || '0');

  const [timeLeft, setTimeLeft] = useState(parsedDuration * 60);
  const [isActive, setIsActive] = useState(true);

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStopConfirmModal, setShowStopConfirmModal] = useState(false);
  const [showStopSuccessModal, setShowStopSuccessModal] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/')}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{challengeTitle}</Text>
      </View>

      {/* UPPER CONTAINER */}
      <ImageBackground
        source={require('../assets/images/challenges/timerBackground.png')}
        style={styles.upperContainer}
        resizeMode="cover"
      />

      {/* LOWER CONTAINER */}
      <View style={styles.lowerContainer}>
        <View style={styles.timerWrapper}>
          <Text style={styles.timerText}>{formatTime()}</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            setIsActive(false);
            setShowPauseModal(true);
          }}
        >
          <Text style={styles.btnText}>Pause</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => {
            setIsActive(false);
            setShowStopConfirmModal(true);
          }}
        >
          <Text style={styles.secondaryText}>Stop</Text>
        </TouchableOpacity>
      </View>

      {/* === PAUSE MODAL === */}
      <Modal visible={showPauseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="pause-circle-outline" size={90} color="#6549FE" style={{ marginBottom: 5 }} />
            <Text style={styles.modalTitle}>Challenge Paused</Text>
            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { marginTop: 35 }]}
              onPress={() => {
                setShowPauseModal(false);
                setIsActive(true);
              }}
            >
              <Text style={styles.btnText}>Resume</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* === STOP CONFIRM MODAL === */}
      <Modal visible={showStopConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="stop-circle-outline" size={90} color="#FF5A5F" />
            <Text style={styles.modalTitle}>Are you sure you want to stop challenge?</Text>
            <Text style={styles.modalSubtitle}>Your current points will be your final points</Text>
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                setShowStopConfirmModal(false);
                setShowStopSuccessModal(true);
              }}
            >
              <Text style={styles.btnText}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSecondaryBtn}
              onPress={() => {
                setShowStopConfirmModal(false);
                setIsActive(true);
              }}
            >
              <Text style={styles.secondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* === STOP SUCCESS MODAL === */}
      <Modal visible={showStopSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle-outline" size={90} color="green" />
            <Text style={styles.modalTitle}>Successfully stopped the challenge</Text>
            <Text style={styles.modalSubtitle}>Your current points will be your final points</Text>
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                setShowStopSuccessModal(false);
                // Add your leaderboard route here if any
              }}
            >
              <Text style={styles.btnText}>View Leaderboards</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSecondaryBtn}
              onPress={() => {
                setShowStopSuccessModal(false);
                router.push('/Challenges/ChallengeDashboard')
              }}
            >
              <Text style={styles.secondaryText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ChallengeTimerScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  upperContainer: {
    flex: 4,
    width: '100%',
  },
  lowerContainer: {
    flex: 6,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
  },
  timerWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 12,
    borderColor: '#6549FE',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  timerText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  primaryBtn: {
    backgroundColor: '#6549FE',
    paddingHorizontal: 70,
    paddingVertical: 14,
    borderRadius: 40,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
    //marginTop: 50,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#6549FE',
    paddingHorizontal: 70,
    paddingVertical: 14,
    borderRadius: 40,
    width: '80%',
    alignItems: 'center',
    marginTop: -20,
  },
  secondaryText: {
    color: '#6549FE',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6549FE',
    textAlign: 'center',
    marginTop: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 12,
    marginBottom: 20,
  },
  modalPrimaryBtn: {
    backgroundColor: '#6549FE',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
  },
  
  modalPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  modalSecondaryBtn: {
    marginTop: 14,
    borderColor: '#6549FE',
    borderWidth: 2,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  
  modalSecondaryText: {
    color: '#6549FE',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
});
