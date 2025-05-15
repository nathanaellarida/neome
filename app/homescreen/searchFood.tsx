import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

const demoFoods = [
  { name: 'White Rice', cal: 260, grams: 200, brand: '', healthy: true },
  { name: 'Boiled Eggs', cal: 82, grams: 57, brand: '', healthy: true },
  { name: 'Hot and Spicy', cal: 154, grams: 86, brand: 'Century Tuna', healthy: false },
  { name: 'Roasted Chicken', cal: 219, grams: 98, brand: '', healthy: true },
  { name: 'Corned Tuna', cal: 96, grams: 58, brand: 'San Marino', healthy: false },
];

const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export default function SearchFood() {
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('Select a Meal');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [modalPos, setModalPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.foodLogged === 'true') {
      Toast.show({
        type: 'success',
        text1: 'Food Logged!',
        position: 'bottom',
        visibilityTime: 2000,
      });
      // Remove the param so it doesn't show again if you navigate back
      router.setParams({ foodLogged: undefined });
    }
  }, [params.foodLogged]);

  const openModal = (food: any, y: number, x: number) => {
    setSelectedFood(food);
    setModalPos({ x, y });
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setSelectedFood(null);
  };

  return (
    <View style={styles.container}>
      {/* Header with dropdown */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push('./foodTracking')}>
          <Ionicons name="close" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mealDropdown}>
          <Text style={styles.mealDropdownText}>{mealType}</Text>
          <Ionicons name="chevron-down" size={18} color="#2563EB" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#2563EB" style={{ marginRight: 6 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a food"
          placeholderTextColor="#A3A3A3"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#A3A3A3" />
          </TouchableOpacity>
        )}
      </View>

      {/* History and Filter */}
      <View style={styles.historyRow}>
        <Text style={styles.historyLabel}>History</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="funnel-outline" size={18} color="#222" />
          <Text style={styles.filterText}>Most Recent</Text>
        </TouchableOpacity>
      </View>

      {/* Food List */}
      <FlatList
        data={demoFoods}
        keyExtractor={item => item.name}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.foodCard} 
            activeOpacity={0.8} 
            onPress={() => router.push({
              pathname: './addFood',
              params: { 
                foodName: item.name,
                calories: item.cal,
                grams: item.grams,
                brand: item.brand,
                healthy: item.healthy.toString()
              }
            })}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.foodName}>{item.name}</Text>
                {item.healthy && <Ionicons name="checkmark-circle" size={15} color="#22C55E" style={{ marginLeft: 4 }} />}
              </View>
              <Text style={styles.foodDetails}>
                {item.cal} cal, {item.grams} gram{item.grams > 1 ? 's' : ''}
                {item.brand ? `, ${item.brand}` : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={event => {
                const handle = event.target;
                handle.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
                  openModal(item, py + height, px);
                });
              }}
            >
              <Ionicons name="add" size={22} color="#2563EB" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

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
                  setMealType(option);
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
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 18,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mealDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  mealDropdownText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  historyLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  filterText: {
    color: '#222',
    fontSize: 13,
    marginLeft: 3,
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 15,
    marginBottom: 12,
  },
  foodName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  foodDetails: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    padding: 4,
    marginLeft: 10,
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
