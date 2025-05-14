import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function SettingsScreen() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutModal(false);
      router.replace('/loginpage/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    
        const loadSound = async () => {
          const { sound } = await Audio.Sound.createAsync(
            require('../assets/images/tap.wav'),
            { shouldPlay: false }
          );
          soundRef.current = sound;
        };
    
        loadSound();
    
        return () => {
          if (soundRef.current) {
            soundRef.current.unloadAsync();
          }
        };
      }, []);
    
      const playTapSound = async () => {
        try {
          const sound = soundRef.current;
          if (sound) {
            await sound.stopAsync(); // Ensure sound starts clean
            await sound.playFromPositionAsync(0); // No delay, plays from start
          }
        } catch (error) {
          console.warn('Failed to play sound', error);
        }
      };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={async() => {
          await playTapSound();
          router.back();
        } }>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profile Button */}
            <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/settings/profile')}>
              <View style={styles.settingLeft}>
                <Ionicons name="person-circle-outline" size={24} color="#6549FE" />
                <Text style={styles.settingText}>Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Notification Button */}
            <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/settings/notification')}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={24} color="#6549FE" />
                <Text style={styles.settingText}>Notification</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Goals Button */}
            <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/mental_activities/MentalActivities')}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="track-changes" size={24} color="#6549FE" />
                <Text style={styles.settingText}>Goals</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Weekly Report Button */}
            <TouchableOpacity style={styles.settingButton}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="monitor-heart" size={24} color="#6549FE" />
                <Text style={styles.settingText}>My Weekly Report</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Change Password Button */}
            <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/settings/changePassword')}>
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed-outline" size={24} color="#6549FE" />
                <Text style={styles.settingText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/settings/deleteAccount')}>
              <View style={styles.settingLeft}>
                <Ionicons name="person-outline" size={24} color="#6549FE" />
                <Text style={styles.settingText}>Delete Account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* About Button */}
            <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/settings/about')}>
              <View style={styles.settingLeft}>
                <Feather name="info" size={24} color="#6549FE" />
                <Text style={styles.settingText}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={() => setShowLogoutModal(true)}
            >
              <Ionicons name="log-out-outline" size={24} color="#6549FE" style={{ marginRight: 10 }} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure you want to logout?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingTop: 30,
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
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: 20
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6549FE',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#F4F4F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});