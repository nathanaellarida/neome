import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfilePhotoScreen() {
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'We need permission to access your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (image) {
      await AsyncStorage.setItem('profileImage', image);
      router.back(); // Go back to profile screen
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setImage(savedImage);
      }
    };
    loadImage();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile Photo</Text>
        <Ionicons name="person-circle-outline" size={24} color="#6549FE" />
      </View>

      {/* Image Upload Card */}
      <View style={styles.card}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarCircle}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="camera" size={32} color="#000" />
          )}
        </TouchableOpacity>
        <Text style={styles.uploadText}>Upload Profile Photo</Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingHorizontal: 20,
        paddingVertical: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
      },
      headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6549FE',
      },
    card: {
      backgroundColor: '#fff',
      margin: 20,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
    },
    avatarCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: '#D8D8D8',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: 140,
      height: 140,
      borderRadius: 70,
    },
    uploadText: {
      marginTop: 15,
      color: '#6549FE',
      fontWeight: '500',
    },
    saveButton: {
      backgroundColor: '#6549FE',
      marginHorizontal: 60,
      marginTop: 25,
      paddingVertical: 14,
      borderRadius: 30,
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 17,
    },
  });
  