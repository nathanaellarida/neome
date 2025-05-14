import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import EmotionalAnalysis from './emotionAnalysis'; // adjust path as needed
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, SafeAreaView, ScrollView, Dimensions, FlatList, Alert } from 'react-native';
import { Feather, MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
import { Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
//import uuid from 'react-native-uuid';
import { router } from 'expo-router';
import { db, auth } from '../../firebaseConfig';
import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, getDocs, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

type Comment = {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
};

type Sentence = {
  id: string;
  text: string;
  emotion: string;
  emotionScore: number;
  highlighted: boolean;
  comments: Comment[];
};


// Types
type Folder = {
  id: string;
  name: string;
  notebooks: string[]; // Array of notebook IDs
  isExpanded: boolean;
};

type Notebook = {
  id: string;
  title: string;
  lastEdited: Date;
  pages: JournalPage[];
  folderId: string | null;
  color?: string;
  image?: string | null;

  // ✅ Add these two:
  analysis?: Sentence[];
  lastAnalyzedText?: string;
};


type JournalPage = {
  id: string;
  content: string;
  mood: string;
  date: Date;
};


const PASTEL_COLORS = [
  '#FFD1DC', // pastel pink
  '#B0E0E6', // powder blue
  '#F0E68C', // khaki
  '#E6E6FA', // lavender
  '#C1E1C1', // pastel green
];

const AnimatedCommentIcon = ({ onPress }: { onPress: () => void }) => {
  const scale = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 120,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={onPress} style={{ marginLeft: 3 }}>
        <Ionicons name="chatbubble-ellipses-outline" size={16} color="#8B5CF6" />
      </TouchableOpacity>
    </Animated.View>
  );
};



// Color palette options
const COLORS = ['#000000', '#FF0000', '#0000FF', '#008000', '#800080', '#FFA500'];

export default function JournalScreen() {
  // State management organized into logical groups
  const moveNotebookToFolder = (notebookId: string) => {
    console.log('Move notebook to folder:', notebookId);
    // You can build full move functionality later!
  };
  
  const [isJournalEdited, setIsJournalEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [analyzedSentences, setAnalyzedSentences] = useState<Sentence[]>([]);
  const [isEditingJournal, setIsEditingJournal] = useState(true);
  const [triggerAnalyze, setTriggerAnalyze] = useState(false);
  

  //Function to open the "New Folder" Modal
  const openNewFolderModal = () => {
    updateUiState({ folderModalVisible: true });
  };

  //Function to open the "New Notebook" Modal
  const openNewNotebookModal = () => {
    updateUiState({ notebookModalVisible: true });
  };

  //Function to open a Folder (click Folder)
  const openFolder = (folderId: string) => {
    updateState({ selectedFolderId: folderId });
  };
  
  //
  const closeFolder = () => {
    updateState({ selectedFolderId: null });
  };  
  

  //Function to open a Notebook (click Notebook)
  const openNotebook = (notebookId: string) => {
    const notebook = state.notebooks.find(n => n.id === notebookId);
    if (notebook) {
      handleNotebookSelect(notebook);
    }
  };
  
  //Open the modal
const openCommentModal = (comment: string) => {
  setSelectedComment(comment);
  setCommentModalVisible(true);
};
//close the modal
const closeCommentModal = () => {
  setSelectedComment(null);
  setCommentModalVisible(false);
};

  const [state, setState] = useState({
    notebooks: [] as Notebook[],
    folders: [] as Folder[],
    selectedNotebook: null as Notebook | null,
    selectedFolderId: null as string | null,
    journalText: '',
    selectedMood: '',
    editingNotebook: null as Notebook | null,
    editingFolder: null as Folder | null,
  });

  const [uiState, setUiState] = useState({
    notebookModalVisible: false,
    folderModalVisible: false,
    moodPickerVisible: false,
    colorPickerVisible: false,
    editFolderModalVisible: false,
    isBold: false,
    isItalic: false,
    textColor: '#000000',
    newNotebookTitle: '',
    newFolderName: '',
    editNotebookTitle: '',
    editFolderName: '',
    analyzeModalVisible: false,
  });

  const textInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [userId, setUserId] = useState<string | null>(null);

  // Load userId on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  // Load folders and notebooks from Firestore
  useEffect(() => {
    if (!userId) return;
    // Folders
    const foldersRef = collection(db, 'users', userId, 'Folders');
    const unsubFolders = onSnapshot(foldersRef, (snapshot) => {
      const folders = snapshot.docs.map(doc => ({ ...(doc.data() as Folder), id: doc.id }));
      updateState({ folders });
    });
    // Notebooks
    const journalsRef = collection(db, 'users', userId, 'Journals');
    const unsubJournals = onSnapshot(journalsRef, (snapshot) => {
      const notebooks = snapshot.docs.map(doc => ({ ...(doc.data() as Notebook), id: doc.id }));
      updateState({ notebooks });
    });
    return () => {
      unsubFolders();
      unsubJournals();
    };
  }, [userId]);

  useEffect(() => {
    if (triggerAnalyze) {
      // Set triggerAnalyze back to false after a short delay to reset
      setTimeout(() => setTriggerAnalyze(false), 1000);
    }
  }, [triggerAnalyze]);


  // Helper function to update main state
  const updateState = (newState: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  // Helper function to update UI state
  const updateUiState = (newState: Partial<typeof uiState>) => {
    setUiState(prev => ({ ...prev, ...newState }));
  };

  const getEmotionColor = (emotion: string): string => {
    switch (emotion) {
      case 'joy': return '#FFEB3B';
      case 'sadness': return '#90CAF9';
      case 'anger': return '#FFCDD2';
      case 'fear': return '#E1BEE7';
      case 'anxiety': return '#FFCC80';
      default: return 'transparent';
    }
  };

  const detectEmotion = (sentence: string): string => {
    const lower = sentence.toLowerCase();
    if (lower.includes('happy') || lower.includes('joy') || lower.includes('excited')) return 'joy';
    if (lower.includes('sad') || lower.includes('upset') || lower.includes('depressed')) return 'sadness';
    if (lower.includes('angry') || lower.includes('furious') || lower.includes('mad')) return 'anger';
    if (lower.includes('afraid') || lower.includes('scared') || lower.includes('fear')) return 'fear';
    if (lower.includes('anxious') || lower.includes('worry') || lower.includes('nervous')) return 'anxiety';
    return 'neutral';
  };

  const calculateEmotionScore = (emotion: string): number => {
    switch (emotion) {
      case 'joy': return 0.8;
      case 'sadness': return 0.7;
      case 'anger': return 0.9;
      case 'fear': return 0.8;
      case 'anxiety': return 0.7;
      default: return 0.3;
    }
  };

  const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
  const MODEL_NAME = 'gemini-2.0-flash';

  const getShortAffirmation = async (sentenceText: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `Here is a journal excerpt: "${sentenceText}". Provide a 3-sentence motivational message to make the person feel better. Avoid cliches.` }
                ]
              }
            ]
          }),
        }
      );
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'You are enough. You are doing your best. 💙';
    } catch (error) {
      console.error('Gemini Affirmation Error:', error);
      return 'You are enough. You are doing your best. 💙';
    }
  };  
  

  const getHeaviestSentences = async (journalText: string): Promise<string[]> => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `Here is a user's journal entry:\n\n"${journalText}"\n\nIdentify the 2 to 3 sentences that carry the deepest emotional weight (e.g., vulnerability, exhaustion, frustration, anger, sadness). Return only the exact sentences word-for-word without any extra explanation.` }
                ]
              }
            ]
          }),
        }
      );
      const data = await response.json();
      const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
      const sentences = (resultText.split(/\n|\. /) || []).map((sentence: string) => sentence.trim()).filter(Boolean);
  
      return sentences;
    } catch (error) {
      console.error('Error getting heaviest sentences:', error);
      return [];
    }
  };
  
  // Create a new notebook
  const createNotebook = async () => {
    if (uiState.newNotebookTitle.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Please enter a journal title!',
        position: 'top',
        visibilityTime: 2000,
      });
      setJournalImage(null);
      return;
    }
    if (!userId) return;
  
    const randomColor = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
  
    const newNotebook: Notebook = {
      id: Date.now().toString(),
      title: uiState.newNotebookTitle,
      lastEdited: new Date(),
      pages: [],
      folderId: state.selectedFolderId,
      color: randomColor,
    };

    
  
    // ✅ Prepare new notebooks array
    const updatedNotebooks = [...state.notebooks, newNotebook];
  
    // ✅ Prepare updated folders if inside a folder
    let updatedFolders = state.folders;
    if (state.selectedFolderId) {
      updatedFolders = state.folders.map(folder =>
        folder.id === state.selectedFolderId
          ? { ...folder, notebooks: [...folder.notebooks, newNotebook.id] }
          : folder
      );
    }
  
    // ✅ Now update state in one shot
    updateState({
      notebooks: updatedNotebooks,
      folders: updatedFolders,
      selectedFolderId: null, // ✅ Reset selection after adding
    });
  
    updateUiState({
      newNotebookTitle: '',
      notebookModalVisible: false,
    });

    await addDoc(collection(db, 'users', userId, 'Journals'), newNotebook);
  };
  
  
  
  // Create a new folder
  const createFolder = async () => {
    if (uiState.newFolderName.trim() === '') {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }
    if (!userId) return;
    
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: uiState.newFolderName,
      notebooks: [],
      isExpanded: true,
    };
    
    await addDoc(collection(db, 'users', userId, 'Folders'), newFolder);
    
    updateState({
      folders: [...state.folders, newFolder],
    });
    
    updateUiState({
      newFolderName: '',
      folderModalVisible: false,
    });
  };

  // Select a notebook
  const handleNotebookSelect = (notebook: Notebook) => {
    updateState({
      selectedNotebook: notebook,
      journalText: notebook.pages.length > 0 ? notebook.pages[0].content : '',
      selectedMood: notebook.pages.length > 0 ? notebook.pages[0].mood : '',
    });
    setJournalImage(notebook.image ?? null);
    setAnalyzedSentences(notebook.analysis ?? []);
    setAnalyzedSentences([]);
    setSelectedComment(null);
    setTriggerAnalyze(false);
    setIsEditingJournal(true);
  };

