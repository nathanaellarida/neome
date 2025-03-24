import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image'; // ✅ Use expo-image for GIF support
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SnbAdvanced() {
  const router = useRouter();

  // Workout Data with GIFs
  const workouts = [
    { title: 'Jumping Jacks', reps: '00:20', image: require('../assets/images/gif1.gif') },
    { title: 'Abdominal Crunches', reps: 'x16', image: require('../assets/images/gif2.gif') },
    { title: 'Russian Twists', reps: 'x20', image: require('../assets/images/gif3.gif') },
    { title: 'Mountain Climber', reps: 'x16', image: require('../assets/images/gif4.gif') },
    { title: 'Heel Touch', reps: 'x20', image: require('../assets/images/gif5.gif') },
    { title: 'Leg Raises', reps: 'x16', image: require('../assets/images/gif6.gif') },
    { title: 'Plank', reps: '00:20', image: require('../assets/images/gif7.gif') },
    { title: 'Abdominal Crunches', reps: 'x12', image: require('../assets/images/gif8.gif') },
    { title: 'Russian Twists', reps: 'x32', image: require('../assets/images/gif9.gif') },
    { title: 'Mountain Climber', reps: 'x12', image: require('../assets/images/gif10.gif') },
    { title: 'Heel Touch', reps: 'x20', image: require('../assets/images/gif1.gif') },
    { title: 'Leg Raises', reps: 'x16', image: require('../assets/images/gif2.gif') },
    { title: 'Plank', reps: '00:20', image: require('../assets/images/gif3.gif') },
    { title: 'Cobra Stretch', reps: '00:30', image: require('../assets/images/gif4.gif') },
    { title: 'Spine Lumbar Twist Stretch Left', reps: '00:30', image: require('../assets/images/gif5.gif') },
    { title: 'Spine Lumbar Twist Stretch Right', reps: '00:30', image: require('../assets/images/gif6.gif') },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/images/snbAdvancedWorkout.png')} 
          style={styles.headerBackground} 
          contentFit="cover" // ✅ Similar to resizeMode
        />

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Text & Start Button */}
        <View style={styles.headerContent}>
          <Text style={styles.workoutTitle}>Shoulder & Back</Text>
          <Text style={styles.workoutTitleSNB}>Advanced</Text>
          <Text style={styles.workoutSubText}>20 minutes - 16 Workouts</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => router.push('/startWorkout/ReadyToGo')}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SCROLLABLE WORKOUT LIST */}
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>20 mins - 16 Workouts</Text>

        {workouts.map((exercise, index) => (
          <View key={index} style={styles.workoutCard}>
            <Image 
              source={exercise.image} 
              style={styles.exerciseImage} 
              contentFit="contain" // ✅ Ensures GIFs display properly
            />
            <View style={styles.workoutInfo}>
              <Text style={styles.exerciseTitle}>{exercise.title}</Text>
              <Text style={styles.exerciseReps}>{exercise.reps}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// STYLESHEET
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /** HEADER **/
  headerContainer: {
    position: 'relative',
    height: 180,
    justifyContent: 'flex-start',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },

  headerBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  backButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },

  backText: {
    fontSize: 16,
    fontWeight: 'light',
    color: '#fff',
  },

  headerContent: {
    marginTop: 30,
    marginLeft: 20,
  },

  workoutTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },

  workoutTitleSNB: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 30,
    marginTop: 5,
  },

  workoutSubText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },

  startButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    width: 100,
    marginTop: 1,
  },

  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },

  /** WORKOUT LIST **/
  scrollContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44349B',
    marginBottom: 15,
  },

  workoutCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },

  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },

  workoutInfo: {
    flex: 1,
  },

  exerciseTitle: {
    fontSize: 13,
    fontWeight: 'medium',
    color: '#44349B',
  },

  exerciseReps: {
    fontSize: 14,
    color: '#7B7B7B',
  },
});
