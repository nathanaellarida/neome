import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';


export default function EditProfileScreen() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'inch'>('cm');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [birthDate, setBirthDate] = useState(new Date());
  const [tempDate, setTempDate] = useState({
    day: birthDate.getDate(),
    month: birthDate.getMonth() + 1,
    year: birthDate.getFullYear()
  });

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

  useEffect(() => {
    const loadImage = async () => {
      const savedUri = await AsyncStorage.getItem('profileImage');
      if (savedUri) setProfileImage(savedUri);
    };
    loadImage();
  }, []);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await AsyncStorage.setItem('profileImage', uri);
    }
  };

  const handleDateConfirm = () => {
    setBirthDate(new Date(tempDate.year, tempDate.month - 1, tempDate.day));
    setShowDateDropdown(false);
  };

  const handleSave = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

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
            <Text style={styles.label}>Username</Text>
            <TextInput
              placeholder="Enter username"
              style={styles.input}
            />
          </View>

          {/* Height with unit toggle */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Height</Text>
            <View style={styles.heightContainer}>
              <TextInput
                placeholder="Enter height"
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
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
            <Text style={styles.label}>Weight</Text>
            <TextInput
              placeholder="Enter weight"
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          {/* Sex */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sex</Text>
            <View style={styles.sexContainer}>
              <Text style={styles.sexText}>Female</Text>
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
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter email"
              style={styles.input}
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  },
  sexContainer: {
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  sexText: {
    color: '#666',
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