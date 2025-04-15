// app/Challenges/ChallengeVersusScreen.tsx
import React from 'react';
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

type AvatarUser = {
  name: string;
  avatar: ImageSourcePropType;
};

export default function ChallengeVersusScreen() {
  const { challengeTitle, owner, participants, duration } = useLocalSearchParams<{
    challengeTitle: string;
    owner: string;
    participants: string;
    duration?: string;
  }>();

  const parsedOwner = owner ? JSON.parse(owner) : { name: '', avatar: '' };
  const parsedParticipants: AvatarUser[] = participants ? JSON.parse(participants) : [];

  const visibleParticipants = parsedParticipants.slice(0, 3);
  const extraCount = parsedParticipants.length > 3 ? parsedParticipants.length - 3 : 0;

  return (
    <ImageBackground
      source={require('../assets/images/challenges/versus screen background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Text style={styles.title}>{challengeTitle}</Text>

      {/* Owner */}
      <View style={styles.ownerContainer}>
        {parsedOwner.avatar && (
          <Image
            source={typeof parsedOwner.avatar === 'string'
              ? { uri: parsedOwner.avatar }
              : parsedOwner.avatar}
            style={styles.avatar}
          />
        )}
        <Text style={styles.name}>{parsedOwner.name}</Text>
      </View>

      {/* Participants */}
      <View style={styles.participantContainer}>
        {visibleParticipants.map((p, index) => (
          <View key={index} style={styles.participantIcon}>
            {p.avatar && (
              <Image
                source={typeof p.avatar === 'string' ? { uri: p.avatar } : p.avatar}
                style={styles.avatar}
              />
            )}
            <Text style={styles.nameSmall}>{p.name}</Text>
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
          style={styles.startBtn}
          onPress={() =>
            router.push({
              pathname: '/Challenges/ChallengeTimerScreen',
              params: {
                challengeTitle,
                duration: parseInt(duration?.replace(/[^\d]/g, '') || '0').toString(),
              },
            })
          }
        >
          <Text style={styles.btnText}>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.push("/Challenges/MyChallengesScreen")}>
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
  ownerContainer: {
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
