import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTaskContext } from './TaskContext';

const { width } = Dimensions.get('window');

export default function FolderDetailsScreen() {
  const { folderTitle } = useLocalSearchParams<{ folderTitle: string }>();
  const { tasks, markTaskAsDone } = useTaskContext(); // ✅ include markTaskAsDone

  const filteredTasks = tasks.filter(task => task.folder === folderTitle);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{folderTitle}</Text>
        <View style={styles.iconGroup}>
          <Ionicons name="notifications-outline" size={23} color="#6549FE" style={{ marginRight: 10 }} />
          <Ionicons name="menu-outline" size={28} color="#6549FE" />
        </View>
      </View>

      {/* Title and Add Task */}
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.taskCount}>
            {filteredTasks.length} {folderTitle?.toString().toLowerCase()} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </Text>
          <Text style={styles.taskSub}>You can do it!</Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/mental_activities/AddNewTask',
              params: { folder: folderTitle },
            })
          }
        >
          <Text style={styles.addTaskText}>Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {filteredTasks.map((task, index) => (
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
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}{'  '}
              {task.time}
            </Text>

            {/* Edit and Done Buttons */}
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
                      taskIndex: tasks.findIndex(t => t === task).toString(),
                    },
                  })
                }
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => markTaskAsDone(tasks.findIndex(t => t === task))} // ✅ exact task index
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#44349B' },
  iconGroup: { flexDirection: 'row', alignItems: 'center' },
  titleRow: {
    marginTop: 25,
    marginBottom: 15,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCount: { fontSize: 18, fontWeight: 'bold', color: '#44349B', marginBottom: 2 },
  taskSub: { fontSize: 14, color: '#999' },
  addTaskText: { color: '#6549FE', fontWeight: 'bold', fontSize: 14 },

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
  taskImage: {
    width: '150%',
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
  },
  doneButton: {
    backgroundColor: 'white',
    paddingVertical: 2,
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
});
