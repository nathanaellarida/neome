import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AchievementScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/challenges/10pointsbg.png')}
        resizeMode="cover"
        style={styles.background}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Icon wrapper (centered circle from background) */}
        <View style={styles.iconWrapper}>
          <Image
            source={require('../assets/images/achievement.gif')}
            style={styles.icon}
          />
        </View>

        {/* White Card Content */}
        <View style={styles.card}>
          {/* Points & Achievement Message */}
          <Text style={styles.achievementText}>YOU’VE GOT AN ACHIEVEMENT</Text>
          <Text style={styles.points}>+10</Text>
          <View style={styles.bonusRow}>
            <Text style={styles.bonusText}>bonus points</Text>
            <Image
              source={require('../assets/images/challenges/bonuspoints.png')}
              style={styles.bonusIcon}
            />
          </View>

          {/* Congratulations Section with Background Image */}
          <ImageBackground
            source={require('../assets/images/challenges/orange.png')}
            style={styles.congratsBox}
            resizeMode="stretch"
            borderBottomLeftRadius={25}
            borderBottomRightRadius={25}
          >
            <Text style={styles.congratsTitle}>Congratulations!</Text>
            <Text style={styles.congratsSub}>You have earned a point</Text>
            <Text style={styles.congratsHint}>
              Complete more challenges to earn more{'\n'}points and badges.
            </Text>
          </ImageBackground>
        </View>

        {/* Buttons Outside the Card */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/Challenges/ChallengeDashboard')}
        >
          <Text style={styles.primaryButtonText}>Explore Challenge</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/leaderboard/overallLeaderboard')}
        >
          <Text style={styles.secondaryButtonText}>View Leaderboard</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6549FE' },
  background: { flex: 1, padding: 20 },

  backButton: {
    alignSelf: 'flex-end',
    marginTop: 20,
    marginBottom: 10,
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconWrapper: {
    width: 135,
    height: 135,
    borderRadius: 70,
    backgroundColor: '#fff',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  icon: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    borderRadius: 70,
  },

  card: {
    marginTop: -50,
    backgroundColor: 'white',
    height: 400,
    borderRadius: 25,
    paddingTop: 70,
    paddingBottom: 30,
    paddingLeft: 25,
    paddingRight: 20,
    alignItems: 'center',
    width: width - 40,
    alignSelf: 'center',
  },

  achievementText: {
    color: '#FFA836',
    fontWeight: '600',
    fontSize: 14,
  },
  points: {
    fontSize: 60,
    fontWeight: 'semibold',
    color: '#FFA836',
    marginVertical: 5,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bonusText: {
    color: '#888',
    fontSize: 16,
  },
  bonusIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },

  congratsBox: {
    backgroundColor: '#FFFFFF',
    width: '113%',
    height: 185,
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  congratsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  congratsSub: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 6,
    fontWeight: 'semibold'
  },
  congratsHint: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },

  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: width - 100,
    alignSelf: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#6549FE',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: width - 100,
    alignSelf: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#6549FE',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
