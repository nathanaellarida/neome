import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function FullBodyWorkoutGoal() {
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Workout Weeks Data
  const workoutWeeks = [
    { week: 'Week 1', completed: true },
    { week: 'Week 2', completed: false },
    { week: 'Week 3', completed: false },
    { week: 'Week 4', completed: false },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER - Fixed at the Top */}
        <View style={styles.headerContainer}>
        {/* Background Image */}
        <Image source={require('../assets/images/fullBodyWO.png')} style={styles.headerBackground} />

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Text & Progress Container */}
        <View style={styles.headerContent}>
            <Text style={styles.workoutTitle}>Full Body</Text>
            <Text style={styles.workoutTitle}>Workout</Text>

            {/* Days Left & Progress */}
            <View style={styles.progressContainer}>
            {/* Days Left Text */}
            <Text style={styles.daysLeft}>17 Days left</Text>

            {/* Row for Progress Text & Bar */}
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>45%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '45%' }]} />
              </View>
            </View>
          </View>
        </View>
        </View>


      {/* SCROLLABLE CONTENT */}
        <View style={styles.scrollableContainer}>
        <ScrollView ref={scrollViewRef} style={styles.scrollContainer}>
            {/* DESCRIPTION */}
            <Text style={styles.description}>
            Boost your fitness with a full body workout that targets all major muscles for strength, endurance, and flexibility. 
            Get ready to feel energized and strong all over. Let’s dive in!
            </Text>

            {/* WEEKS CONTAINER - Groups all weeks into one container */}
            <View style={styles.weeksContainer}>
              {workoutWeeks.map((week, index) => (
                <View key={index} style={styles.timelineContainer}>
                  
                  {/* Vertical Line (Don't show for last week) */}
                  {index !== workoutWeeks.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      week.completed ? styles.completedLine : styles.incompleteLine
                    ]} />
                  )}

                  {/* TIMELINE ICON */}
                  <View style={[styles.timelineDot, week.completed ? styles.timelineActive : styles.timelineInactive]}>
                    <Ionicons name="flash" size={14} color={'#fff'} /> 
                  </View>

                  {/* WEEK CONTAINER */}
                  <View style={styles.weekContent}>
                    {/* WEEK TITLE */}
                    <Text style={[styles.weekTitle, { color: week.completed ? '#6549FE' : '#aaa' }]}>{week.week}</Text>

                    {/* WORKOUT DAY PROGRESS */}
                    <View style={styles.workoutBox}>
                      {/* First Row: Days 1 to 4 */}
                      <View style={styles.workoutRow}>
                      {[1, 2, 3, 4].map((day, i) => (
                        <View key={i} style={styles.workoutItem}>
                          <View style={[styles.dayCircle, week.completed ? styles.completedDay : styles.pendingDay]}>
                            <Text style={[styles.dayText, week.completed ? styles.completedText : styles.pendingText]}>{day}</Text>
                          </View>
                          {i < 3 && <Ionicons name="chevron-forward" size={16} color="#CDCDCD" style={styles.arrowIcon} />}
                        </View>
                      ))}
                    </View>

                    <View style={styles.workoutRow}>
                      {[5, 6, 7].map((day, i) => (
                        <View key={i} style={styles.workoutItem}>
                          <View style={[
                            styles.dayCircle,
                            day === 7 && week.week === 'Week 1' ? styles.ongoingDay :
                            week.completed ? styles.completedDay : styles.pendingDay
                          ]}>
                            <Text style={[
                              styles.dayText,
                              day === 7 && week.week === 'Week 1' ? styles.ongoingText :
                              week.completed ? styles.completedText : styles.pendingText
                            ]}>{day}</Text>
                          </View>
                          {/* Add arrow after days 5, 6, and also after 7 */}
                          {i < 2 && <Ionicons name="chevron-forward" size={16} color="#CDCDCD" style={styles.arrowIcon} />}
                          {i === 2 && ( // Ensure the arrow appears after 7 leading to the trophy
                            <Ionicons name="chevron-forward" size={16} color="#CDCDCD" style={styles.arrowIcon} />
                          )}
                        </View>
                      ))}
                      
                      {/* Trophy Icon */}
                      <View style={styles.workoutItem}>
                        <Ionicons name="trophy" size={35} color="#FBC02D" style={styles.trophyIcon} />
                      </View>
                    </View>

                    </View>
                  </View>
                </View>
              ))}
            </View>
        </ScrollView>
        </View>

      {/* START BUTTON - Fixed at the Bottom */}
      <TouchableOpacity style={styles.fixedStartButton} onPress={() => router.push('/physical_activities/FullBodyWorkout')}>
        <Text style={styles.startButtonText}>START</Text>
      </TouchableOpacity>
    </View>
  );
}

