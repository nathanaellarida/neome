import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';  // ✅ Import router
import { Image } from 'react-native';

const femaleAvatar = require('../assets/images/femalepic.png');  
const maleAvatar = require('../assets/images/malepic.png');  

export default function UserDataScreen1() {
  const { width, height } = Dimensions.get('window'); 
  const scaleWidth = width / 1080;
  const scaleHeight = height / 1920;
  const router = useRouter(); // ✅ Correct way to use router

  return (
    <View style={styles.container}>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { top: 90 * scaleHeight, right: 60* scaleWidth }]}>
        <Text style={[styles.progressText, { fontSize: 40 * scaleWidth }]}>1/8</Text>
      </View>

      {/* Progress Bar Status */}
      <View style={[styles.progressStatus, { top: 105 * scaleHeight, left: 180* scaleWidth }]}>
      </View>

      {/* Progress Bar Status Colored */}
              <View style={[styles.progressStatusColored, { top: 72 * scaleHeight, left: 180* scaleWidth }]}>
                        </View>

      {/* Title */}
      <Text style={[styles.title, {top: 244 * scaleHeight, fontSize: 75 * scaleWidth}]}>
        Tell Us About Yourself!
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { top: 362 * scaleHeight, fontSize: 50 * scaleWidth }]}>
        To give you a better experience, we need to know your gender
      </Text>

      {/* Gender Buttons */}
      <View style={[styles.genderButtonsContainer, { top: 675 * scaleHeight, paddingHorizontal: 85 * scaleWidth }]}>
        {/* Male Button */}
        <TouchableOpacity style={[styles.genderButton, styles.maleButton, { width: 442 * scaleWidth, height: 608 * scaleHeight }]}>
          <Text style={[styles.genderButtonText, { fontSize: 60 * scaleWidth }]}>Male</Text>
        </TouchableOpacity>

        {/* Female Button */}
        <TouchableOpacity style={[styles.genderButton, styles.femaleButton, { width: 442 * scaleWidth, height: 608 * scaleHeight, marginLeft: -80 * scaleWidth }]}>
          <Text style={[styles.genderButtonText, { fontSize: 60 * scaleWidth }]}>Female</Text>
        </TouchableOpacity>
      </View>

      {/* Female Avatar */}
      <Image source={femaleAvatar} style={styles.femaleAvatar} resizeMode="contain" />
      {/* Male Avatar */}
      <Image source={maleAvatar} style={styles.maleAvatar} resizeMode="contain" />

      {/* Next Button */}
      <TouchableOpacity 
        style={[styles.nextButton, { left: 162 * scaleWidth, top: 1681 * scaleHeight, width: 757 * scaleWidth, height: 135 * scaleHeight }]} 
        onPress={() => router.push('/neome_userdata_app/userdatascreen')} // ✅ Added navigation
      >
        <Text style={[styles.nextButtonText, { fontSize: 48 * scaleWidth }]}>Next</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  femaleAvatar: {
    position: 'absolute',
    top: 270,
    width: 158,
    height: 158, 
    left: 180
  },
  maleAvatar: {
    position: 'absolute',
    top: 270,
    width: 158,
    height: 158, 
    right: 180
  },
  progressStatus: {
    width: 240, // Same width & height
    height: 12,
    backgroundColor: '#F3F6FF',
    borderRadius: 80,
  },
  progressStatusColored: {
    width: 30, // Same width & height
    height: 12,
    backgroundColor: '#6549FE',
    borderRadius: 80,
  },
  progressBarContainer: {
    position: 'absolute',
     color: '#AEAEAE',
  },
  progressText: {
    fontWeight: '600',
    color: '#6549FE',
  },
  title: {
    position: 'absolute',
    fontWeight: '600',
    color: '#6549FE',
    width: '100%',
    textAlign: 'center'
  },
  subtitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: '#AEAEAE',
    width: '100%',
    textAlign: 'center'

  },
  genderButtonsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  genderButton: {
    backgroundColor: '#F3F6FF',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  maleButton: {
    marginRight: 30,
  },
  femaleButton: {
    marginLeft: 30,
  },
  genderButtonText: {
    fontWeight: '600',
    color: '#6549FE',
    marginBottom: 20,
  },
  nextButton: {
    position: 'absolute',
    backgroundColor: '#6549FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 67,
  },
  nextButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
});