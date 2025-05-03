import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ActivityIndicator, Dimensions, Animated, PanResponder } from 'react-native';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

interface StickerPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  onStickerSelect: (url: string) => void;
}

interface StickerItem {
  name: string;
  url: string;
}

const STICKERS = [
  {
    name: 'HAHAHA',
    url: 'https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/neome_stickers%2FHAHAHA.png?alt=media&token=9388af1c-b58e-4511-8aac-c9e3e4e2945d',
  },
  {
    name: 'awesome',
    url: 'https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/neome_stickers%2Fawesome.png?alt=media&token=YOUR_TOKEN',
  },
  {
    name: 'feelingpretty',
    url: 'https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/neome_stickers%2Ffeelingpretty.png?alt=media&token=YOUR_TOKEN',
  },
  {
    name: 'godbless',
    url: 'https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/neome_stickers%2Fgodbless.png?alt=media&token=YOUR_TOKEN',
  },
  {
    name: 'goodjob',
    url: 'https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/neome_stickers%2Fgoodjob.png?alt=media&token=YOUR_TOKEN',
  },
  {
    name: 'hi',
    url: 'https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/neome_stickers%2Fhi.png?alt=media&token=YOUR_TOKEN',
  },
  {
    name: 'salamatpo',
    url: 'https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/neome_stickers%2Fsalamatpo.png?alt=media&token=YOUR_TOKEN',
  },
  {
    name: 'thumbs-up',
    url: 'https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/neome_stickers%2Fthumbs-up.png?alt=media&token=YOUR_TOKEN',
  },
  {
    name: 'yassghurl',
    url: 'https://firebasestorage.googleapis.com/v0/b/neome-beac7.firebasestorage.app/o/neome_stickers%2Fyassghurl.png?alt=media&token=YOUR_TOKEN',
  },
];

const StickerPreviewModal: React.FC<StickerPreviewModalProps> = ({ visible, onClose, onStickerSelect }) => {
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fetchStickers();
      panY.setValue(0);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        panY.setValue(0);
      });
    }
  }, [visible]);

  const fetchStickers = async () => {
    setLoading(true);
    setStickers(STICKERS);
    setLoading(false);
  };

  // PanResponder for drag-to-close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_: any, gestureState: any) => gestureState.dy > 5,
      onPanResponderMove: Animated.event([
        null,
        { dy: panY },
      ], { useNativeDriver: true }),
      onPanResponderRelease: (_: any, gestureState: any) => {
        if (gestureState.dy > 100) {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            panY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  if (!visible) return null;

  const translateY = Animated.add(
    slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [350, 0],
    }),
    panY
  );

  const renderSticker = ({ item }: { item: StickerItem }) => (
    <TouchableOpacity style={styles.stickerWrapper} onPress={() => onStickerSelect(item.url)}>
      <Image source={{ uri: item.url }} style={styles.stickerImage} resizeMode="contain" />
    </TouchableOpacity>
  );

  return (
    <Animated.View
      style={[styles.sheetContainer, { transform: [{ translateY }] }]}
      pointerEvents="box-none"
    >
      <View style={styles.sheetHeader}>
        <View style={styles.sheetHandle} />
        <Text style={styles.title}>NeoMe Stickers</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#6549FE" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={stickers}
          renderItem={renderSticker}
          keyExtractor={item => item.name}
          numColumns={3}
          contentContainerStyle={styles.stickerGrid}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 20,
    minHeight: 350,
    maxHeight: width > 400 ? 500 : 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sheetHandle: {
    width: 48,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginBottom: 10,
    marginTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
    textAlign: 'left',
    marginLeft: -200,
    marginBottom: 0,
    marginTop: 10,
    letterSpacing: 0.2,
  },
  stickerGrid: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  stickerWrapper: {
    flex: 1,
    alignItems: 'center',
    margin: 8,
    maxWidth: (width - 80) / 3,
  },
  stickerImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    marginLeft: 8,
    marginTop: 2,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  closeText: {
    fontSize: 22,
    color: '#6549FE',
  },
});

export default StickerPreviewModal; 