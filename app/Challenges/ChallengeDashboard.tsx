import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ImageSourcePropType } from 'react-native';
import { db, auth, storage } from '../../firebaseConfig';
import { collection, query, getDocs, DocumentData, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

type Challenge = {
  id: string;
  title: string;
  description: string;
  goal: number;
  startDate: string;
  endDate: string;
  icon: string;
  progressColor: string;
  friends: string[];
  createdAt: string;
  updatedAt: string;
};

type FriendData = {
  id: string;
  name: string;
  avatar: string;
};

const DEFAULT_IMAGE = require('../../assets/images/default-avatar.png');

export default function HomeScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [friendsData, setFriendsData] = useState<{ [key: string]: FriendData }>({});
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [iconError, setIconError] = useState<{ [challengeId: string]: boolean }>({});
  const [avatarError, setAvatarError] = useState<{ [friendId: string]: boolean }>({});

  const getDownloadableUrl = async (gsUrl: string): Promise<string | undefined> => {
    try {
      if (!gsUrl || !gsUrl.startsWith('gs://')) return gsUrl;
      // Extract the path from gs:// URL
      const path = gsUrl.replace('gs://neome-beac7.firebasestorage.app/', '');
      const storageRef = ref(storage, path);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error converting gs:// URL:', error);
      return undefined; // Return undefined if not found
    }
  };

  const getFriendData = async (friendId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', friendId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        let avatarUrl = userData.avatar || '';
        // If the avatar is a gs:// or storage path, convert to HTTP URL
        if (avatarUrl.startsWith('gs://')) {
          // Extract the filename
          const match = avatarUrl.match(/gs:\/\/[^\/]+\/profile\/(user\d+\.png)/);
          if (match && match[1]) {
            // Use the public HTTP URL for Firebase Storage
            avatarUrl = `https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/profile%2F${encodeURIComponent(match[1])}?alt=media`;
          } else {
            // fallback to undefined if not a known file
            avatarUrl = undefined;
          }
        } else if (avatarUrl.startsWith('/profile/') || avatarUrl.startsWith('profile/')) {
          // Handle storage path without gs://
          const filename = avatarUrl.split('/').pop();
          if (filename) {
            avatarUrl = `https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/profile%2F${encodeURIComponent(filename)}?alt=media`;
          } else {
            avatarUrl = undefined;
          }
        }
        return {
          id: friendId,
          name: userData.name || '',
          avatar: avatarUrl,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error getting user data for friend ${friendId}:`, error);
      return null;
    }
  };

  const loadFriendsData = async (friendIds: string[]) => {
    const uniqueFriendIds = Array.from(new Set(friendIds));
    const friendsDataMap: { [key: string]: FriendData } = {};

    await Promise.all(
      uniqueFriendIds.map(async (friendId) => {
        const friendData = await getFriendData(friendId);
        if (friendData) {
          friendsDataMap[friendId] = friendData;
        }
      })
    );

    setFriendsData(friendsDataMap);
  };

  const fetchChallengeIconUrl = async (challengeTitle: string) => {
    try {
      const iconDoc = await getDoc(doc(db, 'challenges_icons', challengeTitle));
      if (iconDoc.exists()) {
        const gsPath = iconDoc.data().path;
        // Convert gs:// to HTTP URL
        const match = gsPath.match(/gs:\/\/[^\/]+\/challenges_icons\/(.+\.png)/);
        if (match && match[1]) {
          return `https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/challenges_icons%2F${encodeURIComponent(match[1])}?alt=media`;
        }
      }
    } catch (error) {
      console.error('Error fetching icon from Firestore:', error);
    }
    return undefined;
  };

  const fetchChallenges = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No user logged in');
        setLoading(false);
        return;
      }

      const userChallengesRef = collection(db, `users/${currentUser.uid}/challenges`);
      const querySnapshot = await getDocs(userChallengesRef);
      const fetchedChallenges: Challenge[] = [];
      const allFriendIds = new Set<string>();
      
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data() as DocumentData;
        const friends = data.friends || [];
        friends.forEach((friendId: string) => allFriendIds.add(friendId));
        // Try to get icon URL from the challenge document
        let iconUrl = data.icon || '';
        // If iconUrl is missing or not a valid URL, try Firestore lookup table
        if (!iconUrl || (!iconUrl.startsWith('http') && !iconUrl.startsWith('gs://') && !iconUrl.startsWith('challenges_icons/'))) {
          iconUrl = await fetchChallengeIconUrl(data.title);
        } else if (iconUrl.startsWith('gs://')) {
          // Extract the filename
          const match = iconUrl.match(/gs:\/\/[^\/]+\/challenges_icons\/(.+\.png)/);
          if (match && match[1]) {
            iconUrl = `https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/challenges_icons%2F${encodeURIComponent(match[1])}?alt=media`;
          } else {
            iconUrl = undefined;
          }
        } else if (iconUrl.startsWith('/challenges_icons/') || iconUrl.startsWith('challenges_icons/')) {
          // Handle storage path without gs://
          const filename = iconUrl.split('/').pop();
          if (filename) {
            iconUrl = `https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/challenges_icons%2F${encodeURIComponent(filename)}?alt=media`;
          } else {
            iconUrl = undefined;
          }
        }
        fetchedChallenges.push({
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          goal: data.goal || 0,
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          icon: iconUrl,
          progressColor: data.progressColor || '#6549FF',
          friends: friends,
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
        });
      }

      setChallenges(fetchedChallenges);
      // Load all friend data including avatars
      await loadFriendsData(Array.from(allFriendIds));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Handler to trigger the first modal
  const handleEllipsisPress = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowProgressModal(true);
  };

  // Handler to delete the challenge
  const handleConfirmDelete = async () => {
    setShowDeleteConfirmModal(false);
    if (!selectedChallenge) return;
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');
      const challengeRef = doc(db, 'users', currentUser.uid, 'challenges', selectedChallenge.id);
      await deleteDoc(challengeRef);
      // Remove from local state
      setChallenges(prev => prev.filter(c => c.id !== selectedChallenge.id));
      setShowDeletedModal(true);
      setSelectedChallenge(null);
    } catch (error) {
      console.error('Error deleting challenge:', error);
      // Optionally show an error modal or toast here
    }
  };

  const handleEditChallenge = () => {
    if (selectedChallenge) {
      setShowProgressModal(false);
      router.push({
        pathname: '/Challenges/CreateNewChallenge',
        params: {
          editMode: "true",
          challengeData: JSON.stringify({
            id: selectedChallenge.id,
            name: selectedChallenge.title,
            description: selectedChallenge.description,
            goal: selectedChallenge.goal,
            startDate: selectedChallenge.startDate,
            endDate: selectedChallenge.endDate,
            icon: selectedChallenge.icon,
            progressColor: selectedChallenge.progressColor,
            friends: selectedChallenge.friends
          })
        }
      });
    }
  };

  const renderChallengeCards = (data: Challenge[]) =>
    data.map((item: Challenge) => {
      const friendOverflow = item.friends.length > 3;
      const visibleFriends = item.friends.slice(0, 3);
      return (
        <View key={item.id} style={styles.challengeCard}>
          {/* Top Row */}
          <View style={styles.challengeHeader}>
            <View style={styles.challengeIconWrapper}>
              <Image
                source={iconError[item.id] || !item.icon ? DEFAULT_IMAGE : { uri: item.icon }}
                style={styles.challengeIcon}
                resizeMode="contain"
                onError={() => setIconError(prev => ({ ...prev, [item.id]: true }))}
              />
            </View>
            <View style={styles.challengeText}>
              <Text style={styles.challengeTitle}>{item.title}</Text>
              <Text style={styles.challengeDesc}>{item.description}</Text>
            </View>
            <TouchableOpacity onPress={() => handleEllipsisPress(item)}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#6549FE" />
            </TouchableOpacity>
          </View>
  
          {/* Mid Info */}
          <View style={styles.challengeInfoRow}>
            <Text style={styles.challengeProgress}>
              <Text style={styles.progressGoal}>{item.goal} mins</Text>
            </Text>
          </View>
  
          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: '0%',
                  backgroundColor: item.progressColor,
                },
              ]}
            />
          </View>
  
          {/* Dates and Avatars */}
          <View style={styles.challengeFooter}>
            <Text style={styles.challengeDates}>
              {item.startDate} - {item.endDate}
            </Text>
            <View style={styles.friendAvatars}>
              {visibleFriends.map((friendId: string, i: number) => (
                <Image
                  key={i}
                  source={avatarError[friendId] || !friendsData[friendId]?.avatar ? DEFAULT_IMAGE : { uri: friendsData[friendId].avatar }}
                  style={[styles.avatar, { marginLeft: i !== 0 ? -10 : 0 }]}
                  onError={() => setAvatarError(prev => ({ ...prev, [friendId]: true }))}
                />
              ))}
              {friendOverflow && (
                <View style={styles.avatarOverflow}>
                  <Text style={styles.avatarOverflowText}>
                    +{item.friends.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton}
          onPress={() => router.push("/homescreen/HomeScreen")}>
            <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Challenges</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/Challenges/CreateNewChallenge")}>
            <Ionicons name="add" size={24} color="#6549FE" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton]}
            onPress={() => router.push('/messaging/MessageHome')}>
            <Text style={styles.tabText}>My Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Challenges</Text>
          </TouchableOpacity>
        </View>

        {/* Trophy Card */}
        <ImageBackground
          source={require('../assets/images/challenges/playTogetherBackground.png')}
          style={styles.trophyCard}
          imageStyle={{ borderRadius: 20 }}
        >
          <Text style={styles.trophyTitle}>Let's Play Together</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/Challenges/MyChallengesScreen")}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>

          <Image source={require('../assets/images/challenges/trophy.png')} style={styles.trophyImage} />
        </ImageBackground>

        <Text style={styles.progressTitle}>My Progress</Text>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6549FE" />
          </View>
        ) : (
          /* Render Challenge Cards */
          <View style={styles.challengeList}>
            {renderChallengeCards(challenges)}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navButton}>
            <Ionicons name="home-outline" size={25} color="#6549FE" />
            </TouchableOpacity>
    
            {/* Increased spacing for Statistics */}
            <TouchableOpacity style={[styles.navButton, { marginRight: 30 }]}>
            <Ionicons name="bar-chart-outline" size={25} color="#6549FE" />
            </TouchableOpacity>
    
            {/* Center Profile Button */}
            <TouchableOpacity style={styles.centerCircle}>
            <Ionicons name="person" size={32} color="#FFFFFF" />
            </TouchableOpacity>
    
            {/* Increased spacing for Calendar */}
            <TouchableOpacity style={[styles.navButton, { marginLeft: 30 }]}>
            <Ionicons name="calendar-outline" size={25} color="#6549FE" />
            </TouchableOpacity>
    
            <TouchableOpacity style={styles.navButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={25} color="#6549FE" />
            </TouchableOpacity>
        </View>
        {/* My Progress Modal */}
      <Modal visible={showProgressModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowProgressModal(false)}>
              <Ionicons name="close" size={20} color="#6549FE" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>My Progress</Text>
            <Image source={require('../assets/images/challenges/trophy.png')} style={{ width: 80, height: 80, marginVertical: 20 }} />
            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleEditChallenge}>
              <Text style={styles.modalBtnText}>Edit Challenge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => {
              setShowProgressModal(false);
              setShowDeleteConfirmModal(true);
            }}>
              <Text style={styles.modalBtnOutlineText}>Delete Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal visible={showDeleteConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image source={require('../assets/images/challenges/error-circle.png')} style={{ width: 80, height: 80, marginBottom: 20 }} />
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalDesc}>Do you really want to delete this challenge?{"\n"}This process cannot be undone.</Text>
            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleConfirmDelete}>
              <Text style={styles.modalBtnText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setShowDeleteConfirmModal(false)}>
              <Text style={styles.modalBtnOutlineText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Deleted Successfully Modal */}
      <Modal visible={showDeletedModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image source={require('../assets/images/challenges/check-circle.png')} style={{ width: 80, height: 80, marginBottom: 20 }} />
            <Text style={styles.modalTitle}>Successfully Deleted</Text>
            <Text style={styles.modalDesc}>
              You have successfully deleted the Challenge{"\n"}
              <Text style={{ fontWeight: 'bold' }}>"{selectedChallenge?.title}"</Text>
            </Text>
            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setShowDeletedModal(false)}>
              <Text style={styles.modalBtnText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FF' },
  scrollContainer: { paddingBottom: 100 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: { marginRight: 10 },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  addButton: {
    marginLeft: 'auto',
    backgroundColor: '#F3F6FF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 5,
    marginTop: 20,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#6549FE',
    fontWeight: '500',
  },
  activeTab: {
    backgroundColor: '#6549FE',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },  
  
  trophyCard: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#A288F0',
    borderRadius: 50,
    padding: 20,
    alignItems: 'flex-start',
    position: 'relative',
    height: 140,
  },
  trophyImage: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 120,
    height: 120,
    marginRight: 8,
    resizeMode: 'contain',
  },
  trophyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  startButton: {
    marginTop: 25,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  startButtonText: {
    color: '#6549FE',
    fontWeight: 'bold',
  },

  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
  },
  challengeList: {
    paddingHorizontal: 20,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  challengeIcon: {
    width: 40,
    height: 40,
  },
  challengeText: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  challengeDesc: {
    color: '#6B7280',
    marginTop: 2,
  },
  challengeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,

  },
  challengeProgress: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressGoal: {
    color: '#FF9900',
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E6E9F8',
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    borderRadius: 10,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  challengeDates: {
    color: '#6B7280',
  },
  friendAvatars: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarOverflow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6E9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
  },
  avatarOverflowText: {
    color: '#6549FE',
    fontWeight: 'bold',
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // CENTER PROFILE BUTTON
  centerCircle: {
    width: 65,
    height: 65,
    borderRadius: 50,
    backgroundColor: '#6549FE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: width / 2 - 32.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6549FE',
    textAlign: 'center',
  },
  modalDesc: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  modalPrimaryBtn: {
    backgroundColor: '#6549FE',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  modalSecondaryBtn: {
    borderColor: '#6549FE',
    borderWidth: 1.5,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 25,
    alignItems: 'center',
    width: '100%',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBtnOutlineText: {
    color: '#6549FE',
    fontWeight: 'bold',
  },
  modalCloseBtn: {
    alignSelf: 'flex-end',
  },  
  
});