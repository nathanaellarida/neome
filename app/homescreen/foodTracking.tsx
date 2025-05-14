import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Defs, ClipPath, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

const DEFAULT_GOAL = 2000; // Default calorie goal
const foodPlaceholderImg = require('../assets/images/clipboard.png'); // Use your food image

// Example meal history entry type
// In a real app, you would fetch this from a database
type MealEntry = {
  id: string;
  label: string;
  calories: number;
  time: string;
};

const initialHistory: MealEntry[] = [
  // Example: { id: '1', label: 'Breakfast', calories: 350, time: '08:00', image: foodPlaceholderImg },
];

const STOMACH_PATH = "M67.5,15C63.029,15,60.255,15.939,57.998,16.978L48.132,7.233C46.68,5.781,44.738,5.013,42.516,5.013C39.562,5.013,36.342,6.471,33.901,8.911C31.956,10.856,30.634,13.261,30.178,15.682C29.625,18.624,30.351,21.274,32.198,23.119L45.607,36.893C48.44,39.727,50,43.493,50,47.5C50,55.911,43.411,62.5,35,62.5C33.606,62.5,32.365,62.003,30.929,61.429C29.254,60.759,27.356,60,25,60C20.053,60,5,60,5,87.5C5,91.776,9.299,95,15,95S25,91.776,25,87.5C25,83.75,25.943,83.75,27.505,83.75C29.75,83.75,31.11,84.444,33.17,85.496C36.894,87.396,41.993,90,55,90C76.682,90,95,71.682,95,50C95,33.143,86.395,15,67.5,15Z";

// AnimatedWaveDrop for food/calorie (orange/yellow theme)
const AnimatedWaveDrop = ({ progress = 0.5, size = 100, color = '#FFB347' }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const animatedValue2 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
    Animated.loop(
      Animated.timing(animatedValue2, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [animatedValue, animatedValue2]);

  const amplitude = 5;
  const centerY = size * (1 - progress) * 0.8 + size * 0.1;
  
  const getWavePath = (phase: number) => {
    let d = '';
    const points = 50;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * size;
      const y = amplitude * Math.sin((2 * Math.PI * (i / points)) + phase) + centerY;
      d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    }
    d += ` L${size},${size} L0,${size} Z`;
    return d;
  };
  
  const getReverseWavePath = (phase: number) => {
    let d = '';
    const points = 50;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * size;
      const y = amplitude * Math.sin((2 * Math.PI * (i / points)) - phase) + centerY;
      d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    }
    d += ` L${size},${size} L0,${size} Z`;
    return d;
  };
  
  const [phase, setPhase] = React.useState(0);
  const [phase2, setPhase2] = React.useState(0);
  
  React.useEffect(() => {
    const id = animatedValue.addListener(({ value }) => setPhase(value * 2 * Math.PI));
    const id2 = animatedValue2.addListener(({ value }) => setPhase2(value * 2 * Math.PI));
    return () => {
      animatedValue.removeListener(id);
      animatedValue2.removeListener(id2);
    };
  }, [animatedValue, animatedValue2]);
  
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="clip">
          <Path d={STOMACH_PATH} />
        </ClipPath>
      </Defs>
      {/* Stomach outline for visual effect (background) */}
      <Path
        d={STOMACH_PATH}
        stroke={color}
        strokeWidth={1}
        fill="#fff"
      />
      <G clipPath="url(#clip)">
        <Path
          d={getReverseWavePath(phase2)}
          fill={color + '80'}
          opacity={0.8}
        />
        <Path
          d={getWavePath(phase)}
          fill={color}
          opacity={0.9}
        />
      </G>
      {/* Overlay stomach outline to mask any gaps/white spots */}
      <Path
        d={STOMACH_PATH}
        stroke={color}
        strokeWidth={10}
        fill="none"
        fillOpacity={10}
      />
    </Svg>
  );
};

