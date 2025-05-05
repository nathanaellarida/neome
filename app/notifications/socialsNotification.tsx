import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, where } from 'firebase/firestore';
import { db, auth, storage } from '../../firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';

interface Notification {
  id: string;
  type: string;
  senderId: string;
  senderName: string;
  challengeId?: string;
  challengeName?: string;
  challengeDays?: number;
  challengeMins?: number;
  startDate?: string;
  endDate?: string;
  status: string;
  createdAt: any;
  read: boolean;
  senderAvatar?: string;
}

export default function SocialsNotification() {
  const [notifications, setNotifications] = useState<{ new: Notification[], earlier: Notification[] }>({
    new: [],
    earlier: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to view notifications');
      return;
    }

    // Query notifications collection
    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newNotifications: Notification[] = [];
      const earlierNotifications: Notification[] = [];

      // Process each notification
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Get sender's avatar
        let senderAvatar = undefined;
        try {
          const senderDoc = await getDoc(doc(db, 'users', data.senderId));
          const senderData = senderDoc.data();
          if (senderData && senderData.avatar) {
            const avatarRef = ref(storage, senderData.avatar);
            senderAvatar = await getDownloadURL(avatarRef);
          }
        } catch (error) {
          console.error('Error fetching sender avatar:', error);
        }

        const notification: Notification = {
          id: docSnapshot.id,
          type: data.type,
          senderId: data.senderId,
          senderName: data.senderName,
          challengeId: data.challengeId,
          challengeName: data.challengeName,
          challengeDays: data.challengeDays,
          challengeMins: data.challengeMins,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          createdAt: data.createdAt,
          read: data.read,
          senderAvatar
        };

        // Separate new and earlier notifications (last 24 hours)
        const now = new Date();
        const notificationDate = data.createdAt?.toDate();
        if (notificationDate && now.getTime() - notificationDate.getTime() < 24 * 60 * 60 * 1000) {
          newNotifications.push(notification);
        } else {
          earlierNotifications.push(notification);
        }
      }

      setNotifications({
        new: newNotifications,
        earlier: earlierNotifications
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    if (notification.type === 'challenge_invitation') {
      // Mark notification as read
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const notificationRef = doc(db, 'users', currentUser.uid, 'notifications', notification.id);
        await updateDoc(notificationRef, { read: true });

        // Navigate to challenge details or acceptance screen
        router.push({
          pathname: '/Challenges/ChallengeInvitation',
          params: {
            notificationId: notification.id,
            challengeId: notification.challengeId,
            senderId: notification.senderId
          }
        });
      } catch (error) {
        console.error('Error handling notification:', error);
        Alert.alert('Error', 'Failed to process notification');
      }
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = timestamp.toDate();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 24 * 60) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / (24 * 60))}d`;
  };

  const renderNotification = (notification: Notification) => {
    let message = '';
    if (notification.type === 'challenge_invitation') {
      message = `${notification.senderName} invited you to join "${notification.challengeName}" challenge for ${notification.challengeDays} days, ${notification.challengeMins} mins per day`;
    }

    return (
      <TouchableOpacity 
        key={notification.id} 
        style={[styles.notificationCard, !notification.read && styles.unreadCard]}
        onPress={() => handleNotificationPress(notification)}
      >
        <View style={styles.avatarContainer}>
          {notification.senderAvatar ? (
            <Image source={{ uri: notification.senderAvatar }} style={styles.avatar} />
          ) : (
            <Image source={require('../../assets/images/default-avatar.png')} style={styles.avatar} />
          )}
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.time}>{formatTime(notification.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Socials</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {notifications.new.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>New</Text>
            {notifications.new.map(renderNotification)}
          </>
        )}

        {notifications.earlier.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {notifications.earlier.map(renderNotification)}
          </>
        )}

        {!loading && notifications.new.length === 0 && notifications.earlier.length === 0 && (
          <Text style={styles.noNotifications}>No notifications yet</Text>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  searchButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6549FE',
    marginBottom: 15,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#F0F7FF',
    borderLeftWidth: 3,
    borderLeftColor: '#6549FE',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
  },
  noNotifications: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
    fontSize: 16,
  }
});
