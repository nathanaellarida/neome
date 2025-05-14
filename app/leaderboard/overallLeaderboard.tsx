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
import { db } from '../../firebaseConfig';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Type definition for user data
type UserData = {
  id: string;
  name: string;
  email: string;
  points: number;
  avatar?: any; // Will be a URI or require() depending on data source
  gender: string;
  overallrank: string;
};

// Default avatar images by gender
const defaultAvatars = {
  male: require('../assets/images/leaderboard/jacob.png'),
  female: require('../assets/images/leaderboard/hannah.png'),
  default: require('../assets/images/leaderboard/jacob.png'),
};

export default function LeaderboardScreen() {
  const [loading, setLoading] = useState(true);
  const [top3Users, setTop3Users] = useState<UserData[]>([]);
  const [otherUsers, setOtherUsers] = useState<UserData[]>([]);
  const [activeTopTab, setActiveTopTab] = useState('Leaderboard');
  const [activeTab, setActiveTab] = useState<'overall' | 'friends'>('overall');

  // Function to fetch user data from Firebase
  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Create a query against the users collection, ordered by points (descending)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('points', 'desc'), limit(50));
      
      // Execute the query
      const querySnapshot = await getDocs(q);
      
      // Process the results into our format
      const fetchedUsers: UserData[] = [];
      
      let index = 0;
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        
        fetchedUsers.push({
          id: doc.id,
          name: userData.name || 'Anonymous',
          email: userData.email || '',
          points: userData.points || 0,
          gender: userData.gender || 'default',
          // Use the rank based on the index in the results
          overallrank: (index + 1).toString(),
          // Avatar will be set later
        });
        index++;
      });
      
      // Split into top3 and others
      const top3 = fetchedUsers.slice(0, 3).map((user, index) => ({
        ...user,
        overallrank: (index + 1).toString(),
        // For now, use default avatars based on gender
        avatar: defaultAvatars[user.gender as keyof typeof defaultAvatars] || defaultAvatars.default
      }));
      
      const others = fetchedUsers.slice(3).map((user, index) => ({
        ...user,
        overallrank: (index + 4).toString(),
        // For now, use default avatars based on gender
        avatar: defaultAvatars[user.gender as keyof typeof defaultAvatars] || defaultAvatars.default
      }));
      
      setTop3Users(top3);
      setOtherUsers(others);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchLeaderboardData();
  }, []);

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
          <TouchableOpacity style={styles.refreshButton} onPress={fetchLeaderboardData}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6371F7" />
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : (
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

              {/* First Place - Check if data exists */}
              {top3Users.length > 0 && (
                <TouchableOpacity
                  style={[styles.avatarWrapper, styles.firstPlace]}
                  onPress={() =>
                    router.push({
                      pathname: '../leaderboard/playerDetails',
                      params: {
                        id: top3Users[0].id,
                        name: top3Users[0].name,
                        email: top3Users[0].email,
                        points: top3Users[0].points.toString(),
                        gender: top3Users[0].gender,
                        overallrank: top3Users[0].overallrank,
                      },
                    })
                  }
                >
                  <Image source={top3Users[0].avatar} style={styles.avatar} />
                  <Text style={styles.userName}>{top3Users[0].name}</Text>
                  <Text style={styles.userPoints}>{top3Users[0].points.toLocaleString()}</Text>
                </TouchableOpacity>
              )}

              {/* Second Place - Check if data exists */}
              {top3Users.length > 1 && (
                <TouchableOpacity
                  style={[styles.avatarWrapper, styles.secondPlace]}
                  onPress={() =>
                    router.push({
                      pathname: '../leaderboard/playerDetails',
                      params: {
                        id: top3Users[1].id,
                        name: top3Users[1].name,
                        email: top3Users[1].email,
                        points: top3Users[1].points.toString(),
                        gender: top3Users[1].gender,
                        overallrank: top3Users[1].overallrank,
                      },
                    })
                  }
                >
                  <Image source={top3Users[1].avatar} style={styles.avatar} />
                  <Text style={styles.userName}>{top3Users[1].name}</Text>
                  <Text style={styles.userPoints}>{top3Users[1].points.toLocaleString()}</Text>
                </TouchableOpacity>
              )}

              {/* Third Place - Check if data exists */}
              {top3Users.length > 2 && (
                <TouchableOpacity
                  style={[styles.avatarWrapper, styles.thirdPlace]}
                  onPress={() =>
                    router.push({
                      pathname: '../leaderboard/playerDetails',
                      params: {
                        id: top3Users[2].id,
                        name: top3Users[2].name,
                        email: top3Users[2].email,
                        points: top3Users[2].points.toString(),
                        gender: top3Users[2].gender,
                        overallrank: top3Users[2].overallrank,
                      },
                    })
                  }
                >
                  <Image source={top3Users[2].avatar} style={styles.avatar} />
                  <Text style={styles.userName}>{top3Users[2].name}</Text>
                  <Text style={styles.userPoints}>{top3Users[2].points.toLocaleString()}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Player List Container */}
            <View style={styles.listContainer}>
              {otherUsers.length > 0 ? (
                otherUsers.map((user, index) => (
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
                    <Image source={user.avatar} style={styles.playerAvatar} />
                    <View>
                      <Text style={styles.playerName}>{user.name}</Text>
                      <Text style={styles.playerPointsText}>{user.points.toLocaleString()} points</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noPlayersContainer}>
                  <Text style={styles.noPlayersText}>No other players available</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
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
    minHeight: 300, // Ensure it has some height even when empty
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
    justifyContent: 'space-between',
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
    flex: 1,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#5E3EE6', // optional: tint if the image is monochrome
  },
  refreshButton: {
    backgroundColor: '#6371F7',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  refreshText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    margin: 20,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6371F7',
    fontWeight: '600',
  },
  noPlayersContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noPlayersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
  },
  // Keep existing styles
  topTabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 5,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },  
  topTab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
  },  
  activeTopTab: {
    backgroundColor: '#6549FE',
  },  
  topTabText: {
    fontSize: 14,
    color: '#6549FE',
    fontWeight: '600',
  },  
  activeTopTabText: {
    color: '#fff',
  },
});