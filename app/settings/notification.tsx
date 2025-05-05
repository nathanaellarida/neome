import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

export default function NotificationScreen() {
  const router = useRouter();
  const soundRef = useRef<Audio.Sound | null>(null);

  const handleMarkAllAsRead = () => {
    // Add your mark all as read logic here
    console.log("All notifications marked as read");
  };

  useEffect(() => {
  
      const loadSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/images/tap.wav'),
          { shouldPlay: false }
        );
        soundRef.current = sound;
      };
  
      loadSound();
  
      return () => {
        if (soundRef.current) {
          soundRef.current.unloadAsync();
        }
      };
    }, []);
  
    const playTapSound = async () => {
      try {
        const sound = soundRef.current;
        if (sound) {
          await sound.stopAsync(); // Ensure sound starts clean
          await sound.playFromPositionAsync(0); // No delay, plays from start
        }
      } catch (error) {
        console.warn('Failed to play sound', error);
      }
    };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={async() => {
          await playTapSound();
          router.back();
        } }>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Ionicons name="notifications-outline" size={24} color="#6549FE" />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Reminders Category */}
            <TouchableOpacity style={styles.categoryButton}  onPress={() => router.push('/settings/reminders')}>
              <View style={styles.categoryLeft}>
                <Ionicons name="time-outline" size={24} color="#6549FE" />
                <Text style={styles.categoryText}>Reminders</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Socials Category */}
            <TouchableOpacity style={styles.categoryButton}  onPress={() => router.push('/settings/socials')}>
              <View style={styles.categoryLeft}>
                <Ionicons name="people-outline" size={24} color="#6549FE" />
                <Text style={styles.categoryText}>Socials</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Motivational Quotes Category */}
            <TouchableOpacity style={styles.categoryButton}  onPress={() => router.push('/settings/quotes')}>
              <View style={styles.categoryLeft}>
                <Ionicons name="sparkles-outline" size={24} color="#6549FE" />
                <Text style={styles.categoryText}>Motivational Quotes</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Warnings Category */}
            <TouchableOpacity style={styles.categoryButton}  onPress={() => router.push('/settings/warnings')}>
              <View style={styles.categoryLeft}>
                <Ionicons name="warning-outline" size={24} color="#6549FE" />
                <Text style={styles.categoryText}>Warnings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Mark All As Read Button */}
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF2FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  markAllButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: '#6549FE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markAllText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});