import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { isInNeighborhood, encodeGeohash } from '@/lib/geohash';

export default function Scan() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  async function handleScan({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const scannerGeohash = encodeGeohash(latitude, longitude);

      const { data: invite, error } = await supabase
        .from('invite_tokens')
        .select('*')
        .eq('id', data)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !invite) {
        Alert.alert('Invalid code', 'This code has expired or already been used.', [
          { text: 'Try again', onPress: () => setScanned(false) },
        ]);
        return;
      }

      if (!isInNeighborhood(invite.geohash, scannerGeohash)) {
        Alert.alert('Wrong location', 'You must be in the same neighborhood as your neighbor to join.', [
          { text: 'OK', onPress: () => setScanned(false) },
        ]);
        return;
      }

      await supabase.from('invite_tokens').update({ used: true }).eq('id', invite.id);
      await supabase.auth.updateUser({ data: { verified: true, geohash: invite.geohash } });

      router.replace('/(main)/feed');
    } catch {
      Alert.alert('Error', 'Something went wrong. Try again.');
      setScanned(false);
    }
  }

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>camera access needed to scan your neighbor's code</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>scan your neighbor's code</Text>
      <Text style={styles.subtitle}>ask a neighbor to open locally and show you their invite code</Text>
      <View style={styles.camera}>
        <CameraView
          style={StyleSheet.absoluteFill}
          onBarcodeScanned={handleScan}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
      </View>
      {__DEV__ && (
        <TouchableOpacity style={styles.skip} onPress={() => router.replace('/(main)/feed')}>
          <Text style={styles.skipText}>skip for now (dev only)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  back: { marginBottom: 16 },
  backText: { fontSize: 16, color: '#000' },
  title: { fontSize: 24, fontWeight: '600', marginTop: 60, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 32, lineHeight: 20 },
  camera: { flex: 1, borderRadius: 4, overflow: 'hidden', backgroundColor: '#000' },
  text: { flex: 1, textAlign: 'center', padding: 24, paddingTop: 120 },
  skip: { marginTop: 16, alignItems: 'center' },
  skipText: { fontSize: 13, color: '#aaa', textDecorationLine: 'underline' },
});
