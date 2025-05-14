import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function UserDataScreen8() {
  const { width, height } = Dimensions.get('window');
  const scaleWidth = width / 1080;
  const scaleHeight = height / 1920;
  const router = useRouter();

  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleSelection = (goal: string) => {
    if (selected.includes(goal)) {
      setSelected(selected.filter((item) => item !== goal));
    } else {
      setSelected([...selected, goal]);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Dummy save function for consistency with wellnessgoals (can be replaced with Firestore logic if needed)
  const handleFinish = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.push('/homescreen/HomeScreen');
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
        <Text style={styles.progressText}>9/9</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Mental Health & Stress Information</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Used to help track and recommend appropriate mental health and emotional well-being activities.
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
            {selected.includes(goal) && <Ionicons name="checkmark" size={24} color="white" style={styles.checkIcon} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Finish Button */}
      <TouchableOpacity 
        style={[styles.nextButton, !selected.length && styles.disabledButton]} 
        onPress={handleFinish}
        disabled={!selected.length || saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.nextButtonText}>
            {!selected.length ? "Select Option(s)" : "Finish"}
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
    width: '100%', // 9/9 = 100%
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
    flexDirection: 'row',
    paddingHorizontal: 20,
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
