import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // ✅ Import checkmark icon

export default function UserDataScreen4() {
  const { width, height } = Dimensions.get('window');
  const scaleWidth = width / 1080;
  const scaleHeight = height / 1920;
  const router = useRouter();

  // 🔥 Track selected button
  const [selected, setSelected] = useState<string | null>(null);

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
        <Text style={[styles.progressText, { fontSize: 40 * scaleWidth }]}>4/8</Text>
      </View>

      {/* Progress Bar Status */}
      <View style={[styles.progressStatus, { top: 105 * scaleHeight, left: 180 * scaleWidth }]}></View>

      {/* Progress Bar Status Colored */}
      <View style={[styles.progressStatusColored, { top: 72 * scaleHeight, left: 180 * scaleWidth }]}></View>

      {/* Title */}
      <Text style={[styles.title, { top: 244 * scaleHeight, fontSize: 75 * scaleWidth }]}>
        Body Type
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { top: 362 * scaleHeight, fontSize: 50 * scaleWidth }]}>
        This helps us create your personalized plan
      </Text>

      {/* Buttons for Body Type */}
      <View style={styles.buttonContainer}>
        {["Slim", "Average", "Athletic", "Plus-Size"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.bodyTypeButton, selected === type && styles.selectedButton]}
            onPress={() => setSelected(selected === type ? null : type)} // ✅ Toggle selection
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
        style={[styles.nextButton, { left: 162 * scaleWidth, top: 1681 * scaleHeight, width: 757 * scaleWidth, height: 135 * scaleHeight }]}
        onPress={() => router.push('/neome_userdata_app/activitylevel')}
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
    width: 120,
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
    marginTop: 185,
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
    flexDirection: 'row',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  buttonText: { fontSize: 20, fontWeight: '600', color: '#6549FE' },

  /* 🔥 Selected Button Styles */
  selectedButton: { backgroundColor: '#6549FE', flexDirection: 'row' },

  selectedButtonText: { color: '#FFFFFF' },

  checkIcon: { marginLeft: 10 },

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
