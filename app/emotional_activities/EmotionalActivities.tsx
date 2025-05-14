import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import { Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { format, differenceInSeconds, endOfDay } from 'date-fns';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { db, auth } from '../../firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import defaultEmoji from '../../assets/images/default-emoji.png';


//mood History Componnets

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const calendarMoodEmojis = ['😄', '😊', '😢', '😡', '😐', '😴', '🤩']; // Mock emojis
const todayIndex = new Date().getDay();

const { width } = Dimensions.get('window');

type Mood = {
  label: string;
  gif: any;
};

const moods: Mood[] = [
  { label: 'Happy', gif: require('../assets/images/happy.gif') },
  { label: 'Sad', gif: require('../assets/images/sad.gif') },
  { label: 'Good Mood', gif: require('../assets/images/goodmood.gif') },
  { label: 'Annoyed', gif: require('../assets/images/annoyed.gif') },
  { label: 'Angry', gif: require('../assets/images/angry.gif') },
  { label: 'Tired', gif: require('../assets/images/tired.gif') },
  { label: 'Confused', gif: require('../assets/images/confused.gif') },
  { label: 'Confident', gif: require('../assets/images/confident.gif') },
];

const moodColors = [
  { background: '#FFE0A3', fill: '#FDBE54' }, // Happy
  { background: '#C7D3FF', fill: '#5F88FF' }, // Sad
  { background: '#FFCCCC', fill: '#FF6A6A' }, // Good Mood
  { background: '#F6D8FF', fill: '#DC7AFF' }, // Annoyed
  { background: '#FFCACA', fill: '#FF7A7A' }, // Angry
  { background: '#CFFFFC', fill: '#57E6D9' }, // Tired
  { background: '#D9FFE2', fill: '#59E190' }, // Confused
  { background: '#FFFACD', fill: '#FFDF6B' }, // Confident
];

// Place this at the top (outside your component)
const moodEmojis = [
  require('../assets/images/0.png'),
  require('../assets/images/1.png'),
  require('../assets/images/2.png'),
  require('../assets/images/3.png'),
  require('../assets/images/4.png'),
  require('../assets/images/5.png'),
  require('../assets/images/6.png'),
];


const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const MODEL_NAME = 'gemini-2.0-flash';

// Add a type for mood selections

type MoodSelection = {
  id: string;
  timestamp: any;
  emoji: string;
  [key: string]: any;
};

export default function EmotionalActivities(): JSX.Element {
  const [aiMoodMessage, setAiMoodMessage] = useState('');
const [loadingMessage, setLoadingMessage] = useState(false);

const getMoodMessageFromAI = async (emotion: string) => {
  try {
    setLoadingMessage(true);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,    
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `The user is currently feeling ${emotion}. Provide a short 2 sentence motivational statement to make the person feel better. Avoid cliches.`
                }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || aiMoodMessage || 'You got this!';
    setAiMoodMessage(result);
  } catch (err) {
    console.error('AI Mood Message Error:', err);
    setAiMoodMessage(aiMoodMessage  || 'Unable to fetch message at the moment.');
  } finally {
    setLoadingMessage(false);
  }
};


  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [period, setPeriod] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [moodDialogVisible, setMoodDialogVisible] = useState<boolean>(false);
  const router = useRouter();
  const [moodHistory, setMoodHistory] = useState(
    weekdays.map((day) => ({ day, emoji: '' }))
  );


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];

const toggleDropdown = (open: boolean) => {
  setIsDropdownOpen(open);
  Animated.timing(rotateAnim, {
    toValue: open ? 1 : 0,
    duration: 200,
    easing: Easing.inOut(Easing.ease),
    useNativeDriver: true,
  }).start();
};

const rotateInterpolate = rotateAnim.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '180deg'],
});


const stats = {
  overall: '68%',
  stress: '15%',
  inspiration: '86%',
};

const getEmojiForEmotion = (emotion: string) => {
  switch (emotion.toLowerCase()) {
    case 'joy':
      return '😊';
    case 'sadness':
      return '😢';
    case 'anger':
      return '😠';
    case 'fear':
      return '😨';
    case 'anxiety':
      return '😰';
    case 'inspiration':
      return '✨';
    case 'stress':
      return '😖';
    case 'neutral':
      return '😐';
    default:
      return '🤔';
  }
};

