import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

export default function NotificationsDashboard() {
  const [socialsUnreadCount, setSocialsUnreadCount] = useState(0);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSocialsUnreadCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.bellIcon}>
          <Ionicons name="notifications-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Reminders Section */}
        <TouchableOpacity style={styles.notificationItem}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: '#FFE8E8' }]}>
              <Ionicons name="calendar-outline" size={24} color="#FF4B4B" />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>Reminders</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6549FE" />
        </TouchableOpacity>

        {/* Socials Section */}
        <TouchableOpacity 
          style={styles.notificationItem}
          onPress={() => router.push('/notifications/socialsNotification')}
        >
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: '#E8EFFF' }]}>
              <Ionicons name="people-outline" size={24} color="#6549FE" />
            </View>
            {socialsUnreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{socialsUnreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>Socials</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6549FE" />
        </TouchableOpacity>

        {/* Motivational Quotes Section */}
        <TouchableOpacity style={styles.notificationItem}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: '#FFF3E8' }]}>
              <Ionicons name="chatbox-ellipses-outline" size={24} color="#FF8B4B" />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>Motivational Quotes</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6549FE" />
        </TouchableOpacity>

        {/* Warnings Section */}
        <TouchableOpacity style={styles.notificationItem}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: '#FFE8E8' }]}>
              <Ionicons name="warning-outline" size={24} color="#FF4B4B" />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>Warnings</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6549FE" />
        </TouchableOpacity>
      </ScrollView>

      {/* Mark all as read button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.markAllButton}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>
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
  bellIcon: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 15,
  },
  iconBackground: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4B4B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#F3F6FF',
  },
  markAllButton: {
    backgroundColor: '#6549FE',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6549FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
