import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Rest() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(15);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Logic
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1 && intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleAdd20Seconds = () => {
    setSeconds(prev => prev + 20);
  };

  return (
    <View style={styles.container}>
      {/* Avatar GIF */}
      <ExpoImage
        source={require('../assets/images/gif11.gif')}
        style={styles.avatar}
        contentFit="contain"
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
      </TouchableOpacity>

      {/* Rest Info Card */}
      <View style={styles.restCard}>
        {/* Top Row: next info */}
        <View style={styles.row}>
          <View>
            <Text style={styles.nextLabel}>Next 2/16</Text>
            <Text style={styles.nextExercise}>Squats</Text>
          </View>
          <Text style={styles.repsText}>x12</Text>
        </View>

        {/* Rest Text */}
        <Text style={styles.restLabel}>Rest</Text>

        {/* Countdown Timer */}
        <Text style={styles.timerText}>
          00:{seconds.toString().padStart(2, '0')}
        </Text>

        {/* +20s Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAdd20Seconds}>
          <Text style={styles.addButtonText}>+20s</Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
  },
  avatar: {
    width: width - 50,
    height: 350,
    backgroundColor: '#F6F6FC',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  restCard: {
    marginTop: 10,
    width: width,
    flex: 1,
    backgroundColor: '#8377EA',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 25,
    paddingTop: 25,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  nextLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  nextExercise: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  repsText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 10,
  },
  restLabel: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 30,
  },
  timerText: {
    fontSize: 55,
    fontWeight: 'bold',
    color: '#111',
    marginVertical: 20,
  },
  addButton: {
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 50,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#fff',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 85,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#6549FE',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
