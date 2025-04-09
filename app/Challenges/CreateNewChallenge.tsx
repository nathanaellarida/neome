import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
// Import Picker from the community package instead of react-native
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';


import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Time options for dropdown (in minutes)
const timeOptions = ['5', '10', '15', '20', '30', '45', '60', '90', '120', '150', '180'];


export default function CreateNewChallenge() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const habitsParam = params?.habits;
  
    if (habitsParam) {
      try {
        const parsedHabits = JSON.parse(habitsParam as string);
        
        if (Array.isArray(parsedHabits)) {
          // Check if we're getting simple string array or objects with properties
          if (typeof parsedHabits[0] === 'string') {
            // Handle legacy format (array of strings)
            const newChallenges = parsedHabits.map((habit) => ({
              id: Math.random().toString(),
              name: habit,
              days: 4,
              mins: 30,
            }));
  
            setChallenges((prev) => {
              const existingNames = prev.map(c => c.name);
              const filteredNew = newChallenges.filter(nc => !existingNames.includes(nc.name));
              return [...prev, ...filteredNew];
            });
          } else {
            // Handle new format (array of objects with name, mins, days)
            const newChallenges = parsedHabits.map((habit) => ({
              id: Math.random().toString(),
              name: habit.name,
              days: habit.days || 4,  // Fallback to default if missing
              mins: habit.mins || 30,  // Fallback to default if missing
            }));
  
            setChallenges((prev) => {
              const existingNames = prev.map(c => c.name);
              const filteredNew = newChallenges.filter(nc => !existingNames.includes(nc.name));
              return [...prev, ...filteredNew];
            });
          }
        }
      } catch (error) {
        console.error("Error parsing habits:", error);
      }
    }
  }, [params?.habits]);


  const { habit, mins, days } = useLocalSearchParams();

  useEffect(() => {
    if (habit && mins && days) {
      const newChallenge = {
        id: Math.random().toString(),
        name: String(habit),
        mins: parseInt(String(mins)),
        days: parseInt(String(days)),
      };
  
      // Prevent duplicate insertions
      const alreadyExists = challenges.some((c) => c.name === newChallenge.name);
      if (!alreadyExists) {
        setChallenges((prev) => [...prev, newChallenge]);
      }
    }
  }, [habit, mins, days]);
  

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [friends, setFriends] = useState([
    { id: '1', name: 'Jhoanne', avatar: require('../assets/images/avatars/user1.png') },
    { id: '2', name: 'Lowela', avatar: require('../assets/images/avatars/user2.png') },
  ]);
  const [challenges, setChallenges] = useState([
    { id: '1', name: 'Exercise', days: 4, mins: 30 },
  ]);

  const [time, setTime] = useState('5');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<{
    mode: 'start' | 'end' | null;
  }>({ mode: null });

  const [challengeName, setChallengeName] = useState('');
  const [challengeDays, setChallengeDays] = useState(1);
  const [challengeMins, setChallengeMins] = useState(parseInt(time));

  // Use useEffect to calculate days whenever dates change
  useEffect(() => {
    calculateDaysDifference();
  }, [startDate, endDate]);

  const addFriend = () => {
    // TODO: Replace with backend user picker modal
    const id = Math.random().toString();
    setFriends([...friends, { id, name: 'Matt', avatar: require('../assets/images/avatars/user1.png') }]);
  };

  const removeFriend = (id: string) => {
    setFriends(friends.filter(f => f.id !== id));
  };

  const addChallenge = () => {
    const id = Math.random().toString();
    setChallenges([...challenges, { id, name: 'Rest an hour', days: 4, mins: 30 }]);
  };

  const removeChallenge = (id: string) => {
    setChallenges(challenges.filter(c => c.id !== id));
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (showDatePicker.mode === 'start' && selectedDate) {
      setStartDate(selectedDate);
    } else if (showDatePicker.mode === 'end' && selectedDate) {
      setEndDate(selectedDate);
    }
    setShowDatePicker({ mode: null });
    // We don't need to call calculateDaysDifference here, it'll be called by useEffect
  };
  

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateDaysDifference = () => {
    if (!startDate || !endDate) return;
  
    // Clone the dates to avoid mutating state
    const start = new Date(startDate.getTime());
    const end = new Date(endDate.getTime());
  
    // Normalize both dates to midnight (no time component)
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
  
    // Debug logs
    //console.log('Start date:', start.toISOString());
    //console.log('End date:', end.toISOString());
    //console.log('Comparison result:', end < start);
  
    // Calculate inclusive day range
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    //console.log('Diff time (ms):', diffTime);
    //console.log('Diff days:', diffDays);
  
    setChallengeDays(diffDays);
  };

  const resetChallengeForm = () => {
    // Reset all fields in the Challenge section
    setChallengeName('');
    setTime('5');
    setStartDate(new Date());
    setEndDate(new Date());
    setChallengeDays(1);
  };
  
  

  return (
    <>
      {/* HEADER (fixed, full width) */}
      <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/Challenges/ChallengeDashboard")}>
        <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
      </TouchableOpacity>

        <Text style={styles.headerTitle}>Create New Challenge</Text>
      </View>
  
      {/* MAIN CONTAINER */}
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >

        {/* FRIENDS SECTION */}
        <Text style={styles.sectionTitle}>Invite friends</Text>
        <View style={styles.inlineRow}>
          <TouchableOpacity style={styles.addCircle} onPress={addFriend}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
          {friends.map(friend => (
            <View key={friend.id} style={styles.friendPill}>
              <Image source={friend.avatar} style={styles.avatar} />
              <Text style={styles.pillText}>{friend.name}</Text>
              <TouchableOpacity onPress={() => removeFriend(friend.id)} style={styles.removeBtn}>
                <Ionicons name="close" size={14} color="#6549FE" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* CHALLENGES SECTION */}
        <Text style={styles.sectionTitle}>Choose Challenge</Text>
        <View style={styles.inlineRow}>
        <TouchableOpacity style={styles.addCircle} onPress={() => router.push('/Challenges/HabitsToChallenge')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
          {challenges.map(challenge => (
            <View key={challenge.id} style={styles.challengeCard}>
              <Text style={styles.challengeTextTitle}>{challenge.name}</Text>
              <Text style={styles.challengeDetails}>{challenge.days} days</Text>
              <Text style={styles.challengeDetails}>{challenge.mins} mins</Text>
              <TouchableOpacity onPress={() => removeChallenge(challenge.id)} style={styles.removeX}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* TIME + DATE SECTION */}
        <View style={styles.timeContainer}>
          <Text style={styles.sectionTitle}>Create Challenge:</Text>

          <TextInput
            placeholder="Challenge Name"
            style={styles.challengeInput}
            value={challengeName}
            onChangeText={setChallengeName}
          />

          <View style={styles.timeRow}>
            <Text style={styles.label}>Active Time:</Text>
            <TouchableOpacity style={styles.timeInput} onPress={() => setShowTimeModal(true)}>
              <Text style={styles.timeText}>{time} min</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTimeModal(true)}>
              <Ionicons name="timer-outline" size={20} color="#6549FE" />
            </TouchableOpacity>
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.label}>Start Date:</Text>
            <Ionicons name="calendar" size={18} color="#6549FE" />
            <TouchableOpacity onPress={() => setShowDatePicker({ mode: 'start' })}>
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.label}>End Date:</Text>
            <Ionicons name="calendar" size={18} color="#6549FE" />
            <TouchableOpacity onPress={() => setShowDatePicker({ mode: 'end' })}>
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#6549FE', marginTop: 10 }}>
            Total Challenge Days: {challengeDays}
          </Text>

          {/* CREATE CHALLENGE BUTTON INSIDE TIME CONTAINER */}
          <TouchableOpacity
            style={[styles.createChallengeSmallButton, { backgroundColor: '#FF9900', marginTop: 20 }]}
            onPress={() => {
              if (!challengeName.trim()) {
                alert('Please enter a challenge name');
                return;
              }
              if (startDate && endDate && endDate < startDate) {
                alert('End date must be after the start date.');
                return;
              }

              const newChallenge = {
                id: Math.random().toString(),
                name: challengeName,
                days: challengeDays,
                mins: parseInt(time),
              };

              setChallenges([...challenges, newChallenge]);
              
              // Reset all fields after creating the challenge
              resetChallengeForm();
            }}
          >
            <Text style={styles.saveBtnText}>Create Challenge</Text>
          </TouchableOpacity>
        </View>


        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => setShowSuccessModal(true)}
        >
          <Text style={styles.saveBtnText}>Save Challenge</Text>
        </TouchableOpacity>

      </ScrollView>
      {/* Time Picker Modal with Dropdown */}
      <Modal visible={showTimeModal} transparent animationType="slide">
  <View style={styles.modal}>
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
          value={showDatePicker.mode === 'start' ? startDate || new Date() : endDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <Ionicons name="checkmark-circle-outline" size={100} color="green" />
            <Text style={styles.successTitle}>Successfully added the challenge.</Text>
            <Text style={styles.successSubText}>
              You can now view and participate in the challenge!
            </Text>

            <TouchableOpacity
              style={styles.successPrimaryBtn}
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/Challenges/MyChallengesScreen');
              }}              
            >
              <Text style={styles.successPrimaryText}>View Challenge</Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={styles.successSecondaryBtn}
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/');
              }}              
            >
              <Text style={styles.successSecondaryText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      </View> {/* This closes the MAIN container */}
    </>
  );
}

