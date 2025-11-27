// app/(tabs)/index.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function HomePage() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#1e3a8a" />

      <View style={styles.container}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="barbell" size={80} color="#1e90ff" />
          </View>
          
          <Text style={styles.title}>Med Workout Team</Text>
          <Text style={styles.subtitle}>Manage your gym members effortlessly</Text>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.featureCard}>
            <Ionicons name="people" size={32} color="#00d4aa" />
            <Text style={styles.featureTitle}>Members</Text>
            <Text style={styles.featureDesc}>Track all subscribers</Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="calendar" size={32} color="#ff6b6b" />
            <Text style={styles.featureTitle}>Subscriptions</Text>
            <Text style={styles.featureDesc}>Monitor expiry dates</Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="stats-chart" size={32} color="#ffd700" />
            <Text style={styles.featureTitle}>Analytics</Text>
            <Text style={styles.featureDesc}>View gym statistics</Text>
          </View>
        </View>

        {/* Main Action Button */}
        <Link href="/members" asChild>
          <Pressable style={styles.mainButton}>
            {({ pressed }) => (
              <View style={[styles.buttonContent, pressed && styles.buttonPressed]}>
                <Ionicons name="arrow-forward-circle" size={28} color="white" />
                <Text style={styles.buttonText}>Go to Members</Text>
              </View>
            )}
          </Pressable>
        </Link>

        {/* Footer */}
        <Text style={styles.footer}>Powered by Med Workout Team © 2025</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#1e90ff',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  featureTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  featureDesc: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
  },
  mainButton: {
    backgroundColor: '#1e90ff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1e90ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 30,
  },
});