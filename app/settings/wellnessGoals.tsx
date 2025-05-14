
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

// Define TypeScript interface for wellness goals
interface WellnessGoal {
  id: number;
  title: string;
  active: boolean;
}

export default function WellnessGoalsScreen() {
  // Sample wellness goals
  const [wellnessGoals, setWellnessGoals] = useState<WellnessGoal[]>([
    { id: 1, title: 'Meditate for 10 minutes daily', active: true },
    { id: 2, title: 'Walk 10,000 steps per day', active: true },
    { id: 3, title: 'Drink 8 glasses of water daily', active: true },
    { id: 4, title: 'Sleep 8 hours every night', active: false },
    { id: 5, title: 'Practice mindfulness for 5 minutes', active: false },
    { id: 6, title: 'Stretch for 10 minutes daily', active: false },
    { id: 7, title: 'Take breaks every 90 minutes', active: true },
    { id: 8, title: 'Journal daily emotions', active: false },
    { id: 9, title: 'Eat one vegetable with each meal', active: true }
  ]);
  // Function to toggle goal active status
  const toggleGoal = (id: number) => {
    setWellnessGoals(wellnessGoals.map(goal => 
      goal.id === id ? { ...goal, active: !goal.active } : goal
    ));
  };

  // Function to handle adding a new goal (would navigate to add goal screen)
  const handleAddGoal = () => {
    alert('Add goal functionality will be implemented soon!');
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wellness Goals</Text>
        <View style={{ width: 24 }} /> {/* Empty view for alignment */}
      </View>

      {/* Introduction */}
      <View style={styles.introContainer}>
        <Text style={styles.introText}>
          Select wellness goals that you want to focus on. These goals help you maintain balance in your physical, mental, and emotional health.
        </Text>
      </View>

      {/* Goals List */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {wellnessGoals.map((goal, index) => (
            <View key={goal.id}>
              <View style={styles.goalRow}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Switch
                  value={goal.active}
                  onValueChange={() => toggleGoal(goal.id)}
                  trackColor={{ false: '#E0E0E0', true: '#CFC0FF' }}
                  thumbColor={goal.active ? '#6549FE' : '#f4f3f4'}
                />
              </View>
              {index < wellnessGoals.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Add New Goal Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
          <Text style={styles.addButtonText}>
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            {' Add New Goal'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backButton: {
    padding: 5,
  },
  introContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
    marginBottom: 20,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  goalTitle: {
    fontSize: 16,
    color: '#444',
    flex: 1,
    paddingRight: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  addButton: {
    backgroundColor: '#6549FE',
    borderRadius: 50,
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
  }
});