// STYLESHEET
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
  
    /** HEADER (FIXED AT THE TOP) **/
    headerContainer: {
        position: 'relative',
        height: 180, // Increased height for better spacing
        justifyContent: 'flex-start',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      },
      
      headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
      },
      
      backButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
      },
      
      backText: {
        fontSize: 16,
        fontWeight: 'light',
        color: '#fff',
      },
      
      headerContent: {
        marginTop: 20, // Push content down
        marginLeft: 25,
      },
      
      workoutTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
      },
      
      progressContainer: {
        marginTop: 17,
        alignItems: 'flex-start',
      },
      
      progressRow: {
        flexDirection: 'row', // Align Progress Text & Progress Bar in a row
        alignItems: 'center', // Keep them centered
      },
      
      daysLeft: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 5, // Space before the row
      },
      
      progressText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'light',
        marginRight: 7, // Space between 45% and Progress Bar
      },
      
      progressBar: {
        flex: 1, // Let the progress bar take up remaining space
        height: 9,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 20,
      },
      
      progressFill: {
        height: '100%',
        backgroundColor: '#6549FE',
        borderRadius: 10,
      },      
  
    /** SCROLLABLE CONTENT **/
    scrollableContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Gives it a distinct background
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    scrollContainer: {
    paddingHorizontal: 20,
    },      
    description: {
      fontSize: 14,
      color: '#44349B',
      marginBottom: 10,
      marginTop: 20,
      marginLeft: 10,
      textAlign: 'justify'
    },
  
    /** WEEKLY WORKOUT SECTION **/
    weekContainer: {
      marginBottom: 20,
    },
    timelineContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 20,
      position: 'relative',
    },
    
    timelineDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 15,
    },
    
    timelineActive: {
      backgroundColor: '#6549FE',
    },
    
    timelineInactive: {
      backgroundColor: '#AEAEAE',
    },
    
    timelineLine: {
      position: 'absolute',
      width: 2,
      height: '100%',
      left: 12, // Align with the center of the timelineDot
      top: 24,
    },
    
    completedLine: {
      backgroundColor: '#6549FE', // Solid purple for completed weeks
    },
    
    incompleteLine: {
      backgroundColor: 'transparent',
      borderStyle: 'dashed',
      borderColor: '#ccc', // Dashed gray for incomplete weeks
      borderWidth: 1,
    },
    
    weeksContainer: {
      backgroundColor: '#FFFFFF',  
      borderRadius: 20,  
      paddingVertical: 20,  
      paddingHorizontal: 15,  
      marginBottom: 70,  
    },
    
    weekContent: {
      flex: 1,
    },
    
    weekTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    
    workoutBox: {
      backgroundColor: '#F3F6FF',
      padding: 15,
      borderRadius: 15,
      flexDirection: 'column',
      flexWrap: 'wrap',
      alignItems: 'center',
      width: 270, // Adjusted to make space for arrows
      alignSelf: 'center',
    },
    
    workoutRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    
    workoutItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    arrowIcon: {
      marginHorizontal: 5, // Spacing between day and arrow
    },    
    
    ongoingDay: {
      borderColor: '#6549FE',  // Highlight the active day
      borderWidth: 2,
      backgroundColor: '#FFFFFF',  // Keep it unfilled
    },
    
    ongoingText: {
      color: '#6549FE',  // Make the text stand out
    },     
    
    dayCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      marginBottom: 10,
      borderColor: '#F5EDED',  // Highlight the active day
      borderWidth: 1,
    },
    
    completedDay: {
      backgroundColor: '#8979FF',
    },
    
    pendingDay: {
      backgroundColor: '#FFFFFF',
    },
    
    dayText: {
      fontSize: 14,
      fontWeight: 'light',
      textAlign: 'center',
    },
    
    completedText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    
    pendingText: {
      color: "#6549FE", 
    },
    
    trophyIcon: {
      marginRight: 10,
      marginBottom: 5,
    },    
    trophyWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
    },    
    /** FIXED START BUTTON - Positioned Over ScrollView **/
    fixedStartButton: {
      position: 'absolute',
      bottom: 30,
      left: width * 0.2,
      right: width * 0.2,
      backgroundColor: '#6549FE',
      paddingVertical: 15,
      borderRadius: 30,
      alignItems: 'center',
      zIndex: 10, // Ensures it's on top
    },
    startButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
});