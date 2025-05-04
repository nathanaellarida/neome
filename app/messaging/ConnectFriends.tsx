// pages/friends/ConnectFriends.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FindFriends from '../../components/FindFriends';
import MyFriendsList from '../../components/MyFriendsList';
import FriendRequestList from '../../components/FriendRequestList';
import { getAuth } from 'firebase/auth';

const { width } = Dimensions.get('window');

const ConnectFriends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Find Friends' | 'My Friends' | 'Friend Request'>('Find Friends');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        // Handle the case when user is not authenticated
        setCurrentUserId(null);
        // Optionally redirect to login screen
        // router.push('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderContent = () => {
    // If currentUserId is null, we can show a loading state or redirect
    if (!currentUserId) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyListText}>Please sign in to view friends</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'Find Friends':
        return <FindFriends currentUserId={currentUserId} searchQuery={searchQuery} />;
      case 'My Friends':
        return <MyFriendsList currentUserId={currentUserId} />;
      case 'Friend Request': 
        return <FriendRequestList currentUserId={currentUserId} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.addButtonContainer} onPress={() => router.push('/messaging/MessageHome')}>
          <View style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#6549FE" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerText}>Friends</Text>
      </View>

      <View style={styles.tabContainerWrapper}>
        <View style={styles.tabContainer}>
          {['Find Friends', 'My Friends', 'Friend Request'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab ? styles.activeTab : styles.inactiveTab,
              ]}
              onPress={() => setActiveTab(tab as typeof activeTab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab ? styles.activeTabText : styles.inactiveTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.contentContainer}>{renderContent()}</View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
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
  headerContainer: {
    width,
    height: 80,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingLeft: 5,
    paddingTop: 5
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6549FE',
    paddingLeft: 10
  },
  tabContainerWrapper: {
    width: width - 40,
    marginTop: 20,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 30,
    overflow: 'hidden',
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#6549FE',
    borderRadius: 30,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  inactiveTabText: {
    color: '#6549FE',
  },
  searchContainer: {
    flexDirection: 'row',
    width: width - 40,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginTop: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    width: width - 40,
    marginTop: 10,
  },
  bottomNav: {
    width,
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
    shadowRadius: 8,
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
  addButtonContainer: {
    marginRight: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
});

export default ConnectFriends;