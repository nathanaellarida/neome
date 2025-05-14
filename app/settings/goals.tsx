import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function GoalsScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    startingWeight: '',
    startDate: '',
    currentWeight: '',
    goalWeight: '',
    weeklyGoal: '',
    activityLevel: '',
  });

  useEffect(() => {
    const fetchUserGoals = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.push('/loginpage/login');
          return;
        }

        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();

          // Format the starting date if it exists
          let formattedStartDate = '';
          if (data.startDate && data.startDate.toDate) {
            const date = data.startDate.toDate();
            formattedStartDate = `on ${date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}`;
          }

          setUserData({
            startingWeight: data.startingWeight ? `${data.startingWeight} lbs${formattedStartDate ? ' ' + formattedStartDate : ''}` : '',
            startDate: formattedStartDate,
            currentWeight: data.weight ? `${data.weight} lbs` : '',
            goalWeight: '140 lbs', // Placeholder as requested
            weeklyGoal: 'Lose 1 lb per week', // Placeholder as requested
            activityLevel: data.activityLevel || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGoals();
  }, []);

  const handleEditGoals = () => {
    // Navigate to an edit screen for goals
    // For now, we just display a placeholder
    alert('Edit goals functionality will be implemented soon!');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6549FE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with back button and save button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goals</Text>
        <TouchableOpacity>
          <Ionicons name="checkmark-circle-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.card}>
          {/* Starting Weight */}
          <View style={styles.row}>
            <Text style={styles.label}>Starting Weight</Text>
            <Text style={styles.value}>{userData.startingWeight || '147 lbs on Oct 13, 2024'}</Text>
          </View>

          <View style={styles.divider} />

          {/* Current Weight */}
          <View style={styles.row}>
            <Text style={styles.label}>Current Weight</Text>
            <Text style={styles.value}>{userData.currentWeight || '147 lbs'}</Text>
          </View>

          <View style={styles.divider} />

          {/* Goal Weight */}
          <View style={styles.row}>
            <Text style={styles.label}>Goal Weight</Text>
            <Text style={styles.value}>{userData.goalWeight}</Text>
          </View>

          <View style={styles.divider} />

          {/* Weekly Goal */}
          <View style={styles.row}>
            <Text style={styles.label}>Weekly Goal</Text>
            <Text style={styles.value}>{userData.weeklyGoal}</Text>
          </View>

          <View style={styles.divider} />

          {/* Activity Level */}
          <View style={styles.row}>
            <Text style={styles.label}>Activity Level</Text>
            <Text style={styles.value}>{userData.activityLevel || 'Lightly Active'}</Text>
          </View>

          <View style={styles.divider} />

          {/* Wellness Goals (previously Physical Goals) */}
          <TouchableOpacity style={styles.row} onPress={() => router.push('/settings/wellnessGoals')}>
            <Text style={styles.label}>Wellness Goals</Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color="#6549FE" />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditGoals}>
          <Text style={styles.editButtonText}>Edit Goals</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F8FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 65,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#6549FE',
    fontWeight: '500',
    textAlign: 'right',
    maxWidth: width * 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#6549FE',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    width: '90%',
    alignSelf: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});