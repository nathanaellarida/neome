import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import ActiveAvatarList from '../../components/ActiveAvatarList';
import FriendMessageList from '../../components/FriendMessageList';

// Define interface for chat item
interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  avatarUrl: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const BACK_BUTTON = require('../assets/images/backPurple.png');
const { width } = Dimensions.get('window');

const MessageHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState('My Friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Set up Firebase Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // User is signed in
        setIsLoading(false);
      } else {
        // Redirect to login if not authenticated
        router.replace('/loginpage/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChatPress = (chat: ChatItem) => {
    // Get current user from Firebase Auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return;
    }
    
    const currentUserId = currentUser.uid;
    
    router.push({
      pathname: '/messaging/ChatScreen',
      params: {
        chatId: chat.id,
        receiverId: chat.id.replace(`${currentUserId}_`, '').replace(`_${currentUserId}`, ''),
        receiverName: chat.name,
        receiverAvatar: chat.avatar,
        senderId: currentUserId
      }
    } as any);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6549FE" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={BACK_BUTTON} style={styles.backButton} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Messages</Text>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButtonContainer} onPress={() => router.push('/messaging/ConnectFriends' as any)}>
          <View style={styles.addButton}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'My Friends' && styles.activeTab]}
          onPress={() => setActiveTab('My Friends')}>
          <Text style={[styles.tabText, activeTab === 'My Friends' && styles.activeTabText]}>My Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Challenges' && styles.activeTab]}
          onPress={() => router.push("./Challenges/ChallengeDashboard")}>
          <Text style={[styles.tabText, activeTab === 'Challenges' && styles.activeTabText]}>Challenges</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar - Show only for 'My Friends' tab */}
      {activeTab === 'My Friends' && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#A0A0A0" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content based on active tab */}
      {activeTab === 'My Friends' ? (
        <View style={styles.contentContainer}>
          <ActiveAvatarList />
          <FriendMessageList 
            onChatPress={handleChatPress} 
            searchQuery={searchQuery}
          />
        </View>
      ) : (
        <View style={styles.challengesContainer}>
          <Text style={styles.comingSoonText}>Challenges coming soon!</Text>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/homescreen/HomeScreen')}>
          <Ionicons name="home-outline" size={25} color="#6549FE" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, { marginRight: 30 }]}>
          <Ionicons name="bar-chart-outline" size={25} color="#6549FE" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.centerCircle}>
          <Ionicons name="person" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, { marginLeft: 30 }]}>
          <Ionicons name="calendar-outline" size={25} color="#6549FE" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={25} color="#6549FE" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FF',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  loadingContainer: {
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6549FE',
    fontSize: 16,
  },
  headerContainer: {
    width: width,
    height: 80,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    width: 30,
    height: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  addButtonContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 35,
    height: 35,
    backgroundColor: '#6549FE',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 5,
    marginTop: 20,
    width: '90%',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#6549FE',
  },
  tabText: {
    fontSize: 16,
    color: '#6549FE',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    marginTop: 20,
    width: '90%',
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingRight: 10,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  challengesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 18,
    color: '#6549FE',
    fontWeight: '500',
  },
  bottomNav: {
    width: width,
    height: 65,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 35,
    paddingBottom: 3,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    width: 60,
    height: 60,
    backgroundColor: '#6549FE',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    left: width / 2 - 30,
    shadowColor: '#6549FE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default MessageHome;