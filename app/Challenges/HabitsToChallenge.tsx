import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

type HabitCategory = 'Physical' | 'Mental' | 'Social' | 'Emotional';

// Time options for dropdown (in minutes)
const timeOptions = ['5', '10', '15', '20', '30', '45', '60', '90', '120', '150', '180'];

const habitCategories: Record<HabitCategory, string[]> = {
  Physical: [
    'Walking',
    'Stretching',
    'Dancing',
    'Yoga',
    'Jogging',
    'Home Workout',
    'Jump Rope',
    'Swimming',
    'Cycling',
    'Hiking',
    'Pilates',
    'Strength Training',
    'Tai Chi',
    'Zumba',
    'Stair Climbing'
  ],  
  Mental: [
    'Reading',
    'Puzzle',
    'Brain Games',
    'Learning a Language',
    'Listening to Podcasts',
    'Writing Essays',
    'Playing Chess',
    'Watching Documentaries',
    'Memory Exercises',
    'Mind Mapping',
    'Problem Solving',
    'Flashcard Practice',
    'Trivia Practice',
    'Meditation with Focus',
    'Journaling Thoughts'
  ],  
  Social: [
    'Calling Friends',
    'Group Games',
    'Joining a Club',
    'Attending Events',
    'Volunteering',
    'Video Chat with Family',
    'Sending Encouragement',
    'Helping a Neighbor',
    'Having Coffee with Someone',
    'Joining a Group Chat',
    'Complimenting Someone',
    'Asking How Someone Feels',
    'Hosting a Game Night',
    'Online Group Study',
    'Playing Multiplayer Games'
  ],  
  Emotional: [
    'Meditation',
    'Journaling',
    'Gratitude Listing',
    'Deep Breathing',
    'Positive Affirmations',
    'Talking to a Therapist',
    'Listening to Music',
    'Mindfulness Practice',
    'Coloring or Drawing',
    'Digital Detox',
    'Self-Reflection',
    'Taking a Nature Walk',
    'Unplugged Hour',
    'Doing Nothing (Intentional Rest)',
    'Emotional Check-In'
  ]
};

const categories: HabitCategory[] = ['Physical', 'Mental', 'Social', 'Emotional'];

