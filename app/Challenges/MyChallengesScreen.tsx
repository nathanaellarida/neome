// MyChallengesScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // ✅ Replace navigation hook

const challenges = [
  {
    id: 1,
    title: 'Read a book',
    duration: '30 min',
    owner: { name: 'Ramsey', avatar: require('../assets/images/avatars/user1.png') },
    participants: [
      { name: 'Alice', avatar: require('../assets/images/avatars/user2.png') },
      { name: 'Nat', avatar: require('../assets/images/avatars/user3.png') },
      { name: 'Jamie', avatar: require('../assets/images/avatars/user4.png') },
      { name: 'Kyla', avatar: require('../assets/images/avatars/user5.png') },
    ],
  },
  {
    id: 2,
    title: 'Study',
    duration: '1 hour',
    owner: { name: 'Ramsey', avatar: require('../assets/images/avatars/user1.png') },
    participants: [
      { name: 'Mark', avatar: require('../assets/images/avatars/user2.png') },
      { name: 'Jess', avatar: require('../assets/images/avatars/user3.png') },
    ],
  },
  {
    id: 3,
    title: 'Jogging',
    duration: '45 min',
    owner: { name: 'Ramsey', avatar: require('../assets/images/avatars/user1.png') },
    participants: [
      { name: 'Ava', avatar: require('../assets/images/avatars/user2.png') },
      { name: 'Leo', avatar: require('../assets/images/avatars/user3.png') },
      { name: 'Maya', avatar: require('../assets/images/avatars/user4.png') },
    ],
  },
  {
    id: 4,
    title: 'Drawing',
    duration: '1 hr 30 min',
    owner: { name: 'Ramsey', avatar: require('../assets/images/avatars/user1.png') },
    participants: [
      { name: 'Elaine', avatar: require('../assets/images/avatars/user3.png') },
      { name: 'Kyle', avatar: require('../assets/images/avatars/user4.png') },
    ],
  },
  {
    id: 5,
    title: 'Yoga',
    duration: '40 min',
    owner: { name: 'Ramsey', avatar: require('../assets/images/avatars/user1.png') },
    participants: [
      { name: 'Nina', avatar: require('../assets/images/avatars/user2.png') },
      { name: 'Sam', avatar: require('../assets/images/avatars/user3.png') },
      { name: 'Tara', avatar: require('../assets/images/avatars/user4.png') },
      { name: 'Liam', avatar: require('../assets/images/avatars/user5.png') },
      { name: 'Yana', avatar: require('../assets/images/avatars/user2.png') },
    ],
  },
];


export default function MyChallengesScreen() {
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
        {challenges.map((challenge, index) => (
          <TouchableOpacity
            key={challenge.id}
            style={styles.challengeCard}
            onPress={() =>
              router.push({
                pathname: '/Challenges/ChallengeVersusScreen',
                params: {
                  challengeTitle: challenge.title,
                  duration: challenge.duration,
                  owner: JSON.stringify(challenge.owner),
                  participants: JSON.stringify(challenge.participants),
                },
              })
            }
          >
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDate}>September 12 - September 15</Text>
            </View>
            <View style={styles.timeWrapper}>
              <Ionicons name="time-outline" size={20} color="#5672F9" />
              <Text style={styles.challengeTime}>{challenge.duration}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
