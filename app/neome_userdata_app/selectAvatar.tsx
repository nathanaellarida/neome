import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig'; // Import your existing Firebase config

// Import avatar images
const avatar1 = require('../../assets/images/user1.png');
const avatar2 = require('../../assets/images/user2.png');
const avatar3 = require('../../assets/images/user3.png');
const avatar4 = require('../../assets/images/user4.png');
const avatar5 = require('../../assets/images/user5.png');
const avatar6 = require('../../assets/images/user6.png');
const avatar7 = require('../../assets/images/user7.png'); // This exists now based on the screenshot
const avatar8 = require('../../assets/images/user4.png'); // Reusing user4 as placeholder

// Define the mapping from avatar number to storage path
// Using the full URL based on your Firebase Storage format
const avatarStoragePaths: Record<number, string> = {
  1: 'gs://neome-beac7.firebasestorage.app/profile/user1.png',
  2: 'gs://neome-beac7.firebasestorage.app/profile/user2.png',
  3: 'gs://neome-beac7.firebasestorage.app/profile/user3.png',
  4: 'gs://neome-beac7.firebasestorage.app/profile/user4.png',
  5: 'gs://neome-beac7.firebasestorage.app/profile/user5.png',
  6: 'gs://neome-beac7.firebasestorage.app/profile/user6.png',
  7: 'gs://neome-beac7.firebasestorage.app/profile/user7.png',
  8: 'gs://neome-beac7.firebasestorage.app/profile/user4.png', // Reusing user4
};

export default function SelectAvatar() {
  const { width, height } = Dimensions.get('window');
  const scaleWidth = width / 1080;
  const scaleHeight = height / 1920;
  const router = useRouter();
  
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentAvatarPath, setCurrentAvatarPath] = useState<string | null>(null);
  
  // Get current user on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // If not authenticated, redirect to login
        Alert.alert('Authentication Required', 'Please login to continue');
        router.replace('/loginpage/login');
        return;
      }
      
      setCurrentUser(user);
      
      // Fetch the user's current avatar from Firestore
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentAvatarPath(userData?.avatar || null);
          
          // Set the selected avatar based on current path
          if (userData?.avatar) {
            // Find the avatar number that matches the current path
            const avatarNumber = Object.entries(avatarStoragePaths).find(
              ([_, path]) => path === userData.avatar
            );
            
            if (avatarNumber) {
              setSelectedAvatar(parseInt(avatarNumber[0]));
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load your profile');
        setLoading(false);
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [router]);
  
  // Function to get the selected avatar image source
  const getSelectedAvatarSource = () => {
    switch(selectedAvatar) {
      case 1: return avatar1;
      case 2: return avatar2;
      case 3: return avatar3;
      case 4: return avatar4;
      case 5: return avatar5;
      case 6: return avatar6;
      case 7: return avatar7;
      case 8: return avatar8;
      default: return null;
    }
  };
  
  // Function to update avatar in Firestore
  const updateAvatar = async () => {
    if (!currentUser || selectedAvatar === null) {
      Alert.alert('Error', 'Please select an avatar first');
      return;
    }
    
    setSaving(true);
    
    try {
      // Get the storage path for the selected avatar
      const avatarPath = avatarStoragePaths[selectedAvatar];
      
      // Update the user's avatar in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        avatar: avatarPath,
        updatedAt: serverTimestamp()
      });
      
      setCurrentAvatarPath(avatarPath);
      setSaving(false);
      
      // Navigate to the next screen
      router.push('/neome_userdata_app/selectBirthdate');
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Error', 'Failed to update avatar. Please try again.');
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Show loading indicator
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6549FE" />
        <Text style={{ color: '#6549FE', fontSize: 18, marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

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
        <Text style={styles.progressText}>2/9</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Choose Your Avatar!</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Select an avatar that best reflects your style, personality, or mood
      </Text>

      {/* Avatar Placeholder Container */}
      <View style={styles.avatarPlaceholderContainer}>
        <View style={styles.avatarPlaceholder}>
          {selectedAvatar ? (
            <Image 
              source={getSelectedAvatarSource()} 
              style={styles.mainAvatarImage} 
            />
          ) : currentAvatarPath ? (
            <View style={styles.currentAvatarPlaceholder}>
              <Text style={styles.currentAvatarText}>Current Avatar</Text>
            </View>
          ) : null}
        </View>
        
        {!selectedAvatar && !currentAvatarPath && (
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Preset Avatars Title */}
      <Text style={styles.presetTitle}>Preset Avatars</Text>

      {/* Avatar Grid */}
      <View style={styles.avatarGrid}>
        <View style={styles.avatarRow}>
          <TouchableOpacity 
            style={[styles.avatarOption, selectedAvatar === 1 ? styles.selectedAvatar : null]} 
            onPress={() => setSelectedAvatar(1)}
          >
            <Image source={avatar1} style={styles.avatarImage} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.avatarOption, selectedAvatar === 2 ? styles.selectedAvatar : null]} 
            onPress={() => setSelectedAvatar(2)}
          >
            <Image source={avatar2} style={styles.avatarImage} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.avatarOption, selectedAvatar === 3 ? styles.selectedAvatar : null]} 
            onPress={() => setSelectedAvatar(3)}
          >
            <Image source={avatar3} style={styles.avatarImage} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.avatarOption, selectedAvatar === 4 ? styles.selectedAvatar : null]} 
            onPress={() => setSelectedAvatar(4)}
          >
            <Image source={avatar4} style={styles.avatarImage} />
          </TouchableOpacity>
        </View>
        <View style={styles.avatarRow}>
          <TouchableOpacity 
            style={[styles.avatarOption, selectedAvatar === 5 ? styles.selectedAvatar : null]} 
            onPress={() => setSelectedAvatar(5)}
          >
            <Image source={avatar5} style={styles.avatarImage} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.avatarOption, selectedAvatar === 6 ? styles.selectedAvatar : null]} 
            onPress={() => setSelectedAvatar(6)}
          >
            <Image source={avatar6} style={styles.avatarImage} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.avatarOption, selectedAvatar === 7 ? styles.selectedAvatar : null]} 
            onPress={() => setSelectedAvatar(7)}
          >
            <Image source={avatar7} style={styles.avatarImage} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.avatarOption, selectedAvatar === 8 ? styles.selectedAvatar : null]} 
            onPress={() => setSelectedAvatar(8)}
          >
            <Image source={avatar8} style={styles.avatarImage} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={[styles.nextButton, !selectedAvatar && styles.disabledButton]} 
        onPress={updateAvatar}
        disabled={!selectedAvatar || saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.nextButtonText}>
            {selectedAvatar === null ? "Select an Avatar" : "Save & Continue"}
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
    width: '22.22%', // 2/9 = ~22.22%
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
  avatarPlaceholderContainer: {
    alignSelf: 'center',
    marginTop: 20,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  currentAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentAvatarText: {
    color: '#6549FE',
    fontWeight: '500',
    textAlign: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6549FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainAvatarImage: {
    width: '100%',
    height: '100%',
  },
  presetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6549FE',
    marginTop: 50,
    marginBottom: 20,
    marginLeft: 10,
  },
  avatarGrid: {
    alignItems: 'center',
    marginTop: 30,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  selectedAvatar: {
    borderWidth: 2,
    borderColor: '#6549FE',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
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