import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import { StatusBar } from "expo-status-bar";

export default function StepsCounter() {
  const [steps, setSteps] = useState(9550);
  const [calories, setCalories] = useState(510);
  const [distance, setDistance] = useState(4.5);
  const [caloriesBurned, setCaloriesBurned] = useState(455);
  const [isTracking, setIsTracking] = useState(false);
  
  // Progress ring calculations
  const size = 220;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const goalSteps = 10000;
  const progress = steps / goalSteps;
  const strokeDashoffset = circumference - circumference * progress;

  // Mock tracking functionality
  useEffect(() => {
    let intervalId;
    if (isTracking) {
      intervalId = setInterval(() => {
        // Simulate step counting by adding random steps between 5-20 every second
        const newSteps = Math.floor(Math.random() * 15) + 5;
        setSteps(prevSteps => prevSteps + newSteps);
        
        // Update calories (approximately 0.05 calories per step)
        const newCalories = Math.round(newSteps * 0.05);
        setCalories(prevCalories => prevCalories + newCalories);
        setCaloriesBurned(prevCalories => prevCalories + newCalories);
        
        // Update distance (approximately 0.0008 km per step)
        const newDistance = newSteps * 0.0008;
        setDistance(prevDistance => parseFloat((prevDistance + newDistance).toFixed(2)));
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTracking]);

  const handleStartTracking = () => {
    if (isTracking) {
      setIsTracking(false);
      Alert.alert("Tracking stopped", "Your activity has been recorded.");
    } else {
      setIsTracking(true);
      Alert.alert("Tracking started", "We're now tracking your steps, distance, and calories.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Steps progress circle */}
        <View style={styles.progressContainer}>
          <Svg width={size} height={size}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e0e0e0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#7965E6"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>
          {/* Running person icon */}
          <View style={styles.iconContainer}>
            <Image
              source={require("../assets/images/runningMan.png")}
              style={styles.runningIcon}
            />
          </View>

          {/* Steps count */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsValue}>{steps}</Text>
            <Text style={styles.stepsLabel}>steps</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {/* Calories circle */}
          <View style={styles.statItem}>
            <View style={styles.statCircle}>
              <Svg width={90} height={90}>
                <Circle
                  cx={45}
                  cy={45}
                  r={40}
                  stroke="#e0e0e0"
                  strokeWidth={5}
                  fill="transparent"
                />
                <Circle
                  cx={45}
                  cy={45}
                  r={40}
                  stroke="#7965E6"
                  strokeWidth={5}
                  fill="transparent"
                  strokeDasharray={40 * 2 * Math.PI}
                  strokeDashoffset={40 * 2 * Math.PI * (1 - calories / 600)}
                  strokeLinecap="round"
                />
              </Svg>
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{calories}</Text>
                <Text style={styles.statLabel}>kcal</Text>
              </View>
            </View>
          </View>
          {/* Distance circle */}
          <View style={styles.statItem}>
            <View style={styles.statCircle}>
              <Svg width={90} height={90}>
                <Circle
                  cx={45}
                  cy={45}
                  r={40}
                  stroke="#e0e0e0"
                  strokeWidth={5}
                  fill="transparent"
                />
                <Circle
                  cx={45}
                  cy={45}
                  r={40}
                  stroke="#7965E6"
                  strokeWidth={5}
                  fill="transparent"
                  strokeDasharray={40 * 2 * Math.PI}
                  strokeDashoffset={40 * 2 * Math.PI * (1 - distance / 8)}
                  strokeLinecap="round"
                />
              </Svg>
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{distance}</Text>
                <Text style={styles.statLabel}>km</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Calories burned banner */}
        <View style={styles.caloriesBanner}>
          <Ionicons name="flame" size={28} color="#FF5722" />
          <Text style={styles.caloriesBurnedText}>{caloriesBurned} cal</Text>
        </View>

        {/* Start Tracking Button */}
        <TouchableOpacity 
          style={[
            styles.trackingButton, 
            isTracking ? styles.trackingButtonActive : {}
          ]}
          onPress={handleStartTracking}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isTracking ? "pause-circle" : "play-circle"} 
            size={24} 
            color="#FFF" 
          />
          <Text style={styles.trackingButtonText}>
            {isTracking ? "Stop Tracking" : "Start Tracking"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 15,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  progressContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 80,
    marginTop: -10,
  },
  iconContainer: {
    position: "absolute",
    top: "30%",
    left: "20%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    alignItems: "center",
    justifyContent: "center",
  },
  runningIcon: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  stepsContainer: {
    position: "absolute",
    top: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  stepsValue: {
    fontSize: 45,
    fontWeight: "bold",
    color: "#000",
    lineHeight: 50,
  },
  stepsLabel: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 0,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "70%",
    marginBottom: 30,
    paddingHorizontal: 0,
    gap: 30,
  },
  statItem: {
    alignItems: "center",
    width: 90,
    height: 90,
    backgroundColor: "#f5f5f5",
    borderRadius: 45,
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 20,
  },
  statCircle: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: 90,
    height: 90,
  },
  statTextContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#aaa",
  },
  caloriesBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3EF",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
  },
  caloriesBurnedText: {
    fontSize: 22,
    fontWeight: "500",
    color: "#FF5722",
    marginLeft: 10,
  },
  trackingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7965E6",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 30,
    width: "80%",
    shadowColor: "#7965E6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  trackingButtonActive: {
    backgroundColor: "#FF5722",
    shadowColor: "#FF5722",
  },
  trackingButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
  },
});