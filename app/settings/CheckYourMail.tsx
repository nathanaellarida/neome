import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CheckYourMailScreen() {
  const router = useRouter();

  const handleOpenEmailApp = () => {
    Linking.openURL('mailto:');
  };

  return (
    <View style={styles.container}>
      {/* Header (fixed at top, like changePassword.tsx) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <Ionicons name="lock-closed" size={24} color="#6549FE" />
      </View>
      {/* Centered Content */}
      <View style={styles.centeredContent}>
        {/* Email Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="mail-open-outline" size={56} color="#8B5CF6" />
        </View>
        {/* Title */}
        <Text style={styles.title}>Check your mail</Text>
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          We have sent a password recover instructions to your email.
        </Text>
        {/* Open Email App Button */}
        <TouchableOpacity style={styles.openEmailButton} onPress={handleOpenEmailApp}>
          <Text style={styles.openEmailButtonText}>Open email app</Text>
        </TouchableOpacity>
        {/* Skip Link */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.skipText}>Skip, I'll confirm later</Text>
        </TouchableOpacity>
      </View>
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Did not receive the email? Check your spam filter, {' '}
          <Text style={styles.footerLink} onPress={() => router.replace('/settings/changePassword')}>
            or try another email address
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: -15,
    paddingVertical: 20,
    width: '100%',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: '#F3F0FF',
    borderRadius: 32,
    padding: 18,
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 28,
  },
  openEmailButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
  },
  openEmailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  skipText: {
    color: '#8B5CF6',
    fontSize: 15,
    marginBottom: 40,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  footerText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
  },
  footerLink: {
    color: '#8B5CF6',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
}); 