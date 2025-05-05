import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, arrayUnion, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

interface Challenge {
  title: string;
  description: string;
  goal: number;
  startDate: string;
  endDate: string;
  createdBy: string;
}

const getChallengeIconUrl = (challengeName: string) => {
  const tokens: { [key: string]: string } = {
    'Cycling': '36c42a49-275e-4d42-954f-ede41080ee38',
    'Dancing': '8b8f4dba-5f67-4c86-a9ea-602eb7570981',
    'Hiking': 'd9b90dd4-e0a7-4f6c-a427-2437d5b730c7',
    'Home Workout': '36356795-42d9-4a58-82a5-869c3be58e36',
    'Jogging': '5b3c504b-d4a6-48b7-97a9-99a0a78f6eef',
    'Jump Rope': 'b1b834d1-dc06-4a07-a2ce-ab989befdcc1',
    'Streching': '32bf5be4-d5bd-489a-af66-c2f8a2c0eb02',
    'Swimming': 'fe9992a8-edfe-496c-9bcb-50bd61739be8',
    'Walking': 'd9bd04ad-6574-4650-bce7-75737bf42798',
    'Yoga': '21c1bc90-376c-4bf8-ad8e-8185371631dd',
    'default': 'YOUR_TOKEN',
  };
  const fileName = encodeURIComponent(`${challengeName}.png`);
  const token = tokens[challengeName] || tokens['default'];
  return `https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/challenges_icons%2F${fileName}?alt=media&token=${token}`;
};

export default function ChallengeInvitation() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [senderName, setSenderName] = useState('');

  useEffect(() => {
    const loadChallengeDetails = async () => {
      try {
        const { challengeId, senderId } = params;
        if (!challengeId || !senderId) {
          Alert.alert('Error', 'Invalid challenge invitation');
          router.back();
          return;
        }

        // Get challenge details
        const challengeDoc = await getDoc(doc(db, 'users', senderId as string, 'challenges', challengeId as string));
        if (!challengeDoc.exists()) {
          Alert.alert('Error', 'Challenge not found');
          router.back();
          return;
        }

        // Get sender's name
        const senderDoc = await getDoc(doc(db, 'users', senderId as string));
        if (senderDoc.exists()) {
          setSenderName(senderDoc.data()?.name || 'Someone');
        }

        setChallenge(challengeDoc.data() as Challenge);
        setLoading(false);
      } catch (error) {
        console.error('Error loading challenge details:', error);
        Alert.alert('Error', 'Failed to load challenge details');
        router.back();
      }
    };

    loadChallengeDetails();
  }, [params]);

  const handleAccept = async () => {
    try {
      const currentUser = auth.currentUser;
      const { challengeId, senderId, notificationId } = params;
      
      if (!currentUser || !challengeId || !senderId || !challenge) {
        Alert.alert('Error', 'Invalid challenge data');
        return;
      }

      // Create challenge in current user's collection
      const userChallengeRef = doc(db, 'users', currentUser.uid, 'challenges', challengeId as string);
      await setDoc(userChallengeRef, {
        title: challenge.title,
        description: challenge.description,
        goal: challenge.goal,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        icon: getChallengeIconUrl(challenge.title),
        progressColor: '#6549FF',
        friends: [senderId as string],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        accepted: true,
        acceptedAt: serverTimestamp()
      });

      // Update original challenge's friends array
      const originalChallengeRef = doc(db, 'users', senderId as string, 'challenges', challengeId as string);
      await updateDoc(originalChallengeRef, {
        friends: arrayUnion(currentUser.uid)
      });

      // Delete the notification
      if (notificationId) {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'notifications', notificationId as string));
      }

      Alert.alert(
        'Success',
        'You have joined the challenge!',
        [
          {
            text: 'View Challenge',
            onPress: () => router.push('/Challenges/MyChallengesScreen')
          }
        ]
      );
    } catch (error) {
      console.error('Error accepting challenge:', error);
      Alert.alert('Error', 'Failed to accept challenge');
    }
  };

  const handleDecline = async () => {
    try {
      const currentUser = auth.currentUser;
      const { notificationId } = params;
      
      if (!currentUser || !notificationId) {
        Alert.alert('Error', 'Invalid notification data');
        return;
      }

      // Delete the notification
      await deleteDoc(doc(db, 'users', currentUser.uid, 'notifications', notificationId as string));
      
      router.back();
    } catch (error) {
      console.error('Error declining challenge:', error);
      Alert.alert('Error', 'Failed to decline challenge');
    }
  };

  if (loading || !challenge) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6549FE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Invitation</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.description}>{challenge.description}</Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#6549FE" />
              <Text style={styles.detailText}>{challenge.goal} minutes per day</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#6549FE" />
              <Text style={styles.detailText}>
                {challenge.startDate} - {challenge.endDate}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={20} color="#6549FE" />
              <Text style={styles.detailText}>Invited by {senderName}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.acceptButton]}
              onPress={handleAccept}
            >
              <Text style={styles.buttonText}>Accept Challenge</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.declineButton]}
              onPress={handleDecline}
            >
              <Text style={[styles.buttonText, styles.declineText]}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F6FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    paddingTop: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#6549FE',
  },
  declineButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6549FE',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  declineText: {
    color: '#6549FE',
  },
}); 