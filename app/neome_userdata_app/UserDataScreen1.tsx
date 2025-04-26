import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const femaleAvatar = require('../assets/images/femalepic.png');
const maleAvatar = require('../assets/images/malepic.png');

type Gender = 'male' | 'female' | null;

export default function UserDataScreen1() {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState<Gender>(null);

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
  };

  const handleNext = async () => {
    if (!selectedGender || !auth.currentUser) return;

    try {
      // Update the user document with the selected gender
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        gender: selectedGender
      });

      // Navigate to next screen
      router.push('/neome_userdata_app/selectAvatar');
    } catch (error) {
      console.error("Error updating gender:", error);
      alert("Failed to save gender selection. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Container */}
      <View style={styles.progressContainer}>
        {/* Progress Bar */}
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBarFill} />
        </View>
        <Text style={styles.progressText}>1/9</Text>
      </View>

      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Tell Us About Yourself!</Text>
        <Text style={styles.subtitle}>
          To give you a better experience we need to{'\n'}know your gender
        </Text>
      </View>

      {/* Gender Selection Section */}
      <View style={styles.genderSection}>
        <TouchableOpacity 
          style={[
            styles.genderCard,
            selectedGender === 'male' && styles.selectedCard
          ]}
          onPress={() => handleGenderSelect('male')}
        >
          <Image 
            source={maleAvatar} 
            style={styles.avatar} 
            resizeMode="contain"
          />
          <Text style={[
            styles.genderText,
            selectedGender === 'male' && styles.selectedText
          ]}>Male</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.genderCard,
            selectedGender === 'female' && styles.selectedCard
          ]}
          onPress={() => handleGenderSelect('female')}
        >
          <Image 
            source={femaleAvatar} 
            style={styles.avatar} 
            resizeMode="contain"
          />
          <Text style={[
            styles.genderText,
            selectedGender === 'female' && styles.selectedText
          ]}>Female</Text>
        </TouchableOpacity>
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={[
          styles.nextButton,
          !selectedGender && styles.nextButtonDisabled
        ]}
        onPress={handleNext}
        disabled={!selectedGender}
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
    width: '11.11%', // 1/9 = ~11.11%
    height: '100%',
    backgroundColor: '#6549FE',
    borderRadius: 80,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6549FE',
  },
  headerSection: {
    marginTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#6549FE',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#AEAEAE',
    textAlign: 'center',
    lineHeight: 24,
  },
  genderSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 48,
    gap: 12,
  },
  genderCard: {
    width: '48%',
    aspectRatio: 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCard: {
    backgroundColor: '#6549FE',
  },
  avatar: {
    width: '90%',
    height: '75%',
    marginBottom: 16,
  },
  genderText: {
    fontSize: 18,
    color: '#6549FE',
    fontWeight: '600',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#6549FE',
    borderRadius: 100,
    height: 56,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
  },
  nextButtonDisabled: {
    backgroundColor: '#E8E8E8',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});