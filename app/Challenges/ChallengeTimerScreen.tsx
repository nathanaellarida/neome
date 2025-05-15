import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { Audio } from 'expo-av';

function calculateChallengePoints(totalMinutes: number, completedMinutes: number): number {
  const maxPoints = totalMinutes * 2;
  const percent = completedMinutes / totalMinutes;
  let tier = 0;
  if (percent >= 1) tier = 1;
  else if (percent >= 0.8) tier = 0.8;
  else if (percent >= 0.7) tier = 0.7;
  else if (percent >= 0.5) tier = 0.5;
  else if (percent >= 0.3) tier = 0.3;
  else if (percent >= 0.25) tier = 0.25;
  else tier = 0;
  const points = maxPoints * tier;
  return Math.round(points * 10) / 10;
}

const ChallengeTimerScreen: React.FC = () => {
  const { challengeTitle, duration, challengeId, participants, ownerId } = useLocalSearchParams<{
    challengeTitle: string;
    duration: string;
    challengeId: string;
    participants: string;
    ownerId: string;
  }>();

  const parsedDuration = parseInt(duration || '0');
  const [timeLeft, setTimeLeft] = useState(parsedDuration * 60);
  const [originalTime, setOriginalTime] = useState(parsedDuration * 60);
  const [isActive, setIsActive] = useState(true);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStopConfirmModal, setShowStopConfirmModal] = useState(false);
  const [showStopSuccessModal, setShowStopSuccessModal] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [showParticipantPausedModal, setShowParticipantPausedModal] = useState(false);
  const [pausedByUser, setPausedByUser] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Calculate pointsText based on Firestore originalTime and timeLeft
  const totalMinutes = originalTime / 60;
  const completedMinutes = (originalTime - timeLeft) / 60;
  const pointsText = `${calculateChallengePoints(totalMinutes, completedMinutes)} Points`;

  // Initialize shared challenge document
  useEffect(() => {
    const initializeSharedChallenge = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser || !challengeId) return;

      const sharedChallengeRef = doc(db, 'shared_challenges', challengeId);
      
      try {
        // Try to get the shared challenge document
        const sharedDoc = await getDoc(sharedChallengeRef);
        
        // If it doesn't exist, create it
        if (!sharedDoc.exists()) {
          await setDoc(sharedChallengeRef, {
            timeLeft: parsedDuration * 60,
            originalTime: parsedDuration * 60,
            timerState: 'running',
            lastUpdated: serverTimestamp(),
            participants: JSON.parse(participants || '[]'),
            ownerId: ownerId,
            challengeTitle: challengeTitle
          });
        }
      } catch (error) {
        console.error('Error initializing shared challenge:', error);
      }
    };

    initializeSharedChallenge();
  }, [challengeId, ownerId, parsedDuration, participants, challengeTitle]);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser || !challengeId) {
      console.log('Missing required data:', { currentUser, challengeId });
      return;
    }

    // Check if current user is the host
    const isUserHost = currentUser.uid === ownerId;
    setIsHost(isUserHost);

    // Set up real-time listener for the shared challenge
    const sharedChallengeRef = doc(db, 'shared_challenges', challengeId);
    const unsubscribe = onSnapshot(sharedChallengeRef, (doc) => {
      const data = doc.data();
      console.log('Timer update from Firestore:', data);
      if (data) {
        setTimeLeft(data.timeLeft);
        if (data.originalTime) setOriginalTime(data.originalTime);
        const isPaused = data.timerState === 'paused' || !!data.pausedBy;
        setIsActive(!isPaused);

        if (data.lastUpdated) {
          setLastUpdateTime(data.lastUpdated.toMillis());
        }

        // Handle pause notifications
        if (data.pausedBy && data.pausedBy.id !== currentUser.uid) {
          setPausedByUser(data.pausedBy.name);
          setShowParticipantPausedModal(true);
        } else if (!data.pausedBy) {
          // Close the participant paused modal when timer is resumed
          setShowParticipantPausedModal(false);
          setPausedByUser('');
        }
      }
    });

    return () => unsubscribe();
  }, [challengeId, ownerId]);

  // Update the timer effect to sync with Firebase
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Only run timer if active and no one has paused
    if (isActive && timeLeft > 0) {
      console.log('Starting timer:', { isActive, timeLeft });
      timer = setInterval(async () => {
        try {
          const sharedChallengeRef = doc(db, 'shared_challenges', challengeId);
          
          // Check current state before updating
          const snapshot = await getDoc(sharedChallengeRef);
          const data = snapshot.data();
          
          // Only update if the timer is still running and no one has paused
          if (data && data.timerState === 'running' && !data.pausedBy) {
            const newTimeLeft = timeLeft - 1;
            setTimeLeft(newTimeLeft);
            
            // Only update Firebase if we're the host
            if (isHost) {
              await updateDoc(sharedChallengeRef, {
                timeLeft: newTimeLeft,
                timerState: 'running',
                lastUpdated: serverTimestamp()
              });
            }
          } else {
            // If someone paused, clear the interval
            clearInterval(timer);
          }
        } catch (error) {
          console.error('Error updating timer:', error);
          clearInterval(timer);
        }
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isActive, timeLeft, isHost, challengeId]);

  useEffect(() => {
    // Request audio permissions
    const getPermissions = async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    };

    getPermissions();

    // Cleanup
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handlePause = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const sharedChallengeRef = doc(db, 'shared_challenges', challengeId);
    try {
      await updateDoc(sharedChallengeRef, {
        timerState: 'paused',
        timeLeft: timeLeft,
        lastUpdated: serverTimestamp(),
        pausedBy: {
          id: currentUser.uid,
          name: currentUser.displayName || 'A participant'
        }
      });
      setIsActive(false);
      setShowPauseModal(true);
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  };

  const handleResume = async () => {
    const sharedChallengeRef = doc(db, 'shared_challenges', challengeId);
    try {
      await updateDoc(sharedChallengeRef, {
        timerState: 'running',
        timeLeft: timeLeft,
        lastUpdated: serverTimestamp(),
        pausedBy: null // Clear the pausedBy field when resuming
      });
      setIsActive(true);
      setShowPauseModal(false);
      // No need to set showParticipantPausedModal here as it will be handled by the Firestore listener
    } catch (error) {
      console.error('Error resuming timer:', error);
    }
  };

  const handleStop = async () => {
    const sharedChallengeRef = doc(db, 'shared_challenges', challengeId);
    try {
      await updateDoc(sharedChallengeRef, {
        timerState: 'stopped',
        timeLeft: timeLeft,
        lastUpdated: serverTimestamp()
      });
      setIsActive(false);
      setShowStopConfirmModal(false);
      setShowStopSuccessModal(true);
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const startCall = async () => {
    try {
      const recordingObject = new Audio.Recording();
      await recordingObject.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recordingObject.startAsync();
      setRecording(recordingObject);
      setIsCallActive(true);

      // Update Firestore to indicate user is in a call
      const sharedChallengeRef = doc(db, 'shared_challenges', challengeId);
      await updateDoc(sharedChallengeRef, {
        callActive: true,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const endCall = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      setIsCallActive(false);

      // Update Firestore to indicate call has ended
      const sharedChallengeRef = doc(db, 'shared_challenges', challengeId);
      await updateDoc(sharedChallengeRef, {
        callActive: false,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error ending call:', error);
    }
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
      >
        {/* Points System UI - overlayed */}
        <View style={styles.pointsContainer}>
          <Image
            source={require('../assets/images/points.png')}
            style={styles.pointsIcon}
          />
          <Text style={styles.pointsText}>{pointsText}</Text>
        </View>
      </ImageBackground>

      {/* LOWER CONTAINER */}
      <View style={styles.lowerContainer}>
        <View style={styles.timerWrapper}>
          <Text style={styles.timerText}>{formatTime()}</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handlePause}
        >
          <Text style={styles.btnText}>Pause</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => setShowStopConfirmModal(true)}
        >
          <Text style={styles.secondaryText}>Stop</Text>
        </TouchableOpacity>

        {/* Voice Call Button */}
        <TouchableOpacity
          style={[styles.voiceCallBtn, isCallActive && styles.voiceCallBtnActive]}
          onPress={isCallActive ? endCall : startCall}
        >
          <Ionicons 
            name={isCallActive ? "mic" : "mic-outline"} 
            size={24} 
            color={isCallActive ? "#fff" : "#6549FE"} 
          />
          <Text style={[styles.voiceCallText, isCallActive && styles.voiceCallTextActive]}>
            {isCallActive ? "End Voice" : "Start Voice"}
          </Text>
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
              onPress={handleResume}
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
              onPress={handleStop}
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
                setShowStopSuccessModal(false);                router.push({
                  pathname: './SuccessPoints',
                  params: { points: calculateChallengePoints(originalTime / 60, (originalTime - timeLeft) / 60).toString() }
                });
              }}
            >
              <Text style={styles.btnText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryBtn}
              onPress={() => {
                setShowStopSuccessModal(false);
                router.push('./ChallengeDashboard');
              }}
            >
              <Text style={styles.secondaryText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Participant Paused Modal */}
      <Modal visible={showParticipantPausedModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="pause-circle-outline" size={90} color="#6549FE" style={{ marginBottom: 5 }} />
            <Text style={styles.modalTitle}>{pausedByUser} paused the challenge</Text>
            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { marginTop: 35 }]}
              onPress={() => setShowParticipantPausedModal(false)}
            >
              <Text style={styles.btnText}>OK</Text>
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
  
  voiceCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#6549FE',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 40,
    width: '80%',
    marginTop: 10,
  },
  voiceCallBtnActive: {
    backgroundColor: '#6549FE',
  },
  voiceCallText: {
    color: '#6549FE',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  voiceCallTextActive: {
    color: '#fff',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 18,
    left: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  pointsIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    resizeMode: 'contain',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA836',
  },
});