const emotionLabels = {
  overall: 'joy',
  stress: 'stress',
  inspiration: 'inspiration',
};

  const weeklyChart = [32, 61, 13, 18, 29, 74, 33];
  const monthlyChart = [20, 18, 12, 35, 44, 28, 16, 37, 50, 41, 39, 27];

  const [userId, setUserId] = useState<string | null>(null);
  const [moodSelections, setMoodSelections] = useState<any[]>([]);
  const [hasReactedToday, setHasReactedToday] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [mentalStatesData, setMentalStatesData] = useState<{ stress: number; anxiety: number; motivation: number }>({ stress: 0, anxiety: 0, motivation: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchMoods = async () => {
      const moodsRef = collection(db, 'users', userId, 'mood_selections');
      const q = query(moodsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const selections: MoodSelection[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp ?? null,
          emoji: data.emoji ?? '',
          ...data,
        };
      });
      setMoodSelections(selections);

      // Map moods to weekdays
      const weekMap = weekdays.map((day, idx) => {
        // Find a mood selection for this weekday (most recent)
        const found = selections.find(sel => {
          if (!sel.timestamp) return false;
          const date = sel.timestamp instanceof Date ? sel.timestamp : new Date(sel.timestamp.seconds ? sel.timestamp.seconds * 1000 : sel.timestamp);
          return date.getDay() === idx && date.toDateString() === new Date(date).toDateString();
        });
        return {
          day,
          emoji: found ? found.emoji : '',
        };
      });
      setMoodHistory(weekMap);
    };
    fetchMoods();
  }, [userId]);

  // Check if user has reacted today
  useEffect(() => {
    if (!moodSelections.length) {
      setHasReactedToday(false);
      return;
    }
    const today = new Date();
    const todayStr = today.toDateString();
    const todayReaction = moodSelections.find(sel => {
      if (!sel.timestamp) return false;
      const reactionDate = sel.timestamp instanceof Date ? sel.timestamp : new Date(sel.timestamp.seconds ? sel.timestamp.seconds * 1000 : sel.timestamp);
      return reactionDate.toDateString() === todayStr;
    });
    setHasReactedToday(!!todayReaction);
  }, [moodSelections]);

  // Add a live countdown for timeRemaining
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (hasReactedToday) {
      setTimeRemaining(getTimeRemainingString());
      interval = setInterval(() => {
        setTimeRemaining(getTimeRemainingString());
      }, 1000);
    } else {
      setTimeRemaining('');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasReactedToday]);

  useEffect(() => {
    if (!userId) return;
    const fetchMentalStates = async () => {
      const mentalStatesRef = collection(db, 'users', userId, 'mental_states');
      const q = query(mentalStatesRef, orderBy('timestamp', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setMentalStatesData({
          stress: data.stress || 0,
          anxiety: data.anxiety || 0,
          motivation: data.motivation || 0,
        });
      }
    };
    fetchMentalStates();
  }, [userId]);

  const handleMoodPress = async (mood: Mood): Promise<void> => {
    setSelectedMood(mood);
    setMoodDialogVisible(true);
    setMoodHistory(prev =>
      prev.map((entry, index) =>
        index === todayIndex ? { ...entry, emoji: getEmojiFromLabel(mood.label) } : entry
      )
    );
    if (userId) {
      try {
        await addDoc(
          collection(db, 'users', userId, 'mood_selections'),
          {
            mood: mood.label,
            emoji: getEmojiFromLabel(mood.label),
            ai_message: aiMoodMessage,
            timestamp: new Date(),
          }
        );
      } catch (err) {
        console.error('Error saving mood:', err);
      }
    }
  };

  const getEmojiFromLabel = (label: string): string => {
    switch (label.toLowerCase()) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😢';
      case 'good mood':
        return '😁';
      case 'annoyed':
        return '😒';
      case 'angry':
        return '😡';
      case 'tired':
        return '😴';
      case 'confused':
        return '😕';
      case 'confident':
        return '😎';
      default:
        return '��';
    }
  };  
  
  function getTimeRemainingString() {
    const now = new Date();
    const end = endOfDay(now);
    const seconds = differenceInSeconds(end, now);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')} Hours`;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#EFF2FF' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sentiment Analysis</Text>
        <View style={styles.iconGroup}>
          <Ionicons name="notifications-outline" size={23} color="#6549FE" style={{ marginRight: 10 }} />
          <Ionicons name="menu-outline" size={28} color="#6549FE" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Mood History */}
        <View style={{ marginTop: 10, paddingHorizontal: 20 , paddingBottom: 10}}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#44349B' }}>
          Mood History
        </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {moodHistory.map(({ day, emoji }, idx) => (
            <View key={idx} style={{ alignItems: 'center' }}>
              {emoji ? (
                <Text style={{ fontSize: 24 }}>{emoji}</Text>
              ) : (
                <Image
                  source={defaultEmoji}
                  style={{ width: 24, height: 24, resizeMode: 'contain' }}
                />
              )}
              <Text style={{ fontSize: 12 }}>{day}</Text>
            </View>
          ))}

          </View>
        </View>

        {/* Avatar Analysis Title */}
        <Text style={styles.analysisTitle}>Avatar Analysis</Text>

        {/* Avatar Analysis */}
        <View style={styles.avatarAnalysisWrapper}>
          <View style={styles.avatarSection}>
            <Image 
              source={require('../assets/images/avatarSectionBg.png')} 
              style={styles.avatarBackgroundImage} 
            />

          <View style={styles.statBoxWrapper}>
            {Object.entries(stats).map(([key, value]) => (
              <View key={key} style={styles.statBox}>
                <Text style={[styles.statEmoji, { fontSize: 30, marginRight: 10 }]}>
                {getEmojiForEmotion(emotionLabels[key as keyof typeof emotionLabels])}
                </Text>
                <View>
                  <Text style={styles.statLabel}>
                    {key === 'overall' ? 'Overall Stats' : key === 'stress' ? 'Stress Level' : 'Motivation Level'}
                  </Text>
                  <Text style={styles.statValue}>{value}</Text>
                </View>
              </View>
            ))}
          </View>

          </View>

          {/* Avatar Image outside to allow overflow */}
          <View style={styles.avatarImageContainer}>
            <Image 
              source={require('../assets/images/heartAvatar.png')} 
              style={styles.avatarImage} 
            />
          </View>
        </View>

        {/* Journal Container */}
        <TouchableOpacity
          onPress={() => router.push('./journalManager')}
          style={{
            marginHorizontal: 20,
            marginTop: 5,
            borderRadius: 20,
            backgroundColor: '#9a90ff',
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            marginBottom: 12,
          }}
        >
          {/* Notebook Icon */}
          <Image
            source={require('../assets/images/notebookIcon.png')}
            style={{
              width: 70,
              height: 70,
              marginRight: 10,
            }}
          />

          {/* Text Content */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              View Your Journal
            </Text>
            <Text style={{ color: '#E0DEFF', fontSize: 12, marginTop: 2 }}>
              Tap to explore your entries
            </Text>
          </View>

          {/* Arrow Icon */}
          <Ionicons name="arrow-forward-circle" size={32} color="#fff" />
        </TouchableOpacity>



        {/* Mood Section Container */}
        <View style={[styles.moodContainer, { marginBottom: 12 }]}>
          {!hasReactedToday && (
            <Text style={styles.prompt}>How are you feeling today?</Text>
          )}
          {hasReactedToday ? (
            <View style={{
              position: 'absolute',
              top: -16,
              left: 0,
              right: 0,
              bottom: -16,
              backgroundColor: '#fff',
              borderRadius: 20,
              zIndex: 10,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}>
              <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
                You can only react once a day!
              </Text>
              <Text style={{ color: '#222', fontSize: 16, marginTop: 8, textAlign: 'center' }}>
                Time Remaining: {timeRemaining}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodList}>
              {moods.map((mood, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    handleMoodPress(mood);
                    setSelectedMood(mood);
                    getMoodMessageFromAI(mood.label);
                  }}
                  style={styles.moodItem}
                >
                  <Image source={mood.gif} style={styles.moodGif} />
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {loadingMessage ? (
            <Text style={{ color: '#666', marginTop: 10, marginHorizontal: 20 }}>
              Loading supportive message...
            </Text>
          ) : aiMoodMessage ? (
            <View
              style={{
                marginTop: 10,
                marginHorizontal: 10,
                padding: 18,
                backgroundColor: '#F5F2FF',
                borderLeftWidth: 5,
                borderLeftColor: '#6549FE',
                borderRadius: 14,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Text style={{ color: '#6549FE', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>
                Quote of the Day
              </Text>
              <Text style={{ color: '#3E3E3E', fontSize: 15, lineHeight: 22 }}>
                {aiMoodMessage}
              </Text>
            </View>
          ) : null}
        </View>


        

      {/* Mental States Chart */}
      <View style={[styles.emotionGraphWrapper, { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, marginBottom: 22 }]}>
      <Text style={[styles.chartTitle, { marginBottom: 10 }]}>My Mental State Scale</Text>
        <LineChart
          data={{
            labels: ['Stress', 'Anxiety', 'Motivation'],
            datasets: [
              {
                data: [mentalStatesData.stress, mentalStatesData.anxiety, mentalStatesData.motivation],
                strokeWidth: 3,
              },
            ],
          }}
          width={Dimensions.get('window').width - 60}
          height={220}
          withShadow={true}
          withInnerLines={false}
          withOuterLines={false}
          withDots={true}
          yAxisInterval={0.1}
          chartConfig={{
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(101, 73, 254, ${opacity})`,
            labelColor: () => '#332C64',
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#6549FE',
              fill: '#fff',
            },
          }}
          bezier
          style={{
            borderRadius: 50,
          }}
        />
      </View>


      {/* Enhanced Emoji Mood Radar */}
      <View style={[styles.chartWrapperContainer, {
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 20,
          marginHorizontal: 20,
          marginBottom: 5,
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 6,
        }]}>
          <Text style={[styles.chartTitle, { marginBottom: 10 }]}>My Mood Radar</Text>

          <Dropdown
            style={styles.dropdownPicker}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={[
              { label: 'Weekly', value: 'Weekly' },
              { label: 'Monthly', value: 'Monthly' },
            ]}
            maxHeight={150}
            labelField="label"
            valueField="value"
            value={period}
            onChange={item => setPeriod(item.value)}
            onFocus={() => toggleDropdown(true)}
            onBlur={() => toggleDropdown(false)}
            renderRightIcon={() => (
              <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                <Ionicons name="chevron-down" size={16} color="#6549FE" />
              </Animated.View>
            )}
            containerStyle={styles.dropdownContainer}
            itemContainerStyle={styles.dropdownItemContainer}
            itemTextStyle={styles.dropdownItemText}
          />

          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Svg width={320} height={320}>
              {(() => {
                const width = 320;
                const radius = 100;
                const center = width / 2;
                const labels = [
                  { emoji: '😊', name: 'Happy' },
                  { emoji: '😢', name: 'Sad' },
                  { emoji: '😁', name: 'Good Mood' },
                  { emoji: '😒', name: 'Annoyed' },
                  { emoji: '😡', name: 'Angry' },
                  { emoji: '😴', name: 'Tired' },
                  { emoji: '😕', name: 'Confused' },
                  { emoji: '😎', name: 'Confident' },
                ];
                const data = period === 'Weekly'
                  ? [65, 40, 70, 35, 20, 50, 45, 60]
                  : [50, 30, 55, 25, 15, 35, 40, 70];

                const angleStep = (2 * Math.PI) / data.length;
                const maxIndex = data.indexOf(Math.max(...data));
                const dominant = labels[maxIndex];

                const getPoint = (value: number, index: number) => {
                  const angle = angleStep * index - Math.PI / 2;
                  const r = (value / 100) * radius;
                  return {
                    x: center + r * Math.cos(angle),
                    y: center + r * Math.sin(angle),
                  };
                };

                const polygonPoints = data.map(getPoint);
                const pointString = polygonPoints.map(p => `${p.x},${p.y}`).join(' ');

                return (
                  <>
                    <Circle cx={center} cy={center} r={radius} fill="rgba(245,240,255,0.5)" />
                    {[0.25, 0.5, 0.75, 1].map((level, i) => (
                      <Circle
                        key={`ring-${i}`}
                        cx={center}
                        cy={center}
                        r={radius * level}
                        stroke="#eee"
                        strokeWidth={1}
                        fill="none"
                      />
                    ))}
                    {data.map((_, i) => {
                      const angle = angleStep * i - Math.PI / 2;
                      return (
                        <Line
                          key={`line-${i}`}
                          x1={center}
                          y1={center}
                          x2={center + radius * Math.cos(angle)}
                          y2={center + radius * Math.sin(angle)}
                          stroke="#ccc"
                          strokeDasharray="4"
                        />
                      );
                    })}
                    <Polygon
                      points={pointString}
                      fill="rgba(101, 73, 254, 0.3)"
                      stroke="#6549FE"
                      strokeWidth={2}
                    />
                    {labels.map((item, i) => {
                      const angle = angleStep * i - Math.PI / 2;
                      const x = center + (radius + 24) * Math.cos(angle);
                      const y = center + (radius + 24) * Math.sin(angle);
                      return (
                        <React.Fragment key={i}>
                          <SvgText
                            x={x}
                            y={y - 12}
                            fontSize="20"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                          >
                            {item.emoji}
                          </SvgText>
                          <SvgText
                            x={x}
                            y={y + 10}
                            fontSize="12"
                            fill="#444"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                          >
                            {item.name}
                          </SvgText>
                        </React.Fragment>
                      );
                    })}
                  </>
                );
              })()}
            </Svg>

            {/* Dominant Mood */}
            <View style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#888' }}>Dominant Mood</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6549FE' }}>
                {(() => {
                  const labels = [
                    'Happy', 'Sad', 'Good Mood', 'Annoyed',
                    'Angry', 'Tired', 'Confused', 'Confident'
                  ];
                  const data = period === 'Weekly'
                    ? [65, 40, 70, 35, 20, 50, 45, 60]
                    : [50, 30, 55, 25, 15, 35, 40, 70];
                  const maxIndex = data.indexOf(Math.max(...data));
                  return labels[maxIndex];
                })()}
              </Text>
            </View>
          </View>
        </View>




        {/* Recommendations */}
        <Text style={styles.recommendationTitle}>Recommendation</Text>
        {["Engage in Activities You Enjoy", "Connect with Positive People", "Set Personal Goals and Celebrate Small Wins", "Practice Gratitude Daily"].map((tip, i) => (
          <View key={i} style={styles.tipBox}>
            <Text style={styles.tipTitle}>{tip}</Text>
            <Text style={styles.tipText}>Sample tip description for: {tip}</Text>
          </View>
        ))}
      </ScrollView>

      <Modal visible={moodDialogVisible} transparent animationType="fade">
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogBox}>
          {/* Sparkle gifs (only 2) */}
          <Image
            source={require('../assets/images/star.gif')}
            style={[styles.sparkle, { top: 50, left: 5 }]}
          />
          <Image
            source={require('../assets/images/star.gif')}
            style={[styles.sparkle, { bottom: 170, right: 2 }]}
          />

          {/* Title */}
          {selectedMood?.label === 'Good Mood' ? (
            <>
              <Text style={[styles.dialogTitle, { marginBottom: 5 }]}>You're in a</Text>
              <Text style={styles.dialogTitle}>Good Mood!</Text>
            </>
          ) : (
            <Text style={styles.dialogTitle}>You're {selectedMood?.label}!</Text>
          )}

          {/* Emoji GIF */}
          <View style={styles.dialogEmojiContainer}>
            <Image
              source={selectedMood?.gif}
              style={styles.dialogEmoji}
            />
          </View>

          {/* Description */}
          <Text style={styles.dialogDescription}>
            {selectedMood?.label && aiMoodMessage }
          </Text>

          {/* OK Button */}
          <TouchableOpacity style={styles.okButton} onPress={() => setMoodDialogVisible(false)}>
            <Text style={styles.okButtonText}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
      
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
  container: { paddingBottom: 85 },
  header: {
    paddingTop: 20,
    width: width,
    height: 75,
    paddingBottom: 20,
    backgroundColor: '#fff', 
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#44349B', marginRight: 30},
  iconGroup: { flexDirection: 'row', alignItems: 'center' },
  greeting: { fontSize: 25, color: '#6549FE', fontWeight: 'medium', paddingHorizontal: 22, marginBottom: 10, marginTop: 25 },
  avatarSection: {
    margin: 15,
    marginTop: 10,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
    position: 'relative',
    height: 200,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  avatarBackgroundImage: {
    borderRadius: 15,
    zIndex: -1,
    position: 'absolute',
    width: '110%',
    height: '120%',
    resizeMode: 'stretch',
  },
  statBoxWrapper: { gap: 0, marginTop: 50, marginBottom: 40},
  statBox: {
    height: 50,
    width: 180,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 7,
  },
  statEmoji: {
    width: 35,
    height: 50,
    resizeMode: 'contain',
    marginRight: 15,
  },  
  statLabel: { color: '#6549FE', fontWeight: '600' },
  statValue: { color: '#FFA500', fontSize: 16, fontWeight: 'bold' },
  avatarImage: {
    position: 'absolute',
    width: 190, // make it wider
    height: 280, // make it taller
    right: -15, // shift more to the right
    bottom: -16, // shift more downward
    resizeMode: 'contain',
    zIndex: 2,
  },
  
  avatarAnalysisWrapper: {
    position: 'relative',
  },
  
  avatarImageContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 2,
  },  
  prompt: { fontSize: 18, color: '#44349B', fontWeight: 'medium', paddingHorizontal: 20, alignSelf: 'center' },
  moodBar: {
    width: '90%',
    height: 60,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 50,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    overflow: 'hidden',
  },  
  moodGifLarge: {
    width: '120%',
    height: '100%',
    resizeMode: 'cover',
    alignSelf: 'center',
  },  
  moodList: { marginTop: 10 },
  moodItem: { alignItems: 'center', marginHorizontal: 7 },
  moodGif: { width: 85, height: 85, resizeMode: 'cover', borderRadius: 20 },
  moodLabel: { color: '#666', marginTop: 5 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', marginTop: 20 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#44349B' },
  dropdown: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#fff', borderRadius: 15, elevation: 2 },
  dropdownText: { color: '#777', marginRight: 5 },
  chartContainer: { flexDirection: 'row', paddingLeft: 2, marginTop: 10 },
  chartBarWrapper: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  barLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  chartEmoji: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  chartBarOuter: {
    width: 30,
    height: 105,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginTop: 5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  chartBarInner: {
    width: '100%',
    backgroundColor: '#FF7A7A',
    borderRadius: 20,
  },
  barDay: {
    fontSize: 13,
    marginTop: 3,
    color: '#6549FE',
  },  
  chartBar: { width: 20, backgroundColor: '#FFA9A9', borderRadius: 10 },
  recommendationTitle: { fontSize: 18, fontWeight: 'bold', color: '#44349B', margin: 20 },
  tipBox: { 
  backgroundColor: '#fff', 
  marginHorizontal: 20, 
  marginBottom: 10, 
  padding: 15, 
  borderRadius: 15, 
  elevation: 5, 
  },
  tipTitle: { color: '#6549FE', fontWeight: 'medium', fontSize: 14 },
  tipText: { color: '#666', marginTop: 5 },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  dialogBox: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    position: 'relative',
  },
  
  dialogTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#6549FE',
    textAlign: 'center',
    marginBottom: 20,
  },
  dialogEmojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 25,
    backgroundColor: '#A4C0CB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden'
  },
  
  dialogEmoji: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  
  dialogDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 0,
    lineHeight: 20,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  emotionGraphWrapper: {
    marginHorizontal: 20,
    marginTop: 20,
  },  
  
  okButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 14,
    paddingHorizontal: 100,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  okButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sparkle: {
    position: 'absolute',
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },  
  dialogText: { color: '#333', fontSize: 16 },
  analysisTitle: {
    fontSize: 18,
    color: '#44349B',
    fontWeight: 'bold',
    paddingHorizontal: 22,
  },  
  moodContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  moodHistoryContainer: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  moodHistoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#332C64',
    marginBottom: 8,
  },
  moodHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodColumn: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  day: {
    fontSize: 10,
    color: '#332C64',
    marginTop: 2,
  },  
  chartWrapperContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginHorizontal: 15,
    marginTop: 15,
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
  dropdownPicker: {
    width: 100,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  
  selectedTextStyle: {
    fontSize: 14,
    color: '#AEAEAE',
  },
  
  dropdownContainer: {
    borderRadius: 10,
    elevation: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  
  dropdownItemContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  
  dropdownItemText: {
    fontSize: 14,
    color: '#6549FE',
  },  
});
 