import React, { useState } from 'react';
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

const moodMessages: { [key: string]: string } = {
  'Happy': 'Happiness fuels your dreams and drives your purpose. Use that energy to conquer mountains and turn every moment into a victory.',
  'Sad': 'It’s okay to feel down sometimes. Think of it as the valley before the peak—your happiness will return, stronger than before.',
  'Good Mood': 'When you’re riding the waves of a good mood, let it propel you to reach new heights. Embrace the feeling and let it fuel your dreams.',
  'Annoyed': 'Annoyance is just a signal that something needs your attention. Channel that energy into solving the problem and reclaim your peace.',
  'Angry': 'Anger is a powerful force—use it to fuel your resilience, not your regrets. Take control and turn that energy into something productive.',
  'Tired': 'When you’re tired, remember that rest is just as important as action. Recharge, regroup, and come back stronger.',
  'Confused': 'When confusion clouds your mind, let it be a sign that you\'re growing. Embrace the uncertainty, ask questions, and clarity will follow.',
  'Confident': 'Confidence isn’t just believing you can succeed; it’s knowing you will. Embrace it, own it, and let your light shine bright.',
};

export default function EmotionalActivities(): JSX.Element {
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [period, setPeriod] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [moodDialogVisible, setMoodDialogVisible] = useState<boolean>(false);
  const router = useRouter();

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

  const handleMoodPress = (mood: Mood): void => {
    setSelectedMood(mood);
    setMoodDialogVisible(true);
  };

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
        {/* Greeting */}
        <Text style={styles.greeting}>You're inspired lately!</Text>

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
                    {key === 'overall' ? 'Overall Stats' : key === 'stress' ? 'Stress Level' : 'Inspiration Level'}
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

        {/* Journal Button */}
        <TouchableOpacity
          onPress={() => router.push('./journalManager')}
          style={{
            marginHorizontal: 20,
            marginTop: 8,
            borderRadius: 20,
            backgroundColor: '#9a90ff',
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              View Your Journal
            </Text>
            <Text style={{ color: '#E0DEFF', fontSize: 12, marginTop: 2 }}>
              Tap to explore your entries
            </Text>
          </View>

          <Ionicons name="arrow-forward-circle" size={32} color="#fff" />
        </TouchableOpacity>



        {/* Mood Section Container */}
        <View style={styles.moodContainer}>
          <Text style={styles.prompt}>How are you feeling today?</Text>
          <View style={styles.moodBar}>
          <Image source={require('../assets/images/feelingToday.gif')} style={styles.moodGifLarge} />
        </View>

          {/* Horizontal Mood Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodList}>
            {moods.map((mood, idx) => (
              <TouchableOpacity key={idx} onPress={() => handleMoodPress(mood)} style={styles.moodItem}>
                <Image source={mood.gif} style={styles.moodGif} />
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>


        {/* Mood Chart */}
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Mood Chart</Text>
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
            onChange={item => {
              setPeriod(item.value);
            }}
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
        </View>

        <View style={styles.chartWrapperContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chartContainer}
          >
            {(period === 'Weekly' ? weeklyChart : monthlyChart).map((val: number, index: number) => {
              const moodIndex = index % moods.length;
              const colors = moodColors[moodIndex];
              const percentage = val; // Assuming val is already a percentage

              return (
                <View key={index} style={styles.chartBarWrapper}>
                  <Text style={styles.barLabel}>{percentage}%</Text>

                  <Image
                    source={moodEmojis[moodIndex] ?? moodEmojis[0]}
                    style={styles.chartEmoji}
                  />

                  <View style={{ height: 5 }} />

                  <View style={[styles.chartBarOuter, { borderColor: colors.background }]}>
                    <View style={[styles.chartBarInner, { height: `${percentage}%`, backgroundColor: colors.fill }]} />
                  </View>

                  <Text style={styles.barDay}>
                    {period === 'Weekly'
                      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]
                      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
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
              <Text style={[styles.dialogTitle, { marginBottom: 5 }]}>You’re in a</Text>
              <Text style={styles.dialogTitle}>Good Mood!</Text>
            </>
          ) : (
            <Text style={styles.dialogTitle}>You’re {selectedMood?.label}!</Text>
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
            {selectedMood?.label && moodMessages[selectedMood.label]}
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
  prompt: { fontSize: 18, color: '#6549FE', fontWeight: 'medium', paddingHorizontal: 20, alignSelf: 'center' },
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
    fontSize: 20,
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
 