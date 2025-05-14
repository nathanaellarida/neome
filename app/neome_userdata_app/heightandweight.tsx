import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { auth, db } from '../../firebaseConfig';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function UserDataScreen3() {
  const { width, height } = Dimensions.get('window');
  const scaleWidth = width / 1080;
  const scaleHeight = height / 1920;
  const router = useRouter();

  // State for Height and Weight
  const [heightValue, setHeightValue] = useState(170);
  const [weightValue, setWeightValue] = useState(65);
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace({ pathname: '/loginpage/login', params: { redirectTo: '/neome_userdata_app/heightandweight' } });
    }
  }, []);

  const handleNext = async () => {
    if (!auth.currentUser) {
      alert('You must be logged in to continue');
      return;
    }
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        height: heightValue,
        weight: weightValue,
        updatedAt: serverTimestamp(),
      });
      router.push('/neome_userdata_app/bodytype');
    } catch (error) {
      console.error('Error updating height and weight:', error);
      alert('Failed to save your height and weight. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#6549FE" />
      </TouchableOpacity>

      {/* Progress Container */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBarFill} />
        </View>
        <Text style={styles.progressText}>4/9</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Height and Weight</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        This helps us create your personalized plan
      </Text>

      {/* Height Section */}
      <View style={[styles.selectionContainer, { marginTop: 32 }]}>
        <Text style={styles.label}>Height</Text>
        <View style={styles.unitSwitch}>
          <TouchableOpacity
            style={[styles.unitButton, heightUnit === 'cm' && styles.unitButtonSelected]}
            onPress={() => setHeightUnit('cm')}
          >
            <Text style={[styles.unitText, heightUnit === 'cm' && styles.unitTextSelected]}>Cm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, heightUnit === 'Ft' && styles.unitButtonSelected]}
            onPress={() => setHeightUnit('Ft')}
          >
            <Text style={[styles.unitText, heightUnit === 'Ft' && styles.unitTextSelected]}>Ft</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sliderValue}>{heightValue}</Text>
        <Slider
          style={styles.slider}
          minimumValue={140}
          maximumValue={200}
          step={1}
          minimumTrackTintColor="#6549FE"
          maximumTrackTintColor="#E5E5E5"
          thumbTintColor="#6549FE"
          value={heightValue}
          onValueChange={(value) => setHeightValue(value)}
        />
      </View>

      {/* Weight Section */}
      <View style={[styles.selectionContainer, { marginTop: 32 }]}>
        <Text style={styles.label}>Weight</Text>
        <View style={styles.unitSwitch}>
          <TouchableOpacity
            style={[styles.unitButton, weightUnit === 'kg' && styles.unitButtonSelected]}
            onPress={() => setWeightUnit('kg')}
          >
            <Text style={[styles.unitText, weightUnit === 'kg' && styles.unitTextSelected]}>kg</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, weightUnit === 'lbs' && styles.unitButtonSelected]}
            onPress={() => setWeightUnit('lbs')}
          >
            <Text style={[styles.unitText, weightUnit === 'lbs' && styles.unitTextSelected]}>lbs</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sliderValue}>{weightValue}</Text>
        <Slider
          style={styles.slider}
          minimumValue={25}
          maximumValue={500}
          step={1}
          minimumTrackTintColor="#6549FE"
          maximumTrackTintColor="#E5E5E5"
          thumbTintColor="#6549FE"
          value={weightValue}
          onValueChange={(value) => setWeightValue(value)}
        />
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>Next</Text>
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
    width: '44.44%',
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
  selectionContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6549FE',
    marginBottom: 10,
  },
  unitSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F3F6FF',
    borderRadius: 20,
    padding: 5,
  },
  unitButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  unitButtonSelected: {
    backgroundColor: '#6549FE',
  },
  unitText: {
    fontSize: 14,
    color: '#AEAEAE',
  },
  unitTextSelected: {
    color: '#FFFFFF',
  },
  sliderValue: {
    fontSize: 24,
    padding: 10,
    fontWeight: 'bold',
    color: '#6549FE',
    marginBottom: 10,
  },
  slider: {
    width: 300,
    height: 40,
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
});
