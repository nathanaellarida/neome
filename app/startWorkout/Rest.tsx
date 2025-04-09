import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'react-native';

const { width, height } = Dimensions.get('window');

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
      {/* TOP HALF: Avatar Section */}
      <View style={styles.avatarContainer}>
        <ExpoImage
          source={require('../assets/images/gif11.gif')}
          style={styles.avatar}
          contentFit="contain"
        />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM HALF: Info Section */}
      <ImageBackground
        source={require('../assets/images/restbg.png')} // Replace with your image path
        style={styles.restCard}
        resizeMode="cover"
      >
        <View style={styles.row}>
          <View>
            <Text style={styles.nextLabel}>Next 2/16</Text>
            <Text style={styles.nextExercise}>Squats</Text>
          </View>
          <Text style={styles.repsText}>x12</Text>
        </View>

        <Text style={styles.restLabel}>Rest</Text>

        <Text style={styles.timerText}>
          00:{seconds.toString().padStart(2, '0')}
        </Text>

        <TouchableOpacity style={styles.addButton} onPress={handleAdd20Seconds}>
          <Text style={styles.addButtonText}>+20s</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /** TOP HALF **/
  avatarContainer: {
    flex: 1,
    backgroundColor: '#F6F6FC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: width,
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
  },

  /** BOTTOM HALF **/
  restCard: {
    flex: 1,
    width: width,
    backgroundColor: '#8377EA',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 25,
    paddingTop: 15,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  nextLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  nextExercise: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  repsText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
  },
  restLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#111',
    marginVertical: 10,
  },
  addButton: {
    borderColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 40,
    paddingVertical: 6,
    paddingHorizontal: 80,
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
    paddingVertical: 7,
    paddingHorizontal: 85,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#6549FE',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
