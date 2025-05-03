import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  ActivityIndicator, Animated, Dimensions, Modal, Platform, Alert, Linking,
  SafeAreaView, PanResponder
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../../firebaseConfig';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

interface Photo {
  id: string;
  uri: string;
  height: number;
  width: number;
}

interface PhotoGalleryModalProps {
  visible: boolean;
  onClose: () => void;
  chatId: string;
  onImageSelected: (imagePath: string) => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.75;
const FULL_HEIGHT = SCREEN_HEIGHT;
const DRAG_THRESHOLD = 100;

const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({ 
  visible, 
  onClose, 
  chatId,
  onImageSelected
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const lastGestureDy = useRef(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        slideAnim.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        const initialPosition = SCREEN_HEIGHT - MODAL_HEIGHT;
        const newPosition = Math.max(0, Math.min(initialPosition + gestureState.dy, SCREEN_HEIGHT));
        slideAnim.setValue(newPosition);
      },
      onPanResponderRelease: (_, gestureState) => {
        const initialPosition = SCREEN_HEIGHT - MODAL_HEIGHT;
        
        if (gestureState.dy > DRAG_THRESHOLD) {
          // Close with animation if dragged down past threshold
          closeWithAnimation();
        } else if (gestureState.dy < -DRAG_THRESHOLD) {
          // Expand if dragged up past threshold
          setIsFullScreen(true);
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 65
          }).start();
        } else {
          // Return to original position
          setIsFullScreen(false);
          Animated.spring(slideAnim, {
            toValue: initialPosition,
            useNativeDriver: true,
            friction: 8,
            tension: 65
          }).start();
        }
      }
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setIsFullScreen(false);
      fadeAnim.setValue(1);
      checkPermissions();
      slideIn();
    } else {
      slideOut();
    }
  }, [visible]);

  useEffect(() => {
    console.log('Selected photo changed:', selectedPhoto?.id || 'none');
  }, [selectedPhoto]);

  useEffect(() => {
    console.log('Selected photo state:', selectedPhoto);
    console.log('Button should be visible:', !!selectedPhoto);
  }, [selectedPhoto]);

  useEffect(() => {
    console.log('Send button component rendered');
  }, []);

  const slideIn = () => {
    Animated.spring(slideAnim, {
      toValue: SCREEN_HEIGHT - MODAL_HEIGHT,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(onClose);
  };

  const checkPermissions = async () => {
    try {
      console.log('Checking permissions...');
      if (Platform.OS !== 'web') {
        const { status, granted } = await MediaLibrary.getPermissionsAsync();
        console.log('Permission status:', status, 'Granted:', granted);
        
        setPermissionGranted(status === 'granted');
        
        if (status === 'granted') {
          console.log('Permission already granted, loading photos...');
          loadPhotos();
        } else {
          console.log('Permission not granted, requesting...');
          requestPermissions();
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      console.log('Requesting permissions...');
      const { status, granted } = await MediaLibrary.requestPermissionsAsync();
      console.log('Permission request result:', status, 'Granted:', granted);
      
      setPermissionGranted(status === 'granted');
      
      if (status === 'granted') {
        console.log('Permission granted, loading photos...');
        loadPhotos();
      } else {
        console.log('Permission denied');
        Alert.alert(
          'Permission Required',
          'Please enable photo library access in your device settings to view photos.',
          [
            { 
              text: 'Open Settings', 
              onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings() 
            },
            { text: 'Cancel', onPress: onClose, style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const loadPhotos = async () => {
    try {
      console.log('Starting to load photos...');
      setLoading(true);
      
      // Get all photo assets
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        first: 50,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      console.log('Found photos:', assets.length);

      if (assets.length === 0) {
        console.log('No photos found in the library');
        setLoading(false);
        return;
      }

      // Get proper URIs for the assets
      const formattedPhotos = await Promise.all(
        assets.map(async (asset) => {
          try {
            // Get the asset info which contains the proper localUri
            const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
            return {
              id: asset.id,
              uri: assetInfo.localUri || asset.uri,
              height: asset.height || 300,
              width: asset.width || 300,
            };
          } catch (error) {
            console.error('Error getting asset info:', error);
            return null;
          }
        })
      );

      // Filter out any null values from failed asset info requests
      const validPhotos = formattedPhotos.filter((photo): photo is Photo => photo !== null);

      console.log('Formatted photos:', validPhotos.length);
      setPhotos(validPhotos);
      // Clear any previous selection
      setSelectedPhoto(null);
      
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (photo: Photo) => {
    console.log('Photo selected:', photo.id);
    // Toggle selection - if already selected, deselect it
    if (selectedPhoto && selectedPhoto.id === photo.id) {
      setSelectedPhoto(null);
    } else {
      setSelectedPhoto(photo);
    }
  };

  const handleSendPhoto = async () => {
    console.log('Send button pressed');
    if (!selectedPhoto) {
      Alert.alert('Selection Required', 'Please select a photo to send');
      return;
    }

    const imagePath = await uploadImage(selectedPhoto.uri);
    if (imagePath) {
      onImageSelected(imagePath);
      onClose();
    }
  };

  const compressImage = async (uri: string): Promise<string> => {
    try {
      const result = await manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      return result.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri; // Return original URI if compression fails
    }
  };

  const uploadImage = async (uri: string) => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to upload images');
      return null;
    }

    try {
      setUploading(true);
      
      // Compress the image before uploading
      const compressedUri = await compressImage(uri);
      
      // Convert URI to blob
      const response = await fetch(compressedUri);
      const blob = await response.blob();
      
      // Create unique filename
      const filename = `chat_images/${chatId}/${auth.currentUser.uid}_${Date.now()}`;
      const storage = getStorage();
      const storageRef = ref(storage, filename);
      
      // Debug log
      console.log('Uploading to:', filename);
      
      // Upload blob to Firebase Storage
      await uploadBytes(storageRef, blob);
      
      // Get download URL (not needed but good for verification)
      await getDownloadURL(storageRef);
      return filename; // Return storage path to be stored in Firestore
    } catch (error: any) {
      // Improved error logging
      console.error('Error uploading image:', error);
      if (error && error.serverResponse) {
        console.error('Server response:', error.serverResponse);
      }
      Alert.alert('Upload Failed', `Failed to upload image. ${error?.message || ''}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const renderPhoto = ({ item }: { item: Photo }) => {
    const isSelected = selectedPhoto?.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.photoItem,
          isSelected && styles.selectedPhoto
        ]}
        onPress={() => handlePhotoSelect(item)}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: item.uri }} 
          style={styles.thumbnail}
          resizeMode="cover"
          onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
        />
        {isSelected && (
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#6549FE" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const closeWithAnimation = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={closeWithAnimation}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.dismissArea} 
          activeOpacity={1}
          onPress={closeWithAnimation}
        />
        
        <View style={styles.modalWrapper}>
          <Animated.View 
            style={[
              styles.modalContainer,
              { 
                transform: [{ translateY: slideAnim }],
                height: isFullScreen ? FULL_HEIGHT : MODAL_HEIGHT,
                opacity: fadeAnim
              }
            ]}
          >
            <SafeAreaView style={styles.safeArea}>
              <View {...panResponder.panHandlers}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <Text style={styles.headerTitle}>Photo Gallery</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={closeWithAnimation}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Main content area: photos grid */}
              <View style={styles.mainContainer}>
                {loading ? (
                  <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#6549FE" />
                    <Text style={styles.loadingText}>Loading photos...</Text>
                  </View>
                ) : (
                  <View style={styles.contentContainer}>
                    {photos.length > 0 ? (
                      <FlatList
                        data={photos}
                        renderItem={renderPhoto}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        contentContainerStyle={styles.photoGrid}
                        removeClippedSubviews={false}
                        initialNumToRender={12}
                        maxToRenderPerBatch={12}
                        windowSize={5}
                      />
                    ) : (
                      <View style={styles.noPhotosContainer}>
                        <Text style={styles.noPhotosText}>No photos available</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </SafeAreaView>

            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.uploadingText}>Uploading photo...</Text>
              </View>
            )}
          </Animated.View>

          {/* Send Button in its own container */}
          <View style={styles.sendButtonContainer}>
            <TouchableOpacity 
              onPress={handleSendPhoto} 
              style={[
                styles.sendButton,
                !selectedPhoto && styles.sendButtonDisabled
              ]}
              disabled={!selectedPhoto}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    position: 'relative',
    height: MODAL_HEIGHT,
  },
  modalContainer: {
    backgroundColor: '#242424',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  sendButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    padding: 30,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  sendButton: {
    backgroundColor: '#4B70F4',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    opacity: 1,
  },
  sendButtonDisabled: {
    backgroundColor: '#4B70F4',
    opacity: 0,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dismissArea: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#242424',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#888',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'relative',
    backgroundColor: '#242424',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#242424',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#242424',
    marginBottom: 80, // Space for the button
  },
  photoGrid: {
    padding: 4,
  },
  photoItem: {
    flex: 1/3,
    aspectRatio: 1,
    margin: 1,
    position: 'relative',
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  selectedPhoto: {
    borderWidth: 3,
    borderColor: '#6549FE',
  },
  checkmarkContainer: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  loadingText: {
    marginTop: 10,
    color: '#6549FE',
    fontSize: 16,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 20, // Higher than the send button
  },
  uploadingText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noPhotosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotosText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default PhotoGalleryModal;