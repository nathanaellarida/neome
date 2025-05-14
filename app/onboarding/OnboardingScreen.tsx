import { StyleSheet, Text, View, Image, ImageBackground, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import React, { useState } from 'react';
import PagerView from 'react-native-pager-view';
import { router } from 'expo-router';

// Get device width and height for dynamic sizing
const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      {/* Onboarding Swiper */}
      <PagerView 
        style={{ flex: 1 }} 
        initialPage={0} 
        onPageSelected={(e) => setCurrentIndex(e.nativeEvent.position)}
      >
        {/* Slide 1 */}
        <View key="1" style={styles.container}>
          <ImageBackground source={require('../assets/images/bg1.png')} style={styles.backgroundImage}>
            <Image source={require('../assets/images/slide1.png')} style={styles.image} />
          </ImageBackground>
        </View>

        {/* Slide 2 */}
        <View key="2" style={styles.container}>
          <ImageBackground source={require('../assets/images/bg2.png')} style={styles.backgroundImage}>
            <Image source={require('../assets/images/slide2.png')} style={styles.image} />
          </ImageBackground>
        </View>

        {/* Slide 3 */}
        <View key="3" style={styles.container}>
          <ImageBackground source={require('../assets/images/bg3.png')} style={styles.backgroundImage}>
            <Image source={require('../assets/images/slide3.png')} style={styles.image} />
          </ImageBackground>
        </View>

        {/* Slide 4 (Final Slide) */}
        <View key="4" style={styles.container}>
          <ImageBackground source={require('../assets/images/bg4.png')} style={styles.backgroundImage}>
            <Image source={require('../assets/images/slide4.png')} style={styles.image} />
          </ImageBackground>
        </View>
      </PagerView>

      {/* Skip Button (Visible on First 3 Pages) */}
      {currentIndex < 3 && (
        <TouchableOpacity style={styles.skipButton} onPress={() => router.push("/neome_userdata_app/UserDataScreen1")}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
        ))}
      </View>

      {/* "Get Started" Button (Visible Only on Last Slide) */}
      {currentIndex === 3 && (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.getStartedButton} onPress={() => router.push("/neome_userdata_app/UserDataScreen1")}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 2,
    height: height * 1.1,
    resizeMode: 'cover',
    padding: 190,
    marginTop: -100,
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    borderRadius: 20,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#6549FE',
  },
  activeDot: {
    backgroundColor: '#6549FE', // Active dot color (main color preference)
    width: 22,
    height: 15,
  },
  getStartedButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
