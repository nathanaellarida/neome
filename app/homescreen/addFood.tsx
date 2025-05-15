import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable, Dimensions, View as RNView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { calculateNutrition, getServingSizeOptions } from '../utils/foodDatabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { G, Circle } from 'react-native-svg';
import { db, auth } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const CIRCLE_SIZE = 80;
const STROKE_WIDTH = 7;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Macro = { percent: number; color: string };

function MacroCircleProgress({ calories, macros }: { calories: number; macros: Macro[] }) {
  let start = 0;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
        <G rotation="-90" origin={`${CIRCLE_SIZE / 2},${CIRCLE_SIZE / 2}`}>
          {macros.map((macro: Macro, idx: number) => {
            const length = (macro.percent / 100) * CIRCUMFERENCE;
            const strokeDasharray = [length, CIRCUMFERENCE - length];
            const circle = (
              <Circle
                key={idx}
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={macro.color}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={-start}
              />
            );
            start += length;
            return circle;
          })}
        </G>
      </Svg>
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        alignItems: 'center', justifyContent: 'center'
      }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222' }}>{calories}</Text>
        <Text style={{ fontSize: 13, color: '#888' }}>cal</Text>
      </View>
    </View>
  );
}

export default function AddFood() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [servingSize, setServingSize] = useState('1 gram');
  const [numServings, setNumServings] = useState('1');
  const [meal, setMeal] = useState('Select a Meal');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const mealBtnRef = useRef<RNView>(null);
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    carbsPercent: 0,
    fatPercent: 0,
    proteinPercent: 0
  });

  // Update nutrition values when serving size or number of servings changes
  useEffect(() => {
    try {
      const servingSizeNum = parseInt(servingSize);
      const numServingsNum = parseInt(numServings);
      if (!isNaN(servingSizeNum) && !isNaN(numServingsNum)) {
        const calculatedNutrition = calculateNutrition(params.foodName as string, servingSizeNum, numServingsNum);
        setNutrition(calculatedNutrition);
      }
    } catch (error) {
      console.error('Error calculating nutrition:', error);
    }
  }, [servingSize, numServings, params.foodName]);

  const openModal = () => {
    if (mealBtnRef.current) {
      mealBtnRef.current.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
        setModalPos({ x: px, y: py + height });
        setModalVisible(true);
      });
    } else {
      setModalVisible(true);
    }
  };
  const closeModal = () => setModalVisible(false);

  // Save food log to Firestore
  const saveFoodLog = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not logged in');
      const foodLog = {
        foodName: params.foodName,
        servingSize,
        numServings,
        meal,
        calories: nutrition.calories,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        protein: nutrition.protein,
        createdAt: serverTimestamp(),
      };
      await addDoc(
        collection(db, 'users', user.uid, 'foodLogs'),
        foodLog
      );
      router.push({ pathname: './searchFood', params: { foodLogged: 'true' } });
    } catch (err) {
      console.error('Failed to save food log:', err);
      // Optionally show an error toast here
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Food</Text>
        <TouchableOpacity
          disabled={meal === 'Select a Meal'}
          style={{ opacity: meal === 'Select a Meal' ? 0.4 : 1 }}
          onPress={saveFoodLog}
        >
          <Ionicons
            name="checkmark"
            size={26}
            color={meal === 'Select a Meal' ? "#AAA" : "#222"}
          />
        </TouchableOpacity>
      </View>

      {/* Food Name */}
      <View style={styles.foodNameRow}>
        <Text style={styles.foodName}>{params.foodName}</Text>
        {params.healthy === 'true' && <Ionicons name="checkmark-circle" size={20} color="#22C55E" style={{ marginLeft: 6 }} />}
      </View>
      <Text style={styles.foodSubName}>{params.brand || 'No brand'}</Text>

      {/* Serving Size, Number of Servings, Meal */}
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Serving Size</Text>
        <TouchableOpacity style={styles.inputBox}>
          <Text style={styles.inputBoxText}>{servingSize}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Number of Servings</Text>
        <TextInput
          style={styles.inputBox}
          value={numServings}
          onChangeText={setNumServings}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Meal</Text>
        <TouchableOpacity
          style={styles.inputBox}
          onPress={openModal}
          ref={mealBtnRef}
        >
          <Text style={[styles.inputBoxText, meal === 'Select a Meal' && { color: '#F43F5E' }]}>{meal}</Text>
        </TouchableOpacity>
      </View>

      {/* Nutrition Summary */}
      <View style={[styles.nutritionRow, { marginTop: 30 }]}> 
        <View style={styles.calorieCircleContainer}>
          <MacroCircleProgress
            calories={nutrition.calories}
            macros={[
              { percent: nutrition.carbsPercent, color: '#06B6D4' },
              { percent: nutrition.fatPercent, color: '#F43F5E' },
              { percent: nutrition.proteinPercent, color: '#F59E42' },
            ]}
          />
        </View>
        <View style={styles.macroCol}>
          <Text style={[styles.macroPercent, { color: '#06B6D4' }]}>{nutrition.carbsPercent}%</Text>
          <Text style={styles.macroValue}>{nutrition.carbs} g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroCol}>
          <Text style={[styles.macroPercent, { color: '#F43F5E' }]}>{nutrition.fatPercent}%</Text>
          <Text style={styles.macroValue}>{nutrition.fat} g</Text>
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
        <View style={styles.macroCol}>
          <Text style={[styles.macroPercent, { color: '#F59E42' }]}>{nutrition.proteinPercent}%</Text>
          <Text style={styles.macroValue}>{nutrition.protein} g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
      </View>

      {/* Modal for meal selection */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View style={[
            styles.modalContent,
            {
              position: 'absolute',
              top: modalPos.y,
              left: Dimensions.get('window').width * 0.05,
              width: Dimensions.get('window').width * 0.9,
            },
          ]}>
            {mealOptions.map((option, idx) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalOption,
                  idx === 0 && styles.modalOptionTop,
                  idx === mealOptions.length - 1 && styles.modalOptionBottom,
                ]}
                onPress={() => {
                  setMeal(option);
                  closeModal();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
                {idx !== mealOptions.length - 1 && <View style={styles.modalDivider} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 18,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  foodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  foodName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  foodSubName: {
    fontSize: 15,
    color: '#888',
    marginBottom: 18,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  inputBox: {
    minWidth: 90,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#2563EB',
    backgroundColor: '#F9FAFB',
    textAlign: 'right',
  },
  inputBoxText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
    textAlign: 'right',
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 30,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  calorieCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  macroCol: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  macroPercent: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  macroLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 25,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    position: 'relative',
  },
  modalOptionTop: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalOptionBottom: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  modalOptionText: {
    fontSize: 17,
    color: '#222',
    textAlign: 'left',
    width: '100%',
  },
  modalDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});
