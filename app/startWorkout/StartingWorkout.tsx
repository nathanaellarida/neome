import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function StartingWorkout() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(15);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Logic
  useEffect(() => {
    if (!isPaused && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, seconds]);

  const handlePause = () => {
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  return (
    <View style={styles.container}>
      {/* Avatar GIF */}
      <ExpoImage
        source={require('../assets/images/gif1.gif')}
        style={styles.avatar}
        contentFit="contain"
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
      </TouchableOpacity>

      {/* Text */}
      <Text style={styles.exerciseTitle}>Jumping Jacks</Text>

      {/* Timer */}
      <Text style={styles.timerText}>00:{seconds.toString().padStart(2, '0')}</Text>

      {/* Pause Button */}
      <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
        <Text style={styles.pauseButtonText}>Pause</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.footerText}>Previous</Text>
        </TouchableOpacity >

        <TouchableOpacity onPress={() => router.push('/startWorkout/Rest')}>
        <Text style={styles.footerText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Modal when paused */}
      <Modal visible={isPaused} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Challenge</Text>
            <Text style={styles.modalTitle}>Paused</Text>
            <ExpoImage source={require('../assets/images/cat.gif')} style={styles.catImage} />

            <Pressable style={styles.resumeButton} onPress={handleResume}>
              <Text style={styles.resumeText}>Resume</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
      marginTop: 15,
    },
    backButton: {
      position: 'absolute',
      top: 40,
      left: 20,
      zIndex: 10,
    },
    exerciseTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#6549FE',
      marginTop: 25,
    },
    timerText: {
      fontSize: 60,
      fontWeight: 'bold',
      color: '#111',
      marginTop: 13,
    },
    pauseButton: {
      backgroundColor: '#6C4CFF',
      borderRadius: 40,
      paddingVertical: 10,
      paddingHorizontal: 75,
      marginTop: 20,
    },
    pauseButtonText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    footer: {
      width: width,
      paddingHorizontal: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      position: 'absolute',
      bottom: 30,
    },
    footerText: {
      fontSize: 16,
      color: '#777',
    },
  
    /** Modal **/
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: '#fff',
      borderRadius: 30,
      padding: 30,
      width: '85%',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 35,
      fontWeight: 'bold',
      color: '#6549FE',
      textAlign: 'center',
      lineHeight: 35,
      paddingTop: 10, 
    },
    catImage: {
      width: 300,
      height: 200,
      resizeMode: 'stretch',
    },
    resumeButton: {
      backgroundColor: '#6C4CFF',
      borderRadius: 40,
      paddingVertical: 12,
      paddingHorizontal: 50,
    },
    resumeText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
});