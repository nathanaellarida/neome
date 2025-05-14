import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

const clipboardImg = require('../../assets/images/cupsizes/clipboard.png');

// HistoryEntry type reused from waterIntake.tsx
// id, label, amount, time, image, date

type HistoryEntry = {
  id: string;
  label: string;
  amount: number;
  image: string;
  time: string;
  date: Date;
};

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getDayKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

const DEFAULT_GOAL = 2500;

const CIRCLE_SIZE = 48;

export default function WaterIntakeHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [groupedHistory, setGroupedHistory] = useState<Record<string, HistoryEntry[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dates, setDates] = useState<Date[]>([]);
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        // Fetch user goal (if available)
        // You can add logic here to fetch the user's goal from Firestore if needed
        // setGoal(fetchedGoal);
        const historyRef = collection(db, 'users', user.uid, 'waterIntakeHistory');
        const q = query(historyRef, orderBy('time', 'desc'));
        const querySnapshot = await getDocs(q);
        const allHistory = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const dateObj = data.time?.toDate ? data.time.toDate() : new Date();
          return {
            id: doc.id,
            label: data.label || '',
            amount: data.amount || 0,
            image: data.image || '',
            time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()),
          };
        });
        setHistory(allHistory);
        // Group by date
        const grouped: Record<string, HistoryEntry[]> = {};
        allHistory.forEach(entry => {
          const key = getDayKey(entry.date);
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(entry);
        });
        setGroupedHistory(grouped);
        // Get unique dates (last 7 days)
        const uniqueDates = Array.from(new Set(allHistory.map(e => getDayKey(e.date)))).map(key => new Date(key));
        let daysArr = uniqueDates;
        if (uniqueDates.length < 7) {
          const today = new Date();
          daysArr = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            daysArr.push(d);
          }
        }
        setDates(daysArr);
        setSelectedDate(daysArr[daysArr.length - 1]);
      } catch (err) {
        console.error('Failed to fetch water intake history:', err);
      }
    };
    fetchHistory();
  }, []);

  const selectedKey = getDayKey(selectedDate);
  const entries = groupedHistory[selectedKey] || [];

  // Helper to get total intake for a date
  function getIntakeForDate(date: Date): number {
    const key = getDayKey(date);
    const entries = groupedHistory[key] || [];
    return entries.reduce((sum, e) => sum + e.amount, 0);
  }

  // Date circle size
  const STROKE_WIDTH = 3;
  const SELECTED_STROKE_WIDTH = 4.5;
  const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
  const SELECTED_RADIUS = (CIRCLE_SIZE - SELECTED_STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const SELECTED_CIRCUMFERENCE = 2 * Math.PI * SELECTED_RADIUS;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Water Intake History</Text>
      </View>

      {/* Date Picker */}
      <View style={styles.datePickerContainer}>
        {dates.map((date, idx) => {
          const isSelected = getDayKey(date) === selectedKey;
          const intake = getIntakeForDate(date);
          const progress = Math.min(intake / goal, 1);
          const strokeWidth = isSelected ? SELECTED_STROKE_WIDTH : STROKE_WIDTH;
          const radius = isSelected ? SELECTED_RADIUS : RADIUS;
          const circumference = isSelected ? SELECTED_CIRCUMFERENCE : CIRCUMFERENCE;
          const strokeDashoffset = circumference * (1 - progress);
          return (
            <View key={getDayKey(date)} style={styles.dateColumn}>
              <Text style={[styles.dateButtonText, isSelected && styles.selectedDateButtonText]}>
                {daysOfWeek[date.getDay()]}
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, isSelected && styles.selectedDateButton]}
                onPress={() => setSelectedDate(date)}
                activeOpacity={0.8}
              >
                <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={{ marginBottom: 0 }}>
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={radius}
                    stroke="#E0E0E0"
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={radius}
                    stroke="#21A8F3"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${CIRCLE_SIZE / 2},${CIRCLE_SIZE / 2}`}
                  />
                </Svg>
                <View style={styles.dateNumContainer}>
                  <Text style={[styles.dateNum, isSelected && styles.selectedDateNum]}>
                    {date.getDate()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* History List */}
      <View style={styles.historyCard}>
        <Text style={styles.historyDateLabel}>{formatDate(selectedDate)}</Text>
        {entries.length === 0 ? (
          <View style={styles.emptyHistoryContainer}>
            <Image source={clipboardImg} style={{ width: 130, height: 130, marginBottom: 10, resizeMode: 'contain' }} />
            <Text style={styles.emptyHistoryText}>You have no history of water intake for this day.</Text>
          </View>
        ) : (
          <FlatList
            data={entries}
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
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    marginBottom: 8,
    marginTop: 8,
    minHeight: 80,
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    maxWidth: 52,
  },
  dateButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'transparent',
    minHeight: 60,
    maxWidth: 52,
  },
  selectedDateButton: {
    // Optionally add a shadow or scale for selected
    shadowColor: '#21A8F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  dateTextContainer: {
    display: 'none', // Not used anymore
  },
  dateButtonText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 2,
  },
  selectedDateButtonText: {
    color: '#2196F3',
    fontWeight: '700',
  },
  dateNumContainer: {
    position: 'absolute',
    top: 6,
    left: 0,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  dateNum: {
    fontSize: 15,
    color: '#888',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedDateNum: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 0,
    padding: 16,
    flex: 1,
  },
  historyDateLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
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
    marginTop: 10,
  },
  emptyHistoryText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
  },
});
