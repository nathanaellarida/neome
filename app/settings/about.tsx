import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificationScreen() {
  const router = useRouter();
  
  // State for modals
  const [isCommunityGuidelinesVisible, setCommunityGuidelinesVisible] = useState(false);
  const [isTermsVisible, setTermsVisible] = useState(false);
  const [isPrivacyPolicyVisible, setPrivacyPolicyVisible] = useState(false);

  // Toggle modals
  const showCommunityGuidelines = () => setCommunityGuidelinesVisible(true);
  const hideCommunityGuidelines = () => setCommunityGuidelinesVisible(false);

  const showTerms = () => setTermsVisible(true);
  const hideTerms = () => setTermsVisible(false);

  const showPrivacyPolicy = () => setPrivacyPolicyVisible(true);
  const hidePrivacyPolicy = () => setPrivacyPolicyVisible(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <Ionicons name="notifications-outline" size={24} color="#6549FE" />
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Community Guidelines Category */}
            <TouchableOpacity style={styles.categoryButton} onPress={showCommunityGuidelines}>
              <View style={styles.categoryLeft}>
                <Ionicons name="time-outline" size={24} color="#6549FE" />
                <Text style={styles.categoryText}>Community Guidelines</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Terms of Service Category */}
            <TouchableOpacity style={styles.categoryButton} onPress={showTerms}>
              <View style={styles.categoryLeft}>
                <Ionicons name="people-outline" size={24} color="#6549FE" />
                <Text style={styles.categoryText}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            {/* Privacy Policy Category */}
            <TouchableOpacity style={styles.categoryButton} onPress={showPrivacyPolicy}>
              <View style={styles.categoryLeft}>
                <Ionicons name="sparkles-outline" size={24} color="#6549FE" />
                <Text style={styles.categoryText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>

      {/* Community Guidelines Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCommunityGuidelinesVisible}
        onRequestClose={hideCommunityGuidelines}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Community Guidelines</Text>
            <ScrollView contentContainerStyle={styles.modalTextContainer}>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Respect Each Other</Text> {"\n"}
                Be kind and courteous. Harassment, hate speech, or discriminatory behavior will not be tolerated. {"\n\n"}

                <Text style={styles.boldText}>Authenticity and Integrity</Text> {"\n"}
                Provide accurate health inputs to maintain the efficacy of the platform and avoid misrepresentation. {"\n\n"}

                <Text style={styles.boldText}>Privacy Matters</Text> {"\n"}
                Do not share personal or sensitive data of yourself or others on public features of the platform. {"\n\n"}

                <Text style={styles.boldText}>Constructive Feedback</Text> {"\n"}
                Share feedback that helps others grow. Avoid criticism that is harmful or discouraging. {"\n\n"}

                <Text style={styles.boldText}>Engagement and Support</Text> {"\n"}
                Participate actively in challenges, discussions, and community goals, fostering motivation and encouragement. {"\n\n"}

                <Text style={styles.boldText}>Prohibited Content</Text> {"\n"}
                Do not post or share inappropriate, offensive, or harmful material. {"\n\n"}

                <Text style={styles.boldText}>Use Responsibly</Text> {"\n"}
                Avoid exploiting or misusing gamification features for unintended purposes. {"\n\n"}

                Breaking these guidelines may result in suspension or removal from the platform.
              </Text>
            </ScrollView>
            <Pressable style={styles.closeButton} onPress={hideCommunityGuidelines}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTermsVisible}
        onRequestClose={hideTerms}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <ScrollView contentContainerStyle={styles.modalTextContainer}>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>By using NeoME, you agree to the following terms:</Text> {"\n\n"}
                - You are responsible for your actions on the platform. {"\n"}
                - NeoME reserves the right to remove inappropriate content. {"\n"}
                - You must be at least 13 years old to use the service. {"\n"}
                - Personal data may be collected for better service. {"\n"}
                - You can cancel your account anytime by contacting support.
              </Text>
            </ScrollView>
            <Pressable style={styles.closeButton} onPress={hideTerms}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPrivacyPolicyVisible}
        onRequestClose={hidePrivacyPolicy}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <ScrollView contentContainerStyle={styles.modalTextContainer}>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Data Collection:</Text> {"\n"}
                - We collect personal information such as name, email, and activity data. {"\n"}
                - Your data is stored securely and will not be shared with third parties without consent. {"\n\n"}

                <Text style={styles.boldText}>Your Rights:</Text> {"\n"}
                - You have the right to access, update, or delete your personal information. {"\n"}
                - We use cookies to enhance your user experience. {"\n\n"}

                <Text style={styles.boldText}>Consent:</Text> {"\n"}
                - By using NeoME, you consent to our privacy practices outlined here.
              </Text>
            </ScrollView>
            <Pressable style={styles.closeButton} onPress={hidePrivacyPolicy}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
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
    paddingBottom: 20,
    paddingTop: 20,
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
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    height: 400, // Fixed height for modal
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalTextContainer: {
    paddingBottom: 20,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
