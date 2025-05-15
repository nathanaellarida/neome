import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { ImageBackground } from 'react-native';
import { router, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const progressCards = [
  { label: 'Weight Progress', value: 85, color: '#4FA8FF' },
  { label: 'Body Composition Progress', value: 45, color: '#FFD048' },
  { label: 'Fitness Progress', value: 95, color: '#F58BFF' },
  { label: 'Activity Progress', value: 70, color: '#02D110' },
  { label: 'Comparison Progress', value: 100, color: '#6549FE' },
];

const avatarStats = [
  { label: 'Starting Weight', value: '147 lbs on Oct 13, 2024' },
  { label: 'Current Weight', value: '147 lbs' },
  { label: 'Goal Weight', value: '140 lbs' },
  { label: 'Weekly Goal', value: 'Lose 1 lb per week' },
  { label: 'Activity Level', value: 'Lightly Active' },
  { label: 'Body Fat Percentage', value: '25%' },
  { label: 'Muscle Mass Percentage', value: '35%' },
  { label: 'Waist Circumference', value: '34 inches' },
  { label: 'Body Mass Index (BMI)', value: '24.5 (normal)' },
];

export default function AvatarProgressScreen() {
  const [activeTab, setActiveTab] = useState<'Current' | 'Goal'>('Current');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [avatarModel, setAvatarModel] = useState('femaleBody6.glb'); // Default
  const [goalAvatarModel, setGoalAvatarModel] = useState('femaleBody5.glb'); // Default goal body
  
  // Function to generate WebView HTML content with proper scaling
  const generateAvatarHTML = (model: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
          <script type="module" src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js"></script>
          <script type="module" src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/GLTFLoader.js"></script>
          <style>
            html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: transparent; }
            model-viewer { 
              width: 100%; 
              height: 100%;
              --poster-color: transparent;
              --progress-bar-color: transparent;
              --progress-mask: transparent;
            }
            .text-content { display: none; } /* Hide any text content */
          </style>
        </head>
        <body>
          <model-viewer 
            id="avatar"
            src="https://raw.githubusercontent.com/VIRGINIAMW123/female-avatar-models/main/${model}"
            alt="3D Avatar"
            camera-controls
            autoplay
            environment-image="neutral"
            shadow-intensity="1"
            exposure="1"
            camera-orbit="0deg 85deg 2.0m"
            min-camera-orbit="auto auto 1.5m"
            max-camera-orbit="auto auto 3.0m"
            field-of-view="28deg"
            disable-zoom
            interaction-prompt="none">
          </model-viewer>
        </body>
      </html>
    `;
  };
  
  // Fetch user data and calculate BMI for avatar model
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.height) setHeight(String(userData.height));
          if (userData.weight) setWeight(String(userData.weight));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);
  
  // Calculate BMI and set avatar models for both current and goal views
  useEffect(() => {
    if (!height || !weight) return;
    
    // Convert height (in cm) to meters and calculate BMI
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    
    // Calculate a target BMI that's 2 points lower for the goal avatar
    // We're setting a floor of 16 for health reasons (don't show unhealthy avatar goals)
    const targetBmi = Math.max(bmi - 2, 16);

    // Set current avatar model
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
    
    // Set goal avatar model
    let goalAvatar = '';
    if (targetBmi < 16) goalAvatar = 'femaleBody1.glb';
    else if (targetBmi < 17) goalAvatar = 'femaleBody2.glb';
    else if (targetBmi < 18.5) goalAvatar = 'femaleBody3.glb';
    else if (targetBmi < 20) goalAvatar = 'femaleBody4.glb';
    else if (targetBmi < 22) goalAvatar = 'femaleBody5.glb';
    else if (targetBmi < 24) goalAvatar = 'femaleBody6.glb';
    else if (targetBmi < 28) goalAvatar = 'femaleBody7.glb';
    else if (targetBmi < 30) goalAvatar = 'femaleBody8.glb';
    else if (targetBmi < 32) goalAvatar = 'femaleBody9.glb';
    else if (targetBmi <= 35) goalAvatar = 'femaleBody10.glb';
    else goalAvatar = 'femaleBody11.glb';

    setAvatarModel(newAvatar);
    setGoalAvatarModel(goalAvatar);
  }, [height, weight]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.title}>Avatar Progress</Text>
        <Ionicons name="pulse-outline" size={24} color="#6549FE" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
        {/* Toggle Tabs */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Current' && styles.activeTab]}
            onPress={() => setActiveTab('Current')}
          >
            <Text style={[styles.tabText, activeTab === 'Current' && styles.activeTabText]}>Current</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Goal' && styles.activeTab]}
            onPress={() => setActiveTab('Goal')}
          >
            <Text style={[styles.tabText, activeTab === 'Goal' && styles.activeTabText]}>Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Preview */}
        <View style={styles.avatarComparison}>
          <View style={styles.avatarColumn}>
            <Text style={styles.avatarLabel}>Current Avatar Data</Text>
            {/* Avatar 3D WebView */}
            <WebView
              originWhitelist={['https://*']}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              source={{ html: generateAvatarHTML(avatarModel) }}
              style={styles.avatarWebView}
            />
            <View
              style={[
                styles.avatarShadow,
                activeTab === 'Current' ? styles.violetShadow : styles.mintShadow,
              ]}
            />
          </View>

          {/* Divider at the center */}
          <View style={styles.divider} />

          <View style={styles.avatarColumn}>
            <Text style={styles.avatarLabel}>Goal Avatar Data</Text>
            {/* Goal Avatar 3D WebView */}
            <WebView
              originWhitelist={['https://*']}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              source={{ html: generateAvatarHTML(goalAvatarModel) }}
              style={styles.avatarWebView}
            />
            <View
              style={[
                styles.avatarShadow,
                activeTab === 'Goal' ? styles.violetShadow : styles.mintShadow,
              ]}
            />
          </View>
        </View>

        {/* Progress Section */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.progressScroll}>
          {progressCards.map((card, idx) => {
            const size = 80;
            const strokeWidth = 8;
            const radius = (size - strokeWidth) / 2;
            const circumference = 2 * Math.PI * radius;
            const progress = (card.value / 100) * circumference;

            // Background images
            const backgroundImages = [
              require('../assets/images/progress1.png'),
              require('../assets/images/progress2.png'),
              require('../assets/images/progress3.png'),
              require('../assets/images/progress4.png'),
              require('../assets/images/progress5.png'),
            ];
            const backgroundImage = backgroundImages[idx % backgroundImages.length];

            // Inner background colors for circles
            const circleColors = ['#6895F8', '#FFC430', '#FF80FD', '#02D110', '#6549FE'];
            const circleBgColor = circleColors[idx % circleColors.length];

            return (
              <ImageBackground
                key={idx}
                source={backgroundImage}
                style={styles.progressContainer}
                imageStyle={{ borderRadius: 20 }}
              >
                {/* Progress Circle with % inside */}
                <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                  <Svg width={size} height={size} style={{ position: 'absolute' }}>
                    {/* Only white progress stroke */}
                    <Circle
                      stroke="#FFFFFF"
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      strokeLinecap="round"
                      rotation="-90"
                      origin={`${size / 2}, ${size / 2}`}
                    />
                  </Svg>

                  {/* Center fill + text */}
                  <View style={{
                    backgroundColor: circleBgColor,
                    width: size - 8,
                    height: size - 8,
                    borderRadius: (size - 8) / 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    elevation: 4,
                  }}>
                    <Text style={styles.progressPercentage}>{card.value}%</Text>
                  </View>
                </View>

                {/* Label below the circle */}
                <Text style={styles.progressTitle}>{card.label}</Text>
              </ImageBackground>
            );
          })}
        </ScrollView>

        {/* Avatar Data Section */}
        <Text style={styles.sectionTitle}>Avatar's Current Data</Text>
        <View style={styles.statsContainer}>
          {avatarStats.map((stat, idx) => (
            <View key={idx} style={styles.statRow}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
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
        <TouchableOpacity style={styles.centerCircle} onPress={() => router.push('/avatar_progress/AvatarProgressScreen')}>
          <Ionicons name="person" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Increased spacing for Calendar */}
        <TouchableOpacity style={[styles.navButton, { marginLeft: 30 }]}>
          <Ionicons name="calendar-outline" size={25} color="#6549FE" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/messaging/MessageHome')}>
          <Ionicons name="chatbubble-ellipses-outline" size={25} color="#6549FE" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 65,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#44349B' },
  toggleContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginVertical: 20,
    borderRadius: 40,
    backgroundColor: '#fff',
    padding: 5,
    elevation: 5,
  },
  tab: {
    width: width * 0.4,
    paddingVertical: 10,
    borderRadius: 40,
    alignItems: 'center',
  },
  activeTab: { backgroundColor: '#6549FE' },
  tabText: { fontWeight: 'bold', color: '#6549FE' },
  activeTabText: { color: '#fff' },
  avatarImage: {
    width: 120,
    height: 200,
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#44349B',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
  },
  progressScroll: { paddingLeft: 0 },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150, // Fixed width for each container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginTop: 30,
    elevation: 3,
  },
  innerCircle: {
    position: 'absolute',
    width: 80, // Smaller relative to parent
    height: 80, // Smaller relative to parent
    borderRadius: 40, // Half of width/height
    backgroundColor: '#6895F8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressTitle: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 18, // Slightly smaller font
    fontWeight: 'bold',
    marginBottom: 5,
  },  
  progressCircleFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#6549FE',
  },  
  statsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 30,
    marginBottom: 40,
    elevation: 2,
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
    backgroundColor: '#6895F8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  statRow: {
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6549FE',
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
  avatarComparison: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 5,
    paddingVertical: 20,
    borderRadius: 25,
    elevation: 2,
    height: 380, // ← increased height for 3D models
  },
  avatarColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },    
  avatarLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#44349B',
    marginBottom: 10,
  },
  avatarShadow: {
    width: 100,              // Wider for horizontal ellipse
    height: 30,              // Taller to give it more volume
    marginTop: 10,           // Adjusted to position below the WebView
    backgroundColor: '#6549FE', // or '#C7FFE3' depending on active tab
    opacity: 1,
    borderRadius: 50,
  }, 
  violetShadow: {
    backgroundColor: '#6549FE',
    opacity: 1,
  },
  mintShadow: {
    backgroundColor: '#C7FFE3',
    opacity: 1,
  },    
  divider: {
    width: 1,
    backgroundColor: '#DADADA',
    height: '100%',
    alignSelf: 'center',
  },    
  avatarWebView: {
    width: 140,
    height: 280,
    marginVertical: 10,
    backgroundColor: 'transparent',
  },
});
