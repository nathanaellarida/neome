import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Modal, TouchableWithoutFeedback, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { auth, db, storage } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';


export default function EditProfileScreen() {
  const router = useRouter();
  
  // User data state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // UI state
  const [heightUnit, setHeightUnit] = useState<'cm' | 'inch'>('cm');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [birthDate, setBirthDate] = useState(new Date());
  const [tempDate, setTempDate] = useState({
    day: birthDate.getDate(),
    month: birthDate.getMonth() + 1,
    year: birthDate.getFullYear()
  });
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Months array for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years (from current year to 100 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Generate days based on selected month and year
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };
  const days = Array.from({ length: getDaysInMonth(tempDate.month, tempDate.year) }, (_, i) => i + 1);
  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert('Error', 'You need to be logged in to edit your profile.');
          router.back();
          return;
        }
        
        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Set user data to state
          setFullName(userData.name || '');
          setEmail(userData.email || currentUser.email || '');
          setHeight(userData.height ? String(userData.height) : '');
          setWeight(userData.weight ? String(userData.weight) : '');
          setGender(userData.gender || '');
          
          // Handle birthdate
          if (userData.birthdate) {
            try {
              // Check if birthdate is a Firestore timestamp or a string
              const birthDateObj = userData.birthdate.toDate ? 
                userData.birthdate.toDate() : 
                new Date(userData.birthdate);
                
              setBirthDate(birthDateObj);
              setTempDate({
                day: birthDateObj.getDate(),
                month: birthDateObj.getMonth() + 1,
                year: birthDateObj.getFullYear()
              });
            } catch (error) {
              console.log('Error parsing birthdate:', error);
            }
          }
          
          // Handle profile image
          if (userData.avatar) {
            try {
              const imageRef = ref(storage, userData.avatar);
              const url = await getDownloadURL(imageRef);
              setProfileImage(url);
            } catch (error) {
              console.log('Error fetching profile image:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load your profile data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
  
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        // We'll upload the image to Firebase Storage when the user saves the profile
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const handleDateConfirm = () => {
    setBirthDate(new Date(tempDate.year, tempDate.month - 1, tempDate.day));
    setShowDateDropdown(false);
  };
  const uploadImageAsync = async (uri: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create a reference to upload the image
      const imageRef = ref(storage, `users/${currentUser.uid}/profile/avatar.jpg`);
      
      // Upload the blob
      const uploadTask = uploadBytesResumable(imageRef, blob);
      
      // Return a promise that resolves with the download URL when complete
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Progress function
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            // Error function
            console.error('Error during upload:', error);
            reject(error);
          },
          async () => {
            // Complete function
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to save your profile.');
        return;
      }
      
      // Reference to the user document
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Prepare update data object
      const updateData: any = {
        name: fullName,
        email: email,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        gender: gender,
        birthdate: birthDate,
        lastUpdated: new Date()
      };
      
      // Handle profile image if it's changed (if it starts with 'file:' it's a new local image)
      if (profileImage && profileImage.startsWith('file:')) {
        try {
          // Upload the image and get the download URL
          const avatarPath = `users/${currentUser.uid}/profile/avatar.jpg`;
          const downloadURL = await uploadImageAsync(profileImage);
          updateData.avatar = avatarPath;
        } catch (error) {
          console.error('Error uploading profile image:', error);
          Alert.alert('Warning', 'Failed to upload profile image, but other data will be saved.');
        }
      }
      
      // Update the user document in Firestore
      await updateDoc(userRef, updateData);
      
      Alert.alert('Success', 'Your profile has been updated successfully.');
      router.back();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        {saving ? (
          <ActivityIndicator size="small" color="#6549FE" />
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>
      
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#6549FE" />
          <Text style={{marginTop: 12, fontSize: 16, color: '#6549FE'}}>Loading profile data...</Text>
        </View>
      ) : (

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handleImagePick}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarCircle} />
            ) : (
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={40} color="#6549FE" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.uploadText}>Edit Profile Photo</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>            <TextInput
              placeholder="Enter full name"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Height with unit toggle */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Height</Text>
            <View style={styles.heightContainer}>              <TextInput
                placeholder="Enter height"
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />
              <View style={styles.unitPicker}>
                <TouchableOpacity 
                  style={[styles.unitButton, heightUnit === 'cm' && styles.activeUnit]}
                  onPress={() => setHeightUnit('cm')}
                >
                  <Text style={[styles.unitText, heightUnit === 'cm' && styles.activeUnitText]}>cm</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.unitButton, heightUnit === 'inch' && styles.activeUnit]}
                  onPress={() => setHeightUnit('inch')}
                >
                  <Text style={[styles.unitText, heightUnit === 'inch' && styles.activeUnitText]}>inch</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Weight */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Weight</Text>            <TextInput
              placeholder="Enter weight"
              style={styles.input}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>          {/* Gender */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity 
                style={[styles.genderButton, gender === 'Male' && styles.activeGender]}
                onPress={() => setGender('Male')}
              >
                <Text style={[styles.genderText, gender === 'Male' && styles.activeGenderText]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.genderButton, gender === 'Female' && styles.activeGender]}
                onPress={() => setGender('Female')}
              >
                <Text style={[styles.genderText, gender === 'Female' && styles.activeGenderText]}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.genderButton, gender === 'Other' && styles.activeGender]}
                onPress={() => setGender('Other')}
              >
                <Text style={[styles.genderText, gender === 'Other' && styles.activeGenderText]}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date of Birth with dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDateDropdown(true)}
            >
              <Text style={styles.dateText}>
                {months[birthDate.getMonth()]} {birthDate.getDate()}, {birthDate.getFullYear()}
              </Text>
              <Ionicons name="calendar" size={20} color="#6549FE" />
            </TouchableOpacity>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>            <TextInput
              placeholder="Enter email"
              style={styles.input}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity></View>
      </ScrollView>
      )}

      {/* Date Dropdown Modal */}
      <Modal
        visible={showDateDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDateDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDateDropdown(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownTitle}>Select Date of Birth</Text>
          
          <View style={styles.dateDropdownRow}>
            {/* Month Dropdown */}
            <View style={styles.dropdownColumn}>
              <Text style={styles.dropdownLabel}>Month</Text>
              <ScrollView style={styles.dropdownScroll}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[styles.dropdownItem, tempDate.month === index + 1 && styles.selectedItem]}
                    onPress={() => setTempDate({...tempDate, month: index + 1})}
                  >
                    <Text style={[styles.dropdownItemText, tempDate.month === index + 1 && styles.selectedItemText]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Day Dropdown */}
            <View style={styles.dropdownColumn}>
              <Text style={styles.dropdownLabel}>Day</Text>
              <ScrollView style={styles.dropdownScroll}>
                {days.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dropdownItem, tempDate.day === day && styles.selectedItem]}
                    onPress={() => setTempDate({...tempDate, day})}
                  >
                    <Text style={[styles.dropdownItemText, tempDate.day === day && styles.selectedItemText]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year Dropdown */}
            <View style={styles.dropdownColumn}>
              <Text style={styles.dropdownLabel}>Year</Text>
              <ScrollView style={styles.dropdownScroll}>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[styles.dropdownItem, tempDate.year === year && styles.selectedItem]}
                    onPress={() => setTempDate({...tempDate, year})}
                  >
                    <Text style={[styles.dropdownItemText, tempDate.year === year && styles.selectedItemText]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleDateConfirm}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF2FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D8E0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 10,
    color: '#6549FE',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F4F4F4',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  heightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitPicker: {
    marginLeft: 10,
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  unitButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  activeUnit: {
    backgroundColor: '#6549FE',
  },
  unitText: {
    color: '#666',
  },
  activeUnitText: {
    color: '#fff',
  },  genderContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    overflow: 'hidden',
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeGender: {
    backgroundColor: '#6549FE',
  },
  genderText: {
    color: '#666',
  },
  activeGenderText: {
    color: '#fff', 
  },
  dateInput: {
    backgroundColor: '#F4F4F4',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  saveButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  // Dropdown styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdownContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
    marginBottom: 15,
    textAlign: 'center',
  },
  dateDropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#6549FE',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  selectedItemText: {
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});