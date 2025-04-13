import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Modal, Dimensions, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, router } from 'expo-router';
import { useTaskContext } from './TaskContext';
import { useFolderContext } from './FolderContext';

const { width } = Dimensions.get('window');

export default function EditTask() {
  const {
    title: paramTitle,
    description: paramDescription,
    date: paramDate,
    time: paramTime,
    folder: paramFolder,
    taskIndex,
  } = useLocalSearchParams<{
    title: string;
    description: string;
    date: string;
    time: string;
    folder: string;
    taskIndex: string;
  }>();

  const { tasks, updateTaskList } = useTaskContext();
  const { folders, addFolder } = useFolderContext();

  const task = tasks[parseInt(taskIndex)];
  const [title, setTitle] = useState(paramTitle || '');
  const [description, setDescription] = useState(paramDescription || '');
  const [dateObj, setDateObj] = useState<Date | null>(paramDate ? new Date(paramDate) : null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState(paramTime || '');
  const [timeObj, setTimeObj] = useState<Date | null>(null);
  const [selectedFolder, setSelectedFolder] = useState(paramFolder || '');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

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

  useEffect(() => {
    if (dateObj) {
      setDate(formatDate(dateObj));
    }
  }, [dateObj]);

  const handleSaveChanges = () => {
    if (!title || !dateObj || !time) return;

    const updatedTask = {
      ...task,
      title,
      description,
      date: dateObj.toISOString().split('T')[0],
      time,
      folder: selectedFolder,
    };

    const updatedTasks = tasks.map((t, index) =>
      index === parseInt(taskIndex) ? updatedTask : t
    );

    updateTaskList(updatedTasks);
    setShowSaveSuccess(true);
  };

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
  };

  const handleDone = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Task</Text>
        <Ionicons name="notifications-outline" size={23} color="#6549FE" />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.whiteCard}>
          <Text style={styles.label}>Task Title</Text>
          <TextInput value={title} onChangeText={setTitle} style={styles.input} />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Set Date</Text>
              <TouchableOpacity style={styles.dateTimePicker} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateTimeText}>{date || 'mm/dd/yyyy'}</Text>
                <Ionicons name="calendar" size={20} color="#6549FE" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Set Time</Text>
              <TouchableOpacity style={styles.dateTimePicker} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.dateTimeText}>{time || '00:00'}</Text>
                <Ionicons name="time" size={20} color="#6549FE" />
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateObj || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, selectedDate) => {
                if (selectedDate) setDateObj(selectedDate);
                setShowDatePicker(false);
              }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={timeObj || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, selectedTime) => {
                if (selectedTime) {
                  setTime(formatTime(selectedTime));
                  setTimeObj(selectedTime);
                }
                setShowTimePicker(false);
              }}
            />
          )}

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
                    style={[styles.folderChip, isSelected ? styles.selectedChip : styles.unselectedChip]}
                    onPress={() => setSelectedFolder(prev => (prev === folder.title ? '' : folder.title))}
                  >
                    <Text style={[styles.folderText, isSelected && { color: 'white' }]}>{folder.title}</Text>
                    {isSelected && <Ionicons name="checkmark" size={16} color="white" style={{ marginLeft: 5 }} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description"
            multiline
            style={styles.textarea}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showSaveSuccess} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Task Updated Successfully!</Text>
            <Ionicons name="checkmark-circle-outline" size={100} color="#00BB16" />
            <TouchableOpacity onPress={handleDone} style={styles.dialogButton}>
              <Text style={styles.dialogButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddFolderModal} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <TouchableOpacity style={styles.dialogCloseButton} onPress={() => setShowAddFolderModal(false)}>
                <Ionicons name="close" size={20} color="#6549FE" />
            </TouchableOpacity>
            <Text style={styles.dialogTitle}>New Folder</Text>
            <TextInput
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Enter folder name"
              style={styles.input}
            />
            <TouchableOpacity onPress={handleCreateFolder} style={styles.dialogButton}>
              <Text style={styles.dialogButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF2FF' },
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
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#44349B' },
  formContainer: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 80 },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 25,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#44349B',
    marginBottom: 6,
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
  },
  dateTimeText: {
    color: '#999',
    fontSize: 14,
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
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  folderChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#6549FE',
    borderRadius: 20,
    marginRight: 10,
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
  folderText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  saveButton: {
    backgroundColor: '#6549FE',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    width: '70%',
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
    fontWeight: 'bold',
    color: '#44349B',
    marginBottom: 15,
  },
  dialogButton: {
    backgroundColor: '#fff',
    borderColor: '#6549FE',
    borderWidth: 1.2,
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  dialogButtonText: {
    color: '#6549FE',
    fontWeight: 'bold',
    fontSize: 16,
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
  dialogCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
});
