import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  title: string;
  description: string;
  date: string;
  time: string;
  image: any;
  bgColor: string;
  folder: string;
}

// ✅ Get current date in yyyy-mm-dd format
const getLocalTodayDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const today = getLocalTodayDate();

const generateDefaultTasks = (): Task[] => [
  {
    title: 'Walk 10,000 steps',
    description: 'This is the description for this task. This is the description for this task.',
    date: today,
    time: '7:00 PM',
    image: require('../app/assets/images/plaintask1.png'),
    bgColor: '#A6C6FF',
    folder: 'Daily Tasks',
  },
  {
    title: '45-minute cardio',
    description: 'This is the description for this task.',
    date: today,
    time: '3:00 PM',
    image: require('../app/assets/images/plaintask2.png'),
    bgColor: '#FBC7D4',
    folder: 'Daily Tasks',
  },
  {
    title: 'Drink 2 liters of water',
    description: 'This is the description for this task. So tiring.',
    date: today,
    time: '2:40 PM',
    image: require('../app/assets/images/plaintask3.png'),
    bgColor: '#8BE4A4',
    folder: 'Hydration Goals',
  },
  {
    title: '20-minute walk',
    description: 'This is the description for this task.',
    date: today,
    time: '9:05 AM',
    image: require('../app/assets/images/plaintask4.png'),
    bgColor: '#A2E6F4',
    folder: 'Outdoor Fun',
  },
  {
    title: 'Guided meditation',
    description: 'This is the description for this task. This is the description for this task.',
    date: today,
    time: '11:30 AM',
    image: require('../app/assets/images/plaintask5.png'),
    bgColor: '#FFD96A',
    folder: 'Indoor Activities',
  },
];

type TaskContextType = {
  tasks: Task[];
  completedTasks: Task[];
  addTask: (task: Task) => void;
  updateTaskList: (newList: Task[]) => void;
  markTaskAsDone: (index: number) => void;
};

const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(generateDefaultTasks());
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const updateTaskList = (newList: Task[]) => {
    setTasks(newList);
  };

  const markTaskAsDone = (index: number) => {
    const taskToMove = tasks[index];
    if (!taskToMove) return;
    setTasks(prev => prev.filter((_, i) => i !== index));
    setCompletedTasks(prev => [...prev, taskToMove]);
  };

  return (
    <TaskContext.Provider
      value={{ tasks, completedTasks, addTask, updateTaskList, markTaskAsDone }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to access task context safely
export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

