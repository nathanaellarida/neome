import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const initialFolders = [
  { title: 'Daily Tasks', tasks: 2, image: require('../assets/images/folder1.png') },
  { title: 'School Activities', tasks: 3, image: require('../assets/images/folder2.png') },
  { title: 'Hydration Goals', tasks: 1, image: require('../assets/images/folder3.png') },
  { title: 'Outdoor Fun', tasks: 3, image: require('../assets/images/folder4.png') },
  { title: 'Indoor Activities', tasks: 2, image: require('../assets/images/folder2.png') },
];

const tasks = [
  {
    title: 'Walk 10,000 steps',
    date: 'Today, November 3, 2024',
    time: '7:00 PM',
    image: require('../assets/images/task1.png'),
    bgColor: '#A6C6FF',
  },
  {
    title: '45-minute cardio',
    date: 'Today, November 3, 2024',
    time: '7:00 PM',
    image: require('../assets/images/task2.png'),
    bgColor: '#FBC7D4',
  },
  {
    title: 'Drink 2 liters of water',
    date: 'Today, November 3, 2024',
    time: '7:00 PM',
    image: require('../assets/images/task3.png'),
    bgColor: '#8BE4A4',
  },
];

export default function MentalActivities() {
  const [folders, setFolders] = useState(initialFolders);
  const [folderName, setFolderName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleCreateFolder = () => {
    if (folderName.trim() === '') return;

    setFolders(prev => [
      ...prev,
      {
        title: folderName,
        tasks: 0,
        image: require('../assets/images/folder1.png'),
      },
    ]);
    setShowCreateDialog(false);
    setShowSuccessDialog(true);
    setFolderName('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To-do</Text>
        <View style={styles.iconGroup}>
          <Ionicons name="notifications-outline" size={23} color="#6549FE" style={{ marginRight: 10 }} />
          <Ionicons name="menu-outline" size={28} color="#6549FE" />
        </View>
      </View>

      {/* Scrollable Body */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Folders */}
        <View style={styles.folderHeader}>
          <Text style={styles.folderTitle}>Your Folders ({folders.length})</Text>
          <TouchableOpacity onPress={() => setShowCreateDialog(true)}>
            <Text style={styles.newFolder}>Create New Folder</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.folderScroll}>
          {folders.map((folder, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.folderCard,
                index === folders.length - 1 && { marginRight: 40 },
              ]}
            >
              <Text style={styles.folderName}>{folder.title}</Text>
              <Text style={styles.folderTasks}>{folder.tasks} Tasks</Text>
              <Image source={folder.image} style={styles.folderImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tasks */}
        <View style={styles.tasksHeader}>
          <Text style={styles.taskTitle}>Today's Tasks ({tasks.length})</Text>
          <View style={{ flexDirection: 'column', gap: 2 }}>
            <TouchableOpacity>
              <Text style={styles.link}>See All Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.link}>View Completed tasks</Text>
            </TouchableOpacity>
          </View>
        </View>

        {tasks.map((task, index) => (
          <View key={index} style={[styles.taskCard, { backgroundColor: task.bgColor }]}>
            <Image source={task.image} style={styles.taskImage} />
            <View>
              <Text style={styles.taskText}>{task.title}</Text>
              <Text style={styles.taskSub}>{task.date}</Text>
              <Text style={styles.taskSub}>{task.time}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Create Folder Dialog */}
      <Modal visible={showCreateDialog} transparent animationType="fade">
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogBox}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.dialogCloseButton}
            onPress={() => setShowCreateDialog(false)}
          >
            <Ionicons name="close" size={20} color="#6549FE" />
          </TouchableOpacity>

          <Text style={styles.dialogTitle}>Folder name</Text>
          <TextInput
            value={folderName}
            onChangeText={setFolderName}
            placeholder="Enter folder name"
            style={styles.dialogInput}
            placeholderTextColor="#6549FE"
          />
          <TouchableOpacity style={styles.dialogButton} onPress={handleCreateFolder}>
            <Text style={styles.dialogButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

      {/* Success Dialog */}
      <Modal visible={showSuccessDialog} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={[styles.dialogTitle, { textAlign: 'center' }]}>
              Folder{'\n'}<Text style={{ fontWeight: 'bold' }}>Successfully Created!</Text>
            </Text>
            <Text style={styles.dialogSub}>Start adding tasks to this folder.</Text>
            <Ionicons name="checkmark-circle-outline" size={80} color="green" />
            <TouchableOpacity style={styles.dialogButton} onPress={() => setShowSuccessDialog(false)}>
              <Text style={styles.dialogButtonText}>Close</Text>
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
  container: { flex: 1, backgroundColor: '#EFF2FF' },
  scrollContent: { paddingBottom: 80 },
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#44349B', marginRight: 130 },
  iconGroup: { flexDirection: 'row', alignItems: 'center' },
  folderHeader: {
    marginTop: 20,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  folderTitle: { fontSize: 16, fontWeight: 'bold', color: '#44349B' },
  newFolder: { color: '#6549FE', fontWeight: '500' },
  folderScroll: {
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  folderCard: {
    width: 160,
    height: 180,
    backgroundColor: 'white',
    marginRight: 15,
    borderRadius: 20,
    padding: 15,
    justifyContent: 'space-between',
    elevation: 4,
    overflow: 'hidden',
  },
  folderName: { fontSize: 16, fontWeight: 'bold', color: '#6549FE' },
  folderTasks: { fontSize: 12, color: '#888' },
  folderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
    bottom: 20,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 10,
  },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#44349B' },
  link: { fontSize: 12, color: '#6549FE' },
  taskCard: {
    borderRadius: 20,
    height: 175,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  taskText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  taskSub: { fontSize: 12, color: 'white', marginTop: 2 },
  editButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    width: 56,
  },
  editText: { fontSize: 12, color: '#6549FE', fontWeight: 'bold', alignSelf: 'center' },
  taskImage: {
    width: '150%',
    height: '140%',
    position: 'absolute',
    resizeMode: 'stretch',
    right: 0,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    width: '80%',
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
    marginBottom: 15,
  },
  dialogInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#EFF5FF',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
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
  },
  dialogButtonText: {
    color: '#6549FE',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dialogSub: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
    textAlign: 'center',
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
  dialogCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },  
});
