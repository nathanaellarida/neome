import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTaskContext } from './TaskContext';
import { useFolderContext } from './FolderContext';

const { width } = Dimensions.get('window');

export default function AllTasksScreen() {
  const { tasks, markTaskAsDone } = useTaskContext();
  const { folders } = useFolderContext();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Tasks</Text>
        <View style={styles.iconGroup} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Pending Label + Add Task */}
        <View style={styles.pendingRow}>
          <Text style={styles.pendingLabel}>{tasks.length} total tasks pending</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/mental_activities/AddNewTask',
              })
            }
          >
            <Text style={styles.addTaskButton}>Add Task</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.encouragement}>You got this!</Text>

        {tasks.map((task, index) => (
          <View key={index} style={[styles.taskCard, { backgroundColor: task.bgColor }]}>
            <Image source={task.image} style={styles.taskImage} />
            <View>
              <Text style={styles.taskText}>{task.title}</Text>
              {task.description !== '' && (
                <Text style={styles.taskDescription}>{task.description}</Text>
              )}
            </View>
            <Text style={styles.taskDateTime}>
              {new Date(task.date).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{'  '}
              {task.time}
            </Text>

            <View style={styles.taskActions}>
            <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: '/mental_activities/EditTask',
                    params: {
                      title: task.title,
                      description: task.description,
                      date: task.date,
                      time: task.time,
                      folder: task.folder,
                      taskIndex: index.toString(),
                    },
                  })
                }
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => markTaskAsDone(index)} // ✅ call on press
              >
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
  iconGroup: { flexDirection: 'row', alignItems: 'center' },
  scrollContent: {
    paddingBottom: 10,
    paddingTop: 20,
  },
  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 25,
    marginLeft: 20,
    marginBottom: 5,
  },
  pendingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44349B',
  },
  encouragement: {
    fontSize: 14,
    color: '#999',
    marginLeft: 28,
    marginBottom: 20,
  },
  addTaskButton: {
    fontSize: 14,
    color: '#6549FE',
    fontWeight: '600',
  },
  taskCard: {
    borderRadius: 20,
    height: 175,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  taskText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  taskSub: { fontSize: 12, color: 'white', marginTop: 2 },
  taskImage: {
    width: '140%',
    height: '140%',
    position: 'absolute',
    resizeMode: 'stretch',
    right: 0,
  },
  taskActions: {
    position: 'absolute',
    top: 15,
    right: 20,
    flexDirection: 'column',
    gap: 5,
  },
  editButton: {
    backgroundColor: 'white',
    paddingVertical: 2,
    borderRadius: 20,
    marginBottom: 5,
    width: 56,
    marginRight: 0,
    marginTop: 5,
  },
  doneButton: {
    backgroundColor: 'white',
    paddingVertical: 2,
    paddingHorizontal: 12,
    borderRadius: 20,
    width: 56,
  },
  editText: {
    fontSize: 12,
    color: '#6549FE',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  doneText: {
    fontSize: 12,
    color: '#6549FE',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  taskDescription: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
    marginBottom: 8,
    paddingRight: 40,
  },
  taskDateTime: {
    fontSize: 12,
    color: 'white',
    position: 'absolute',
    bottom: 15,
    left: 20,
  },  
});