// On Save Button
const saveJournalEntry = async () => {
  try {
    if (!isJournalEdited || !state.selectedNotebook || !userId) return;
    const notebookRef = doc(db, 'users', userId, 'Journals', state.selectedNotebook.id);
    const updatedPages = state.selectedNotebook.pages.length > 0
      ? [{ ...state.selectedNotebook.pages[0], content: state.journalText }]
      : [{ id: Date.now().toString(), content: state.journalText, mood: '', date: new Date() }];
    await updateDoc(notebookRef, {
      pages: updatedPages,
      lastEdited: new Date(),
    });
    Toast.show({ type: 'success', text1: 'Journal Saved Successfully!', position: 'top', visibilityTime: 2000 });
    setIsJournalEdited(false);
  } catch (error) {
    console.error('Error saving journal entry:', error);
  }
};




const analyzeJournal = async () => {
  const journalText = state.journalText;

  if (!journalText.trim()) return;

  const allSentences = journalText.match(/[^.!?]+[.!?]+/g) || [];

  const analyzed: Sentence[] = allSentences.map((sentence, index) => ({
    id: `sentence-${index}`,
    text: sentence.trim(),
    emotion: 'neutral', // optional: you can ignore if no need
    emotionScore: 0,
    highlighted: false,
    comments: [],
  }));

  try {
    const heaviestSentences = await getHeaviestSentences(journalText);

    for (const heavySentence of heaviestSentences) {
      const idx = analyzed.findIndex(s =>
        heavySentence.includes(s.text.slice(0, 15)) || s.text.includes(heavySentence.slice(0, 15))
      );
    
      if (idx !== -1) {
        analyzed[idx].highlighted = true;
        const supportiveMessage = await getShortAffirmation(analyzed[idx].text);
        analyzed[idx].comments.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          text: supportiveMessage,
          isAI: true,
          timestamp: new Date(),
        });
      }
    }
    
  } catch (error) {
    console.error('Error analyzing journal:', error);
  }

  setAnalyzedSentences(analyzed);
};


  // Toggle folder expansion
  const toggleFolderExpansion = (folderId: string) => {
    updateState({
      folders: state.folders.map(folder => 
        folder.id === folderId 
          ? { ...folder, isExpanded: !folder.isExpanded } 
          : folder
      ),
    });
  };

  // Delete a notebook
  const deleteNotebook = (notebookId: string) => {
    if (!userId) return;
    Alert.alert(
      'Delete Notebook',
      'Are you sure you want to delete this notebook?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Remove from folder's notebooks array if needed
            const notebook = state.notebooks.find(n => n.id === notebookId);
            if (notebook?.folderId) {
              const folderRef = doc(db, 'users', userId, 'folders', notebook.folderId);
              await updateDoc(folderRef, { notebooks: arrayRemove(notebookId) });
            }
            await deleteDoc(doc(db, 'users', userId, 'journals', notebookId));
            updateState({ selectedNotebook: state.selectedNotebook?.id === notebookId ? null : state.selectedNotebook });
            Toast.show({ type: 'success', text1: 'Notebook deleted!', position: 'top', visibilityTime: 2000 });
          },
        },
      ]
    );
  };
  

  // Delete a folder
  const deleteFolder = (folderId: string) => {
    if (!userId) return;
    Alert.alert(
      'Delete Folder',
      'Are you sure you want to delete this folder? Notebooks will be moved to unassigned.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Move all notebooks in this folder to unassigned
            const journalsRef = collection(db, 'users', userId, 'Journals');
            const querySnapshot = await getDocs(journalsRef);
            const batch: Promise<any>[] = [];
            querySnapshot.forEach((docSnap) => {
              if (docSnap.data().folderId === folderId) {
                batch.push(updateDoc(doc(db, 'users', userId, 'Journals', docSnap.id), { folderId: null }));
              }
            });
            await Promise.all(batch);
            await deleteDoc(doc(db, 'users', userId, 'Folders', folderId));
            updateUiState({ editFolderModalVisible: false });
          },
        },
      ]
    );
  };

  //Save edit notebook
  const saveEditedNotebook = async () => {
    if (!state.editingNotebook || uiState.editNotebookTitle.trim() === '' || !userId) {
      Alert.alert('Error', 'Please enter a notebook title');
      return;
    }
    const notebookRef = doc(db, 'users', userId, 'journals', state.editingNotebook.id);
    // Detect folder change
    const prevNotebook = state.notebooks.find(n => n.id === state.editingNotebook?.id);
    const prevFolderId = prevNotebook?.folderId;
    const newFolderId = state.editingNotebook.folderId;
    if (prevFolderId && prevFolderId !== newFolderId) {
      const prevFolderRef = doc(db, 'users', userId, 'folders', prevFolderId);
      await updateDoc(prevFolderRef, { notebooks: arrayRemove(state.editingNotebook.id) });
    }
    if (newFolderId && prevFolderId !== newFolderId) {
      const newFolderRef = doc(db, 'users', userId, 'folders', newFolderId);
      await updateDoc(newFolderRef, { notebooks: arrayUnion(state.editingNotebook.id) });
    }
    await updateDoc(notebookRef, {
      title: uiState.editNotebookTitle,
      folderId: state.editingNotebook.folderId,
    });
    updateUiState({ editNotebookTitle: '', notebookModalVisible: false });
    updateState({ editingNotebook: null });
  };
  

  // Save edited folder
  const saveEditedFolder = async () => {
    if (!state.editingFolder || uiState.editFolderName.trim() === '' || !userId) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }
    const folderRef = doc(db, 'users', userId, 'Folders', state.editingFolder.id);
    await updateDoc(folderRef, { name: uiState.editFolderName });
    updateUiState({ editFolderName: '', editFolderModalVisible: false });
    updateState({ editingFolder: null });
  };

  // Notebook Item Component
  const NotebookItem = React.memo(({
    notebook,
    onSelect,
    onEdit,
  }: {
    notebook: Notebook;
    onSelect: (notebook: Notebook) => void;
    onEdit: (notebook: Notebook) => void;
  }) => (
    <View style={styles.notebookItemContainer}>
     <TouchableOpacity
      style={[
        styles.notebookItem,
        { backgroundColor: notebook.color || '#ffffff' } // ← apply notebook color here
      ]}
      onPress={() => onSelect(notebook)}
    >
        <View style={styles.notebookContent}>
          <Text style={styles.notebookTitle} numberOfLines={1} ellipsizeMode="tail">
            {notebook.title}
          </Text>
          <Text style={styles.notebookDate}>
            Last edited: {notebook.lastEdited.toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.editNotebookButton}
        onPress={() => onEdit(notebook)}
      >
        <Feather name="edit-2" size={16} color="#666" />
      </TouchableOpacity>
    </View>
  ));



  const [selectedFolderIdForMenu, setSelectedFolderIdForMenu] = useState<string | null>(null);
  const [showFolderOptions, setShowFolderOptions] = useState(false);
  const [selectedNotebookIdForMenu, setSelectedNotebookIdForMenu] = useState<string | null>(null);
  const [showNotebookOptions, setShowNotebookOptions] = useState(false);
  const [journalImage, setJournalImage] = useState<string | null>(null);


  const openNotebookMenu = (notebookId: string) => {
    const selectedNotebook = state.notebooks.find(n => n.id === notebookId);
    if (selectedNotebook) {
      updateState({
        editingNotebook: selectedNotebook,
      });
      updateUiState({
        editNotebookTitle: selectedNotebook.title,
        notebookModalVisible: true, // use same modal as add notebook
      });
    }
  };



  const openFolderMenu = (folderId: string) => {
    setSelectedFolderIdForMenu(folderId);
    setShowFolderOptions(true);
  };

  const renderFolderOptionsModal = () => (
    <Modal
      visible={showFolderOptions}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFolderOptions(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowFolderOptions(false)}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}>
            <TouchableOpacity
              onPress={() => {
                if (selectedFolderIdForMenu) {
                  updateState({ editingFolder: state.folders.find(f => f.id === selectedFolderIdForMenu) || null });
                  updateUiState({ editFolderModalVisible: true });
                }
                setShowFolderOptions(false);
              }}
            >
              <Text style={{ fontSize: 16, marginBottom: 15 }}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (selectedFolderIdForMenu) {
                  deleteFolder(selectedFolderIdForMenu);
                }
                setShowFolderOptions(false);
              }}
            >
              <Text style={{ fontSize: 16, color: 'red' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
  
      // ✅ Set image for UI
      setJournalImage(imageUri);
  
      // ✅ Save image to the current notebook in state
      const updatedNotebooks = state.notebooks.map((notebook) =>
        notebook.id === state.selectedNotebook?.id
          ? { ...notebook, image: imageUri }
          : notebook
      );
  
      updateState({ notebooks: updatedNotebooks });

    }
  };
  
  

  const renderHomeScreen = () => {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F8FF' }}>
        {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal Manager</Text>
      </View>

  
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          
      {/* Folders Section */}
      <View style={{ marginTop: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#44349B', marginRight: 135 }}>Folders</Text>
          <TouchableOpacity onPress={openNewFolderModal}>
            <Text style={{ color: '#8B5CF6', fontWeight: 'bold' }}>+ Add Folder</Text>
          </TouchableOpacity>
        </View>

        <FlatList
        data={state.folders}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 12,
            marginBottom: 15,
            width: '30%',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 3,
            position: 'relative', // needed for 3-dot positioning
          }}>
            
            {/* Correct 3-dot menu */}
            <TouchableOpacity
              onPress={() => openFolderMenu(item.id)}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                padding: 4,
                zIndex: 1,
              }}
            >
              <Ionicons name="ellipsis-vertical" size={18} color="#666" />
            </TouchableOpacity>

            {/* Correct Folder Icon and Text */}
            <TouchableOpacity
              onPress={() => openFolder(item.id)}
              style={{ alignItems: 'center' }}
            >
              <Ionicons name="folder-outline" size={28} color="#8B5CF6" />
              <Text style={{ fontWeight: 'bold', fontSize: 14, marginTop: 6, textAlign: 'center' }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                {item.notebooks.length} Notebooks
              </Text>
            </TouchableOpacity>

          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>No folders yet</Text>
        )}
      />

      </View>

  
          {/* Divider */}
          <View style={{ height: 20 }} />
  
          {/* Notebooks Section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#44349B' }}>
            Recent Documents
          </Text>

          {/* Always show View All button */}
          <TouchableOpacity
            onPress={() => {
              if (state.selectedFolderId) {
                closeFolder();
              }
            }}
          >
            <Text style={{
              color: '#8B5CF6',
              fontWeight: 'bold',
              fontSize: 14,
            }}>
              View All
            </Text>
          </TouchableOpacity>
        </View>


  
          <FlatList
            data={state.selectedFolderId 
              ? state.notebooks.filter(notebook => notebook.folderId === state.selectedFolderId)
              : state.notebooks
            }
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
              style={{
                backgroundColor: 'white',
                padding: 15,
                borderRadius: 12,
                marginBottom: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                onPress={() => openNotebook(item.id)}
              >
                <Ionicons name="document-text-outline" size={28} color="#8B5CF6" style={{ marginRight: 15 }} />
                <View>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>
                  <Text style={{ color: '#666', marginTop: 2 }}>{item.pages.length} Pages</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openNotebookMenu(item.id)}
                style={{ padding: 4, marginLeft: 10 }}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            )}
            ListEmptyComponent={() => (
              <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>No documents yet</Text>
            )}
          />
  
        </ScrollView>
  
        {/* Floating Add Button */}
        <TouchableOpacity
          onPress={openNewNotebookModal}
          style={{
            position: 'absolute',
            bottom: 30,
            right: 20,
            backgroundColor: '#8B5CF6',
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
  
      </View>
    );
  };
  

  
  // Render journal editor (full screen)
  const renderJournalEditor = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.editorHeaderContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          if (isEditingJournal) {
            saveJournalEntry(); // Save text edits
          } else if (!isEditingJournal && analyzedSentences.length > 0 && state.selectedNotebook) {
            // Save analyzed sentences
            const updatedNotebooks = state.notebooks.map((notebook) =>
              notebook.id === state.selectedNotebook?.id
                ? { ...notebook, analysis: analyzedSentences }
                : notebook
            );
            updateState({ notebooks: updatedNotebooks });
          }
        
          updateState({ selectedNotebook: null }); // Navigate back
        }}
        
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

        <Text style={styles.editorHeaderTitle}>{state.selectedNotebook?.title}</Text>
      </View>
  
      <View style={styles.analyzeFooter}>
        <TouchableOpacity 
          style={styles.analyzeButton}
          onPress={() => updateUiState({ analyzeModalVisible: true })}
        >
          <Ionicons name="analytics-outline" size={20} color="white" />
          <Text style={styles.analyzeButtonText}>Analyze</Text>
        </TouchableOpacity>
      </View>
  
      {/* Toolbar */}
      <View style={styles.toolbar}>
  {/* Bold button */}
  <TouchableOpacity 
    style={[styles.toolbarButton, uiState.isBold && styles.activeToolbarButton]} 
    onPress={() => updateUiState({ isBold: !uiState.isBold })}
  >
    <MaterialIcons name="format-bold" size={22} color={uiState.isBold ? "#8B5CF6" : "#444"} />
  </TouchableOpacity>

  {/* Italic button */}
  <TouchableOpacity 
    style={[styles.toolbarButton, uiState.isItalic && styles.activeToolbarButton]} 
    onPress={() => updateUiState({ isItalic: !uiState.isItalic })}
  >
    <MaterialIcons name="format-italic" size={22} color={uiState.isItalic ? "#8B5CF6" : "#444"} />
  </TouchableOpacity>

