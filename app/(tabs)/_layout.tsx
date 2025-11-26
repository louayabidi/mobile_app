import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My App 👋</Text>
      <Text style={styles.subtitle}>Choose an option</Text>

      <Link href="/crud" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Go to CRUD Page</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
