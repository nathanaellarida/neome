import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function UserDataScreen2() {
  const { width, height } = Dimensions.get('window');
  const scaleWidth = width / 1080;
  const scaleHeight = height / 1920;
  const router = useRouter();

  const [date, setDate] = useState(new Date()); // Default to current date
  const [showDatePicker, setShowDatePicker] = useState(false); // Control visibility of the date picker

  const handleDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    // Hide the date picker
    setShowDatePicker(false);

    // Update the date if a valid date is selected
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔙 Back Button (Upper Left Corner) */}
      <TouchableOpacity
        style={[styles.backButton, { top: 65 * scaleHeight, left: 40 * scaleWidth }]}
        onPress={() => router.back()} // ✅ Goes to the previous screen
      >
        <Text style={[styles.backButtonText, { fontSize: 100 * scaleWidth, top: -20 * scaleHeight }]}>←</Text>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { top: 90 * scaleHeight, right: 60 * scaleWidth }]}>
        <Text style={[styles.progressText, { fontSize: 40 * scaleWidth }]}>2/8</Text>
      </View>

      {/* Progress Bar Status */}
      <View style={[styles.progressStatus, { top: 105 * scaleHeight, left: 180 * scaleWidth }]}></View>

      {/* Progress Bar Status Colored */}
      <View style={[styles.progressStatusColored, { top: 72 * scaleHeight, left: 180 * scaleWidth }]}></View>

      {/* Title */}
      <Text style={[styles.title, { top: 244 * scaleHeight, fontSize: 75 * scaleWidth }]}>
        Fill in your Birthdate
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { top: 362 * scaleHeight, fontSize: 50 * scaleWidth }]}>
        To give you a better experience, we need to know your gender
      </Text>

      {/* Date Picker (Centered) */}
      {showDatePicker && (
        <View style={[styles.datePickerContainer, { top: height / 2 - 100, left: width / 2 - 150 }]}>
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner" // Use spinner display for iOS-style wheels
            onChange={handleDateChange}
            locale="en" // Optional: Set locale for consistent formatting
            themeVariant="light" // Optional: Use light or dark theme
          />
        </View>
      )}

      {/* Button to Show Date Picker */}
      <TouchableOpacity
        style={[styles.datePickerButton, { top: 850 * scaleHeight, left: 80 * scaleHeight}]}
        onPress={() => setShowDatePicker(true)} // Show the date picker when clicked
      >
        <Text style={[styles.datePickerButtonText, { fontSize: 75 * scaleWidth }]}>
          {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
      </TouchableOpacity>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, { left: 162 * scaleWidth, top: 1681 * scaleHeight, width: 757 * scaleWidth, height: 135 * scaleHeight }]}
        onPress={() => router.push('/neome_userdata_app/heightandweight')} // ✅ Navigate to next screen
      >
        <Text style={[styles.nextButtonText, { fontSize: 48 * scaleWidth }]}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressBarContainer: {
    position: 'absolute',
  },
  progressStatusColored: {
    width: 70, // Same width & height
    height: 12,
    backgroundColor: '#6549FE',
    borderRadius: 80,
  },
  progressText: {
    fontWeight: '600',
    color: '#6549FE',
  },
  progressStatus: {
    width: 240, // Same width & height
    height: 12,
    backgroundColor: '#F3F6FF',
    justifyContent: 'center',
    borderRadius: 80,
  },
  title: {
    position: 'absolute',
    fontWeight: '600',
    color: '#6549FE',
    width: '100%',
    textAlign: 'center',
  },
  subtitle: {
    position: 'absolute',
    color: '#AEAEAE',
    width: '100%',
    textAlign: 'center',
  },
  nextButton: {
    position: 'absolute',
    backgroundColor: '#6549FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 67,
  },
  nextButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    backgroundColor: '#F3F6FF',
    width: 40, // Adjust button width
    height: 40, // Adjust button height
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100, // Optional rounded corners
  },
  backButtonText: {
    fontWeight: 'bold',
    color: '#6549FE', // Same theme color
  },
  datePickerContainer: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
  },
  datePickerButton: {
    position: 'absolute',
    backgroundColor: '#F3F6FF',
    width: 300, // Same width & height
    height: 100,
    padding: 30,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  datePickerButtonText: {
    fontWeight: '600',
    color: '#6549FE',
  },
});