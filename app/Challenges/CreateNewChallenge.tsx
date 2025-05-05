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
  Alert,
  Animated,
} from 'react-native';
// Import Picker from the community package instead of react-native
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { router } from 'expo-router';
import FriendSelectionModal from './FriendSelectionModal';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth, storage } from '../../firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';

const { width, height } = Dimensions.get('window');

// Time options for dropdown (in minutes)
const timeOptions = ['5', '10', '15', '20', '30', '45', '60', '90', '120', '150', '180'];

// Update Friend type to include all profile information
type Friend = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  level?: number;
  online?: boolean;
  lastSeen?: { toDate: () => Date; } | null;
  avatarUrl?: string;
};

// Add this after the imports
const GRADIENT_COLORS = [
  // Blue gradient
  {
    start: '#60A9F6',
    end: '#2A8BF2'
  },
  // Yellow gradient
  {
    start: '#FFD93D',
    end: '#FF9900'
  },
  // Pink/Purple gradient
  {
    start: '#FF69B4',
    end: '#DA70D6'
  },
  // Green gradient
  {
    start: '#4CD964',
    end: '#2ECC71'
  }
];

// Add this after the GRADIENT_COLORS constant
const PROGRESS_COLORS = ['#6549FF', '#FF33AB', '#FFD93D', '#4CD964'];

// Update the formatDate function to handle Date objects
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

// Add this helper function near the top, after imports
const getChallengeIconUrl = (challengeName: string) => {
  // Map challenge names to their tokens (replace YOUR_TOKEN with actual tokens)
  const tokens: { [key: string]: string } = {
    'Cycling': '36c42a49-275e-4d42-954f-ede41080ee38',
    'Dancing': '8b8f4dba-5f67-4c86-a9ea-602eb7570981',
    'Hiking': 'd9b90dd4-e0a7-4f6c-a427-2437d5b730c7',
    'Home Workout': '36356795-42d9-4a58-82a5-869c3be58e36',
    'Jogging': '5b3c504b-d4a6-48b7-97a9-99a0a78f6eef',
    'Jump Rope': 'b1b834d1-dc06-4a07-a2ce-ab989befdcc1',
    'Streching': '32bf5be4-d5bd-489a-af66-c2f8a2c0eb02',
    'Swimming': 'fe9992a8-edfe-496c-9bcb-50bd61739be8',
    'Walking': 'd9bd04ad-6574-4650-bce7-75737bf42798',
    'Yoga': '21c1bc90-376c-4bf8-ad8e-8185371631dd',
    'default': 'YOUR_TOKEN',
  };
  const fileName = encodeURIComponent(`${challengeName}.png`);
  const token = tokens[challengeName] || tokens['default'];
  return `https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/challenges_icons%2F${fileName}?alt=media&token=${token}`;
};