{/*Image Icon*/}
<TouchableOpacity onPress={handleImagePick} style={styles.toolbarButton}>
  <Ionicons name="image-outline" size={20} color="#333" />
</TouchableOpacity>

    {/* Edit Button */}
    <TouchableOpacity 
    style={styles.toolbarButton}
    onPress={() => {
      setIsEditingJournal(true); // switch to edit mode
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
    }}
  >
    <MaterialIcons
      name="edit"
      size={22}
      color={isEditingJournal ? "#8B5CF6" : "#444"} // ✏️ Purple if edit mode is active
    />
  </TouchableOpacity>

{/* AI Button */}
  <TouchableOpacity 
  style={styles.toolbarButton}
  onPress={async () => {
    try {
      if (isJournalEdited || analyzedSentences.length === 0) {
        setLoading(true);
  
        const journalText = state.journalText;
        const allSentences = journalText.match(/[^.!?]+[.!?]+/g) || [];
  
        const analyzed: Sentence[] = allSentences.map((sentence, index) => ({
          id: `sentence-${index}`,
          text: sentence.trim(),
          emotion: 'neutral',
          emotionScore: 0,
          highlighted: false,
          comments: [],
        }));
  
        const heaviestSentences = await getHeaviestSentences(journalText);
  
        for (const heavySentence of heaviestSentences) {
          const idx = analyzed.findIndex(s =>
            heavySentence.includes(s.text.slice(0, 15)) || s.text.includes(heavySentence.slice(0, 15))
          );
  
          if (idx !== -1) {
            analyzed[idx].highlighted = true;
            const supportiveMessage = await getShortAffirmation(analyzed[idx].text);
            analyzed[idx].comments.push({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
              text: supportiveMessage,
              isAI: true,
              timestamp: new Date(),
            });
          }
        }
  
        // ✅ Save the result to notebook
        const updatedNotebooks = state.notebooks.map((notebook) =>
          notebook.id === state.selectedNotebook?.id
            ? { ...notebook, analysis: analyzed }
            : notebook
        );
  
        updateState({ notebooks: updatedNotebooks });
        setAnalyzedSentences(analyzed);
        setIsJournalEdited(false);
      }
  
      setIsEditingJournal(false); // Always switch to AI mode
    } catch (error) {
      console.error('Error during AI analysis:', error);
    } finally {
      setLoading(false);
    }
  }
}  
  
  
>
  <MaterialIcons
    name="psychology"
    size={24}
    color={isEditingJournal ? "#444" : "#8B5CF6"}
  />
