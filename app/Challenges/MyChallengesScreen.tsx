// MyChallengesScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth, storage } from '../../firebaseConfig';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  startDate: string;
  endDate: string;
  icon: string;
  progressColor: string;
  friends: string[];
  createdAt: string;
  updatedAt: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  email: string;
  avatarUrl?: string;
}

export default function MyChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchFriendData = async (friendId: string): Promise<Friend | null> => {
    try {
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (!friendDoc.exists()) return null;

      const friendData = friendDoc.data();
      let avatarUrl = '';

      // Get friend's avatar URL if it exists
      if (friendData.avatar) {
        try {
          // Convert gs:// path to HTTPS URL
          if (friendData.avatar.startsWith('gs://')) {
            // Remove 'gs://bucket-name/' prefix and get the path
            const storagePath = friendData.avatar.replace(/^gs:\/\/[^/]+\//, '');
            const avatarRef = ref(storage, storagePath);
            avatarUrl = await getDownloadURL(avatarRef);
          } else {
            // If it's already an HTTPS URL, use it directly
            avatarUrl = friendData.avatar;
          }
        } catch (error) {
          console.warn('Error fetching friend avatar:', error);
        }
      }

      return {
        id: friendDoc.id,
        name: friendData.name || '',
        avatar: friendData.avatar || '',
        email: friendData.email || '',
        avatarUrl,
      };
    } catch (error) {
      console.error('Error fetching friend data:', error);
      return null;
    }
  };

  const handleChallengePress = async (challenge: Challenge) => {
    try {
      // Fetch data for all friends in the challenge
      const friendsData = await Promise.all(
        challenge.friends.map(friendId => fetchFriendData(friendId))
      );

      // Filter out any null values from failed friend fetches
      const validFriends = friendsData.filter((friend): friend is Friend => friend !== null);

      // Navigate to ChallengeVersusScreen with all the data
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No user logged in');
        setLoading(false);
        return;
      }

      router.push({
        pathname: '/Challenges/ChallengeVersusScreen',
        params: {
          challengeId: challenge.id,
          challengeTitle: challenge.title,
          duration: challenge.goal.toString(),
          participants: JSON.stringify(validFriends),
          owner: JSON.stringify({
            id: currentUser.uid,
            name: currentUser.displayName || 'User',
            isHost: true
          })
        },
      });
    } catch (error) {
      console.error('Error preparing challenge data:', error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No user logged in');
        setLoading(false);
        return;
      }

      // Get user's challenges
      const userChallengesRef = collection(db, 'users', currentUser.uid, 'challenges');
      const challengesSnapshot = await getDocs(userChallengesRef);
      
      const challengesData = await Promise.all(
        challengesSnapshot.docs.map(async (doc) => {
          const data = doc.data() as Challenge;
          return {
            ...data,
            id: doc.id,
          };
        })
      );

      setChallenges(challengesData);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5672F9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <ImageBackground
        source={require('../assets/images/challenges/headerBackground.png')}
        style={styles.header}
        resizeMode="cover"
      >
        <TouchableOpacity onPress={() => router.push("/Challenges/ChallengeDashboard")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Challenges</Text>
      </ImageBackground>

      {/* CHALLENGES LIST */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {challenges.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No challenges yet</Text>
            <TouchableOpacity 
              style={styles.createChallengeButton}
              onPress={() => router.push('/Challenges/CreateNewChallenge')}
            >
              <Text style={styles.createChallengeButtonText}>Create a Challenge</Text>
            </TouchableOpacity>
          </View>
        ) : (
          challenges.map((challenge, index) => (
            <TouchableOpacity
              key={challenge.id}
              style={styles.challengeCard}
              onPress={() => handleChallengePress(challenge)}
            >
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDate}>{challenge.startDate} - {challenge.endDate}</Text>
              </View>
              <View style={styles.timeWrapper}>
                <Ionicons name="time-outline" size={20} color="#5672F9" />
                <Text style={styles.challengeTime}>{challenge.goal} min</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 15,
    borderRadius: 15,
    elevation: 2,
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A4C8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B3ECF',
  },
  challengeDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeTime: {
    marginLeft: 6,
    fontWeight: 'bold',
    color: '#FFA600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  createChallengeButton: {
    backgroundColor: '#5672F9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createChallengeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
