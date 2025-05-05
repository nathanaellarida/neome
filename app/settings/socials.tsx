import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SocialsScreen() {
  const router = useRouter();

  // Sample social messages data
  const [socials, setSocials] = useState([
    { id: '1', senderName: 'Jhoanne', message: "Katulogon nako bro", time: '2025-04-09 08:30 AM', category: 'new' },
    { id: '2', senderName: 'Lowela', message: "Let's catch up tomorrow", time: '2025-04-08 07:00 PM', category: 'earlier' },
    { id: '3', senderName: 'Matt', message: "Good morning! How are you?", time: '2025-04-08 02:00 PM', category: 'new' },
    { id: '4', senderName: 'Nathanael', message: "Lunch later?", time: '2025-04-07 09:00 AM', category: 'earlier' },
    { id: '5', senderName: 'Virginia', message: "Matulog na guro ta uy?", time: '2025-04-07 09:00 AM', category: 'new' },
  ]);

  // Separate the messages into 'New' and 'Earlier'
  const newMessages = socials.filter(social => social.category === 'new');
  const earlierMessages = socials.filter(social => social.category === 'earlier');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Socials</Text>
        <Ionicons name="chatbubble-outline" size={24} color="#6549FE" />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* New Messages Section */}
        <View style={styles.socialsSection}>
          <Text style={styles.sectionTitle}>New</Text>
          {newMessages.map(social => (
            <View key={social.id} style={styles.socialCard}>
              <View style={styles.profileContainer}>
                {/* Empty Profile Picture */}
                <View style={styles.profilePic} />
                <View style={styles.textContainer}>
                  <Text style={styles.senderName}>{social.senderName}</Text>
                  <Text style={styles.messageText}>
                    {social.senderName} just sent you a message: "{social.message}" 
                    {"\n"}Tap here to reply!
                  </Text>
                  <Text style={styles.messageTime}>{social.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Earlier Messages Section */}
        <View style={styles.socialsSection}>
          <Text style={styles.sectionTitle}>Earlier</Text>
          {earlierMessages.map(social => (
            <View key={social.id} style={styles.socialCard}>
              <View style={styles.profileContainer}>
                {/* Empty Profile Picture */}
                <View style={styles.profilePic} />
                <View style={styles.textContainer}>
                  <Text style={styles.senderName}>{social.senderName}</Text>
                  <Text style={styles.messageText}>
                    {social.senderName} just sent you a message: "{social.message}" 
                    {"\n"}Tap here to reply!
                  </Text>
                  <Text style={styles.messageTime}>{social.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 20,
  },
  socialsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
    marginBottom: 10,
  },
  socialCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D3D3D3', // Grey background to indicate no image
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#AAA',
  },
});
