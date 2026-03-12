import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { encodeGeohash } from '@/lib/geohash';
import { supabase } from '@/lib/supabase';

export default function Address() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  async function verify() {
    if (!address.trim()) return;
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location required', 'We need your location to verify your address.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const geohash = encodeGeohash(latitude, longitude);

      await supabase.auth.updateUser({
        data: { geohash, address_raw: address },
      });

      router.push('/(auth)/scan');
    } catch {
      Alert.alert('Error', 'Could not verify location. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>your address</Text>
      <Text style={styles.subtitle}>used only to place you in your neighborhood. never shown publicly.</Text>
      <TextInput
        style={styles.input}
        placeholder="123 Main St, City, State"
        value={address}
        onChangeText={setAddress}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={verify}
      />
      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={verify} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'verifying...' : 'continue'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 32, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 12, fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: '#000', paddingVertical: 14, borderRadius: 4, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16 },
});
