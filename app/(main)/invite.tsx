import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '@/lib/supabase';

const EXPIRY_SECONDS = 60;

export default function Invite() {
  const [token, setToken] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  async function generateToken() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const expiresAt = new Date(Date.now() + EXPIRY_SECONDS * 1000).toISOString();
    const { data, error } = await supabase
      .from('invite_tokens')
      .insert({ created_by: user.id, geohash: user.user_metadata.geohash, expires_at: expiresAt })
      .select('id')
      .single();

    if (error || !data) {
      Alert.alert('Error', 'Could not generate code. Try again.');
      return;
    }

    setToken(data.id);
    setSecondsLeft(EXPIRY_SECONDS);
  }

  useEffect(() => {
    if (secondsLeft <= 0) {
      setToken(null);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>invite a neighbor</Text>
      <Text style={styles.subtitle}>
        generate a code for a neighbor standing next to you.{' '}
        it expires in 60 seconds.
      </Text>
      {token ? (
        <View style={styles.qrWrap}>
          <QRCode value={token} size={200} />
          <Text style={styles.timer}>{secondsLeft}s</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={generateToken}>
          <Text style={styles.buttonText}>generate code</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 48, textAlign: 'center', lineHeight: 20 },
  qrWrap: { alignItems: 'center', gap: 16 },
  timer: { fontSize: 32, fontWeight: '300', color: '#888' },
  button: { backgroundColor: '#000', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 4 },
  buttonText: { color: '#fff', fontSize: 16 },
});
