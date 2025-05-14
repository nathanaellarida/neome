import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

export default function NotificationScreen() {  const router = useRouter();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [socialsUnreadCount, setSocialsUnreadCount] = useState(0);
  const [remindersUnreadCount, setRemindersUnreadCount] = useState(0);
  
  const handleMarkAllAsRead = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      // Create a new batch
      const batch = writeBatch(db);
      
      // Get all unread reminders
      const remindersRef = collection(db, 'users', user.uid, 'reminders');
      const unreadQuery = query(remindersRef, where('read', '==', false), where('deleted', '==', false));
      const unreadDocs = await getDocs(unreadQuery);
      
      // Update each document in the batch
      unreadDocs.forEach(docSnap => {
        batch.update(docSnap.ref, { read: true });
      });
      
      // Commit the batch
      await batch.commit();
      
      // Update local state
      setRemindersUnreadCount(0);
      console.log("All notifications marked as read");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
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
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      // Unread chats
      const chatsRef = collection(db, 'chats');
      const chatsQuery = query(chatsRef, where('users', 'array-contains', user.uid));
      const chatSnapshots = await getDocs(chatsQuery);
      let unreadChats = 0;
      chatSnapshots.forEach(docSnap => {
        const data = docSnap.data();
        if (data.unreadCounts && data.unreadCounts[user.uid] > 0) {
          unreadChats += 1;
        }
      });
      
      // Unread challenge invitations
      const notificationsRef = collection(db, 'users', user.uid, 'notifications');
      const invitesQuery = query(notificationsRef, where('type', '==', 'challenge_invitation'), where('read', '==', false));
      const invitesSnap = await getDocs(invitesQuery);
      const unreadInvites = invitesSnap.size;
      setSocialsUnreadCount(unreadChats + unreadInvites);
      
      // Unread reminders
      const remindersRef = collection(db, 'users', user.uid, 'reminders');
      const remindersQuery = query(remindersRef, where('read', '==', false), where('deleted', '==', false));
      const remindersSnap = await getDocs(remindersQuery);
      setRemindersUnreadCount(remindersSnap.size);
    };
    
    fetchUnreadCounts();
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
                <View style={{ position: 'relative' }}>
                  <Ionicons name="time-outline" size={24} color="#6549FE" />
                  {remindersUnreadCount > 0 && (
                    <View style={{
                      backgroundColor: '#FF3B30',
                      borderRadius: 12,
                      minWidth: 18,
                      height: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      zIndex: 1,
                      paddingHorizontal: 3,
                    }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>
                        {remindersUnreadCount > 99 ? '99+' : remindersUnreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.categoryText}>Reminders</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Socials Category */}
            <TouchableOpacity style={styles.categoryButton}  onPress={() => router.push('/settings/socials')}>
              <View style={styles.categoryLeft}>
                <View style={{ position: 'relative' }}>
                  <Ionicons name="people-outline" size={24} color="#6549FE" />
                  {socialsUnreadCount > 0 && (
                    <View style={{
                      backgroundColor: '#FF3B30',
                      borderRadius: 12,
                      minWidth: 18,
                      height: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      zIndex: 1,
                      paddingHorizontal: 3,
                    }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>
                        {socialsUnreadCount > 99 ? '99+' : socialsUnreadCount}
                      </Text>
                    </View>
                  )}
                </View>
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