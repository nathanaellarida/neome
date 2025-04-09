import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Make sure to import from expo-svg if using Expo
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';

export default function HomeScreen() {
  const today = new Date();
  const currentDay = today.toLocaleDateString('en-US', { weekday: 'short' });
  const currentMonthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Progress Circle Config
  const size = 150;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressPercent = 70; // 70% complete
  const progressValue = circumference - (circumference * progressPercent) / 100;

  return (
    <View style={styles.container}>
      {/* White Header Container */}
      <View style={styles.headerContainer}>
          {/* Profile Image and Text */}
          <View style={styles.profileSection}>
          <Image source={require('../assets/images/pfp.png')} style={styles.profileImage} />
            <View style={styles.textContainer}>
              <Text style={styles.greeting}>Hello!</Text>
              <Text style={styles.username}>Akari</Text>
            </View>
          </View>

          {/* Icons */}
          <View style={styles.iconContainer}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={23} color="#6549FE" />
            </TouchableOpacity>
            <TouchableOpacity>
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
          <View style={styles.statsContainer}>
            {[
              { value: '3,502', label: 'Points', image: require('../assets/images/points.png') },
              { value: '1,350', label: 'Calories', image: require('../assets/images/calories.png') },
              { value: '300', label: 'Energy', image: require('../assets/images/energy.png') },
              { value: '25', label: 'Badges', image: require('../assets/images/badges.png') },
              { value: '2,532', label: 'Steps', image: require('../assets/images/steps.png') },
            ].map((item, index) => (
              <View key={index} style={styles.statBox}>
                 {/* Different image for each stat */}
                  <Image source={item.image} style={styles.statIcon} />
                {/* Texts aligned to the right */}
                <View style={styles.textWrapper}>
                  <Text style={styles.statNumber}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Placeholder Right Side */}
          <View style={styles.avatarPlaceholder}>
          <Image source={require('../assets/images/avatar.png')} style={styles.avatarImage} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Daily Progress</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.progressScrollContainer}
          >
            {/* Progress Circle 1 - Working Hours */}
            <View style={styles.progressContainer}>
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircleBackground}>
                  <View style={[styles.progressCircleFill, { width: '70%' }]} />
                </View>
                <View style={styles.innerCircle}>
                  <Text style={styles.progressPercentage}>70%</Text>
                </View>
              </View>
              <Text style={styles.progressTitle}>Working Hours</Text>
              <Text style={styles.progressSubtext}>Exceeded by 3 hours</Text>
            </View>

            {/* Progress Circle 2 - Steps */}
            <View style={styles.progressContainer}>
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircleBackground}>
                  <View style={[styles.progressCircleFill, { width: '85%' , backgroundColor: '#FD6FFF'}]} />
                </View>
                <View style={styles.innerCircle}>
                  <Text style={[styles.progressPercentage, { color: '#FF33A8' }]}>85%</Text>
                </View>
              </View>
              <Text style={styles.progressTitle}>Steps</Text>
              <Text style={styles.progressSubtext}>2.5k of 3k steps</Text>
            </View>

            {/* Progress Circle 3 - Hydration */}
            <View style={styles.progressContainer}>
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircleBackground}>
                  <View style={[styles.progressCircleFill, { width: '60%', backgroundColor: '#6DED7C' }]} />
                </View>
                <View style={styles.innerCircle}>
                  <Text style={[styles.progressPercentage, { color: '#6DED7C' }]}>60%</Text>
                </View>
              </View>
              <Text style={styles.progressTitle}>Hydration</Text>
              <Text style={styles.progressSubtext}>4 of 8 glasses</Text>
            </View>

            {/* Progress Circle 4 - Calories */}
            <View style={styles.progressContainer}>
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircleBackground}>
                  <View style={[styles.progressCircleFill, { width: '45%',  backgroundColor: '#FF8B8D' }]} />
                </View>
                <View style={styles.innerCircle}>
                  <Text style={[styles.progressPercentage, { color: '#FF8B8D' }]}>45%</Text>
                </View>
              </View>
              <Text style={styles.progressTitle}>Calories</Text>
              <Text style={styles.progressSubtext}>1350 of 3000 cal</Text>
            </View>

            {/* Progress Circle 5 - Focus Time */}
            <View style={styles.progressContainer}>
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircleBackground}>
                  <View style={[styles.progressCircleFill, { width: '90%', backgroundColor: '#D078FF' }]} />
                </View>
                <View style={styles.innerCircle}>
                  <Text style={[styles.progressPercentage, { color: '#D078FF' }]}>90%</Text>
                </View>
              </View>
              <Text style={styles.progressTitle}>Focus Time</Text>
              <Text style={styles.progressSubtext}>5.4 of 6 hours</Text>
            </View>
          </ScrollView>    

          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesContainer}>
            {[
              { title: 'Physical\nActivities', image: require('../assets/images/physicalacts.png'), screen: '/physical_activities/workoutPlans' },
              { title: 'Mental\nActivities', image: require('../assets/images/mentalacts.png'), screen: '/categories/MentalActivities' },
              { title: 'Social\nActivities', image: require('../assets/images/socialacts.png'), screen: '/categories/SocialActivities' },
              { title: 'Emotional\nActivities', image: require('../assets/images/emotionalacts.png'), screen: '/categories/EmotionalActivities' },
            ].map((category, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.categoryButton} 
                onPress={() => router.push('/Challenges/ChallengeDashboard')}>
                <Image source={category.image} style={styles.categoryImage} />
                <View style={styles.categoryTextContainer}>
                  <Text style={styles.categoryText}>{category.title}</Text>
                  <Text style={styles.categorySubtext}>20 Activities</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

        {/* Challenge Yourself Section */}
        <View style={styles.challengeContainer}>
        <Image source={require('../assets/images/challengeYourSelf.png')} style={styles.challengeImage} />
          <Text style={styles.challengeTitle}>Challenge Yourself</Text>
          <Text style={styles.challengeMainText}>Let’s Play{'\n'}Together</Text>

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
            <TouchableOpacity style={styles.viewButton}>
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

        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/messaging/MessageHome')}>
          <Ionicons name="chatbubble-ellipses-outline" size={25} color="#6549FE" />
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
    width: '50%',
    height: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    justifyContent: 'center',  
    alignItems: 'flex-end',   
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
    marginBottom: 10,
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
    marginTop: 10, // Add space from text
    width: '100%', // Ensure it takes full width for proper alignment
    marginLeft: 20,
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
    
    // Make it stay at the right
    position: 'absolute', 
    right: 20, // Distance from the right edge
  },


  //CHALLENGE CONTAINERS ETC.

});