export default function FoodTracking() {
  const [calories, setCalories] = useState(0);
  const [goal, setGoal] = useState<number | null>(null); // null = loading
  const [history, setHistory] = useState<MealEntry[]>(initialHistory);
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [macroGoals, setMacroGoals] = useState({ protein: 0, fats: 0, carbs: 0 });
  const [macroIntake, setMacroIntake] = useState({ protein: 0, fats: 0, carbs: 0 });

  // Fetch user data and calculate calorie & macro goals
  useEffect(() => {
    async function fetchAndCalcGoal() {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not logged in');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) throw new Error('User data not found');
        const data = userDoc.data();
        
        // Extract and validate user data with default values if missing
        const weight = Number(data.weight) || 70; // Default weight in kg if undefined or invalid
        const height = Number(data.height) || 170; // Default height in cm if undefined or invalid
        const gender = data.gender || 'male'; // Default gender if undefined
        const birthdate = data.birthdate;
        const activitylevel = data.activitylevel || 'Moderate Active'; // Default activity level
        const wellnessgoals = data.wellnessgoals || 'Maintain Weight'; // Default wellness goal
        
        // Calculate age safely
        let age = 30; // Default age if birthdate is invalid
        if (birthdate) {
          try {
            const birth = new Date(birthdate);
            const today = new Date();
            age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
          } catch (e) {
            console.log('Error calculating age, using default:', e);
          }
        }
        
        // BMR calculation with validated inputs
        let BMR = 10 * weight + 6.25 * height - 5 * age;
        BMR += gender === 'male' ? 5 : -161;
        
        // Activity multiplier
        let multiplier = 1.2; // Default multiplier
        if (activitylevel === 'Sedentary') multiplier = 1.2;
        else if (activitylevel === 'Lightly Active') multiplier = 1.375;
        else if (activitylevel === 'Moderate Active') multiplier = 1.55;
        else if (activitylevel === 'Very Active') multiplier = 1.725;
        else if (activitylevel === 'Super Active') multiplier = 1.9;
        
        // Ensure BMR and multiplier are valid numbers
        BMR = isNaN(BMR) ? 1500 : BMR; // Default BMR if calculation fails
        multiplier = isNaN(multiplier) ? 1.2 : multiplier; // Ensure multiplier is valid
        
        const TDEE = BMR * multiplier;
        let finalCalorie = TDEE;
        
        if (wellnessgoals === 'Lose Weight') finalCalorie -= 300;
        else if (wellnessgoals === 'Gain Weight') finalCalorie += 300;
        
        // Ensure final calorie value is a valid number
        finalCalorie = isNaN(finalCalorie) ? DEFAULT_GOAL : finalCalorie;
        const roundedGoal = Math.round(finalCalorie);
        setGoal(roundedGoal);
        
        // Macronutrient ratios
        let proteinPct = 0.3, fatsPct = 0.3, carbsPct = 0.4;
        
        // Adjust ratios based on wellness goals
        if (wellnessgoals === 'Muscle Gain') {
          proteinPct = 0.35; fatsPct = 0.25; carbsPct = 0.4;
        } else if (wellnessgoals === 'Gain Weight') {
          proteinPct = 0.2; fatsPct = 0.3; carbsPct = 0.5;
        }
        
        // Calculate grams: protein/carbs = 4 kcal per gram, fats = 9 kcal per gram
        // Use Math.max to ensure we don't get negative values
        const protein = Math.round(Math.max(0, (roundedGoal * proteinPct) / 4));
        const fats = Math.round(Math.max(0, (roundedGoal * fatsPct) / 9));
        const carbs = Math.round(Math.max(0, (roundedGoal * carbsPct) / 4));
        
        // Validate macro values to ensure they're not NaN
        const validProtein = isNaN(protein) ? 150 : protein; // Default values
        const validFats = isNaN(fats) ? 60 : fats;
        const validCarbs = isNaN(carbs) ? 200 : carbs;
        
        setMacroGoals({ 
          protein: validProtein, 
          fats: validFats, 
          carbs: validCarbs 
        });
      } catch (e) {
        setGoal(DEFAULT_GOAL); // fallback
        setMacroGoals({ protein: 150, fats: 60, carbs: 200 }); // fallback
      } finally {
        setLoadingGoal(false);
      }
    }
    fetchAndCalcGoal();
  }, []);

  // Fetch food logs from Firestore and sum macros for today
  useEffect(() => {
    async function fetchFoodLogs() {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const foodLogsRef = collection(db, 'users', user.uid, 'foodLogs');
        const q = query(foodLogsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const logs: MealEntry[] = [];
        let totalProtein = 0, totalFats = 0, totalCarbs = 0;
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'

        snapshot.docs.forEach(docSnap => {
          const d = docSnap.data();
          if (d.createdAt && d.createdAt instanceof Timestamp) {
            const date = d.createdAt.toDate();
            const dateStr = date.toISOString().slice(0, 10);
            if (dateStr === todayStr) {
              logs.push({
                id: docSnap.id,
                label: d.foodName || 'Meal',
                calories: d.calories || 0,
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
              totalProtein += Number(d.protein) || 0;
              totalFats += Number(d.fat) || 0;
              totalCarbs += Number(d.carbs) || 0;
            }
          }
        });
        setHistory(logs);
        setMacroIntake({ protein: totalProtein, fats: totalFats, carbs: totalCarbs });
      } catch (e) {
        // fallback: do nothing, keep initialHistory
      }
    }
    fetchFoodLogs();
  }, []);

  // Calculate total calories from history
  useEffect(() => {
    setCalories(history.reduce((sum, entry) => sum + entry.calories, 0));
  }, [history]);

  // Use real macro intake values from today's logs with validation
  const protein = Number(macroIntake.protein) || 0;
  const fats = Number(macroIntake.fats) || 0;
  const carbs = Number(macroIntake.carbs) || 0;
  
  // Ensure macro goals are valid numbers
  const proteinGoal = Number(macroGoals.protein) || 150; // Default values if undefined
  const fatsGoal = Number(macroGoals.fats) || 60;
  const carbsGoal = Number(macroGoals.carbs) || 200;
  
  // Calculate percentages safely
  const proteinPercent = proteinGoal > 0 ? Math.min(protein / proteinGoal, 1) : 0;
  const fatsPercent = fatsGoal > 0 ? Math.min(fats / fatsGoal, 1) : 0;
  const carbsPercent = carbsGoal > 0 ? Math.min(carbs / carbsGoal, 1) : 0;

  // Calculate progress safely
  const numGoal = Number(goal) || DEFAULT_GOAL; // Ensure goal is a number
  const numCalories = Number(calories) || 0; // Ensure calories is a number
  const progress = numGoal > 0 ? Math.min(numCalories / numGoal, 1) : 0;
  
  const dynamicColor = progress >= 0.75 ? '#4ADE80' : progress >= 0.5 ? '#FFB347' : '#FF4B4B';
  
  // Calculate remaining calories safely
  const safeGoal = Number(goal) || DEFAULT_GOAL;
  const safeCalories = Number(calories) || 0;
  const remaining = Math.max(safeGoal - safeCalories, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.push('./HomeScreen')}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Tracking</Text>
      </View>

      {/* Progress Card */}
      <View style={styles.card}>
        <View style={styles.calorieRow}>
          <View style={styles.calorieCol}>
            <Text style={styles.calorieLabel}>{calories} kcal</Text>
            <Text style={styles.calorieSubLabel}>consumed</Text>
          </View>
          <View style={styles.circularProgressContainer}>
            <Svg width={160} height={160} viewBox="0 0 160 160">
              <Circle
                cx={80}
                cy={80}
                r={70}
                stroke="#E0E0E0"
                strokeWidth={14}
                fill="none"
              />
              <Circle
                cx={80}
                cy={80}
                r={70}
                stroke={dynamicColor}
                strokeWidth={14}
                fill="none"
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={(1 - progress) * 2 * Math.PI * 70}
                strokeLinecap="round"
                rotation="-90"
                origin="80,80"
              />
            </Svg>
            <View style={styles.stomachCenter} pointerEvents="none">
              <AnimatedWaveDrop progress={progress} size={90} color={dynamicColor} />
            </View>
          </View>
          <View style={styles.calorieCol}>
            <Text style={styles.calorieLabel}>{loadingGoal ? '...' : `${remaining} kcal`}</Text>
            <Text style={styles.calorieSubLabel}>remaining</Text>
          </View>
        </View>
        
        {/* Macros Row */}
        <View style={styles.macrosRow}>
          <View style={styles.macroCol}>
            <Text style={styles.macroLabel}>Protein</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBar, { backgroundColor: '#E11D48', width: `${proteinPercent * 100}%` }]} />
            </View>
            <Text style={styles.macroValue}>
              {!isNaN(protein) ? protein.toFixed(1) : '0.0'} / {!isNaN(proteinGoal) ? proteinGoal : '0'}g
            </Text>
          </View>
          <View style={styles.macroCol}>
            <Text style={styles.macroLabel}>Fats</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBar, { backgroundColor: '#F59E42', width: `${fatsPercent * 100}%` }]} />
            </View>
            <Text style={styles.macroValue}>
              {!isNaN(fats) ? fats.toFixed(1) : '0.0'} / {!isNaN(fatsGoal) ? fatsGoal : '0'}g
            </Text>
          </View>
          <View style={styles.macroCol}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBar, { backgroundColor: '#22D3EE', width: `${carbsPercent * 100}%` }]} />
            </View>
            <Text style={styles.macroValue}>
              {!isNaN(carbs) ? carbs.toFixed(1) : '0.0'} / {!isNaN(carbsGoal) ? carbsGoal : '0'}g
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.logMealButton} onPress={() => router.push('./searchFood')}>
            <Text style={styles.logMealButtonText}>Add a Meal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* History */}
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
        </View>
        {history.length === 0 ? (
          <View style={styles.emptyHistoryContainer}>
            <Image source={foodPlaceholderImg} style={{ width: 130, height: 130, marginBottom: 10, resizeMode: 'contain' }} />
            <Text style={styles.emptyHistoryText}>You have no meal history today.</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyType}>{item.label}</Text>
                  <Text style={styles.historyTime}>{item.time}</Text>
                </View>
                <Text style={styles.historyAmount}>{item.calories} kcal</Text>
              </View>
            )}
          />
        )}
      </View>
      
      <View style={styles.waterTrackButtonContainer}>
        <TouchableOpacity 
          onPress={() => router.push('./waterIntake')} 
          style={styles.waterTrackButton}
        >
          <Text style={styles.waterTrackButtonText}>Track your Water Intake</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingTop: 32,
  },
  headerContainer: {
    width: '100%',
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
    marginTop: -40,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#6549FE',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calorieCol: {
    alignItems: 'center',
    width: 80,
  },
  calorieLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  calorieSubLabel: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  circularProgressContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stomachCenter: {
    position: 'absolute',
    top: 35,
    left: 35,
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    pointerEvents: 'none',
  },
  calorieCenterText: {
    position: 'absolute',
    top: 60,
    left: 0,
    width: 160,
    alignItems: 'center',
    zIndex: 3,
    pointerEvents: 'none',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 2,
    paddingHorizontal: 8,
  },
  macroCol: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  macroLabel: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
    marginBottom: 2,
  },
  macroBarBg: {
    width: '100%',
    height: 7,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 2,
  },
  macroBar: {
    height: 7,
    borderRadius: 4,
  },
  macroValue: {
    fontSize: 13,
    color: '#888',
    marginTop: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  logMealButton: {
    backgroundColor: '#6549FE',
    borderRadius: 26,
    paddingHorizontal: 28,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 145,
    elevation: 2,
    marginTop: 12,
  },
  logMealButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 0,
    padding: 16,
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  historyTime: {
    fontSize: 13,
    color: '#888',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  emptyHistoryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    marginTop: -50,
  },
  emptyHistoryText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
  },
  intakeText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#222',
  },
  goalText: {
    fontSize: 16,
    color: '#888',
    marginTop: -4,
  },
  waterTrackButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  waterTrackButton: {
    backgroundColor: '#21A8F3',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 32,
    elevation: 2,
  },
  waterTrackButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});