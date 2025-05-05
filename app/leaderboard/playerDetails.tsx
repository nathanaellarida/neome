import {
    View,
    Text,
    StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
  } from 'react-native';
  import { useLocalSearchParams, router } from 'expo-router';
  import { auth, db, storage } from '../../firebaseConfig';
  import { doc, getDoc } from 'firebase/firestore';
  import { getDownloadURL, ref } from 'firebase/storage';
  import { useState, useEffect } from 'react';
  
  interface PlayerData {
    name: string;
    email: string;
    points: number;
    gender: string;
    overallrank: string;
    avatar?: string;
    avatarUrl?: string;
  }
  
  export default function PlayerDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [playerData, setPlayerData] = useState<PlayerData | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchPlayerData = async () => {
        try {
          setLoading(true);
          const playerDoc = await getDoc(doc(db, 'users', id as string));
          
          if (playerDoc.exists()) {
            const data = playerDoc.data();
            let avatarUrl = '';
            
            // Get avatar URL from storage if it exists
            if (data.avatar) {
              try {
                const imageRef = ref(storage, data.avatar);
                avatarUrl = await getDownloadURL(imageRef);
              } catch (error) {
                console.warn('Error fetching avatar:', error);
              }
            }
  
            setPlayerData({
              name: data.name || 'Unknown',
              email: data.email || '',
              points: data.points || 0,
              gender: data.gender || 'male',
              overallrank: data.overallrank || '0',
              avatar: data.avatar || '',
              avatarUrl,
            });
          }
        } catch (error) {
          console.error('Error fetching player data:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchPlayerData();
    }, [id]);
  
    if (loading || !playerData) {
      return (
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      );
    }
  
    const backgroundImage =
      playerData.gender === 'male'
        ? require('../assets/images/leaderboard/bluebg.png')
        : require('../assets/images/leaderboard/pinkbg.png');
  
    const statsBgColor = playerData.gender === 'male' ? '#6549FE' : '#FFBCDE';
  
    const achievements = [
      {
        title: 'Champion of Wellness in 45-Minute Cardio',
        date: 'November 5, 2024',
        points: '85/100',
        icon: require('../assets/images/leaderboard/achievement-icon.png'),
      },
      {
        title: 'Wellness Guardian in Guided Meditation',
        date: 'October 26, 2024',
        points: '75/75',
        icon: require('../assets/images/leaderboard/achievement-icon.png'),
      },
      {
        title: 'All-Star Award in Full Body Workout',
        date: 'October 20, 2024',
        points: '75/150',
        icon: require('../assets/images/leaderboard/achievement-icon.png'),
      },
      {
        title: 'Healthy Living in Yoga',
        date: 'September 30, 2024',
        points: '50/50',
        icon: require('../assets/images/leaderboard/achievement-icon.png'),
      },
      {
        title: 'Earned 1st Place in Leaderboard (Friends)',
        date: 'August 30, 2024',
        points: '200',
        icon: require('../assets/images/leaderboard/achievement-icon.png'),
      },
      {
        title: 'Earned 2nd Place in Leaderboard (Friends)',
        date: 'June 30, 2024',
        points: '150',
        icon: require('../assets/images/leaderboard/achievement-icon.png'),
      },
    ];
  
    return (
      <View style={{ flex: 1 }}>
        <ImageBackground source={backgroundImage} style={styles.bg}>
         
  
          <ScrollView contentContainerStyle={styles.scrollContent}>
             {/* Floating Controls */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Image
              source={require('../assets/images/leaderboard/Arrow left.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
  
          <Image
            source={require('../assets/images/leaderboard/levelBadge.png')}
            style={styles.levelBadge}
          />
            {/* Avatar + Card */}
            <View style={styles.cardWrapper}>
              <View style={styles.avatarWrapper}>
                {playerData.avatarUrl ? (
                  <Image source={{ uri: playerData.avatarUrl }} style={styles.avatar} />
                ) : (
                  <Image source={require('../assets/images/leaderboard/ramsey.png')} style={styles.avatar} />
                )}
              </View>
  
              <View style={styles.profileCard}>
                {/* 🎁 Reward icons */}
                <View style={styles.rewardIconsContainer}>
                  <Image
                    source={require('../assets/images/leaderboard/reward-left.png')}
                    style={styles.rewardIcon}
                  />
                  <Image
                    source={require('../assets/images/leaderboard/reward-right.png')}
                    style={styles.rewardIcon}
                  />
                </View>
  
                <Text style={styles.name}>{playerData.name}</Text>
  
                <View
                  style={[styles.statsContainer, { backgroundColor: statsBgColor }]}
                >
                  <View style={styles.statBox}>
                    <Image
                      source={require('../assets/images/leaderboard/star-icon.png')}
                      style={styles.statIcon}
                    />
                    <Text style={styles.statLabel}>POINTS</Text>
                    <Text style={styles.statValue}>
                      {playerData.points.toLocaleString()}
                    </Text>
                  </View>
  
                  <View style={styles.verticalDivider} />
  
                  <View style={styles.statBox}>
                    <Image
                      source={require('../assets/images/leaderboard/globe-icon.png')}
                      style={styles.statIcon}
                    />
                    <Text style={styles.statLabel}>OVERALL RANK</Text>
                    <Text style={styles.statValue}>#{playerData.overallrank}</Text>
                  </View>
  
                  <View style={styles.verticalDivider} />
  
                  <View style={styles.statBox}>
                    <Image
                      source={require('../assets/images/leaderboard/friend-icon.png')}
                      style={styles.statIcon}
                    />
                    <Text style={styles.statLabel}>FRIEND RANK</Text>
                    <Text style={styles.statValue}>#1</Text>
                  </View>
                </View>
              </View>
            </View>
  
            {/* Achievements */}
            <View style={styles.achievementSection}>
              {achievements.map((item, index) => {
                const [earned, total] =
                  item.points.includes('/')
                    ? item.points.split('/').map(Number)
                    : [Number(item.points), Number(item.points)];
                const progress = (earned / total) * 100;
  
                return (
                  <View key={index} style={styles.achievementRow}>
                    <Image
                      source={item.icon}
                      style={styles.achievementIcon}
                      resizeMode="contain"
                    />
  
                    <View style={styles.achievementContent}>
                      <Text style={styles.achievementTitle}>{item.title}</Text>
                      <Text style={styles.achievementMeta}>
                        {item.date} • {item.points} points
                      </Text>
  
                      <View style={styles.progressBarBackground}>
                        <View
                          style={[styles.progressBarFill, { width: `${progress}%` }]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#7B4EF6',
    },
    bg: {
      flex: 1,
      resizeMode: 'cover',
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 130,
      paddingBottom: 0,
    },
    backButton: {
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 100,
      padding: 10,
    },
    backIcon: {
      width: 24,
      height: 24,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    levelBadge: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 45,
      height: 45,
      resizeMode: 'contain',
      zIndex: 100,
    },
    cardWrapper: {
      alignItems: 'center',
      position: 'relative',
      marginBottom: -1,
    },
    avatarWrapper: {
      position: 'absolute',
      top: -50,
      zIndex: 10,
      backgroundColor: '#fff',
      borderRadius: 60,
      padding: 4,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    profileCard: {
      backgroundColor: '#F3F6FF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      alignItems: 'center',
      width: '100%',
      position: 'relative',
    },
    rewardIconsContainer: {
      position: 'absolute',
      top: 20,
      left: 0,
      right: 0,
      zIndex: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 30,
    },
    rewardIcon: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#4B3E8B',
      marginBottom: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 20,
      borderRadius: 16,
      paddingHorizontal: 10,
      width: '100%',
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statIcon: {
      width: 22,
      height: 22,
      tintColor: '#fff',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: '#fff',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
    verticalDivider: {
      width: 1,
      height: '60%',
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    achievementSection: {
      backgroundColor: '#F3F6FF',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      paddingTop: 30,
      paddingHorizontal: 20,
      paddingBottom: 40,
      flexGrow: 1,
      flex: 1,
    },
    achievementRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    achievementIcon: {
      width: 40,
      height: 40,
      marginRight: 12,
      marginTop: 2,
    },
    achievementContent: {
      flex: 1,
    },
    achievementTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#333',
    },
    achievementMeta: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
      marginBottom: 10,
    },
    progressBarBackground: {
      height: 6,
      backgroundColor: '#ddd',
      borderRadius: 3,
    },
    progressBarFill: {
      height: 6,
      backgroundColor: '#FFD700',
      borderRadius: 3,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#7B4EF6',
    },
  });
  