export default function CreateNewChallenge() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const isEditMode = params?.editMode === "true";

  // Initialize challenges from params if available
  const [challenges, setChallenges] = useState<Array<{
    id: string;
    name: string;
    days: number;
    mins: number;
    email: string;
    startDate?: string;
    endDate?: string;
  }>>(() => {
    // Try to get existing challenges from params
    const existingChallenges = params?.existingChallenges;
    if (existingChallenges) {
      try {
        return JSON.parse(existingChallenges as string);
      } catch (e) {
        console.error('Error parsing existing challenges:', e);
        return [];
      }
    }
    return [];
  });

  // Handle incoming habits
  useEffect(() => {
    const habitsParam = params?.habits;
    console.log('CreateNewChallenge - Received habits param:', habitsParam);
    console.log('CreateNewChallenge - Current challenges:', challenges);
    
    if (habitsParam) {
      try {
        const parsedHabits = JSON.parse(habitsParam as string);
        console.log('CreateNewChallenge - Parsed habits:', parsedHabits);
        
        if (Array.isArray(parsedHabits)) {
          const newChallenges = parsedHabits.map((habit) => ({
            id: Math.random().toString(),
            name: habit.name,
            days: habit.days || 4,
            mins: habit.mins || 30,
            email: 'example@email.com',
            startDate: habit.startDate,
            endDate: habit.endDate
          }));

          console.log('CreateNewChallenge - Mapped new challenges:', newChallenges);

          // Combine existing challenges with new ones
          setChallenges(prevChallenges => {
            console.log('CreateNewChallenge - Previous challenges:', prevChallenges);
            
            // Create a set of existing challenge names for quick lookup
            const existingNames = new Set(prevChallenges.map(c => c.name));
            console.log('CreateNewChallenge - Existing names:', Array.from(existingNames));
            
            // Filter out any new challenges that already exist
            const uniqueNewChallenges = newChallenges.filter(
              challenge => !existingNames.has(challenge.name)
            );
            console.log('CreateNewChallenge - Unique new challenges:', uniqueNewChallenges);

            // Return combined array of old and new challenges
            const combinedChallenges = [...prevChallenges, ...uniqueNewChallenges];
            console.log('CreateNewChallenge - Final combined challenges:', combinedChallenges);
            return combinedChallenges;
          });
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
        email: 'example@email.com' // Adding email to match Friend type
      };
  
      // Prevent duplicate insertions
      const alreadyExists = challenges.some((c) => c.name === newChallenge.name);
      if (!alreadyExists) {
        setChallenges((prev) => [...prev, newChallenge]);
      }
    }
  }, [habit, mins, days]);
  

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

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
    setFriends([...friends, { 
      id, 
      name: 'Matt', 
      avatar: '../../assets/images/default-avatar.png',
      email: 'example@email.com' 
    }]);
  };

  const removeFriend = (id: string) => {
    setFriends(friends.filter(f => f.id !== id));
  };

  const addChallenge = () => {
    const id = Math.random().toString();
    setChallenges([...challenges, { id, name: 'Rest an hour', days: 4, mins: 30, email: 'example@email.com' }]);
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
  

  const formatDate = (date: Date | null): string => {
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
  
  

  const handleSelectFriends = (selectedFriends: Friend[]) => {
    // Update friends state with full profile information
    setFriends(selectedFriends.map(friend => ({
      id: friend.id,
      name: friend.name,
      avatar: friend.avatar,
      email: friend.email,
      level: friend.level,
      online: friend.online,
      lastSeen: friend.lastSeen,
      avatarUrl: friend.avatarUrl
    })));
  };

  const handleCustomChallengePress = () => {
    setShowCustomForm(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseCustomForm = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowCustomForm(false);
      resetChallengeForm();
    });
  };

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState<'start' | 'end' | null>(null);

  // Function to navigate to HabitsToChallenge
  const navigateToHabitsToChallenge = () => {
    // Pass current challenges as a parameter
    router.push({
      pathname: '/Challenges/HabitsToChallenge',
      params: {
        existingChallenges: JSON.stringify(challenges)
      }
    });
  };

  // Update the add circle button to use the new navigation function
  const renderAddCircleButton = () => (
    <TouchableOpacity 
      style={styles.addCircle} 
      onPress={navigateToHabitsToChallenge}
    >
      <Ionicons name="add" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const getAvatarUrl = async (avatarPath: string): Promise<string> => {
    // Define default avatars with tokens
    const DEFAULT_AVATAR = 'https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/profile%2Fuser2.png?alt=media&token=c079139b-841e-421d-ab2d-b13799875ccb';
    
    try {
      // If no avatar path is provided or it's empty, return default avatar
      if (!avatarPath || avatarPath.trim() === '') {
        return DEFAULT_AVATAR;
      }

      // If the path is already an HTTP URL, return it as is
      if (avatarPath.startsWith('http')) {
        return avatarPath;
      }

      // Handle Google Cloud Storage URLs
      let storagePath = avatarPath;
      if (avatarPath.startsWith('gs://')) {
        // Extract just the path part, ignoring the bucket name
        const matches = avatarPath.match(/gs:\/\/[^\/]+\/(.+)/);
        if (matches && matches[1]) {
          storagePath = matches[1];
        } else {
          console.error('Invalid gs:// URL format:', avatarPath);
          return DEFAULT_AVATAR;
        }
      }

      // Encode the path properly for the URL
      const encodedPath = encodeURIComponent(storagePath);
      
      // Construct the full Firebase Storage URL
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o';
      const url = `${baseUrl}/${encodedPath}?alt=media`;

      console.log('Attempting to fetch from URL:', url);
      
      try {
        // Try to get the download URL
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch avatar');
        }
        return url;
      } catch (storageError) {
        console.error('Storage error:', storageError);
        return DEFAULT_AVATAR;
      }
    } catch (error) {
      console.error('Error in getAvatarUrl:', error);
      return DEFAULT_AVATAR;
    }
  };

  const fetchFriendData = async (friendId: string): Promise<Friend | null> => {
    try {
      console.log('Fetching data for friend ID:', friendId);
      const userDoc = await getDoc(doc(db, 'users', friendId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data from Firestore:', userData);
        
        // Get downloadable URL for avatar
        const avatarUrl = await getAvatarUrl(userData.avatar || '');
        console.log('Final avatar URL:', avatarUrl);
        
        const friendData = {
          id: friendId,
          name: userData.name || '',
          avatar: avatarUrl,
          email: userData.email || '',
          online: userData.online || false,
          lastSeen: userData.lastSeen || null,
          level: userData.level || 1
        };
        
        console.log('Processed friend data:', friendData);
        return friendData;
      }
      console.log('No user document found for ID:', friendId);
      return null;
    } catch (error) {
      console.error('Error fetching friend data:', error);
      return null;
    }
  };

  // Update the useEffect to better handle friend data loading
  useEffect(() => {
    if (isEditMode && params?.challengeData) {
      try {
        const challengeData = JSON.parse(params.challengeData as string);
        console.log('Challenge data received:', challengeData);
        
        // Parse dates
        const startDateObj = parseDateString(challengeData.startDate);
        const endDateObj = parseDateString(challengeData.endDate);
        
        // Set the challenge data
        setChallenges([{
          id: challengeData.id,
          name: challengeData.name,
          days: calculateDaysBetweenDates(startDateObj, endDateObj),
          mins: challengeData.goal,
          email: 'example@email.com',
          startDate: formatDate(startDateObj),
          endDate: formatDate(endDateObj)
        }]);

        // Fetch and set friends data if available
        if (challengeData.friends && challengeData.friends.length > 0) {
          console.log('Friends array from challenge:', challengeData.friends);
          
          const loadFriends = async () => {
            try {
              const currentUserId = auth.currentUser?.uid;
              console.log('Current user ID:', currentUserId);
              
              const friendPromises = challengeData.friends
                .filter((friendId: string) => friendId !== currentUserId)
                .map((friendId: string) => fetchFriendData(friendId));

              console.log('Fetching data for friends...');
              const friendsData = await Promise.all(friendPromises);
              const validFriends = friendsData.filter((friend): friend is Friend => friend !== null);
              console.log('Valid friends data:', validFriends);
              
              setFriends(validFriends);
            } catch (error) {
              console.error('Error in loadFriends:', error);
            }
          };

          loadFriends();
        }

        // Show custom form if we're editing
        setShowCustomForm(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Set form values
        setChallengeName(challengeData.name);
        setTime(challengeData.goal.toString());
        setStartDate(startDateObj);
        setEndDate(endDateObj);
      } catch (error) {
        console.error('Error parsing challenge data:', error);
      }
    }
  }, [params?.challengeData]);

  // Update the saveChallengesToFirebase function to handle updates
  const saveChallengesToFirebase = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'You must be logged in to save challenges');
        return;
      }

      // Get current user's name for the notification
      const currentUserDoc = await getDoc(doc(db, 'users', userId));
      const currentUserName = currentUserDoc.data()?.name || 'Someone';

      // Only use the selected friends' IDs, don't add current user
      const participantIds = friends.map(friend => friend.id);

      // Save each challenge
      const savePromises = challenges.map(async (challenge) => {
        // Construct the icon path based on the challenge title
        // const iconPath = `gs://neome-beac7.firebasestorage.app/challenges_icons/${challenge.name}.png`;
        const iconPath = getChallengeIconUrl(challenge.name);

        // Base challenge data without timestamps
        const challengeData = {
          title: challenge.name,
          description: `${challenge.days} days per week`,
          goal: challenge.mins,
          startDate: formatDate(startDate || new Date()),
          endDate: formatDate(endDate || new Date()),
          icon: iconPath,
          progressColor: PROGRESS_COLORS[0],
          friends: [],  // Start with empty friends array
          updatedAt: serverTimestamp(),
          createdBy: userId
        };

        let challengeId;
        if (isEditMode) {
          // If editing, update the existing document without createdAt
          const docRef = doc(db, 'users', userId, 'challenges', challenge.id);
          await updateDoc(docRef, challengeData);
          challengeId = challenge.id;
        } else {
          // If creating new, add createdAt timestamp
          const challengesRef = collection(db, 'users', userId, 'challenges');
          const newChallengeDoc = await addDoc(challengesRef, {
            ...challengeData,
            createdAt: serverTimestamp()
          });
          challengeId = newChallengeDoc.id;
        }

        // Create notifications for each invited friend
        const notificationPromises = participantIds.map(async (friendId) => {
          const notificationData = {
            type: 'challenge_invitation',
            senderId: userId,
            senderName: currentUserName,
            challengeId: challengeId,
            challengeName: challenge.name,
            challengeDays: challenge.days,
            challengeMins: challenge.mins,
            startDate: formatDate(startDate || new Date()),
            endDate: formatDate(endDate || new Date()),
            status: 'pending',
            createdAt: serverTimestamp(),
            read: false
          };

          // Add notification to friend's notifications collection
          const friendNotificationsRef = collection(db, 'users', friendId, 'notifications');
          await addDoc(friendNotificationsRef, notificationData);
        });

        await Promise.all(notificationPromises);
      });

      await Promise.all(savePromises);
      console.log('Challenge saved successfully');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving challenge:', error);
      Alert.alert(
        'Error',
        'Failed to save challenge. Please try again.'
      );
    }
  };

  // Update the Save Challenge button press handler
  const handleSavePress = () => {
    if (challenges.length === 0) {
      Alert.alert('Error', 'Please add at least one challenge before saving');
      return;
    }
    saveChallengesToFirebase();
  };

  // Helper function to parse date string
  const parseDateString = (dateStr: string) => {
    try {
      // Check if the date is in "Month Day, Year" format (e.g., "April 30, 2025")
      const parts = dateStr.split(' ');
      if (parts.length === 3) {
        const month = parts[0];
        const day = parseInt(parts[1].replace(',', ''));
        const year = parseInt(parts[2]);
        return new Date(year, getMonthNumber(month), day);
      }
      // If not in the expected format, try direct parsing
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date;
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date(); // Return current date as fallback
    }
  };

  // Helper function to convert month name to number
  const getMonthNumber = (monthName: string) => {
    const months = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3,
      'May': 4, 'June': 5, 'July': 6, 'August': 7,
      'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    return months[monthName as keyof typeof months] || 0;
  };

  // Update calculateDaysBetweenDates to accept Date objects
  const calculateDaysBetweenDates = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Update the header title based on mode
  const headerTitle = isEditMode ? "Edit Challenge" : "Create New Challenge";

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push("/Challenges/ChallengeDashboard")}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Invite friends</Text>
        <View style={styles.inlineRow}>
          <TouchableOpacity style={styles.addCircle} onPress={() => setShowFriendModal(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
          {friends.map(friend => (
            <View key={friend.id} style={styles.friendPill}>
              {friend.avatar ? (
                <Image 
                  source={{ uri: friend.avatar }}
                  style={styles.avatar}
                  defaultSource={require('../../assets/images/default-avatar.png')}
                />
              ) : (
                <Image 
                  source={require('../../assets/images/default-avatar.png')}
                  style={styles.avatar}
                />
              )}
              <View style={styles.friendPillInfo}>
                <Text style={styles.pillText}>{friend.name}</Text>
                {friend.level && <Text style={styles.pillLevel}>Lv.{friend.level}</Text>}
              </View>
              <TouchableOpacity onPress={() => removeFriend(friend.id)} style={styles.removeBtn}>
                <Ionicons name="close" size={14} color="#6549FE" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Select a Challenge Type</Text>
        <View style={styles.inlineRow}>
          {renderAddCircleButton()}
          {challenges.map((challenge, index) => (
            <View key={challenge.id} style={styles.challengeCardContainer}>
              <LinearGradient
                colors={[
                  GRADIENT_COLORS[index % GRADIENT_COLORS.length].start,
                  GRADIENT_COLORS[index % GRADIENT_COLORS.length].end
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.challengeCard}
              >
                <Text style={styles.challengeTextTitle}>{challenge.name}</Text>
                <View style={styles.challengeDetailsContainer}>
                  <Text style={styles.challengeDetails}>{challenge.days} days</Text>
                  <Text style={styles.challengeDetailsDot}>•</Text>
                  <Text style={styles.challengeDetails}>{challenge.mins} mins</Text>
                </View>
              </LinearGradient>
              <TouchableOpacity 
                onPress={() => removeChallenge(challenge.id)} 
                style={styles.removeX}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {!showCustomForm ? (
          <>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.customChallengeButton}
              onPress={handleCustomChallengePress}
            >
              <Text style={styles.customChallengeText}>Custom Challenge</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Animated.View 
            style={[
              styles.customChallengeCard,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Create Challenge:</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseCustomForm}
              >
                <Ionicons name="close" size={24} color="#6549FE" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              placeholder="Challenge Name"
              style={styles.challengeInput}
              value={challengeName}
              onChangeText={setChallengeName}
              placeholderTextColor="#999"
            />

            <View style={styles.timeRow}>
              <Text style={styles.label}>Active Time:</Text>
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeText}>{time} min</Text>
                <TouchableOpacity onPress={() => setShowTimeModal(true)}>
                  <Ionicons name="timer-outline" size={20} color="#6549FE" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dateRow}>
              <Text style={styles.label}>Start Date:</Text>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => {
                  setSelectedDateType('start');
                  setShowCalendarModal(true);
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#6549FE" />
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateRow}>
              <Text style={styles.label}>End Date:</Text>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => {
                  setSelectedDateType('end');
                  setShowCalendarModal(true);
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#6549FE" />
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.totalDays}>
              Total Challenge Days: {challengeDays}
            </Text>

            <TouchableOpacity
              style={styles.createChallengeButton}
              onPress={() => {
                if (!challengeName.trim()) {
                  Alert.alert('Error', 'Please enter a challenge name');
                  return;
                }
                if (startDate && endDate && endDate < startDate) {
                  Alert.alert('Error', 'End date must be after the start date');
                  return;
                }

                const newChallenge = {
                  id: Math.random().toString(),
                  name: challengeName,
                  days: challengeDays,
                  mins: parseInt(time),
                  email: 'example@email.com'
                };

                setChallenges([...challenges, newChallenge]);
                resetChallengeForm();
                setShowCustomForm(false);
                fadeAnim.setValue(0);
              }}
            >
              <Text style={styles.createChallengeText}>Create Challenge</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSavePress}
        >
          <Text style={styles.saveBtnText}>{isEditMode ? 'Update Challenge' : 'Save Challenge'}</Text>
        </TouchableOpacity>
      </View>

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
                <Text style={styles.timeOptionText}>{`${option} minutes`}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={() => setShowTimeModal(false)} style={{ marginTop: 15 }}>
            <Text style={{ color: '#6549FE', fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Replace the existing DatePicker with new Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        transparent
        animationType="fade"
      >
        <View style={styles.calendarModalOverlay}>
          <View style={styles.calendarModalContent}>
            <Calendar
              current={selectedDateType === 'start' ? startDate?.toISOString() : endDate?.toISOString()}
              onDayPress={(day: { timestamp: number }) => {
                const selectedDate = new Date(day.timestamp);
                if (selectedDateType === 'start') {
                  setStartDate(selectedDate);
                } else {
                  setEndDate(selectedDate);
                }
              }}
              markedDates={{
                [(selectedDateType === 'start' 
                  ? startDate?.toISOString().split('T')[0] 
                  : endDate?.toISOString().split('T')[0]) || '']: {
                  selected: true,
                  selectedColor: '#6549FE'
                }
              }}
              theme={{
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: '#6549FE',
                selectedDayBackgroundColor: '#6549FE',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#6549FE',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: '#6549FE',
                monthTextColor: '#6549FE',
                textMonthFontWeight: 'bold',
                textDayFontSize: 14,
                textMonthFontSize: 14,
                textDayHeaderFontSize: 14,
                arrowColor: '#6549FE'
              }}
            />
            <TouchableOpacity
              style={styles.calendarDoneButton}
              onPress={() => {
                setShowCalendarModal(false);
                setSelectedDateType(null);
                calculateDaysDifference();
              }}
            >
              <Text style={styles.calendarDoneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Friend Selection Modal */}
      <FriendSelectionModal
        visible={showFriendModal}
        onClose={() => setShowFriendModal(false)}
        onSelectFriends={handleSelectFriends}
        currentFriends={friends}
      />

      {/* Success Modal */}
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
                router.push('/Challenges/ChallengeDashboard');
              }}              
            >
              <Text style={styles.successSecondaryText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3F6FF',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 30,
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
  
  scrollContainer: { paddingBottom: 10 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6549FE',
    marginBottom: 15,
    marginLeft: 20,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
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
  friendPillInfo: {
    marginHorizontal: 8,
  },
  pillText: {
    color: '#6549FE',
    fontWeight: 'bold',
  },
  pillLevel: {
    color: '#666666',
    fontSize: 12,
  },
  removeBtn: { marginLeft: 5, marginRight: 5 },

  challengeCardContainer: {
    marginRight: 12,
    marginTop: 12,
    marginLeft: 4,
    position: 'relative',
    shadowColor: '#4C4C4C',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 5,
  },
  challengeCard: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 120,
    maxWidth: 200,
  },
  challengeTextTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  challengeDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeDetails: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  challengeDetailsDot: {
    color: '#fff',
    fontSize: 12,
    marginHorizontal: 4,
    opacity: 0.9,
  },
  removeX: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#6549FE',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  label: {
    width: 100,
    fontSize: 16,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    gap: 10,
  },
  timeText: {
    color: '#666666',
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    gap: 8,
  },
  dateText: {
    color: '#666666',
    fontSize: 16,
    flex: 1,
  },

  saveBtn: {
    backgroundColor: '#6549FE',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  customChallengeSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  challengeInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  customChallengeButton: {
    borderWidth: 1,
    borderColor: '#6549FE',
    borderRadius: 30,
    paddingVertical: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  customChallengeText: {
    color: '#6549FE',
    fontSize: 16,
    fontWeight: '600',
  },
  customChallengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginTop: 30,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  formTitle: {
    color: '#6549FE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  timeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  totalDays: {
    color: '#6549FE',
    fontSize: 14,
    marginVertical: 15,
  },
  createChallengeButton: {
    backgroundColor: '#FF9900',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  createChallengeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    width: '90%',
    maxWidth: 350,
  },
  calendarDoneButton: {
    backgroundColor: '#6549FE',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  calendarDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});