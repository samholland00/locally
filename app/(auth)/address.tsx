import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { encodeGeohash } from '@/lib/geohash';
import { supabase } from '@/lib/supabase';

export default function Address() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    detectAddress();
  }, []);

  function promptOpenSettings() {
    Alert.alert(
      'Location required',
      'Locally needs your location to place you in your neighborhood. Please enable it in Settings.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  }

  async function detectAddress() {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        promptOpenSettings();
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (result) {
        const street = [result.streetNumber, result.street].filter(Boolean).join(' ');
        const parts = [street, result.city, result.region].filter(Boolean);
        setAddress(parts.join(', '));
      }
    } catch {
      // silent — user can type manually
    } finally {
      setDetecting(false);
    }
  }

  async function verify() {
    if (!address.trim()) return;
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        promptOpenSettings();
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
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>your address</Text>
      <Text style={styles.subtitle}>used only to place you in your neighborhood. never shown publicly.</Text>
      {detecting && <Text style={styles.detecting}>finding your location, this might take a moment...</Text>}
      <TextInput
        style={styles.input}
        placeholder={detecting ? '' : '123 Main St, City, State'}
        value={address}
        onChangeText={setAddress}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={verify}
        editable={!detecting}
      />
      <TouchableOpacity style={[styles.button, (loading || detecting) && styles.buttonDisabled]} onPress={verify} disabled={loading || detecting}>
        <Text style={styles.buttonText}>{loading ? 'verifying...' : 'continue'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  back: { position: 'absolute', top: 60, left: 24 },
  backText: { fontSize: 16, color: '#000' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 32, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 12, fontSize: 16, marginBottom: 16 },
  detecting: { fontSize: 13, color: '#888', marginBottom: 8, fontStyle: 'italic' },
  button: { backgroundColor: '#000', paddingVertical: 14, borderRadius: 4, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16 },
});
