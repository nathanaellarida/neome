import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RemindersScreen() {
  const router = useRouter();
  
  // Sample reminders data for "New" and "Earlier"
  const [reminders, setReminders] = useState([
    { id: '1', title: 'Low Activity Alert', details: 'Your activity levels are low. To keep your streak, try a short session today!', time: '2025-04-09 08:30 AM', category: 'new' },
    { id: '2', title: 'Fitness Tracker Disconnected', details: 'Your fitness tracker has disconnected. Please reconnect to continue seamless tracking.', time: '2025-04-08 07:00 PM', category: 'earlier' },
    { id: '3', title: 'Incomplete Profile Warning', details: 'Some features may not work fully without a complete profile. Update now for a customized experience.', time: '2025-04-08 02:00 PM', category: 'new' },
    { id: '4', title: 'Unstable Heart Rate Detected', details: 'We noticed an irregular heart rate. If you feel unwell, consider seeking medical attention.', time: '2025-04-07 09:00 AM', category: 'earlier' },
    { id: '5', title: 'Health Tracking Unavailable', details: 'Some health data might not be tracked as your device’s health app integration is inactive.', time: '2025-04-09 08:30 AM', category: 'new' },
    { id: '6', title: 'Data Overwrite Warning', details: 'This action may overwrite existing data. Do you want to continue?”', time: '2025-04-09 08:30 AM', category: 'new' },
  ]);

  // Separate the reminders into 'New' and 'Earlier'
  const newReminders = reminders.filter(reminder => reminder.category === 'new');
  const earlierReminders = reminders.filter(reminder => reminder.category === 'earlier');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Warnings</Text>
        <Ionicons name="warning-outline" size={24} color="#6549FE" />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* New Reminders Section */}
        <View style={styles.remindersSection}>
          <Text style={styles.sectionTitle}>New</Text>
          {newReminders.map(reminder => (
            <View key={reminder.id} style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>{reminder.title}</Text>
              <Text style={styles.reminderDetails}>{reminder.details}</Text>
              <Text style={styles.reminderTime}>{reminder.time}</Text>
            </View>
          ))}
        </View>

        {/* Earlier Reminders Section */}
        <View style={styles.remindersSection}>
          <Text style={styles.sectionTitle}>Earlier</Text>
          {earlierReminders.map(reminder => (
            <View key={reminder.id} style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>{reminder.title}</Text>
              <Text style={styles.reminderDetails}>{reminder.details}</Text>
              <Text style={styles.reminderTime}>{reminder.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 20,
  },
  remindersSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
    marginBottom: 10,
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  reminderDetails: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  reminderTime: {
    fontSize: 12,
    color: '#AAA',
  },
});