const styles = StyleSheet.create({
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
  
  container: { flex: 1, backgroundColor: '#F3F6FF', paddingHorizontal: 15},
  scrollContainer: { paddingBottom: 10 },

  sectionTitle: { fontWeight: 'bold', fontSize: 16, color: '#6549FE', marginTop: 20 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 10 },
  addCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6549FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  friendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginRight: 8,
    marginTop: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  avatar: { width: 35, height: 35, borderRadius: 16, marginRight: 5 },
  pillText: { color: '#6549FE', fontWeight: 'bold' },
  removeBtn: { marginLeft: 5, marginRight: 5 },

  challengeCard: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#5F9CFF',
    marginRight: 8,
    marginTop: 5,
    position: 'relative',
    alignSelf: 'flex-start', // Allow dynamic sizing
    minWidth: 100,
    maxWidth: 200, // Optional limit
  },
  
  challengeTextTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    flexShrink: 1, // allow shrinking if needed
    flexWrap: 'wrap', // wrap long words
  },

  challengeDetails: { color: '#fff', fontSize: 12 },
  removeX: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#6549FE',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  timeContainer: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    marginTop: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  label: { fontWeight: 'bold', color: '#6549FE', marginRight: 10, fontSize:16 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  timeInput: {
    backgroundColor: '#F3F6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  timeText: { color: '#6B7280' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  dateText: {
    color: '#6B7280',
  },

  saveBtn: {
    backgroundColor: '#6549FE',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createChallengeSmallButton: {
    backgroundColor: '#FF9900',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },

  modal: {
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
  modalCloseButton: {
    backgroundColor: '#6549FE',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 15,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  androidPickerContainer: {
    width: 200,
    maxHeight: 200,
    flexDirection: 'column',
  },
  androidPickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 4,
    alignItems: 'center',
  },
  androidPickerItemSelected: {
    backgroundColor: '#E8E3FF',
  },
  androidPickerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  androidPickerTextSelected: {
    color: '#6549FE',
    fontWeight: 'bold',
  },
  timeInputBox: {
    borderColor: '#6549FE',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: 100,
    textAlign: 'center',
    marginVertical: 10,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 40,
    paddingHorizontal: 25,
    width: '100%',
    alignItems: 'center',
  },
  
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6549FE',
    textAlign: 'center',
    marginTop: 20,
  },
  
  successSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 12,
  },
  
  successPrimaryBtn: {
    backgroundColor: '#6549FE',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
  },
  
  successPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  successSecondaryBtn: {
    marginTop: 14,
    borderColor: '#6549FE',
    borderWidth: 2,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  
  successSecondaryText: {
    color: '#6549FE',
    fontWeight: 'bold',
    fontSize: 16,
  },
  challengeInput: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
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