import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>locally</Text>
      <Text style={styles.subtitle}>your neighbors. nothing else.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/address')}>
        <Text style={styles.buttonText}>get started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 48 },
  button: { backgroundColor: '#000', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 4 },
  buttonText: { color: '#fff', fontSize: 16 },
});
