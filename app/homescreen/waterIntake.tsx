import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, Easing, Image } from 'react-native';
import Svg, { Circle, Path, Defs, ClipPath, G } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useCupSize } from '../context/CupSizeContext';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const GOAL = 2500;
const DRINK_AMOUNT = 300;

// AnimatedWaveDrop component
const AnimatedWaveDrop = ({ progress = 0.5, size = 100 }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const animatedValue2 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Synchronized animations with slightly different durations
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 3000, // Slower duration for smoother effect
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    Animated.loop(
      Animated.timing(animatedValue2, {
        toValue: 1,
        duration: 3200, // Slightly different duration for subtle phase difference
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [animatedValue, animatedValue2]);

  // Wave parameters
  const amplitude = 5; // Reduced amplitude for subtler waves
  const waveLength = size * 0.9; // Increased wavelength
  const centerY = size * (1 - progress) * 0.8 + size * 0.1;

  // Generate wave path with adjusted parameters
  const getWavePath = (phase: number) => {
    let d = '';
    const points = 50; // Increased points for smoother wave
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * size;
      const y =
        amplitude *
          Math.sin((2 * Math.PI * (i / points)) + phase) +
        centerY;
      d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    }
    d += ` L${size},${size} L0,${size} Z`;
    return d;
  };

  // Generate reverse wave path with adjusted parameters
  const getReverseWavePath = (phase: number) => {
    let d = '';
    const points = 50; // Increased points for smoother wave
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * size;
      const y =
        amplitude *
          Math.sin((2 * Math.PI * (i / points)) - phase) +
        centerY;
      d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    }
    d += ` L${size},${size} L0,${size} Z`;
    return d;
  };

  // Animated phases
  const [phase, setPhase] = React.useState(0);
  const [phase2, setPhase2] = React.useState(0);

  React.useEffect(() => {
    const id = animatedValue.addListener(({ value }) => {
      setPhase(value * 2 * Math.PI);
    });
    const id2 = animatedValue2.addListener(({ value }) => {
      setPhase2(value * 2 * Math.PI);
    });
    return () => {
      animatedValue.removeListener(id);
      animatedValue2.removeListener(id2);
    };
  }, [animatedValue, animatedValue2]);

  return (
    <Svg width={size} height={size}>
      <Defs>
        <ClipPath id="clip">
          {/* Drop shape (simple circle for now, can be replaced with a drop path) */}
          <Circle cx={size / 2} cy={size / 2} r={size / 2} />
        </ClipPath>
      </Defs>
      {/* Drop outline */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 2}
        stroke="#fff"
        strokeWidth={4}
        fill="#fff"
      />
      <G clipPath="url(#clip)">
        {/* Back wave (lighter color, opposite direction) */}
        <Path
          d={getReverseWavePath(phase2)}
          fill="#A2E8FF"
          opacity={0.8} // Slightly reduced opacity for depth
        />
        {/* Front wave (original) */}
        <Path
          d={getWavePath(phase)}
          fill="#00BFFF"
          opacity={0.9} // Slightly reduced opacity for depth
        />
      </G>
    </Svg>
  );
};

type HistoryEntry = {
  id: string;
  label: string;
  amount: number;
  time: string;
  timestamp?: Date; // Optional timestamp for sorting if needed
  image: any;
};

const clipboardImg = require('../../assets/images/cupsizes/clipboard.png');

// Map cup sizes to image URLs
const cupImageLinks: { [key: string]: string } = {
  "100 mL": "https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/waterIcons%2F100ml.png?alt=media&token=246df742-a331-4638-ad9b-da0ea7706cb6",
  "125 mL": "https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/waterIcons%2F125ml.png?alt=media&token=57754e77-c028-41a9-ba17-bd46a6528325",
  "150 mL": "https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/waterIcons%2F150ml.png?alt=media&token=174a7c86-c9ad-48db-b559-9ffd5df27923",
  "200 mL": "https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/waterIcons%2F200ml.png?alt=media&token=e020e31c-5efc-4322-b53b-eece94c1d227",
  "250 mL": "https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/waterIcons%2F250ml.png?alt=media&token=7ac9800c-d42e-4000-96bd-17dfc80cb9ee",
  "300 mL": "https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/waterIcons%2F300ml.png?alt=media&token=ea4baa34-260c-4dff-a703-9230cf06df21",
  "350 mL": "https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/waterIcons%2F350ml.png?alt=media&token=c23e4712-7675-4bb0-af06-dd9467608694",
  "400 mL": "https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/waterIcons%2F400ml.png?alt=media&token=9a15d908-a1b2-4289-bbef-eb3127bf7ae6",
  "500 mL": "https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/waterIcons%2F500ml.png?alt=media&token=bdcd7b6d-9527-493e-a5b0-20fea206e356",
  "600 mL": "https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/waterIcons%2F600ml.png?alt=media&token=ff253884-d214-4ead-b9c8-15e209a3dc35",
};

