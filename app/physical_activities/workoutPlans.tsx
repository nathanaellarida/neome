import React, { useRef, useState } from 'react';
import { 
  ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function WorkoutPlans() {
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Refs for auto-scrolling
  const beginnerRef = useRef<View>(null);
  const intermediateRef = useRef<View>(null);
  const advancedRef = useRef<View>(null);

  const [activeTab, setActiveTab] = useState('Beginner');

  // Function to scroll to sections
  const scrollToSection = (ref: React.RefObject<View>, tabName: string) => {
    setActiveTab(tabName);
    ref.current?.measure((x, y, width, height, pageX, pageY) => {
      scrollViewRef.current?.scrollTo({ y: pageY - 100, animated: true });
    });
  };

  // Function to scroll to top
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={styles.container}>
         {/* Header */}
         <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Plans</Text>
        </View>

      <ScrollView ref={scrollViewRef} style={{ flex: 1 }}>

        {/* Challenge Section */}
        <Text style={styles.sectionTitle}>Challenge</Text>
        <View style={styles.challengeCard}>
        {/* Text & Button Layer */}
        <View style={styles.challengeContent}>
            <Text style={styles.challengeText}>7x4 Challenge</Text>
            <Text style={styles.challengeTitle}>Full Body</Text>
            <Text style={styles.challengeTitle}>Workout</Text>
            <TouchableOpacity style={styles.startButton} onPress={() => router.push('/physical_activities/fullBodyWorkoutGoal')}>
            <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
        </View>

        {/* Background Image */}
        <Image 
            source={require('../assets/images/physicalChallenge.png')} 
            style={styles.challengeImage} 
        />
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          {[
            { label: 'Beginner', ref: beginnerRef },
            { label: 'Intermediate', ref: intermediateRef },
            { label: 'Advanced', ref: advancedRef },
          ].map((tab, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => scrollToSection(tab.ref, tab.label)}
              style={[
                styles.tabButton,
                activeTab === tab.label && styles.activeTab, // Apply active styles
              ]}
            >
              <Text style={[styles.tabText, activeTab === tab.label && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Beginner Section */}
        <View ref={beginnerRef}>
          <Text style={styles.sectionTitle}>Beginner</Text>
          <View style={styles.workoutList}>
            {[
              { title: 'Abs Beginner', image: require('../assets/images/absBeginner.png'), route: '/beginner/AbsBeginner' },
              { title: 'Chest Beginner', image: require('../assets/images/chestBeginner.png'), route: '/beginner/ChestBeginner' },
              { title: 'Arm Beginner', image: require('../assets/images/armBeginner.png'), route: '/beginner/ArmBeginner' },
              { title: 'Leg Beginner', image: require('../assets/images/legBeginner.png'), route: '/beginner/LegBeginner' },
              { title: 'Shoulder & Back\nBeginner', image: require('../assets/images/sNbBeginner.png'), route: '/beginner/SnbBeginner' },
            ].map((workout, index) => (
              <TouchableOpacity key={index} style={styles.workoutCard} onPress={() => router.push(workout.route as any)}>
                <Image source={workout.image} style={styles.workoutImage} />
                <View style={styles.workoutContent}>
                  <Text style={styles.workoutTitle}>{workout.title}</Text>
                  <Text style={styles.workoutSubText}>20 minutes - 25 Workouts</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Intermediate Section */}
        <View ref={intermediateRef}>
          <Text style={styles.sectionTitle}>Intermediate</Text>
          <View style={styles.workoutList}>
            {[
              { title: 'Abs Intermediate', image: require('../assets/images/absIntermediate.png'), route: '/intermediate/AbsIntermediate' },
              { title: 'Chest Intermediate', image: require('../assets/images/chestIntermediate.png'), route: '/intermediate/ChestIntermediate' },
              { title: 'Arm Intermediate', image: require('../assets/images/armIntermediate.png'), route: '/intermediate/ArmIntermediate' },
              { title: 'Leg Intermediate', image: require('../assets/images/legIntermediate.png'), route: '/intermediate/LegIntermediate' },
              { title: 'Shoulder & Back\nIntermediate', image: require('../assets/images/sNbIntermediate.png'), route: '/intermediate/SnbIntermediate' },
            ].map((workout, index) => (
              <TouchableOpacity key={index} style={styles.workoutCard} onPress={() => router.push(workout.route as any)}>
                <Image source={workout.image} style={styles.workoutImage} />
                <View style={styles.workoutContent}>
                  <Text style={styles.workoutTitle}>{workout.title}</Text>
                  <Text style={styles.workoutSubText}>20 minutes - 25 Workouts</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Advanced Section */}
        <View ref={advancedRef}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          <View style={styles.workoutList}>
            {[
              { title: 'Abs Advanced', image: require('../assets/images/absAdvanced.png'), route: '/advanced/AbsAdvanced' },
              { title: 'Chest Advanced', image: require('../assets/images/chestAdvanced.png'), route: '/advanced/ChestAdvanced' },
              { title: 'Arm Advanced', image: require('../assets/images/armAdvanced.png'), route: '/advanced/ArmAdvanced' },
              { title: 'Leg Advanced', image: require('../assets/images/legAdvanced.png'), route: '/advanced/LegAdvanced' },
              { title: 'Shoulder & Back\nAdvanced', image: require('../assets/images/sNbAdvanced.png'), route: '/advanced/SnbAdvanced' },
            ].map((workout, index) => (
              <TouchableOpacity key={index} style={styles.workoutCard}onPress={() => router.push(workout.route as any)}>
                <Image source={workout.image} style={styles.workoutImage} />
                <View style={styles.workoutContent}>
                  <Text style={styles.workoutTitle}>{workout.title}</Text>
                  <Text style={styles.workoutSubText}>20 minutes - 25 Workouts</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
       {/* Back to Top Button */}
       <TouchableOpacity 
        style={styles.backToTopButton} 
        onPress={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({ y: 0, animated: true });
            }
          }}          
        >
        <Ionicons name="chevron-up" style={styles.backToTopIcon} />
        </TouchableOpacity>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F8F8',
    paddingBottom: 64
 },
  scrollContainer: { 
    paddingBottom: 80
 },
  // HEADER
  headerContainer: {
    width: width,
    height: 75,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
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
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginLeft: 15, 
    color: '#6549FE'
 },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#6549FE', 
    marginLeft: 20, 
    marginTop: 15,
    marginBottom: 15, 
 },
 challengeCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    marginHorizontal: 20,
    height: 190,
    position: 'relative', 
    overflow: 'hidden', 
    flexDirection: 'row', // Ensures image stays on the right
    alignItems: 'center', // Align text and button vertically
  },
  
  challengeContent: {
    flex: 1, // Takes available space
    zIndex: 10, 
    margin: 30,
  },
  
  startButton: { 
    backgroundColor: '#fff', 
    paddingVertical: 8, // Make button taller
    paddingHorizontal: 40, // Adjust width
    borderRadius: 30, // Rounded button
    marginTop: 18, 
    alignSelf: 'flex-start', // Align button to the left
    shadowColor: '#000',
    shadowOpacity: 2.0, // Lower opacity for a soft look
    shadowRadius: 5, // Less intense blur
    shadowOffset: { width: 2, height: 4 }, // Subtle offset
    elevation: 7, // Needed for Android shadows
  },
  
  startButtonText: { 
    color: '#6549FE', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  challengeImage: { 
    position: 'absolute', 
    height: '100%', 
    width: '100%',
    resizeMode: "stretch", // Ensure image fits
    zIndex: 1, 
  },
  
  challengeText: { 
    fontSize: 16, 
    color: '#fff',
    fontWeight: '600', // Slightly bold
  },
  
  challengeTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#fff',
  },  
  tabsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 30, 
    marginTop: 20,
    marginHorizontal: 20,
    height: 45,
  },
  tabButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 30,
  },
  tabText: { 
    color: '#6549FE', 
    fontWeight: 'bold',
    fontSize: 15,
    alignContent: 'center',
  },
  activeTab: {
    backgroundColor: '#6549FE',
  },
  activeTabText: {
    color: '#fff',
  },
  workoutList: { 
    marginHorizontal: 15 
  },
  
  workoutCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    marginHorizontal: 5,
    marginVertical: 7,
    height: 175,
    position: 'relative', 
    overflow: 'hidden', 
    flexDirection: 'row', // Ensures image stays on the right
  },
  workoutImage: { 
    width: '100%', 
    height: '100%', 
    position: 'absolute', 
    resizeMode: "stretch", // Ensure image fits
  },
  workoutContent: { 
    padding: 20, 
    position: 'absolute',
    marginTop: 20, 
    zIndex: 2 
  },
  
  workoutTitle: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  
  workoutSubText: { 
    fontSize: 17, 
    color: '#fff' 
  },
  
  backToTopButton: { 
    position: 'absolute', 
    bottom: 100, 
    right: 30, 
    backgroundColor: 'rgba(101, 73, 254, 0.6)', // Semi-transparent purple
    width: 60, // Adjust button size
    height: 60, // Adjust button size
    borderRadius: 30, // Fully round button
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  backToTopIcon: {
    fontSize: 24, // Adjust arrow size
    color: '#fff', // White arrow
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
});
