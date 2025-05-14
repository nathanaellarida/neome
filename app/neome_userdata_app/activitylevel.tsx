import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // ✅ Import for checkmark
// Add Firebase imports
import { auth, db } from '../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const activityLevels = [
  {
    title: "Sedentary",
    subtitle: "Little or no exercise",
  },
  {
    title: "Light Active",
    subtitle: "Light exercise/sports 1-3 days a week",
  },
  {
    title: "Moderate Active",
    subtitle: "Moderate exercise/sports 3-5 days a week",
  },
  {
    title: "Very Active",
    subtitle: "Hard exercise/sports 6-7 days a week",
  },
  {
    title: "Super Active",
    subtitle: "Very hard exercise/sports & physical job",
  },
];

export default function UserDataScreen5() {
  const { width, height } = Dimensions.get('window');
  const scaleWidth = width / 1080;
  const scaleHeight = height / 1920;
  const router = useRouter();

  // 🔥 Track selected button
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    router.back();
  };

  // Save activity level to Firestore
  const handleNext = async () => {
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
        activitylevel: selected,
      });
      setSaving(false);
      router.push('/neome_userdata_app/wellnessgoals');
    } catch (error) {
      setSaving(false);
      Alert.alert('Error', 'Failed to save activity level. Please try again.');
      console.error('Error updating activity level:', error);
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
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBarFill} />
        </View>
        <Text style={styles.progressText}>6/9</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Activity Level</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        This is essential for calculating baseline recommendations such as calorie goals and workout intensity.
      </Text>

      {/* Buttons for Activity Level */}
      <View style={styles.buttonContainer}>
        {activityLevels.map(({ title, subtitle }) => (
          <TouchableOpacity
            key={title}
            style={[styles.bodyTypeButton, selected === title && styles.selectedButton]}
            onPress={() => setSelected(selected === title ? null : title)}
          >
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={[styles.buttonText, selected === title && styles.selectedButtonText]}>
                {title}
              </Text>
              <Text style={styles.subtitleText}>{subtitle}</Text>
            </View>
            {/* ✅ Checkmark appears only when selected */}
            {selected === title && <Ionicons name="checkmark" size={24} color="white" style={styles.checkIcon} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={[styles.nextButton, !selected && styles.disabledButton]} 
        onPress={handleNext}
        disabled={!selected || saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.nextButtonText}>
            {!selected ? "Select Activity Level" : "Save & Continue"}
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
    width: '66.67%', // 6/9 = ~66.67%
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
    width: 280,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 67,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row', // ✅ Allows text + checkmark in the same row
    paddingHorizontal: 20, // ✅ Padding for spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: { fontSize: 18, fontWeight: '600', color: '#6549FE', textAlign: 'center' },
  subtitleText: { fontSize: 13, color: '#AEAEAE', textAlign: 'center', marginTop: 2 },

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