export default function WaterIntake() {
  const { cup } = useCupSize();
  const [intake, setIntake] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [goal, setGoal] = useState(2500); // Default, will update from Firestore

  // Fetch user height and weight, then calculate goal
  useEffect(() => {
    const fetchUserDataAndSetGoal = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          const height = Number(data.height); // in cm
          const weight = Number(data.weight); // in kg
          if (height > 0 && weight > 0) {
            // BSA (m²) = sqrt([height(cm) x weight(kg)]/3600)
            const bsa = Math.sqrt((height * weight) / 3600);
            const calculatedGoal = Math.round(bsa * 1500); // mL
            setGoal(calculatedGoal);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data for water goal:', err);
      }
    };
    fetchUserDataAndSetGoal();
  }, []);

  // Fetch water intake history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const historyRef = collection(db, 'users', user.uid, 'waterIntakeHistory');
        const q = query(historyRef, orderBy('time', 'desc'));
        const querySnapshot = await getDocs(q);
        const today = new Date();
        let todayIntake = 0;
        const historyData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Check if entry is from today
          let isToday = false;
          if (data.time?.toDate) {
            const entryDate = data.time.toDate();
            isToday =
              entryDate.getDate() === today.getDate() &&
              entryDate.getMonth() === today.getMonth() &&
              entryDate.getFullYear() === today.getFullYear();
          }
          if (isToday) {
            todayIntake += data.amount || 0;
          }
          return {
            id: doc.id,
            label: data.label || '',
            amount: data.amount || 0,
            image: data.image || '',
            time: isToday && data.time?.toDate
              ? data.time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
          };
        });
        // Only set history with today's entries
        const todayHistoryData = historyData.filter(item => {
          // Check if entry is from today (we can safely do this because time is already formatted as a string)
          // If time exists, we assume the entry was processed through the isToday check above
          return item.time !== '';
        });
        setHistory(todayHistoryData);
        setIntake(todayIntake); // Update progress bar with today's total intake
      } catch (err) {
        console.error('Failed to fetch water intake history:', err);
      }
    };
    fetchHistory();
  }, []);

  // Parse the mL value from the cup label (e.g., '350 mL' -> 350)
  const drinkAmount = parseInt(cup.label);

  const progress = Math.min(intake / goal, 1);
  const circleCircumference = 2 * Math.PI * 83;
  const strokeDashoffset = circleCircumference * (1 - progress);

  const handleDrink = async () => {
    setIntake(prev => Math.min(prev + drinkAmount, goal));
    const imageLink = cupImageLinks[cup.label] || "";
    const now = new Date();
    const newEntry = {
      id: Date.now().toString(),
      label: cup.label,
      amount: drinkAmount,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: imageLink,
    };
    setHistory(prev => [newEntry, ...prev]);

    // Save to Firestore
    try {
      const user = auth.currentUser;
      if (!user) return;
      const historyRef = collection(db, 'users', user.uid, 'waterIntakeHistory');
      await addDoc(historyRef, {
        label: newEntry.label,
        amount: newEntry.amount,
        time: new Date(), // Store as Firestore Timestamp
        image: imageLink, // Always a link now
      });
    } catch (err) {
      console.error('Failed to save water intake history:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header (copied from workoutPlans.tsx) */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Water Intake</Text>
      </View>

      {/* Progress Card */}
      <View style={styles.card}>
        <View style={styles.progressContainer}>
          <Svg width={180} height={180}>
            <Circle
              cx={90}
              cy={90}
              r={83}
              stroke="#E0E0E0"
              strokeWidth={14}
              fill="none"
            />
            <Circle
              cx={90}
              cy={90}
              r={83}
              stroke="#2196F3"
              strokeWidth={14}
              fill="none"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="90"
              origin="90,90"
            />
          </Svg>
          {/* Animated water drop with wave */}
          <View style={styles.animatedDropContainer}>
            <AnimatedWaveDrop progress={intake / goal} size={90} />
          </View>
        </View>
        {/* Intake/Goal text below the circle */}
        <View style={styles.progressTextBelow}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={styles.intakeText}>{intake}</Text>
          </View>
          <Text style={styles.goalText}>/ {goal} mL</Text>
        </View>
        {/* Drink and cup buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.drinkButton} onPress={handleDrink}>
            <Text style={styles.drinkButtonText}>Drink ({drinkAmount} mL)</Text>
          </TouchableOpacity>
          <View style={styles.cupButtonWrapper}>
            <TouchableOpacity style={styles.cupButton} onPress={() => router.push('./switchCupSizes')}>
              <Image source={cup.image} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
            </TouchableOpacity>
            <View style={styles.refreshIconWrapper}>
              <View style={styles.refreshCircle}>
                <Icon name="refresh" size={17} color="#888" />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* History */}
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
          <TouchableOpacity onPress={() => router.push('./waterIntakeHistory')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {history.length === 0 ? (
          <View style={styles.emptyHistoryContainer}>
            <Image source={clipboardImg} style={{ width: 130, height: 130, marginBottom: 10, resizeMode: 'contain' }} />
            <Text style={styles.emptyHistoryText}>You have no history of water intake today.</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <Image
                  source={item.image ? { uri: item.image } : clipboardImg}
                  style={{ width: 28, height: 28, marginRight: 12, resizeMode: 'contain' }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyType}>{item.label}</Text>
                  <Text style={styles.historyTime}>{item.time}</Text>
                </View>
                <Text style={styles.historyAmount}>{item.amount} mL</Text>
              </View>
            )}
          />
        )}
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
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressTextBelow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    marginBottom: 8,
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
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  drinkButton: {
    backgroundColor: '#21A8F3',
    borderRadius: 26,
    paddingHorizontal: 28,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    minWidth: 145,
    elevation: 2,
  },
  drinkButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  cupButtonWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cupButton: {
    width: 36,
    height: 36,
    borderRadius: 23,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    elevation: 2,
  },
  refreshIconWrapper: {
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  refreshCircle: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
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
  viewAll: {
    color: '#2196F3',
    fontWeight: '500',
    fontSize: 15,
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
  animatedDropContainer: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyHistoryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    marginTop: -50
  },
  emptyHistoryText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
  },
});
