import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, onSnapshot, query, where, getDoc, setDoc, updateDoc, addDoc, orderBy, Timestamp, serverTimestamp, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebaseConfig';

export default function RemindersScreen() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  
  interface Reminder {
    id: string;
    title: string;
    details: string;
    time: string;
    category: string;
    read: boolean;
    deleted?: boolean;
    isSystem: boolean;
  }
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check food and water intake and create reminders if needed
  useEffect(() => {
    if (!user) return;
    
    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkAndCreateReminders = async () => {
      try {
        // Check if we already added health reminders today to avoid duplicates
        const remindersRef = collection(db, 'users', user.uid, 'reminders');
        const todayRemindersQuery = query(
          remindersRef, 
          where('isSystem', '==', true),
          where('created', '>=', today)
        );
        const existingReminders = await getDocs(todayRemindersQuery);
        
        // Get existing reminder titles to avoid duplicates
        const existingReminderTitles = new Set();
        existingReminders.forEach(doc => {
          const data = doc.data();
          existingReminderTitles.add(data.title);
        });
        
        // Check food logs
        let todayCalories = 0;
        const foodLogsRef = collection(db, 'users', user.uid, 'foodLogs');
        const foodQuerySnapshot = await getDocs(foodLogsRef);
        
        foodQuerySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.calories && data.createdAt && data.createdAt.toDate) {
            const entryDate = data.createdAt.toDate();
            if (
              entryDate.getDate() === today.getDate() &&
              entryDate.getMonth() === today.getMonth() &&
              entryDate.getFullYear() === today.getFullYear()
            ) {
              todayCalories += Number(data.calories);
            }
          }
        });
        
        // Check water intake
        let todayWaterIntake = 0;
        const waterIntakeRef = collection(db, 'users', user.uid, 'waterIntakeHistory');
        const waterQuerySnapshot = await getDocs(waterIntakeRef);
        
        waterQuerySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.amount && data.time && data.time.toDate) {
            const entryDate = data.time.toDate();
            if (
              entryDate.getDate() === today.getDate() &&
              entryDate.getMonth() === today.getMonth() &&
              entryDate.getFullYear() === today.getFullYear()
            ) {
              todayWaterIntake += Number(data.amount);
            }
          }
        });
        
        // Create food reminder if needed
        if (todayCalories === 0 && !existingReminderTitles.has('Time to Eat!')) {
          await addDoc(collection(db, 'users', user.uid, 'reminders'), {
            title: 'Time to Eat!',
            details: 'You haven\'t logged any meals today. Remember to eat regular, nutritious meals to keep your energy up and stay healthy!',
            time: serverTimestamp(),
            created: new Date(),
            read: false,
            isSystem: true,
            deleted: false
          });
        }
        
        // Create water reminder if needed
        if (todayWaterIntake === 0 && !existingReminderTitles.has('Stay Hydrated!')) {
          await addDoc(collection(db, 'users', user.uid, 'reminders'), {
            title: 'Stay Hydrated!',
            details: 'You haven\'t logged any water intake today. Staying hydrated is essential for your health and well-being. Try to drink at least 8 glasses of water daily!',
            time: serverTimestamp(),
            created: new Date(),
            read: false,
            isSystem: true,
            deleted: false
          });
        }
      } catch (error) {
        console.error('Error checking and creating health reminders:', error);
      }
    };
    
    checkAndCreateReminders();
  }, [user]);
  
  // Fetch reminders from Firebase
  useEffect(() => {
    if (!user) return;

    const remindersRef = collection(db, 'users', user.uid, 'reminders');
    const q = query(remindersRef, orderBy('time', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const remindersList: Reminder[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let timestamp = data.time;
        let formattedTime = '';
        
        if (timestamp) {
          // Convert Firestore timestamp to JS Date
          const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
          formattedTime = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        
        remindersList.push({
          id: doc.id,
          title: data.title,
          details: data.details,
          time: formattedTime,
          category: data.read ? 'earlier' : 'new',
          read: data.read || false,
          isSystem: data.isSystem || false
        });
      });
      setReminders(remindersList);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Mark reminder as read
  const markAsRead = async (reminderId: string) => {
    if (!user) return;
    
    try {
      const reminderRef = doc(db, 'users', user.uid, 'reminders', reminderId);
      await updateDoc(reminderRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking reminder as read:', error);
      Alert.alert('Error', 'Failed to update reminder status');
    }
  };

  // Delete a reminder
  const deleteReminder = async (reminderId: string) => {
    if (!user) return;
    
    try {
      const reminderRef = doc(db, 'users', user.uid, 'reminders', reminderId);
      await updateDoc(reminderRef, {
        deleted: true
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      Alert.alert('Error', 'Failed to delete reminder');
    }
  };

  // Separate the reminders into 'New' and 'Earlier'
  const newReminders = reminders.filter(reminder => !reminder.read && !reminder.deleted);
  const earlierReminders = reminders.filter(reminder => reminder.read && !reminder.deleted);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reminders</Text>
        <Ionicons name="time-outline" size={24} color="#6549FE" />
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6549FE" />
          <Text style={styles.loadingText}>Loading reminders...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* New Reminders Section */}
          <View style={styles.remindersSection}>
            <Text style={styles.sectionTitle}>
              New <Text style={styles.reminderCount}>({newReminders.length})</Text>
            </Text>
            
            {newReminders.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="notifications-off-outline" size={48} color="#C4C4C4" />
                <Text style={styles.emptyStateText}>No new reminders</Text>
              </View>
            ) : (
              newReminders.map(reminder => (
                <TouchableOpacity 
                  key={reminder.id} 
                  style={[
                    styles.reminderCard, 
                    reminder.isSystem && styles.systemReminderCard
                  ]}
                  onPress={() => markAsRead(reminder.id)}
                >
                  <View style={styles.reminderIconContainer}>
                    {reminder.isSystem ? (
                      <Ionicons 
                        name={reminder.title.toLowerCase().includes('water') ? "water" : "nutrition"} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    ) : (
                      <Ionicons name="notifications" size={24} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderDetails}>{reminder.details}</Text>
                    <Text style={styles.reminderTime}>{reminder.time}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteReminder(reminder.id)}
                  >
                    <Ionicons name="close-circle-outline" size={22} color="#FF6B6B" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Earlier Reminders Section */}
          <View style={styles.remindersSection}>
            <Text style={styles.sectionTitle}>
              Earlier <Text style={styles.reminderCount}>({earlierReminders.length})</Text>
            </Text>
            
            {earlierReminders.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="time-outline" size={48} color="#C4C4C4" />
                <Text style={styles.emptyStateText}>No earlier reminders</Text>
              </View>
            ) : (
              earlierReminders.map(reminder => (
                <View 
                  key={reminder.id} 
                  style={[
                    styles.reminderCard, 
                    styles.readReminderCard,
                    reminder.isSystem && styles.systemReminderCard
                  ]}
                >
                  <View style={[styles.reminderIconContainer, styles.readIconContainer]}>
                    {reminder.isSystem ? (
                      <Ionicons 
                        name={reminder.title.toLowerCase().includes('water') ? "water" : "nutrition"} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    ) : (
                      <Ionicons name="notifications-off" size={24} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.reminderContent}>
                    <Text style={[styles.reminderTitle, styles.readReminderTitle]}>{reminder.title}</Text>
                    <Text style={[styles.reminderDetails, styles.readReminderDetails]}>{reminder.details}</Text>
                    <Text style={styles.reminderTime}>{reminder.time}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteReminder(reminder.id)}
                  >
                    <Ionicons name="close-circle-outline" size={22} color="#CCCCCC" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
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
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6549FE',
    marginTop: 10,
  },
  // Reminders Section
  remindersSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
    marginBottom: 15,
  },
  reminderCount: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#A0A0A0',
  },
  // Empty State
  emptyStateContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#A0A0A0',
    marginTop: 15,
  },
  // Reminder Card
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  systemReminderCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#6549FE',
  },
  readReminderCard: {
    opacity: 0.8,
    backgroundColor: '#FAFAFA',
  },
  reminderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6549FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  readIconContainer: {
    backgroundColor: '#AAAAAA',
  },
  reminderContent: {
    flex: 1,
    paddingRight: 15,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  readReminderTitle: {
    color: '#666',
  },
  reminderDetails: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
    lineHeight: 20,
  },
  readReminderDetails: {
    color: '#999',
  },
  reminderTime: {
    fontSize: 12,
    color: '#AAA',
  },
  deleteButton: {
    padding: 5,
  },
});
