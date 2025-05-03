import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MotivationalQuotesScreen() {
  const router = useRouter();

  // Sample motivational quotes data
  const [quotes, setQuotes] = useState([
    { id: '1', quote: "The only bad workout is the one that didn’t happen.’ Keep pushing toward your goals today!", time: '2025-04-09 08:30 AM' },
    { id: '2', quote: "Success is not the key to happiness. Happiness is the key to success.", time: '2025-04-08 07:00 PM' },
    { id: '3', quote: "The harder you work for something, the greater you'll feel when you achieve it.", time: '2025-04-08 02:00 PM' },
    { id: '4', quote: "Don't watch the clock; do what it does. Keep going.", time: '2025-04-07 09:00 AM' },
    { id: '5', quote: "Small steps every day lead to big results.", time: '2025-04-07 09:00 AM' },
    { id: '6', quote: "Don't watch the clock; do what it does. Keep going.", time: '2025-04-07 09:00 AM' },
    { id: '7', quote: "Wake up with determination, go to bed with satisfaction.’ Start your day strong!", time: '2025-04-07 09:00 AM' },
  ]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Motivational Quotes</Text>
        <Ionicons name="chatbubble-outline" size={24} color="#6549FE" />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quotes List */}
        <View style={styles.quotesSection}>
          {quotes.map(quote => (
            <View key={quote.id} style={styles.quoteCard}>
              <View style={styles.textContainer}>
                <Text style={styles.quoteText}>{quote.quote}</Text>
                <Text style={styles.quoteTime}>{quote.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF2FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  scrollContent: {
    padding: 20,
  },
  quotesSection: {
    marginBottom: 40,
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#333',
    marginBottom: 8,
  },
  quoteTime: {
    fontSize: 12,
    color: '#AAA',
  },
});
