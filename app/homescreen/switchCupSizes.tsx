import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCupSize } from '../context/CupSizeContext';
import { useRouter } from 'expo-router';

const cupSizes = [
  { id: '100', label: '100 mL', image: require('../../assets/images/cupsizes/100ml.png') },
  { id: '125', label: '125 mL', image: require('../../assets/images/cupsizes/125ml.png') },
  { id: '150', label: '150 mL', image: require('../../assets/images/cupsizes/150ml.png') },
  { id: '200', label: '200 mL', image: require('../../assets/images/cupsizes/200ml.png') },
  { id: '250', label: '250 mL', image: require('../../assets/images/cupsizes/250ml.png') },
  { id: '300', label: '300 mL', image: require('../../assets/images/cupsizes/300ml.png') },
  { id: '350', label: '350 mL', image: require('../../assets/images/cupsizes/350ml.png') },
  { id: '400', label: '400 mL', image: require('../../assets/images/cupsizes/400ml.png') },
  { id: '500', label: '500 mL', image: require('../../assets/images/cupsizes/500ml.png') },
  { id: '600', label: '600 mL', image: require('../../assets/images/cupsizes/600ml.png') },
];

const drinks = [
  { id: 'coffee', label: 'Coffee', image: require('../../assets/images/cupsizes/coffee.png') },
  { id: 'tea', label: 'Tea', image: require('../../assets/images/cupsizes/tea.png') },
  { id: 'juice', label: 'Juice', image: require('../../assets/images/cupsizes/juice.png') },
  { id: 'sport', label: 'Sport D...', image: require('../../assets/images/cupsizes/sportsdrink.png') },
  { id: 'coconut', label: 'Coconut...', image: require('../../assets/images/cupsizes/coconut.png') },
  { id: 'smoothie', label: 'Smoothie', image: require('../../assets/images/cupsizes/smoothie.png') },
  { id: 'chocolate', label: 'Chocola...', image: require('../../assets/images/cupsizes/chocolate.png') },
  { id: 'cola', label: 'Cola', image: require('../../assets/images/cupsizes/cola.png') },
];

export default function SwitchCupSizes() {
  const { setCup } = useCupSize();
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="close" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Switch Cup Size</Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Cup Sizes Grid */}
        <View style={styles.gridSection}> 
          {Array.from({ length: Math.ceil(cupSizes.length / 4) }).map((_, rowIdx) => {
            const rowItems = cupSizes.slice(rowIdx * 4, rowIdx * 4 + 4);
            const placeholders = Array(4 - rowItems.length).fill(null);
            return (
              <View key={rowIdx} style={styles.gridRow}>
                {rowItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.gridItem}
                    onPress={() => {
                      setCup(item);
                      router.push('./waterIntake');
                    }}
                  >
                    <View style={[styles.gridIcon, { borderColor: '#E0E0E0' }]}> 
                      <Image source={item.image} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                    </View>
                    <Text style={styles.gridLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
                {placeholders.map((_, idx) => (
                  <View key={idx} style={styles.gridItem} />
                ))}
              </View>
            );
          })}
        </View>
        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.orDrink}>Or Drink</Text>
          <View style={styles.divider} />
        </View>
        {/* Drinks Grid */}
        <View style={styles.gridSection}>
          {Array.from({ length: Math.ceil(drinks.length / 4) }).map((_, rowIdx) => {
            const rowItems = drinks.slice(rowIdx * 4, rowIdx * 4 + 4);
            const placeholders = Array(4 - rowItems.length).fill(null);
            return (
              <View key={rowIdx} style={styles.gridRow}>
                {rowItems.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.gridItem}>
                    <View style={[styles.gridIcon, { borderColor: '#E0E0E0' }]}> 
                      <Image source={item.image} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                    </View>
                    <Text style={styles.gridLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
                {placeholders.map((_, idx) => (
                  <View key={idx} style={styles.gridItem} />
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  gridSection: {
    paddingHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridItem: {
    width: '23%',
    alignItems: 'center',
    marginVertical: 10,
  },
  gridIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  gridLabel: {
    fontSize: 13,
    color: '#222',
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orDrink: {
    marginHorizontal: 10,
    color: '#888',
    fontSize: 13,
  },
});
