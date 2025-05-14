import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // ✅ Import for checkmark
// Add Firebase imports
import { auth, db } from '../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default function UserDataScreen6() {
  const { width, height } = Dimensions.get('window');
  const scaleWidth = width / 1080;
  const scaleHeight = height / 1920;
  const router = useRouter();

  // Change from array to single string
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleSelection = (type: string) => {
    if (selected === type) {
      setSelected(null); // Deselect if already selected
    } else {
      setSelected(type); // Select new option
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Save wellness goal to Firestore
  const saveWellnessGoal = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        setSaving(false);
        return;
      }
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        wellnessgoals: selected,
      });
      setSaving(false);
      router.push('/neome_userdata_app/medicalconditions');
    } catch (error) {
      setSaving(false);
      Alert.alert('Error', 'Failed to save wellness goal. Please try again.');
      console.error('Error updating wellness goal:', error);
    }
  };

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
        {/* Progress Bar */}
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBarFill} />
        </View>
        <Text style={styles.progressText}>7/9</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Wellness Goals</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Select one priority to focus on.
      </Text>

      {/* Buttons for Wellness Goals */}
      <View style={styles.buttonContainer}>
        {[
          "Lose Weight",
          "Gain Weight",
          "Build Muscle",
          "Manage Stress",
          "Sleep Quality",
          "Focus & Productivity",
        ].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.bodyTypeButton, selected === type && styles.selectedButton]}
            onPress={() => toggleSelection(type)}
          >
            <Text style={[styles.buttonText, selected === type && styles.selectedButtonText]}>
              {type}
            </Text>
            {selected === type && <Ionicons name="checkmark" size={24} color="white" style={styles.checkIcon} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={[styles.nextButton, !selected && styles.disabledButton]} 
        onPress={saveWellnessGoal}
        disabled={!selected || saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.nextButtonText}>
            {!selected ? "Select a Goal" : "Save & Continue"}
          </Text>
        )}
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
    width: '77.78%', // 7/9 = ~77.78%
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
    fontSize: 24,
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
  buttonContainer: {
    marginTop: 30,
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
    backgroundColor: '#6549FE',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginHorizontal: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#C4C4C4',
  },
});
