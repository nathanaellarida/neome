import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, router } from 'expo-router';
import { useFolderContext } from './FolderContext';
import { useTaskContext } from './TaskContext';

const { width } = Dimensions.get('window');

const taskImages = [
  require('../assets/images/plaintask1.png'),
  require('../assets/images/plaintask2.png'),
  require('../assets/images/plaintask3.png'),
  require('../assets/images/plaintask4.png'),
  require('../assets/images/plaintask5.png'),
];

export default function AddNewTask() {
  const { folders, addFolder } = useFolderContext();
  const { addTask } = useTaskContext(); // ✅ use global task context
  const { folder } = useLocalSearchParams<{ folder?: string }>();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [timeObj, setTimeObj] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [newFolderName, setNewFolderName] = useState('');
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false); // for tasks
  const [showFolderSuccessDialog, setShowFolderSuccessDialog] = useState(false); // for folders
  const [showAddedToFolderDialog, setShowAddedToFolderDialog] = useState(false);

  useEffect(() => {
    if (folder) {
      setSelectedFolder(folder);
    }
  }, [folder]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (time: Date) =>
    time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      title: newFolderName.trim(),
      tasks: 0,
      image: require('../assets/images/folder1.png'),
    };
    addFolder(newFolder);
    setNewFolderName('');
    setShowAddFolderModal(false);
    setShowFolderSuccessDialog(true);
  };

  const handleCreateTask = () => {
    if (!title || !date || !time) return;
  
    // ✅ Random image index between 1 and 5
    const randomImage = taskImages[Math.floor(Math.random() * taskImages.length)];

    const newTask = {
      title,
      date: dateObj
        ? `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`
        : '',
      time: timeObj?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
      description,
      folder: selectedFolder || '',
      image: randomImage,
      bgColor: '#A6C6FF',
    };
  
    addTask(newTask);
  
    if (selectedFolder) {
      setShowAddedToFolderDialog(true);
    } else {
      setShowSuccessDialog(true);
    }
  };

  const handleDone = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Task</Text>
        <Ionicons name="notifications-outline" size={23} color="#6549FE" />
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.whiteCard}>
          <Text style={styles.label}>Task Title</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Enter task title" style={styles.input} />

          {/* Date and Time */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Set Date</Text>
              <TouchableOpacity
                style={styles.dateTimePicker}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeText}>{date || 'mm/dd/yyyy'}</Text>
                <Ionicons name="calendar" size={20} color="#6549FE" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Set Time</Text>
              <TouchableOpacity
                style={styles.dateTimePicker}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeText}>{time || '00m 00s'}</Text>
                <Ionicons name="time" size={20} color="#6549FE" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Date & Time Picker Modals */}
          {showDatePicker && (
            <DateTimePicker
              value={dateObj || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setDate(formatDate(selectedDate));
                  setDateObj(selectedDate);
                }
                setShowDatePicker(false);
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={timeObj || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                if (selectedTime) {
                  setTime(formatTime(selectedTime));
                  setTimeObj(selectedTime);
                }
                setShowTimePicker(false);
              }}
            />
          )}

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description"
            multiline
            style={styles.textarea}
          />

          {/* Folder Selection */}
          <View style={styles.rowLabelContainer}>
            <Text style={styles.label}>Add to Folder</Text>
            <Text style={styles.label2}>Choose or create a folder</Text>
          </View>
          <View style={styles.folderRow}>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddFolderModal(true)}>
              <Ionicons name="add" size={20} color="#6549FE" />
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {folders.map((folder, idx) => {
              const isSelected = selectedFolder === folder.title;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.folderChip,
                    isSelected ? styles.selectedChip : styles.unselectedChip,
                  ]}
                  onPress={() =>
                    setSelectedFolder(prev => (prev === folder.title ? null : folder.title))
                  }
                >
                  <View style={styles.folderChipContent}>
                    <Text style={[styles.folderText, isSelected && { color: 'white' }]}>
                      {folder.title}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="white" style={{ marginLeft: 8 }} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            </ScrollView>
          </View>

          {/* Create Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreateTask}>
            <Text style={styles.createButtonText}>+ Create Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Folder Modal */}
      <Modal visible={showAddFolderModal} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <TouchableOpacity style={styles.dialogCloseButton} onPress={() => setShowAddFolderModal(false)}>
              <Ionicons name="close" size={20} color="#6549FE" />
            </TouchableOpacity>
            <Text style={styles.dialogTitle}>New Folder</Text>
            <TextInput
              value={newFolderName}
              placeholder="Enter folder name"
              onChangeText={setNewFolderName}
              style={styles.input}
            />
            <TouchableOpacity onPress={handleCreateFolder} style={styles.dialogButton}>
              <Text style={styles.dialogButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Dialogs */}
      <Modal visible={showSuccessDialog} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Task Successfully Created!</Text>
            <Ionicons name="checkmark-circle-outline" size={100} color="#00BB16" />
            <TouchableOpacity onPress={handleDone} style={styles.dialogButton}>
              <Text style={styles.dialogButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddedToFolderDialog} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Successfully Added to Folder!</Text>
            <Text style={styles.dialogSub}>Your new task is now added to {selectedFolder}</Text>
            <Ionicons name="checkmark-circle-outline" size={100} color="#00BB16" />
            <TouchableOpacity onPress={handleDone} style={styles.dialogButton}>
              <Text style={styles.dialogButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showFolderSuccessDialog} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Folder Successfully Created!</Text>
            <Text style={styles.dialogSub}>Start adding tasks to this folder.</Text>
            <Ionicons name="checkmark-circle-outline" size={100} color="#00BB16" />
            <TouchableOpacity
              onPress={() => setShowFolderSuccessDialog(false)}
              style={styles.dialogButton}
            >
              <Text style={styles.dialogButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#EFF2FF',
},
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
headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44349B',
},
iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
},
contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 80,
},
label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#44349B',
},
rowLabelContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 20,
  marginBottom: 8,
  paddingHorizontal: 2,
},
label2: {
  fontSize: 12,
  color: '#44349B',
  marginLeft: 10,
},
input: {
  backgroundColor: '#EFF5FF',
  height: 50,
  borderRadius: 25,
  paddingHorizontal: 20,
  fontSize: 14,
  marginBottom: 20,
  width: '100%',
  marginTop: 10,
},
row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
},
halfInput: {
    flex: 1,
    backgroundColor: '#EFF5FF',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#000',
    marginBottom: 20,
},
folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
},
plusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 2,
},
folderScroll: {
    flexDirection: 'row',
    overflow: 'scroll',
},
folderButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#6549FE',
},
folderText: {
    fontSize: 13,
    color: '#6549FE',
    fontWeight: 'bold',
},
selectedFolder: {
    borderWidth: 2,
    borderColor: '#6549FE',
},
textArea: {
    backgroundColor: '#EFF5FF',
    borderRadius: 25,
    padding: 20,
    fontSize: 14,
    textAlignVertical: 'top',
    height: 120,
    color: '#000',
    elevation: 9,
},
createButton: {
    marginTop: 30,
    backgroundColor: '#6549FE',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6549FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
},
createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
},

modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
},
modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    elevation: 6,
},
modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44349B',
    marginBottom: 10,
},
modalInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#EFF5FF',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 14,
    marginBottom: 20,
},
modalButton: {
    backgroundColor: '#fff',
    borderColor: '#6549FE',
    borderWidth: 1.2,
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 25,
},
modalButtonText: {
    color: '#6549FE',
    fontWeight: 'bold',
    fontSize: 16,
},
modalSubText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
    textAlign: 'center',
},
formContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 50,
  },
  textarea: {
    backgroundColor: '#EFF5FF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 14,
    height: 120,
    textAlignVertical: 'top',
    color: '#000',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F4F4F4',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  folderChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#6549FE',
    borderRadius: 20,
    marginRight: 10,
  },

  // Modal: Add Folder / Success / Added to Folder
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    width: '75%',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  dialogTitle: {
    fontSize: 18,
    color: '#44349B',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  dialogSub: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
    textAlign: 'center',
  },
  dialogButton: {
    backgroundColor: '#fff',
    borderColor: '#6549FE',
    borderWidth: 1.2,
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderRadius: 25,
    height: 35,
    textAlign: 'center',
    marginTop: 20,
  },
  dialogButtonText: {
    color: '#6549FE',
    fontWeight: 'bold',
    fontSize: 16,
  },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },  
  dateTimePicker: {
    backgroundColor: '#EFF5FF',
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  dateTimeText: {
    color: '#999',
    fontSize: 14,
  },  
  folderChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedChip: {
    backgroundColor: '#7C6BF6',
  },
  unselectedChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6549FE',
  },  
  dialogCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
});  