export default function HabitsToChallenge() {
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>('Physical');
  const [addedHabits, setAddedHabits] = useState<Array<{name: string, mins: number, days: number}>>([]);
  const [selectedHabit, setSelectedHabit] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  
  // Date and time state
  const [time, setTime] = useState('30');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 4); // Default 4 days challenge
    return date;
  });
  const [showDatePicker, setShowDatePicker] = useState<{
    mode: 'start' | 'end' | null;
  }>({ mode: null });
  const [challengeDays, setChallengeDays] = useState(5);

  // Calculate days difference when dates change
  useEffect(() => {
    calculateDaysDifference();
  }, [startDate, endDate]);

  const calculateDaysDifference = () => {
    if (!startDate || !endDate) return;
  
    // Clone the dates to avoid mutating state
    const start = new Date(startDate.getTime());
    const end = new Date(endDate.getTime());
  
    // Normalize both dates to midnight (no time component)
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
  
    // Calculate inclusive day range
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    setChallengeDays(diffDays);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (showDatePicker.mode === 'start' && selectedDate) {
      setStartDate(selectedDate);
    } else if (showDatePicker.mode === 'end' && selectedDate) {
      setEndDate(selectedDate);
    }
    setShowDatePicker({ mode: null });
  };

  const openModal = (habit: string) => {
    setSelectedHabit(habit);
    
    // Check if this habit is already added, if so use its existing values
    const existingHabit = addedHabits.find(h => h.name === habit);
    if (existingHabit) {
      setTime(existingHabit.mins.toString());
      
      // Calculate the end date based on existing days
      const newEndDate = new Date(startDate);
      newEndDate.setDate(startDate.getDate() + existingHabit.days - 1);
      setEndDate(newEndDate);
    } else {
      // Reset to default values for new habit
      setTime('30');
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 4);
      setEndDate(defaultEndDate);
    }
    
    setShowModal(true);
  };

  const confirmAddHabit = () => {
    if (startDate && endDate && endDate < startDate) {
      alert('End date must be after the start date.');
      return;
    }

    // Create the new habit with the configured values
    const newHabit = {
      name: selectedHabit,
      mins: parseInt(time),
      days: challengeDays
    };
    
    // Update or add the habit
    setAddedHabits(prevHabits => {
      const habitIndex = prevHabits.findIndex(h => h.name === selectedHabit);
      if (habitIndex >= 0) {
        // Update existing habit
        const updatedHabits = [...prevHabits];
        updatedHabits[habitIndex] = newHabit;
        return updatedHabits;
      } else {
        // Add new habit
        return [...prevHabits, newHabit];
      }
    });
    
    setShowModal(false);
  };
  
  const navigateBackWithHabits = () => {
    if (addedHabits.length === 0) {
      router.back();
      return;
    }
    
    // Now we need to pass both the habit names AND their properties
    router.push({
      pathname: '/Challenges/CreateNewChallenge',
      params: {
        habits: JSON.stringify(addedHabits)
      },
    });
  };

  return (
    <>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Habits You want to Challenge</Text>
      </View>

      {/* Main Content Container */}
      <View style={styles.mainContainer}>
        {/* Horizontal Scrollable Category Tabs */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsContainer}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, selectedCategory === cat && styles.tabActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={selectedCategory === cat ? styles.tabTextActive : styles.tabText}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Habit List Container */}
        <View style={styles.habitContainer}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.habitListContent}
          >
            {habitCategories[selectedCategory].map((item) => {
              const isAdded = addedHabits.some(h => h.name === item);
              return (
                <View key={item} style={styles.habitRow}>
                  <Text style={styles.habitName}>{item}</Text>
                  <TouchableOpacity
                    style={isAdded ? styles.addedBtn : styles.addBtn}
                    onPress={() => openModal(item)}
                  >
                    <Text style={isAdded ? styles.addedText : styles.addText}>
                      {isAdded ? 'Edit' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Fixed Add Button - Only shown if there are habits added */}
        {addedHabits.length > 0 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.mainAddButton} onPress={navigateBackWithHabits}>
              <Text style={styles.addText}>Add {addedHabits.length} Habit{addedHabits.length !== 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Habit Configuration Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close button */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color="#6549FE" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Configure "{selectedHabit}"</Text>
            
            {/* Time Selector */}
            <View style={styles.timeRow}>
              <Text style={styles.modalLabel}>Active Time:</Text>
              <TouchableOpacity style={styles.timeInput} onPress={() => setShowTimeModal(true)}>
                <Text style={styles.timeText}>{time} min</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowTimeModal(true)}>
                <Ionicons name="timer-outline" size={20} color="#6549FE" />
              </TouchableOpacity>
            </View>

            {/* Date Selectors */}
            <View style={styles.dateRow}>
              <Text style={styles.modalLabel}>Start Date:</Text>
              <Ionicons name="calendar" size={18} color="#6549FE" />
              <TouchableOpacity onPress={() => setShowDatePicker({ mode: 'start' })}>
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateRow}>
              <Text style={styles.modalLabel}>End Date:</Text>
              <Ionicons name="calendar" size={18} color="#6549FE" />
              <TouchableOpacity onPress={() => setShowDatePicker({ mode: 'end' })}>
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.daysText}>Total Challenge Days: {challengeDays}</Text>
            
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmAddHabit}>
              <Text style={styles.addText}>Add to Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimeModal} transparent animationType="slide">
        <View style={styles.timeModal}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#6549FE', marginBottom: 10 }}>
            Select Active Time (min)
          </Text>

          <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={false}>
            {timeOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.timeOption}
                onPress={() => {
                  setTime(option);
                  setShowTimeModal(false);
                }}
              >
                <Text style={styles.timeOptionText}>{option} minutes</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={() => setShowTimeModal(false)} style={{ marginTop: 15 }}>
            <Text style={{ color: '#6549FE', fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker.mode && (
        <DateTimePicker
          value={showDatePicker.mode === 'start' ? startDate : endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3F6FF',
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  categoryTabsContainer: {
    paddingVertical: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#E1E3FF',
    marginRight: 2,
    alignSelf: 'flex-start',      
  },      
  tabActive: {
    backgroundColor: '#6549FE',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A1A9F2',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  habitContainer: {
    flex: 1000,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  habitListContent: {
    paddingBottom: 10,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  habitName: {
    fontSize: 16,
    color: '#333',
  },
  addBtn: {
    backgroundColor: '#6549FE',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  addedBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#6549FE',
  },
  addText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addedText: {
    color: '#6549FE',
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingVertical: 20,
  },
  mainAddButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    width: '90%',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6549FE',
    marginBottom: 20,
    marginTop: 10,
  },
  modalLabel: {
    fontSize: 16,
    color: '#6549FE',
    fontWeight: 'bold',
  },
  modalConfirmBtn: {
    backgroundColor: '#FF9900',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15,
    width: '100%',
  },
  timeInput: {
    backgroundColor: '#F3F6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 10,
  },
  timeText: { 
    color: '#6B7280' 
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
    marginBottom: 15,
  },
  dateText: {
    color: '#6B7280',
  },
  daysText: {
    color: '#6549FE',
    marginTop: 5,
    fontWeight: 'bold',
  },
  timeModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '40%',
    marginHorizontal: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  timeOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F3F6FF',
    borderRadius: 10,
    marginVertical: 4,
    alignItems: 'center',
  },
  timeOptionText: {
    color: '#6549FE',
    fontWeight: 'bold',
  },
});