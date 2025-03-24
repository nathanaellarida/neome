import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image'; // for GIF support
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function WorkoutScreen() {
  const router = useRouter();

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
      <Text style={styles.readyText}>READY TO GO!</Text>
      <Text style={styles.exerciseTitle}>Jumping Jacks</Text>

      {/* Timer & Arrow Controls */}
        <View style={styles.timerRow}>
        <ExpoImage
            source={require('../assets/images/timer.gif')}
            style={styles.timer}
            contentFit="contain"
        />

        <TouchableOpacity onPress={() => router.push('/startWorkout/StartingWorkout')}>
          <Image
            source={require('../assets/images/forwardArrow.png')}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
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
      marginTop: 15,
    },
    backButton: {
      position: 'absolute',
      top: 40,
      left: 20,
      zIndex: 10,
    },
    readyText: {
      fontSize: 30,
      fontWeight: '900',
      color: '#6549FE',
      marginTop: 30,
    },
    exerciseTitle: {
      fontSize: 25,
      fontWeight: '600',
      color: '#44349B',
      marginTop: 5,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        marginLeft: 45,
    },
    timer: {
        width: 170,  // was 200
        height: 170, // was 200
        marginRight: 5,
    },  
});
  