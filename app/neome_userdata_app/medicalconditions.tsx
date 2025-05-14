import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function UserDataScreen7() {
  const { width, height } = Dimensions.get('window');
  const scaleWidth = width / 1080;
  const scaleHeight = height / 1920;
  const router = useRouter();

  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleSelection = (condition: string) => {
    if (selected.includes(condition)) {
      setSelected(selected.filter((item) => item !== condition));
    } else {
      setSelected([...selected, condition]);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Dummy save function for consistency with wellnessgoals (can be replaced with Firestore logic if needed)
  const handleNext = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.push('/neome_userdata_app/mentalstressinfo');
    }, 500); // Simulate async
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
        <Text style={styles.progressText}>8/9</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Medical Conditions</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        This section will offer customized recommendations while taking into account any pre-existing conditions.
      </Text>

      {/* Buttons for Medical Conditions */}
      <View style={styles.buttonContainer}>
        {[
          "Diabetes",
          "Hypertension",
          "Cardiovascular Issues",
          "Asthma",
          "Arthritis",
          "None",
        ].map((condition) => (
          <TouchableOpacity
            key={condition}
            style={[styles.bodyTypeButton, selected.includes(condition) && styles.selectedButton]}
            onPress={() => toggleSelection(condition)}
          >
            <Text style={[styles.buttonText, selected.includes(condition) && styles.selectedButtonText]}>
              {condition}
            </Text>
            {selected.includes(condition) && <Ionicons name="checkmark" size={24} color="white" style={styles.checkIcon} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={[styles.nextButton, !selected.length && styles.disabledButton]} 
        onPress={handleNext}
        disabled={!selected.length || saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.nextButtonText}>
            {!selected.length ? "Select Condition(s)" : "Save & Continue"}
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
    width: '88.89%', // 8/9 = ~88.89%
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
    marginBottom: 8,
    flexDirection: 'row',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: { fontSize: 20, fontWeight: '600', color: '#6549FE' },
  selectedButton: { backgroundColor: '#6549FE' },
  selectedButtonText: { color: '#FFFFFF' },
  checkIcon: { position: 'absolute', right: 20 },
  nextButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
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
