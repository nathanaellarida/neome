import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // ✅ Import for checkmark

export default function UserDataScreen8() {
  const { width, height } = Dimensions.get('window');
  const scaleWidth = width / 1080;
  const scaleHeight = height / 1920;
  const router = useRouter();

  // 🔥 Track selected buttons
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (goal: string) => {
    if (selected.includes(goal)) {
      setSelected(selected.filter((item) => item !== goal)); // Remove if already selected
    } else {
      setSelected([...selected, goal]); // Add if not selected
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: 65 * scaleHeight, left: 40 * scaleWidth }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backButtonText, { fontSize: 100 * scaleWidth, top: -20 * scaleHeight }]}>←</Text>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { top: 95 * scaleHeight, right: 60 * scaleWidth }]}>
        <Text style={[styles.progressText, { fontSize: 40 * scaleWidth }]}>8/8</Text>
      </View>

      {/* Progress Bar Status */}
      <View style={[styles.progressStatus, { top: 105 * scaleHeight, left: 180 * scaleWidth }]}></View>

      {/* Progress Bar Status Colored */}
      <View style={[styles.progressStatusColored, { top: 72 * scaleHeight, left: 180 * scaleWidth }]}></View>

      {/* Title */}
      <Text style={[styles.title, { top: 244 * scaleHeight, fontSize: 75 * scaleWidth }]}>
        Mental Health & Stress Information
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { top: 450 * scaleHeight, fontSize: 50 * scaleWidth }]}>
        Used to help track and recommend          appropriate mental health and emotional well-being activities.
      </Text>

      {/* Buttons for Mental Health Goals */}
      <View style={styles.buttonContainer}>
        {[
          "Reduce Stress",
          "Manage Anxiety",
          "Practice Mindfulness",
          "Improve Focus",
        ].map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[styles.bodyTypeButton, selected.includes(goal) && styles.selectedButton]}
            onPress={() => toggleSelection(goal)}
          >
            <Text style={[styles.buttonText, selected.includes(goal) && styles.selectedButtonText]}>
              {goal}
            </Text>
            {/* ✅ Checkmark appears only when selected */}
            {selected.includes(goal) && <Ionicons name="checkmark" size={24} color="white" style={styles.checkIcon} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Finish Button */}
      <TouchableOpacity
        style={[styles.nextButton, { left: 162 * scaleWidth, top: 1681 * scaleHeight, width: 757 * scaleWidth, height: 135 * scaleHeight }]}
        onPress={() => router.push('/homescreen/HomeScreen')}
      >
        <Text style={[styles.nextButtonText, { fontSize: 48 * scaleWidth }]}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  progressStatus: {
    width: 240,
    height: 12,
    backgroundColor: '#F3F6FF',
    justifyContent: 'center',
    borderRadius: 80,
  },
  progressStatusColored: {
    width: 240,
    height: 12,
    backgroundColor: '#6549FE',
    borderRadius: 80,
  },
  progressBarContainer: { position: 'absolute' },
  progressText: { fontWeight: '600', color: '#6549FE' },
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

  /* 🔲 Buttons Section */
  buttonContainer: {
    marginTop: 230,
    alignItems: 'center',
    width: '100%',
  },
  bodyTypeButton: {
    width: 250,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 67,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row', // ✅ Allows text + checkmark in the same row
    paddingHorizontal: 20, // ✅ Padding for spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  buttonText: { fontSize: 20, fontWeight: '600', color: '#6549FE' },

  /* 🔥 Selected Button Styles */
  selectedButton: { backgroundColor: '#6549FE' },
  selectedButtonText: { color: '#FFFFFF' },

  /* ✅ Checkmark Icon */
  checkIcon: { position: 'absolute', right: 20 },

  nextButton: {
    position: 'absolute',
    backgroundColor: '#6549FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 67,
  },
  nextButtonText: { fontWeight: '600', color: '#FFFFFF' },

  /* 🔙 Back Button Styles */
  backButton: {
    position: 'absolute',
    backgroundColor: '#F3F6FF',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  backButtonText: { fontWeight: 'bold', color: '#6549FE' },
});
