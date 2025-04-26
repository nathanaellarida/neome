import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

interface AudioRecorderProps {
  onRecordingComplete: (audioPath: string) => void;
  chatId: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, chatId }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone access to record audio.');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Generate a unique filename for the audio
      const timestamp = new Date().getTime();
      const filename = `audio_${timestamp}.m4a`;
      const storagePath = `chats/${chatId}/audio/${filename}`;

      // Upload the audio file
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, blob);

      // Clean up the recording
      setRecording(null);
      setIsRecording(false);

      // Pass the storage path back to the parent component
      onRecordingComplete(storagePath);

    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
      setRecording(null);
      setIsRecording(false);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.iconButton} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={isRecording ? "stop-circle-outline" : "mic-outline"} 
        size={24} 
        color={isRecording ? "#FF0000" : "#000000"} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,
    borderRadius: 22,
  },
});

export default AudioRecorder;