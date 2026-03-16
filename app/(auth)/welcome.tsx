import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>locally</Text>
      <Text style={styles.subtitle}>Your neighbors. Nothing else.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.buttonText}>Get started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontFamily: 'DMSans_600SemiBold', marginBottom: 8 },
  subtitle: { fontSize: 16, fontFamily: 'DMSans_400Regular', color: '#666', marginBottom: 48 },
  button: { backgroundColor: '#000', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans_600SemiBold' },
});