</TouchableOpacity>

</View>

      

<View style={styles.editorScrollView}>
  {loading ? (
    // 👇 SHOW THIS WHEN LOADING
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    }}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Analyzing your journal...</Text>
    </View>
  ) : isEditingJournal ? (
    // 👇 JOURNAL INPUT MODE
    <ScrollView ref={scrollViewRef} contentContainerStyle={[styles.editorContent, { paddingBottom: 120 }]}>
      {journalImage && (
  <View style={{ position: 'relative', marginBottom: 16 }}>
    <Image
      source={{ uri: journalImage }}
      style={{
        width: '100%',
        height: 250,
        borderRadius: 12,
      }}
      resizeMode="contain"
    />
    
    {/* ❌ Delete Icon */}
    <TouchableOpacity
      onPress={() => setJournalImage(null)}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
      }}
    >
      <Ionicons name="close" size={20} color="white" />
    </TouchableOpacity>
  </View>
)}



      <TextInput
        ref={textInputRef}
        style={[
          styles.journalTextInput,
          uiState.isBold && styles.boldText,
          uiState.isItalic && styles.italicText,
          { color: uiState.textColor }
        ]}
        multiline
        value={state.journalText}
        onChangeText={(text) => {
          updateState({ journalText: text });
          setTriggerAnalyze(false);
          setIsJournalEdited(true);
        }}
        placeholder="Start writing your thoughts..."
        placeholderTextColor="#aaa"
        autoFocus
      />
    </ScrollView>

    ) : (
// AI HIGHLIGHTED JOURNAL MODE
<View style={{ flex: 1, padding: 20 }}>
  <ScrollView 
    contentContainerStyle={{ paddingBottom: 100 }}
    showsVerticalScrollIndicator={false}
    style={{ flexGrow: 1 }}
  >
    {/* 🖼️ Display the journal image if available */}
    {journalImage && (
    <Image
      source={{ uri: journalImage }}
      style={{
        width: '100%',
        height: 250,         // optional: increase height to better fit full images
        borderRadius: 12,
        marginBottom: 16,
      }}
      resizeMode="contain"   // ✅ prevents cropping
    />
  )}


    {/* 🧠 Show analyzed sentences */}
    {analyzedSentences.length > 0 ? (
      analyzedSentences.map((sentence) => (
        <View
          key={sentence.id}
          style={{
            backgroundColor: sentence.highlighted ? '#FFF9C4' : 'transparent',
            borderLeftWidth: sentence.highlighted ? 4 : 0,
            borderLeftColor: '#FDD835',
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              lineHeight: 24,
              fontWeight: sentence.highlighted ? '600' : '400',
              color: '#333',
            }}
          >
            {sentence.text}
          </Text>

          {sentence.comments.length > 0 && (
            <TouchableOpacity
              onPress={() => openCommentModal(sentence.comments[0].text)}
              style={{
                marginTop: 8,
                alignSelf: 'flex-start',
                backgroundColor: '#EDE7F6',
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="bulb-outline"
                size={16}
                color="#8B5CF6"
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: '#4A148C', fontWeight: '500', fontSize: 14 }}>
                Insight
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))
    ) : (
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
        No analysis yet. Click Analyze!
      </Text>
    )}
  </ScrollView>
</View>
)}

  {/* 👇 Always render the Comment Modal outside */}
  <Modal
    visible={commentModalVisible}
    transparent
    animationType="slide"
    onRequestClose={closeCommentModal}
  >
    <TouchableWithoutFeedback onPress={closeCommentModal}>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
      }}>
        <TouchableWithoutFeedback>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '70%',
            width: '100%',
          }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={{
                fontSize: 16,
                textAlign: 'center',
                lineHeight: 24,
                color: '#333',
              }}>
                {selectedComment}
              </Text>
            </ScrollView>
            <TouchableOpacity 
              style={{
                backgroundColor: '#8B5CF6',
                paddingVertical: 12,
                paddingHorizontal: 30,
                borderRadius: 25,
                alignSelf: 'center',
                marginTop: 10,
                marginBottom: 20,
              }}
              onPress={closeCommentModal}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
