import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
// Make sure to import from expo-svg if using Expo
//import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { auth, db, storage } from '../../firebaseConfig';
import { doc, updateDoc, serverTimestamp, getDoc, collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { Audio } from 'expo-av';

export default function HomeScreen() {
  const today = new Date();
  const currentDay = today.toLocaleDateString('en-US', { weekday: 'short' });
  const currentMonthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const [userName, setUserName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [avatarModel, setAvatarModel] = useState('femaleBody6.glb'); // Default
  const soundRef = useRef<Audio.Sound | null>(null);
  const [socialsUnreadCount, setSocialsUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [userPoints, setUserPoints] = useState('0');
  const [waterIntake, setWaterIntake] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Progress Circle Config
  const size = 150;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressPercent = 70; // 70% complete
  const progressValue = circumference - (circumference * progressPercent) / 100;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name || 'User');

          // Get profile image URL from Storage
          if (userData.avatar) {
            try {
              const imageRef = ref(storage, userData.avatar);
              const url = await getDownloadURL(imageRef);
              setProfileImageUrl(url);
            } catch (error) {
              console.warn('Error fetching profile image:', error);
            }
          }
          if (userData.height) setHeight(String(userData.height));
          if (userData.weight) setWeight(String(userData.weight));
          if (userData.points !== undefined) setUserPoints(String(userData.points));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Calculate BMI and set avatar model
  useEffect(() => {
    if (!height || !weight) return;
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    const bmi = weightInKg / (heightInMeters * heightInMeters);

    let newAvatar = '';
    if (bmi < 16) newAvatar = 'femaleBody1.glb';
    else if (bmi < 17) newAvatar = 'femaleBody2.glb';
    else if (bmi < 18.5) newAvatar = 'femaleBody3.glb';
    else if (bmi < 20) newAvatar = 'femaleBody4.glb';
    else if (bmi < 22) newAvatar = 'femaleBody5.glb';
    else if (bmi < 24) newAvatar = 'femaleBody6.glb';
    else if (bmi < 28) newAvatar = 'femaleBody7.glb';
    else if (bmi < 30) newAvatar = 'femaleBody8.glb';
    else if (bmi < 32) newAvatar = 'femaleBody9.glb';
    else if (bmi <= 35) newAvatar = 'femaleBody10.glb';
    else newAvatar = 'femaleBody11.glb';

    setAvatarModel(newAvatar);
  }, [height, weight]);

  // Update lastActive timestamp
  useEffect(() => {
    const updateLastActive = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          lastActive: serverTimestamp()
        });
      } catch (error) {
        console.warn('Failed to update lastActive:', error);
      }
    };

    // Update on mount
    updateLastActive();

    // Set up interval to update every minute
    const intervalId = setInterval(updateLastActive, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

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

  // Replace the existing useEffect for notifications with this corrected version
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    let unreadChats = 0;
    let unreadInvites = 0;

    // Listen for unread chats
    const chatsRef = collection(db, 'chats');
    const chatsQuery = query(chatsRef, where('users', 'array-contains', user.uid));
    
    const unsubscribeChats = onSnapshot(chatsQuery, (chatSnapshots) => {
      unreadChats = 0;
      chatSnapshots.forEach(docSnap => {
        const data = docSnap.data();
        if (data.unreadCounts && data.unreadCounts[user.uid] > 0) {
          unreadChats += 1;
        }
      });
      // Update total count
      setSocialsUnreadCount(unreadChats + unreadInvites);
    });

    // Listen for unread challenge invitations
    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    const invitesQuery = query(notificationsRef, 
      where('type', '==', 'challenge_invitation'), 
      where('read', '==', false)
    );

    const unsubscribeInvites = onSnapshot(invitesQuery, (invitesSnap) => {
      unreadInvites = invitesSnap.size;
      // Update total count
      setSocialsUnreadCount(unreadChats + unreadInvites);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeChats();
      unsubscribeInvites();
    };
  }, []);

  // Add this useEffect after the other useEffects
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Query for chats with unread messages
    const chatsRef = collection(db, 'chats');
    const chatsQuery = query(chatsRef, where('users', 'array-contains', user.uid));
    
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      let totalUnread = 0;
      snapshot.forEach(doc => {
        const chatData = doc.data();
        if (chatData.unreadCounts && chatData.unreadCounts[user.uid]) {
          totalUnread += chatData.unreadCounts[user.uid];
        }
      });
      setUnreadMessagesCount(totalUnread);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTodayWaterIntake = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const historyRef = collection(db, 'users', user.uid, 'waterIntakeHistory');
        const querySnapshot = await getDocs(historyRef);
        let total = 0;
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.amount && data.time && data.time.toDate) {
            const entryDate = data.time.toDate();
            if (
              entryDate.getDate() === today.getDate() &&
              entryDate.getMonth() === today.getMonth() &&
              entryDate.getFullYear() === today.getFullYear()
            ) {
              total += Number(data.amount);
            }
          }
        });
        setWaterIntake(total);
      } catch (err) {
        console.error('Failed to fetch today\'s water intake:', err);
      }
    };
    fetchTodayWaterIntake();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const foodLogsRef = collection(db, 'users', user.uid, 'foodLogs');
    const unsubscribe = onSnapshot(foodLogsRef, (querySnapshot) => {
      let total = 0;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.calories && data.createdAt && data.createdAt.toDate) {
          const entryDate = data.createdAt.toDate();
          if (
            entryDate.getDate() === today.getDate() &&
            entryDate.getMonth() === today.getMonth() &&
            entryDate.getFullYear() === today.getFullYear()
          ) {
            total += Number(data.calories);
          }
        }
      });
      setTodayCalories(total);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {/* White Header Container */}
      <View style={styles.headerContainer}>
          {/* Profile Image and Text */}
          <View style={styles.profileSection}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            ) : (
              <Image source={require('../assets/images/pfp.png')} style={styles.profileImage} />
            )}
            <View style={styles.textContainer}>
              <Text style={styles.greeting}>Hello!</Text>
              <Text style={styles.username}>{userName}</Text>
            </View>
          </View>

          {/* Icons */}
          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={async () => {
                await playTapSound();
                router.push("/settings/notification");
              }}
            >
              <View style={{ position: 'relative' }}>
                <Ionicons name="notifications-outline" size={23} color="#6549FE" />
                {socialsUnreadCount > 0 && (
                  <View style={{
                    backgroundColor: '#FF3B30',
                    borderRadius: 12,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: -8,
                    right: -6,
                    zIndex: 1,
                    paddingHorizontal: 3,
                  }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>
                      {socialsUnreadCount > 99 ? '99+' : socialsUnreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await playTapSound();
                router.push("/settings/settingDashboard");
              }}
            >
              <Ionicons name="menu-outline" size={28} color="#6549FE" />
            </TouchableOpacity>
          </View>
        </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* Date Selector (Static) */}
        <View style={styles.dateContainer}>
          <Text style={styles.monthText}>{currentMonthYear}</Text>
          <View style={styles.weekContainer}>
            {days.map((day) => (
              <View
                key={day}
                style={[
                  styles.dayButton,
                  day === currentDay ? styles.selectedDay : {},
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    day === currentDay ? styles.selectedDayText : {},
                  ]}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Your Avatar Section */}
        <Text style={styles.sectionTitle}>Your Avatar</Text>
        <View style={styles.mainContainer}>
          {/* Left: Stats */}
          <View style={styles.statsContainer}>
            {[
              { value: userPoints, label: 'Points', image: require('../assets/images/points.png') },
              { value: todayCalories.toString(), label: 'Calories', image: require('../assets/images/poultryLeg.png') },
              { value: waterIntake.toString(), label: 'Water Intake', image: require('../assets/images/droplet.png') },
              { value: '0', label: 'Badges', image: require('../assets/images/badges.png') },
              { value: '0', label: 'Steps', image: require('../assets/images/steps.png') },
            ].map((item, index) => (
              <View key={index} style={styles.statBox}>
                <Image
                  source={item.image}
                  style={[
                    styles.statIcon,
                    item.label === 'Calories' && { width: 36, height: 36, marginLeft: -8, marginTop: 4 }
                  ]}
                />
                <View
                  style={[
                    styles.textWrapper,
                    item.label === 'Calories' && { marginLeft: -5, marginTop: 4 }
                  ]}
                >
                  <Text style={styles.statNumber}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              </View>
            ))}
          </View>

  {/* Right: Avatar 3D WebView */}
  <WebView
    originWhitelist={['https://*']}
    javaScriptEnabled
    domStorageEnabled
    allowsFullscreenVideo
    mediaPlaybackRequiresUserAction={false}
    source={{
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
            <script type="module" src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js"></script>
            <script type="module" src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/GLTFLoader.js"></script>
            <style>
              html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #fff; }
              model-viewer { width: 100%; height: 100%; }
              .text-content { display: none; } /* Hide any text content */
            </style>
          </head>
          <body>
            <model-viewer 
              id="avatar"
              src="https://raw.githubusercontent.com/VIRGINIAMW123/female-avatar-models/main/${avatarModel}"
              alt="3D Avatar"
              camera-controls
              autoplay
              environment-image="neutral"
              shadow-intensity="1"
              exposure="1"
              camera-orbit="0deg 80deg 1m">
            </model-viewer>

            <script type="module">
              import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
              import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

              const modelViewer = document.querySelector('#avatar');
              let mixer, clock;

              modelViewer.addEventListener('load', async () => {
                const modelUrl = modelViewer.getAttribute('src');
                const loader = new GLTFLoader();
                
                loader.load(modelUrl, (gltf) => {
                  const scene = gltf.scene;
                  const animations = gltf.animations;
                  
                  if (animations && animations.length > 0) {
                    const canvas = document.createElement('canvas');
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    canvas.style.position = 'absolute';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.pointerEvents = 'none';
                    document.body.appendChild(canvas);
                    
                    const renderer = new THREE.WebGLRenderer({ 
                      canvas, 
                      alpha: true,
                      antialias: true
                    });
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    
                    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
                    camera.position.z = 2;

                    const threeScene = new THREE.Scene();
                    threeScene.add(scene);

                    mixer = new THREE.AnimationMixer(scene);
                    let targetClip = animations.find(clip => clip.name === targetAnimation);
                    if (!targetClip && animations.length > 0) {
                      targetClip = animations[0];
                    }

                    if (targetClip) {
                      const action = mixer.clipAction(targetClip);
                      action.play();
                    }

                    clock = new THREE.Clock();

                    function animate() {
                      requestAnimationFrame(animate);
                      if (mixer) {
                        const delta = clock.getDelta();
                        mixer.update(delta);
                      }
                      renderer.render(threeScene, camera);
                    }

                    animate();

                    window.addEventListener('resize', () => {
                      camera.aspect = window.innerWidth / window.innerHeight;
                      camera.updateProjectionMatrix();
                      renderer.setSize(window.innerWidth, window.innerHeight);
                    });
                  }
                });
              });
            </script>
          </body>
        </html>
      `,
    }}
    style={styles.avatarPlaceholder}
  />
</View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesContainer}>
            {[
              { title: 'Physical\nActivities', image: require('../assets/images/physicalacts.png'), screen: '/physical_activities/workoutPlans' },
              { title: 'Mental\nActivities', image: require('../assets/images/mentalacts.png'), screen: '/mental_activities/MentalActivities' },
              { title: 'Social\nActivities', image: require('../assets/images/socialacts.png'), screen: '/Challenges/ChallengeDashboard' },
              { title: 'Emotional\nActivities', image: require('../assets/images/emotionalacts.png'), screen: '/emotional_activities/EmotionalActivities' },
            ].map((category, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.categoryButton} 
                onPress={async() => {
                  await playTapSound();
                  router.push(category.screen as any);
                }}>
                <Image source={category.image} style={styles.categoryImage} />
                <View style={styles.categoryTextContainer}>
                  <Text style={styles.categoryText}>{category.title}</Text>
                  <Text style={styles.categorySubtext}>20 Activities</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

        {/* MY PROGRESS */}
        <Text style={[styles.sectionTitle, { paddingTop: -20  }]}>My Wellness Progress</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 5, paddingBottom: 30 }}
        >
          {[
            {
              label: 'Completed Challenges',
              percent: 80,
              color: '#6549FE',
              subtitle: '4 of 5 done today',
            },
            {
              label: 'Mood Stability',
              percent: 65,
              color: '#FD6FFF',
              subtitle: 'Based on journal entries',
            },
            {
              label: 'Journal Entries',
              percent: 50,
              color: '#6DED7C',
              subtitle: '1 of 2 entries completed',
            },
            {
              label: 'To-Do Tasks',
              percent: 75,
              color: '#FF8B8D',
              subtitle: '3 of 4 tasks done',
            },
            {
              label: 'Sleep Quality',
              percent: 85,
              color: '#D078FF',
              subtitle: '6.8 of 8 hrs sleep',
            },
          ].map((item, index) => {
            const radius = 35;
            const strokeWidth = 6;
            const center = 40;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (circumference * item.percent) / 100;

            return (
              <View
                key={index}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 16,
                  width: 160,
                  marginRight: 15,
                  alignItems: 'center',
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                }}
              >
                <Svg width={80} height={80}>
                  <Circle
                    stroke="#eee"
                    fill="none"
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                  />
                  <Circle
                    stroke={item.color}
                    fill="none"
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${center}, ${center}`}
                  />
                  <SvgText
                    x={center}
                    y={center + 6}
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="bold"
                    fill={item.color}
                  >
                    {item.percent}%
                  </SvgText>
                </Svg>

                <Text style={{ fontWeight: '600', fontSize: 14, color: '#333', textAlign: 'center', marginTop: 10 }}>
                  {item.label}
                </Text>
                <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 }}>
                  {item.subtitle}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Track Food Calorie Section */}
        <View style={styles.trackFoodCard}>
          <Image source={require('../assets/images/TrackFood.png')} style={styles.trackFoodImage} />
          <View style={styles.trackFoodContent}>
            <Text style={styles.trackFoodTitle}>Stay on Track, Stay Energized!</Text>
            <Text style={styles.trackFoodMain}>Track Food</Text>
            <Text style={styles.trackFoodGoal}>Goal: 2,000 Calories Today!</Text>
            <TouchableOpacity
              style={styles.trackFoodButton}              onPress={async () => {
                await playTapSound();
                // TODO: Replace with your food tracking screen route
                router.push('./foodTracking');
              }}
            >
              <Text style={styles.trackFoodButtonText}>Log Meal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Drink a Water Section */}
        <View style={styles.drinkWaterCard}>
          <Image source={require('../assets/images/drinkWaterSection.png')} style={styles.drinkWaterImage} />
          <View style={styles.drinkWaterContent}>
            <Text style={styles.drinkWaterTitle}>Stay Hydrated, Stay Healthy!</Text>
            <Text style={styles.drinkWaterMain}>Drink a Water</Text>
            <Text style={styles.drinkWaterGoal}>Goal: 3 Liters Today! Tap to Track</Text>
            <TouchableOpacity
              style={styles.drinkWaterButton}              onPress={async () => {
                await playTapSound();
                router.push('./waterIntake');
              }}
            >
              <Text style={styles.drinkWaterButtonText}>Drink</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Steps Counter Section */}
        <View style={styles.stepsCounterCard}>
          <Image source={require('../assets/images/stepsCounter.png')} style={styles.stepsCounterImage} />
          <View style={styles.stepsCounterContent}>
            <Text style={styles.stepsCounterTitle}>Keep Moving, Stay Motivated!</Text>
            <Text style={styles.stepsCounterMain}>Steps Counter</Text>
            <Text style={styles.stepsCounterGoal}>Goal: 10,000 Steps Today!</Text>
            <TouchableOpacity
              style={styles.stepsCounterButton}              onPress={async () => {
                await playTapSound();
                router.push('./stepsCounterHome');
              }}
            >
              <Text style={styles.stepsCounterButtonText}>Track Steps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Challenge Yourself Section */}
        <View style={styles.challengeContainer}>
        <Image source={require('../assets/images/challengeYourSelf.png')} style={styles.challengeImage} />
          <Text style={styles.challengeTitle}>Challenge Yourself</Text>
          <Text style={styles.challengeMainText}>Let's Play{'\n'}Together</Text>

          {/* Buttons */}
          <View style={styles.challengeButtonContainer}>
            <TouchableOpacity style={styles.challengeButton}>
              <Text style={styles.challengeButtonText}>With friends</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.challengeButton}>
              <Text style={styles.challengeButtonText}>With others</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Second New Container (Copied and Modified) */}
        <View style={styles.challengeContainer}>
        <Image source={require('../assets/images/challengeYourFriend.png')} style={styles.challengeImage} />
          <Text style={styles.challengeTitle}>Challenge Your Friends</Text>
          <Text style={styles.challengeMainText}>
           Leaderboard {'\n \n'}
          </Text>

          {/* Single Button */}
          <View style={styles.viewButtonContainer}>
            <TouchableOpacity style={styles.viewButton} onPress={async() => {
              await playTapSound();
              router.push('../leaderboard/overallLeaderboard');
              }}>
              <Text style={styles.challengeButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>



        {/*IN PROGRESS CONTAINERS*/}
        <Text style={styles.sectionTitle}>In Progress</Text>

        {/*IN PROGRESS CONTAINERS 1*/}
        <View style={styles.InProgressContainer}>
        <Image source={require('../assets/images/fullBody.png')} style={styles.InProgressImage} />
          <Text style={styles.challengeTitle}>7X4 Challenge</Text>
          <Text style={styles.challengeMainText}>
           Full Body{'\n'}Workout
          </Text>

          {/* Single Button */}
          <View style={styles.continueButtonContainer}>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.challengeButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*IN PROGRESS CONTAINERS 2*/}
        {/* IN PROGRESS CONTAINER - Stretching Workout */}
        <View style={styles.InProgressContainer}>
          <Image source={require('../assets/images/stretching.png')} style={styles.InProgressImage} />

          <Text style={styles.challengeTitle}>7X4 Challenge</Text>
          <Text style={styles.challengeMainText}>
            Stretching{'\n'}Workout
          </Text>

          {/* Single Button */}
          <View style={styles.continueButtonContainer}>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.challengeButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* IN PROGRESS CONTAINER - Walk 10,000 Steps */}
        <View style={styles.InProgressContainer}>
          <Image source={require('../assets/images/walkSteps.png')} style={styles.InProgressImage} />

          <Text style={styles.challengeTitle}>To-Do List</Text>
          <Text style={styles.challengeMainText}>
            Walk 10,000{'\n'}Steps
          </Text>
          <Text style={styles.toDoListSubTitle}>November 4, 2024</Text>

          {/* Single Button */}
          <View style={styles.continueButtonContainer}>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.challengeButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* IN PROGRESS CONTAINER - Drink 2 Liters of Water */}
        <View style={styles.InProgressContainer}>
          <Image source={require('../assets/images/drinkWater.png')} style={styles.InProgressImage} />

          <Text style={styles.challengeTitle}>To-Do List</Text>
          <Text style={styles.challengeMainText}>
            Drink 2 liters{'\n'}of Water
          </Text>
          <Text style={styles.toDoListSubTitle}>November 3, 2024</Text>

          {/* Single Button */}
          <View style={styles.continueButtonContainer}>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.challengeButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/*CHALLENGE*/}
        <Text style={styles.sectionTitle}>Challenge</Text>
        
        {/* CHALLENGE 1 - Read a Book */}
        <View style={styles.challengeTaskContainer}>
          {/* Circle Container for Icon/Image */}
          <View style={styles.challengeIconContainer}>
            <Image source={require('../assets/images/challengeIcon1.png')} style={styles.challengeIcon} />
          </View>

          {/* Text Container */}
          <View style={styles.textContainer}>
            <Text style={styles.challengeIconTitle}>Read a book</Text>
            <Text style={styles.challengeSubText}>4 days per week</Text>
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.challengeNextButton}>
            <Ionicons name="chevron-forward-outline" size={22} color="#6549FE" />
          </TouchableOpacity>
        </View>

        {/* CHALLENGE 2 - Study */}
        <View style={styles.challengeTaskContainer}>
          {/* Circle Container for Icon/Image */}
          <View style={styles.challengeIconContainer}>
            <Image source={require('../assets/images/challengeIcon2.png')} style={styles.challengeIcon} />
          </View>

          {/* Text Container */}
          <View style={styles.textContainer}>
            <Text style={styles.challengeIconTitle}>Study</Text>
            <Text style={styles.challengeSubText}>4 days per week</Text>
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.challengeNextButton}>
            <Ionicons name="chevron-forward-outline" size={22} color="#6549FE" />
          </TouchableOpacity>
        </View>

        {/* CHALLENGE 3 - Exercise */}
        <View style={styles.challengeTaskContainer}>
          {/* Circle Container for Icon/Image */}
          <View style={styles.challengeIconContainer}>
            <Image source={require('../assets/images/challengeIcon3.png')} style={styles.challengeIcon} />
          </View>

          {/* Text Container */}
          <View style={styles.textContainer}>
            <Text style={styles.challengeIconTitle}>Exercise</Text>
            <Text style={styles.challengeSubText}>4 days per week</Text>
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.challengeNextButton}>
            <Ionicons name="chevron-forward-outline" size={22} color="#6549FE" />
          </TouchableOpacity>
        </View>

        {/* CHALLENGE 4 - Gardening */}
        <View style={styles.challengeTaskContainer}>
          {/* Circle Container for Icon/Image */}
          <View style={styles.challengeIconContainer}>
            <Image source={require('../assets/images/challengeIcon4.png')} style={styles.challengeIcon} />
          </View>

          {/* Text Container */}
          <View style={styles.textContainer}>
            <Text style={styles.challengeIconTitle}>Gardening</Text>
            <Text style={styles.challengeSubText}>4 days per week</Text>
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.challengeNextButton}>
            <Ionicons name="chevron-forward-outline" size={22} color="#6549FE" />
          </TouchableOpacity>
        </View>

        </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="home-outline" size={25} color="#6549FE" />
        </TouchableOpacity>

        {/* Increased spacing for Statistics */}
        <TouchableOpacity
          style={[styles.navButton, { marginRight: 30 }]}
          onPress={async() => {
            await playTapSound();
          }}
        >
          <Ionicons name="bar-chart-outline" size={25} color="#6549FE" />
        </TouchableOpacity>

        {/* Center Profile Button */}
        <TouchableOpacity style={styles.centerCircle} onPress={async() =>{
          await playTapSound();
          router.push('/avatar_progress/AvatarProgressScreen');
        } }>
          <Ionicons name="person" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Increased spacing for Journal */}
        <TouchableOpacity style={[styles.navButton, { marginLeft: 30 }]}>
          <Ionicons name="book-outline" size={25} color="#6549FE" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={async() =>{
            await playTapSound();
            router.push('/messaging/MessageHome');
          }}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons name="chatbubble-ellipses-outline" size={25} color="#6549FE" />
            {unreadMessagesCount > 0 && (
              <View style={{
                backgroundColor: '#FF3B30',
                borderRadius: 12,
                minWidth: 18,
                height: 18,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                top: -8,
                right: -6,
                zIndex: 1,
                paddingHorizontal: 3,
              }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80, // Add padding for bottom nav
  },
  
  // HEADER
  headerContainer: {
    width: width,
    height: 75,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#D9D9D9',
  },
  textContainer: {
    marginLeft: 15,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  // DATE SELECTOR
  dateContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  monthText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDay: {
    backgroundColor: '#6549FE',
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },

  // BOTTOM NAVIGATION
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

  // YOUR AVATAR CONTAINER STYLES
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  mainContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statsContainer: {
    width: '45%',
  },
  statBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 3,
  },
  statIcon: {
    width: 25,  // Adjust size as needed
    height: 25, // Adjust size as needed
    marginRight: 10, // Adds spacing between the icon and text
    resizeMode: 'contain',
  },
  textWrapper: {
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  avatarPlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  
  avatarImage: {
    width: '200%',  // Keeps the avatar size large
    height: '85%',  // Adjust height to fit well
    resizeMode: 'contain',  // Ensures proportions are maintained
    marginRight: -90, // Moves the image further to the right
    marginBottom: -30,
  },  

  // PROGRESS BAR CONTAINER STYLES
  progressScrollContainer: {
    paddingHorizontal: 10, // Add some padding to the sides
    //paddingBottom: 10,
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 5,
    alignItems: 'center',
    width: 200, // Fixed width for each container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  progressCircleContainer: {
    width: 120, // Smaller than before
    height: 120, // Smaller than before
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  progressCircleBackground: {
    width: 120, // Match the container size
    height: 120, // Match the container size
    borderRadius: 60, // Half of width/height
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressCircleFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#6549FE',
  },
  innerCircle: {
    position: 'absolute',
    width: 80, // Smaller relative to parent
    height: 80, // Smaller relative to parent
    borderRadius: 40, // Half of width/height
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  progressPercentage: {
    fontSize: 20, // Slightly smaller font
    fontWeight: 'bold',
    color: '#6549FE',
  },
  progressTitle: {
    fontSize: 18, // Slightly smaller font
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 5,
    marginBottom: 5,
  },
  progressSubtext: {
    fontSize: 16, // Smaller font
    color: '#6B7280',
    textAlign: 'center',
  },

  // CATEGORIES SECTION
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  categoryButton: {
    width: '48%',   // Ensures two buttons per row
    height: 90,    // Adjust for better proportions
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',  // Ensures the image does not go outside the rounded corners
    position: 'relative', // Allows absolute positioning of elements inside
    marginBottom: 15,     // Adds vertical spacing between buttons
  },  
  categoryImage: {
    width: '100%',   // Makes the image fill the entire container width
    height: '100%',  // Makes the image fill the entire container height
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'stretch', // Ensures the image covers the entire area properly
  },
  categoryTextContainer: {
    position: 'absolute',
    top: 8,         // Positions text inside the container
    left: 10,        // Aligns text inside the container
  },
  categoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for contrast
  },
  
  categorySubtext: {
    fontSize: 14,
    color: '#F0F0F0', // Slightly faded white for subtext
    top: 10,
  },  

  //CHALLENGE YOURSELEF CONTAINER
  challengeContainer: {
    backgroundColor: '#FFFFFF', // Matching the reference background color
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    height: 195,
    position: 'relative', // Allows absolute positioning for the image
    overflow: 'hidden', // Ensures the image stays within the rounded corners
    alignItems: 'center', // Centers text and buttons inside
  },
  
  challengeImage: {
    width: '100%',  // Makes sure the image covers the width of the container
    height: '100%', // Ensures the image covers the height
    position: 'absolute',
    resizeMode: 'stretch', // Ensures the image maintains proportions without being cropped
  },  
  
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
    marginLeft: 30,
    marginTop: 10,
    alignSelf: 'flex-start', // Align text to the left
  },
    
  challengeMainText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start', // Align text container to the left
    marginBottom: 15,
    marginLeft: 30,
    lineHeight: 36, // Adjust spacing between lines
  },
  
  challengeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  
  challengeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  challengeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6549FE',
  },

  viewButtonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align button to the left
    marginTop: -30, // Add space from text
    width: '100%', // Ensure it takes full width for proper alignment
    marginLeft: 50,
  },

  viewButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    width: 130, // Set a fixed width
    height: 40, // Set a fixed height
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  InProgressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    height: 195,
    position: 'relative', // Allows absolute positioning for the image
    overflow: 'hidden', // Ensures the image stays within the rounded corners
    alignItems: 'center', // Keeps text left-aligned
  },
  
  InProgressImage: {
    width: '100%',  // Ensures the image covers the entire container width
    height: '100%', // Ensures the image covers the entire container height
    position: 'absolute',
    resizeMode: 'stretch', // Ensures proper fit without distortion
    opacity: 1, // Keeps image fully visible
  },
  
  toDoListSubTitle: {
    fontSize: 14,
    color: '#6B7280', // Light gray color
    position: 'absolute',
    bottom: 158, // Position near the bottom
    left: 190, // Move text more to the right
  },
  continueButtonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align button to the left
    marginTop: 10, // Add space from text
    width: '100%', // Ensure it takes full width for proper alignment
    marginLeft: 50,
  },

  //CHALLENGE CONTAINERS
  challengeTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  challengeIconContainer: {
    width: 50, // Circle size
    height: 50,
    borderRadius: 50,
    backgroundColor: '#F3F6FF', // Light background to match reference
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15, // Space between icon and text
    overflow: 'hidden', // Ensures the image doesn't exceed the container bounds
  },
  
  challengeIcon: {
    width: '100%', // Ensures the icon takes the full width of the container
    height: '100%', // Ensures the icon takes the full height of the container
    resizeMode: 'cover', // Fills the container while maintaining aspect ratio
  },  
  challengeTextContainer: {
    flex: 1,
  },
  challngeMainText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  challengeSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: -15, // Moves it closer to the main text
    marginBottom: 10
  },
  challengeIconTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6549FE',
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start', // Align text container to the left
    marginBottom: 15,
    lineHeight: 36, // Adjust spacing between lines
  },
  challengeNextButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'absolute', 
    right: 20,
  },
  redDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4B4B',
    zIndex: 10,
  },

  // DRINK A WATER SECTION
  drinkWaterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    height: 195,
    position: 'relative', // Allows absolute positioning for the image
    overflow: 'hidden', // Ensures the image stays within the rounded corners
    alignItems: 'center', // Centers text and buttons inside
  },
  drinkWaterImage: {
    width: '100%',  // Makes sure the image covers the width of the container
    height: '100%', // Ensures the image covers the height
    position: 'absolute',
    resizeMode: 'stretch', // Ensures the image maintains proportions without being cropped
  },
  drinkWaterContent: {
    position: 'absolute',
    top: 10,
    left: 20,
    alignItems: 'flex-start',
  },
  drinkWaterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  drinkWaterMain: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  drinkWaterGoal: {
    fontSize: 16,
    color: '#F0F0F0',
    marginBottom: 10,
  },
  drinkWaterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  drinkWaterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6549FE',
  },
  
  // STEPS COUNTER SECTION
  stepsCounterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    height: 195,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
  },
  stepsCounterImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'stretch',
  },
  stepsCounterContent: {
    position: 'absolute',
    top: 10,
    left: 20,
    alignItems: 'flex-start',
  },
  stepsCounterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  stepsCounterMain: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  stepsCounterGoal: {
    fontSize: 16,
    color: '#F0F0F0',
    marginBottom: 10,
  },
  stepsCounterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  stepsCounterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CD964',
  },

  // TRACK FOOD CALORIE SECTION
  trackFoodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    height: 195,
    position: 'relative', // Allows absolute positioning for the image
    overflow: 'hidden', // Ensures the image stays within the rounded corners
    alignItems: 'center', // Centers text and buttons inside
  },
  trackFoodImage: {
    width: '100%',  // Makes sure the image covers the width of the container
    height: '100%', // Ensures the image covers the height
    position: 'absolute',
    resizeMode: 'stretch', // Ensures the image maintains proportions without being cropped
  },
  trackFoodContent: {
    position: 'absolute',
    top: 10,
    left: 20,
    alignItems: 'flex-start',
  },
  trackFoodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  trackFoodMain: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  trackFoodGoal: {
    fontSize: 16,
    color: '#F0F0F0',
    marginBottom: 10,
  },
  trackFoodButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  trackFoodButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6549FE',
  },
});