import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // ✅ Import for checkmark

export default function UserDataScreen6() {
  const { width, height } = Dimensions.get('window');
  const scaleWidth = width / 1080;
  const scaleHeight = height / 1920;
  const router = useRouter();

  // 🔥 Track selected buttons
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (type: string) => {
    if (selected.includes(type)) {
      setSelected(selected.filter((item) => item !== type)); // Remove if already selected
    } else {
      setSelected([...selected, type]); // Add if not selected
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
        <Text style={[styles.progressText, { fontSize: 40 * scaleWidth }]}>6/8</Text>
      </View>

      {/* Progress Bar Status */}
      <View style={[styles.progressStatus, { top: 105 * scaleHeight, left: 180 * scaleWidth }]}></View>

      {/* Progress Bar Status Colored */}
      <View style={[styles.progressStatusColored, { top: 72 * scaleHeight, left: 180 * scaleWidth }]}></View>

      {/* Title */}
      <Text style={[styles.title, { top: 244 * scaleHeight, fontSize: 75 * scaleWidth }]}>
        Wellness Goals
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { top: 362 * scaleHeight, fontSize: 50 * scaleWidth }]}>
        You can specify the priorities to focus on.
      </Text>

      {/* Buttons for Wellness Goals */}
      <View style={styles.buttonContainer}>
        {[
          "Lose Weight",
          "Build Muscle",
          "Improve Mental Health",
          "Manage Stress",
          "Sleep Quality",
          "Focus & Productivity",
        ].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.bodyTypeButton, selected.includes(type) && styles.selectedButton]}
            onPress={() => toggleSelection(type)}
          >
            <Text style={[styles.buttonText, selected.includes(type) && styles.selectedButtonText]}>
              {type}
            </Text>
            {/* ✅ Checkmark appears only when selected */}
            {selected.includes(type) && <Ionicons name="checkmark" size={24} color="white" style={styles.checkIcon} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, { left: 162 * scaleWidth, top: 1681 * scaleHeight, width: 757 * scaleWidth, height: 135 * scaleHeight }]}
        onPress={() => router.push('/neome_userdata_app/medicalconditions')}
      >
        <Text style={[styles.nextButtonText, { fontSize: 48 * scaleWidth }]}>Next</Text>
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
    width: 180,
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
    marginTop: 160,
    alignItems: 'center',
    width: '100%',
  },
  bodyTypeButton: {
    width: 250,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 67,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
