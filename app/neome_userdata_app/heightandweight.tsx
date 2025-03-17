import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';

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

  return (
    <View style={styles.container}>
      {/* 🔙 Back Button */}
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
      <View style={[styles.progressStatus, { top: 105 * scaleHeight }]}></View>

      {/* Progress Bar Status Colored */}
      <View style={[styles.progressStatusColored, { top: 72 * scaleHeight, left: -210 * scaleWidth }]}></View>

      {/* Title */}
      <Text style={[styles.title, { top: 244 * scaleHeight, fontSize: 75 * scaleWidth }]}>
        Height and Weight
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { top: 362 * scaleHeight, fontSize: 50 * scaleWidth }]}>
        This helps us create your personalized plan
      </Text>

      {/* Height Section */}
      <View style={[styles.selectionContainer, { marginTop: 170 }]}>
        <Text style={styles.label}>Height</Text>
        <View style={styles.unitSwitch}>
          <TouchableOpacity
            style={[styles.unitButton, heightUnit === 'cm' && styles.unitButtonSelected]}
            onPress={() => setHeightUnit('cm')}
          >
            <Text style={[styles.unitText, heightUnit === 'cm' && styles.unitTextSelected]}>Cm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, heightUnit === 'in' && styles.unitButtonSelected]}
            onPress={() => setHeightUnit('in')}
          >
            <Text style={[styles.unitText, heightUnit === 'in' && styles.unitTextSelected]}>In</Text>
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
      <View style={[styles.selectionContainer, { marginTop: 10 }]}>
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
        style={[styles.nextButton, { left: 162 * scaleWidth, top: 1681 * scaleHeight, width: 757 * scaleWidth, height: 135 * scaleHeight }]}
        onPress={() => router.push('/neome_userdata_app/bodytype')}
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
    alignItems: 'center',
  },
  progressBarContainer: {
    position: 'absolute',
  },
  progressStatusColored: {
    width: 100,
    height: 12,
    backgroundColor: '#6549FE',
    borderRadius: 80,
  },
  progressText: {
    fontWeight: '600',
    color: '#6549FE',
  },
  progressStatus: {
    width: 240,
    height: 12,
    backgroundColor: '#F3F6FF',
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
  selectionContainer: {
    marginTop: 150,
    alignItems: 'center',
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  backButtonText: {
    fontWeight: 'bold',
    color: '#6549FE',
  },
});
