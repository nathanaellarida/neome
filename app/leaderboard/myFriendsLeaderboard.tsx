import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { auth, db, storage } from '../../firebaseConfig';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';

interface Friend {
  id: string;
  name: string;
  email: string;
  points: number;
  avatar: string;
  gender: string;
  overallrank: string;
  avatarUrl?: string;
}

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<'overall' | 'friends'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ id: user.uid, ...userDoc.data() });
        }
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const friendsList: Friend[] = [];
        
        // Get the current user's friends
        const userDoc = await getDoc(doc(db, 'users', currentUser.id));
        const userData = userDoc.data();
        const userFriends = userData?.friends || [];

        // Fetch each friend's data
        for (const friendId of userFriends) {
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          if (friendDoc.exists()) {
            const friendData = friendDoc.data();
            let avatarUrl = '';
            
            // Get avatar URL from storage if it exists
            if (friendData.avatar) {
              try {
                const imageRef = ref(storage, friendData.avatar);
                avatarUrl = await getDownloadURL(imageRef);
              } catch (error) {
                console.warn('Error fetching avatar:', error);
              }
            }

            friendsList.push({
              id: friendId,
              name: friendData.name || 'Unknown',
              email: friendData.email || '',
              points: friendData.points || 0,
              avatar: friendData.avatar || '',
              gender: friendData.gender || 'male',
              overallrank: friendData.overallrank || '0',
              avatarUrl,
            });
          }
        }

        // Sort friends by points in descending order
        friendsList.sort((a, b) => b.points - a.points);
        setFriends(friendsList);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [currentUser]);

  // Split friends into top 3 and others
  const top3 = friends.slice(0, 3);
  const others = friends.slice(3, 50);

  if (loading) {
    return (
      <View style={[styles.root, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        {/* ✅ Fixed Arc Background */}
        <Image
          source={require('../assets/images/leaderboard/Group10783.png')}
          style={styles.fixedBackground}
        />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('../homescreen/HomeScreen')}>
            <Image
              source={require('../assets/images/leaderboard/Arrow left.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leaderboard</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Tabs */}
          <View style={styles.tabWrapper}>
            <View style={styles.segmentBackground}>
              <TouchableOpacity
                style={[
                  styles.segmentTab,
                  activeTab === 'overall' && styles.activeSegment,
                ]}
                onPress={() => router.push("../leaderboard/overallLeaderboard")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === 'overall' && styles.activeText,
                  ]}
                >
                  Overall
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentTab,
                  activeTab === 'friends' && styles.activeSegment,
                ]}
                onPress={() => router.push("../leaderboard/myFriendsLeaderboard")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === 'friends' && styles.activeText,
                  ]}
                >
                  My Friends
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Podium Section */}
          <View style={styles.podiumWrapper}>
            <Image source={require('../assets/images/leaderboard/podium.png')} style={styles.podiumImage} />

            {/* First Place */}
            {top3[0] && (
              <TouchableOpacity
                style={[styles.avatarWrapper, styles.firstPlace]}
                onPress={() =>
                  router.push({
                    pathname: '../leaderboard/playerDetails',
                    params: {
                      id: top3[0].id,
                      name: top3[0].name,
                      email: top3[0].email,
                      points: top3[0].points.toString(),
                      gender: top3[0].gender,
                      overallrank: top3[0].overallrank,
                    },
                  })
                }
              >
                {top3[0].avatarUrl ? (
                  <Image source={{ uri: top3[0].avatarUrl }} style={styles.avatar} />
                ) : (
                  <Image source={require('../assets/images/leaderboard/ramsey.png')} style={styles.avatar} />
                )}
                <Text style={styles.userName}>{top3[0].name}</Text>
                <Text style={styles.userPoints}>{top3[0].points.toLocaleString()}</Text>
              </TouchableOpacity>
            )}

            {/* Second Place */}
            {top3[1] && (
              <TouchableOpacity
                style={[styles.avatarWrapper, styles.secondPlace]}
                onPress={() =>
                  router.push({
                    pathname: '../leaderboard/playerDetails',
                    params: {
                      id: top3[1].id,
                      name: top3[1].name,
                      email: top3[1].email,
                      points: top3[1].points.toString(),
                      gender: top3[1].gender,
                      overallrank: top3[1].overallrank,
                    },
                  })
                }
              >
                {top3[1].avatarUrl ? (
                  <Image source={{ uri: top3[1].avatarUrl }} style={styles.avatar} />
                ) : (
                  <Image source={require('../assets/images/leaderboard/mary.png')} style={styles.avatar} />
                )}
                <Text style={styles.userName}>{top3[1].name}</Text>
                <Text style={styles.userPoints}>{top3[1].points.toLocaleString()}</Text>
              </TouchableOpacity>
            )}

            {/* Third Place */}
            {top3[2] && (
              <TouchableOpacity
                style={[styles.avatarWrapper, styles.thirdPlace]}
                onPress={() =>
                  router.push({
                    pathname: '../leaderboard/playerDetails',
                    params: {
                      id: top3[2].id,
                      name: top3[2].name,
                      email: top3[2].email,
                      points: top3[2].points.toString(),
                      gender: top3[2].gender,
                      overallrank: top3[2].overallrank,
                    },
                  })
                }
              >
                {top3[2].avatarUrl ? (
                  <Image source={{ uri: top3[2].avatarUrl }} style={styles.avatar} />
                ) : (
                  <Image source={require('../assets/images/leaderboard/kyla.png')} style={styles.avatar} />
                )}
                <Text style={styles.userName}>{top3[2].name}</Text>
                <Text style={styles.userPoints}>{top3[2].points.toLocaleString()}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Player List Container */}
          <View style={styles.listContainer}>
            {others.map((user, index) => (
              <TouchableOpacity
                key={user.id}
                style={styles.playerCard}
                onPress={() =>
                  router.push({
                    pathname: '../leaderboard/playerDetails',
                    params: {
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      points: user.points.toString(),
                      gender: user.gender,
                      overallrank: user.overallrank,
                    },
                  })
                }
              >
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>{index + 4}</Text>
                </View>
                {user.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.playerAvatar} />
                ) : (
                  <Image source={require('../assets/images/leaderboard/jacob.png')} style={styles.playerAvatar} />
                )}
                <View>
                  <Text style={styles.playerName}>{user.name}</Text>
                  <Text style={styles.playerPointsText}>{user.points.toLocaleString()} points</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export const options = {
  tabBarStyle: { display: 'none' },
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#7B4EF6',
  },
  safeArea: {
    flex: 1,
  },
  fixedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // this makes it stretch to the bottom
    width: '100%',
    height: '100%', // fills the whole screen
    resizeMode: 'cover',
    zIndex: -1,
  },  
  scrollContent: {
    paddingBottom: 0,
    position: 'relative',
  },
  tabWrapper: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  segmentBackground: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 999,
    padding: 4,
  },
  segmentTab: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 999,
  },
  activeSegment: {
    backgroundColor: '#AE9FFF',
  },
  segmentText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  activeText: {
    color: '#fff',
  },
  podiumWrapper: {
    width: '100%',
    height: 340,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    marginBottom: -35,
  },
  podiumImage: {
    width: '100%',
    height: 190,
    resizeMode: 'contain',
  },
  avatarWrapper: {
    position: 'absolute',
    alignItems: 'center',
    paddingBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  firstPlace: {
    top: 10,
    left: '50%',
    transform: [{ translateX: -40 }],
    zIndex: 10,
  },
  secondPlace: {
    top: 60,
    left: '13%',
    zIndex: 5,
  },
  thirdPlace: {
    top: 70,
    right: '13%',
    zIndex: 5,
  },
  userName: {
    marginTop: 2,
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 14,
  },
  userPoints: {
    marginTop: 4,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#A98FF9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    fontSize: 13,
  },
  listContainer: {
    backgroundColor: '#F3F6FF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 24,
    flex: 1,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 28,
    marginBottom: 16,
  },
  rankCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#AAA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  playerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  playerPointsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  header: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 19,
    borderBottomRightRadius: 19,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  backArrow: {
    fontSize: 24,
    color: '#5E3EE6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44349B',
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#5E3EE6', // optional: tint if the image is monochrome
  },  
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});