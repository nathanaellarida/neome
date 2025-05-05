// app/Challenges/ChallengeVersusScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ImageSourcePropType } from 'react-native';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage, db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, onSnapshot, collection, query, where } from 'firebase/firestore';

type AvatarUser = {
  name: string;
  avatar: string;
  avatarUrl?: string;
  id: string;
};

type CurrentUser = {
  name: string;
  avatar: string;
  avatarUrl?: string;
};

const getAvatarUrl = async (avatarPath: string): Promise<string | undefined> => {
  if (!avatarPath || avatarPath.startsWith('http')) return avatarPath;
  try {
    const storageRef = ref(storage, avatarPath);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error getting avatar URL:', error);
    return undefined;
  }
};

export default function ChallengeVersusScreen() {
  const { challengeTitle, owner, participants, duration, challengeId } = useLocalSearchParams<{
    challengeTitle: string;
    owner: string;
    participants: string;
    duration?: string;
    challengeId: string;
  }>();

  // Log the initial parameters
  useEffect(() => {
    console.log('Route Parameters:', {
      challengeTitle,
      owner,
      participants,
      duration,
      challengeId
    });
  }, [challengeTitle, owner, participants, duration, challengeId]);

  const [ownerWithUrl, setOwnerWithUrl] = useState<AvatarUser | null>(null);
  const [participantsWithUrls, setParticipantsWithUrls] = useState<AvatarUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [readyStatuses, setReadyStatuses] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const avatarUrl = await getAvatarUrl(userData.avatar);
            setCurrentUser({
              name: userData.name || 'User',
              avatar: userData.avatar || '',
              avatarUrl,
            });
            // Set initial ready status
            setIsReady(userData.readyStatus || false);
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Listen for ready status changes of all participants
  useEffect(() => {
    if (!participants) return;

    try {
      const parsedParticipants = JSON.parse(participants);
      const participantIds = parsedParticipants.map((p: AvatarUser) => p.id);
      
      // Create a query to listen to all participants' documents
      const usersQuery = query(
        collection(db, 'users'), 
        where('__name__', 'in', participantIds)
      );

      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const newReadyStatuses: { [key: string]: boolean } = {};
        
        snapshot.forEach((doc) => {
          const userData = doc.data();
          newReadyStatuses[doc.id] = userData.readyStatus || false;
        });
        
        setReadyStatuses(newReadyStatuses);

        // Check if current user and all participants are ready
        const auth = getAuth();
        const currentUserId = auth.currentUser?.uid;
        
        if (currentUserId && isReady) {
          // Check if all participants are ready
          const allParticipantsReady = participantIds.every((id: string) => newReadyStatuses[id]);
          
          // Only route if both current user and all participants are ready
          if (allParticipantsReady && participantIds.length > 0) {
            console.log('All users ready, navigating to timer screen');

            // Reset ready status for current user and all participants
            const resetPromises = [
              // Reset current user's ready status
              updateDoc(doc(db, 'users', currentUserId), {
                readyStatus: false
              }),
              // Reset all participants' ready status
              ...participantIds.map((id: string) => 
                updateDoc(doc(db, 'users', id), {
                  readyStatus: false
                })
              )
            ];

            // Wait for all ready status resets to complete before routing
            Promise.all(resetPromises)
              .then(() => {
                // Parse the owner object to get the owner's ID
                let ownerData;
                try {
                  // First check if we have an owner
                  if (!owner) {
                    console.error('Owner parameter is missing');
                    return;
                  }

                  // Check if owner is already an object or needs parsing
                  ownerData = typeof owner === 'string' ? JSON.parse(owner) : owner;
                  
                  // Log the owner data for debugging
                  console.log('Owner data:', ownerData);
                  
                  // Validate owner data
                  if (!ownerData || !ownerData.id) {
                    console.error('Invalid owner data:', ownerData);
                    return;
                  }
                } catch (error) {
                  console.error('Error parsing owner data:', error);
                  return;
                }
                
                router.push({
                  pathname: '/Challenges/ChallengeTimerScreen',
                  params: {
                    challengeId,
                    challengeTitle,
                    duration,
                    participants,
                    ownerId: ownerData.id // Pass the owner's ID
                  }
                });
              })
              .catch(error => {
                console.error('Error resetting ready statuses:', error);
              });
          }
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up ready status listener:', error);
    }
  }, [participants, challengeId, challengeTitle, duration, isReady, owner]);

  useEffect(() => {
    const fetchAvatarUrls = async () => {
      // Fetch owner avatar URL
      const parsedOwner = owner ? JSON.parse(owner) : { name: '', avatar: '' };
      if (parsedOwner.avatar) {
        const avatarUrl = await getAvatarUrl(parsedOwner.avatar);
        setOwnerWithUrl({ ...parsedOwner, avatarUrl, id: parsedOwner.name });
      } else {
        setOwnerWithUrl(parsedOwner);
      }

      // Fetch participants avatar URLs
      const parsedParticipants: AvatarUser[] = participants ? JSON.parse(participants) : [];
      const participantsWithAvatarUrls = await Promise.all(
        parsedParticipants.map(async (participant) => {
          if (participant.avatar) {
            const avatarUrl = await getAvatarUrl(participant.avatar);
            return { ...participant, avatarUrl };
          }
          return participant;
        })
      );
      setParticipantsWithUrls(participantsWithAvatarUrls);
    };

    fetchAvatarUrls();
  }, [owner, participants]);

  const visibleParticipants = participantsWithUrls.slice(0, 3);
  const extraCount = participantsWithUrls.length > 3 ? participantsWithUrls.length - 3 : 0;

  const handleReadyPress = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const newReadyStatus = !isReady;
        setIsReady(newReadyStatus);

        // Update ready status in user document
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          readyStatus: newReadyStatus
        });
      }
    } catch (error) {
      console.error('Error updating ready status:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/challenges/versus screen background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Text style={styles.title}>{challengeTitle}</Text>

      {/* Current User */}
      <View style={styles.currentUserContainer}>
        {currentUser?.avatar && (
          <View>
            <Image
              source={
                currentUser.avatarUrl
                  ? { uri: currentUser.avatarUrl }
                  : require('../../assets/images/default-avatar.png')
              }
              style={[
                styles.avatar,
                isReady && styles.readyAvatar
              ]}
              defaultSource={require('../../assets/images/default-avatar.png')}
            />
            {isReady && (
              <View style={styles.readyIndicator}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>
        )}
        <Text style={styles.name}>{currentUser?.name}</Text>
        {isReady && <Text style={styles.readyText}>Ready!</Text>}
      </View>

      {/* Participants */}
      <View style={styles.participantContainer}>
        {visibleParticipants.map((p, index) => (
          <View key={index} style={styles.participantIcon}>
            {p.avatar && (
              <View>
                <Image
                  source={
                    p.avatarUrl
                      ? { uri: p.avatarUrl }
                      : require('../../assets/images/default-avatar.png')
                  }
                  style={[
                    styles.avatar,
                    readyStatuses[p.id] && styles.readyAvatar
                  ]}
                  defaultSource={require('../../assets/images/default-avatar.png')}
                />
                {readyStatuses[p.id] && (
                  <View style={styles.readyIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </View>
            )}
            <Text style={styles.nameSmall}>{p.name}</Text>
            {readyStatuses[p.id] && (
              <Text style={styles.readyTextSmall}>Ready!</Text>
            )}
          </View>
        ))}

        {extraCount > 0 && (
          <View style={styles.extraCircle}>
            <Text style={styles.extraText}>{`${extraCount}+`}</Text>
          </View>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.startBtn, isReady && styles.readyBtn]}
          onPress={handleReadyPress}
        >
          <Text style={[styles.btnText, isReady && styles.readyBtnText]}>
            {isReady ? 'Ready!' : 'Ready'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelBtn} 
          onPress={() => router.push("/Challenges/MyChallengesScreen")}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  currentUserContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: 150,
    left: 30,
  },
  participantContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 180,
    right: 20,
    alignItems: 'center',
  },
  participantIcon: {
    alignItems: 'center',
    marginHorizontal: 3,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    marginTop: 5,
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  nameSmall: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  extraCircle: {
    width: 32,
    height: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  extraText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5D4FEF',
  },
  buttonGroup: {
    alignItems: 'center',
  },
  readyAvatar: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  readyIndicator: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  readyText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  readyTextSmall: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  readyBtn: {
    backgroundColor: '#4CAF50',
  },
  readyBtnText: {
    color: '#FFFFFF',
  },
  startBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 70,
    paddingVertical: 14,
    borderRadius: 40,
    marginBottom: 10,
  },
  btnText: {
    color: '#5D4FEF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingHorizontal: 60,
    paddingVertical: 14,
    borderRadius: 40,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
