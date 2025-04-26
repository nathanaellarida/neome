import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { auth, db } from '../../firebaseConfig';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function UserDataScreen2() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUnder18, setIsUnder18] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const checkAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18;
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    if (selectedDate) {
      setDate(selectedDate);
      const isOldEnough = checkAge(selectedDate);
      setIsUnder18(!isOldEnough);

      // Only set timeout to hide if user is old enough
      if (isOldEnough) {
        scrollTimeout.current = setTimeout(() => {
          setShowDatePicker(false);
        }, 1500);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleNext = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to continue');
      return;
    }

    if (isUnder18) {
      Alert.alert('Error', 'You must be at least 18 years old to continue');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        birthdate: date.toISOString(),
        updatedAt: serverTimestamp()
      });

      router.push('/neome_userdata_app/heightandweight');
    } catch (error) {
      console.error('Error updating birthdate:', error);
      Alert.alert('Error', 'Failed to save your birthdate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBack}
      >
        <Ionicons name="arrow-back" size={24} color="#6549FE" />
      </TouchableOpacity>

      {/* Progress Container */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBarFill} />
        </View>
        <Text style={styles.progressText}>3/9</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Fill in your Birthdate</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        This helps us create your personalized plan
      </Text>

      {/* Date Display Button */}
      {!showDatePicker && (
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
        </TouchableOpacity>
      )}

      {/* Date Picker */}
      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            textColor="#6549FE"
            minimumDate={new Date(1900, 0, 1)}
            maximumDate={new Date(2032, 11, 31)}
            style={styles.datePicker}
            locale="en-US"
          />
          {isUnder18 && (
            <Text style={styles.errorText}>
              You must be at least 18 years old above.*
            </Text>
          )}
        </View>
      )}

      {/* Next Button */}
      <TouchableOpacity
        style={[
          styles.nextButton, 
          (loading || isUnder18) && styles.disabledButton
        ]}
        onPress={handleNext}
        disabled={loading || isUnder18}
      >
        <Text style={styles.nextButtonText}>
          {loading ? 'Saving...' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 40,
    marginRight: 20,
    gap: 10,
  },
  progressBarBackground: {
    width: 240,
    height: 12,
    backgroundColor: '#F3F6FF',
    borderRadius: 80,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '33.33%',
    height: '100%',
    backgroundColor: '#6549FE',
    borderRadius: 80,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6549FE',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#6549FE',
    textAlign: 'center',
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    color: '#AEAEAE',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 90,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minWidth: 300,
  },
  dateButtonText: {
    color: '#6549FE',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  datePickerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  datePicker: {
    width: 320,
    height: 260,
  },
  nextButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 18,
    borderRadius: 30,
    marginHorizontal: 20,
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#C4C4C4',
  },
});