</View>

        </View>
      )
  

  //Emotional Analysis Modal
  const renderAnalyzeModal = () => (
    <Modal
      visible={uiState.analyzeModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => updateUiState({ analyzeModalVisible: false })}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.analyzeModalContainer}>
          
          {/* 🔹 Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => updateUiState({ analyzeModalVisible: false })}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
  
          <ScrollView
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <EmotionalAnalysis journalText={state.journalText} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  

  // Edit Notebook Modal
  const renderEditNotebookModal = () => (
    <Modal
      visible={!!state.editingNotebook}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        updateState({ editingNotebook: null });
        updateUiState({ notebookModalVisible: false });
      }}
      
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Notebook</Text>
          
          {/* Rename Notebook */}
          <TextInput
            style={styles.modalInput}
            value={uiState.editNotebookTitle}
            onChangeText={(text) => updateUiState({ editNotebookTitle: text })}
            placeholder="Enter new notebook title"
            autoFocus
          />
          
          {/* Move to Folder */}
          {state.folders.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Move to Folder:</Text>
              <ScrollView style={styles.folderList} contentContainerStyle={styles.folderListContent}>
              <TouchableOpacity
                style={[
                  styles.folderItem,
                  state.editingNotebook?.folderId === null && styles.selectedFolderItem
                ]}
                onPress={() => {
                  if (state.editingNotebook) {
                    updateState({ 
                      editingNotebook: { ...state.editingNotebook, folderId: null } 
                    });
                  }
                }}
              >
                <Text style={styles.folderItemText}>Unassigned</Text>
              </TouchableOpacity>

                
                {state.folders.map((folder) => (
                  <TouchableOpacity
                    key={folder.id}
                    style={[
                      styles.folderItem,
                      state.editingNotebook?.folderId === folder.id && styles.selectedFolderItem
                    ]}
                    onPress={() => {
                      if (state.editingNotebook) {
                        updateState({ 
                          editingNotebook: { ...state.editingNotebook, folderId: folder.id } 
                        });
                      }
                    }}
                  >
                    <FontAwesome5 name="folder" size={16} color="#8B5CF6" style={styles.folderIcon} />
                    <Text style={styles.folderItemText}>{folder.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Color Picker Section 
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Select Page Background Color:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
            {PASTEL_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: color,
                  margin: 5,
                  borderWidth: state.editingNotebook?.color === color ? 2 : 0,
                  borderColor: '#8B5CF6'
                }}
                onPress={() => {
                  if (state.editingNotebook) {
                    updateState({
                      editingNotebook: { ...state.editingNotebook, color }
                    });
                  }
                }}
              />
            ))}
          </View>
          */}

          
          {/* Delete Button */}
          <TouchableOpacity
          onPress={() => {
            if (state.editingNotebook) {
              deleteNotebook(state.editingNotebook.id);
              updateState({ editingNotebook: null });
              updateUiState({ notebookModalVisible: false });
            }
          }}
          style={{ marginTop: 10, alignSelf: 'center' }}
        >
          <Text style={{ color: '#d32f2f', fontSize: 16, fontWeight: '600' }}>
            Delete Notebook
          </Text>
        </TouchableOpacity>



          
          {/* Action Buttons */}
          <View style={styles.modalActionButtons}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]} 
            onPress={() => {
              updateState({ editingNotebook: null });
              updateUiState({ notebookModalVisible: false }); // ✅ Ensure modal is fully closed
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButtonType]} 
              onPress={saveEditedNotebook}
            >
              <Text style={styles.saveButtonTextType}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Edit Folder Modal
  const renderEditFolderModal = () => (
    <Modal
      visible={uiState.editFolderModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => updateUiState({ editFolderModalVisible: false })}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Folder</Text>
          <TextInput
            style={styles.modalInput}
            value={uiState.editFolderName}
            onChangeText={(text) => updateUiState({ editFolderName: text })}
            placeholder="Enter folder name"
            autoFocus
          />
          
          {/* Delete folder button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              if (state.editingFolder) {
                deleteFolder(state.editingFolder.id);
              }
            }}
          >
            <Text style={styles.deleteButtonText}>Delete Folder</Text>
          </TouchableOpacity>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={() => updateUiState({ editFolderModalVisible: false })}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.createButton]} 
              onPress={saveEditedFolder}
            >
              <Text style={styles.createButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // New notebook modal
  const renderNewNotebookModal = () => (
    <Modal
      visible={uiState.notebookModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => updateUiState({ notebookModalVisible: false })}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Journal</Text>
          <TextInput
            style={styles.modalInput}
            value={uiState.newNotebookTitle}
            onChangeText={(text) => updateUiState({ newNotebookTitle: text })}
            placeholder="Enter journal title"
            autoFocus
          />
          
          {state.folders.length > 0 && (
            <View style={styles.folderSelectionContainer}>
              <Text style={styles.folderSelectionLabel}>Select a folder (optional):</Text>
              <ScrollView style={styles.folderSelectionList}>
                <TouchableOpacity
                  style={[
                    styles.folderSelectionItem,
                    state.selectedFolderId === null && styles.selectedFolderItem
                  ]}
                  onPress={() => updateState({ selectedFolderId: null })}
                >
                  <Text style={styles.folderSelectionText}>None</Text>
                </TouchableOpacity>
                
                {state.folders.map((folder) => (
                  <TouchableOpacity
                    key={folder.id}
                    style={[
                      styles.folderSelectionItem,
                      state.selectedFolderId === folder.id && styles.selectedFolderItem
                    ]}
                    onPress={() => updateState({ selectedFolderId: folder.id })}
                  >
                    <FontAwesome5 name="folder" size={16} color="#8B5CF6" style={styles.folderSelectionIcon} />
                    <Text style={styles.folderSelectionText}>{folder.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={() => updateUiState({ notebookModalVisible: false })}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.createButton]} 
              onPress={createNotebook}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  
  // New folder modal
  const renderNewFolderModal = () => (
    <Modal
      visible={uiState.folderModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => updateUiState({ folderModalVisible: false })}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Folder</Text>
          <TextInput
            style={styles.modalInput}
            value={uiState.newFolderName}
            onChangeText={(text) => updateUiState({ newFolderName: text })}
            placeholder="Enter folder name"
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={() => updateUiState({ folderModalVisible: false })}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.createButton]} 
              onPress={createFolder}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  
  
  return (
    <SafeAreaView style={styles.container}>
      {state.selectedNotebook ? renderJournalEditor() : renderHomeScreen()}
      {renderNewNotebookModal()}
      {renderNewFolderModal()}
      {renderEditNotebookModal()}
      {renderEditFolderModal()}
      {renderAnalyzeModal()}
      {renderFolderOptionsModal()}
      <Toast />
    </SafeAreaView>
    
  );
}


const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#44349B', marginRight: 135},
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0ebff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  notebooksContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  notebooksContent: {
    padding: 15,
    paddingBottom: 80, // Extra space for the Add Folder button
  },
  allNotebooksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distribute items evenly
    paddingHorizontal: 5, // Add padding to prevent edge crowding
  },
  folderContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
  },
  folderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderIcon: {
    marginRight: 10,
  },
  folderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  folderNotebooks: {
    padding: 10,
  },
  emptyFolderNotebooks: {
    padding: 15,
    alignItems: 'center',
  },
  emptyFolderText: {
    color: '#888',
    fontStyle: 'italic',
  },
  unassignedNotebooksContainer: {
    marginTop: 10,
  },
  unassignedNotebooksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginLeft: 5,
  },
  notebookItemContainer: {
    width: width * 0.45,
    marginBottom: 15,
    position: 'relative',
    marginRight: 10,
  },
  notebookItem: {
    width: 150, // Fixed width for horizontal items
    height: 200,  
    borderRadius: 8,
    padding: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    borderLeftWidth: 15,
    borderLeftColor: '#FFFFFF',
  },
  editNotebookButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notebooksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  notebookGridItem: {
    width: '48%', // Slightly less than half to account for spacing
    marginBottom: 15,
  },
  selectedNotebook: {
    borderLeftWidth: 6,
    borderLeftColor: '#8B5CF6',
    backgroundColor: '#f5f0ff',
  },
  notebookContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notebookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notebookDate: {
    fontSize: 14,
    color: '#888',
  },
  sectionContainer: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 8,
  },
  folderList: {
    maxHeight: 150,
  },
  folderListContent: {
    paddingBottom: 10,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedFolderItem: {
    backgroundColor: '#f0ebff',
  },
  folderItemText: {
    fontSize: 15,
    color: '#444',
    marginLeft: 8,
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    position: 'absolute',
    top: 15,
    right: 22,
    backgroundColor: '#8B5CF6',
    borderRadius: 25,
    width: 65,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    //marginLeft: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonType: {
    
    backgroundColor: '#8B5CF6',
    marginLeft: 10,
  },
  saveButtonTextType: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ffeeee',
    marginTop: 15,
    marginBottom: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    width: '100%',
  },
  deleteButtonText: {
    color: '#ff4444',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButtonJournal: {
    backgroundColor: '#ffeeee',
    marginTop: 15,
    marginBottom: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center', // ✅ center content vertically
    borderRadius: 8,
    width: '100%',
    height: 50,
  },
  
  deleteButtonTextJournal: {
    color: '#d32f2f', // ✅ strong red that stands out
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },  
  
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#888',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  folderContent: {
    paddingVertical: 8,
  },
  folderNotebooksContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  notebookCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  editorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  moodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  moodText: {
    fontSize: 14,
    color: '#444',
    marginRight: 5,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  toolbarButton: {
    marginRight: 30,
    padding: 5,
  },
  activeToolbarButton: {
    backgroundColor: '#f0ebff',
    borderRadius: 5,
  },
  editorScrollView: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1, 
    borderColor: '#f0f0f0',
  },
  editorContent: {
    padding: 15,
    minHeight: '100%',
  },
  journalTextInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  italicText: {
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  addFolderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addFolderText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
  },
  editorHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  editorHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  folderSelectionContainer: {
    marginBottom: 20,
  },
  folderSelectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E6E6FA',
    marginBottom: 10,
  },
  folderSelectionList: {
    maxHeight: 150,
  },
  folderSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  folderSelectionIcon: {
    marginRight: 10,
  },
  folderSelectionText: {
    fontSize: 15,
    color: '#444',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  createButton: {
    backgroundColor: '#8B5CF6',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  moodPickerContent: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  moodItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
  },
  moodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    color: '#444',
  },
  moodCloseButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  moodCloseText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  colorPickerContainer: {
    position: 'absolute',
    top: 110,
    left: 100,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 120,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  analyzeFooter: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  
  analyzeButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
  },

  analyzeModalContainer: {
  flex: 1,
  width: '90%',
  maxHeight: '90%',
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 20,
  justifyContent: 'flex-start',
},

  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 8,
  },

});