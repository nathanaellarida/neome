import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTaskContext } from '../../contexts/TaskContext';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function CompletedTasksScreen() {
  const { completedTasks } = useTaskContext();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Tasks</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Task List */}
      <ScrollView contentContainerStyle={styles.content}>
        {completedTasks.length === 0 ? (
          <Text style={styles.noTasks}>No completed tasks yet.</Text>
        ) : (
          completedTasks.map((task, index) => (
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
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF2FF' },
  header: {
    paddingTop: 20,
    height: 75,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#44349B' },
  content: { padding: 20 },
  noTasks: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: '#999',
  },
  taskCard: {
    borderRadius: 20,
    height: 175,
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
});
