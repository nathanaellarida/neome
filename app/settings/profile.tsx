import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ProfileScreen() {
  const router = useRouter();

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchImage = async () => {
        const uri = await AsyncStorage.getItem('profileImage');
        if (uri) setProfileImage(uri);
      };
      fetchImage();
    }, [])
  );


  return (
    <View style={styles.container}>
      {/* Header: same as settings */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <Ionicons name="person-circle-outline" size={24} color="#6549FE" />
      </View>

      {/* Content aligned like settings */}
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {/* Avatar */}
            {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarCircle} />
                ) : (
                <View style={styles.avatarCircle} />
                )}
            <Text style={styles.name}>Ramsey</Text>

            {/* Info Items */}
            {[
                { label: 'Username', value: 'Ramsey' },
                { label: 'Profile Photo', value: '', icon: true },
                { label: 'Height', value: '162 cm' },
                { label: 'Weight', value: '51 kg' },
                { label: 'Sex', value: 'Female' },
                { label: 'Date of Birth', value: 'November 12, 2000' },
                { label: 'Email', value: 'ramsey@gmail.com' },
                ].map((item, index) => (
                <View key={index} style={styles.item}>
                    <Text style={styles.label}>{item.label}</Text>
                    <View style={styles.valueRow}>
                    {item.value !== '' && <Text style={styles.value}>{item.value}</Text>}
                    {item.icon ? (
                        <TouchableOpacity onPress={() => router.push('/settings/profilePhoto')}>
                        <Ionicons name="chevron-forward" size={18} color="#aaa" />
                        </TouchableOpacity>
                    ) : null}
                    </View>
                </View>
                ))}

          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/settings/editProfile')} // 👈 Navigate to editProfile.tsx
            >
            <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
        </ScrollView>
      </View>
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
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingBottom: 40,
      marginTop: 20,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    avatarCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#D8E0FF',
      alignSelf: 'center',
      marginBottom: 10,
    },
    name: {
      textAlign: 'center',
      fontSize: 16,
      color: '#6549FE',
      fontWeight: 'bold',
      marginBottom: 20,
    },
    item: {
      borderBottomColor: '#eee',
      borderBottomWidth: 1,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 14,
      color: '#666',
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    value: {
      fontSize: 13,
      color: '#6549FE',
      marginRight: 8,
    },
    editButton: {
      backgroundColor: '#6549FE',
      marginHorizontal: 60,
      marginTop: 25,
      paddingVertical: 14,
      borderRadius: 30,
      alignItems: 'center',
    },
    editButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 17,
    },
  });
  