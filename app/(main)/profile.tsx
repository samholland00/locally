import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

const EXPIRY_SECONDS = 60;

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<{ email: string; first_name: string; last_name: string; address_raw: string } | null>(null);
  const [invitedCount, setInvitedCount] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: au } }) => {
      if (au) {
        setAuthUser({
          email: au.email ?? '',
          first_name: au.user_metadata.first_name ?? '',
          last_name: au.user_metadata.last_name ?? '',
          address_raw: au.user_metadata.address_raw ?? '',
        });
        supabase
          .from('invite_tokens')
          .select('id', { count: 'exact', head: true })
          .eq('created_by', au.id)
          .then(({ count }) => setInvitedCount(count ?? 0));
      }
    });

    supabase
      .from('users')
      .select('*')
      .single()
      .then(({ data }) => { if (data) setUser(data as User); });
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setToken(null);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  async function generateToken() {
    const { data: { user: au } } = await supabase.auth.getUser();
    if (!au) return;
    const expiresAt = new Date(Date.now() + EXPIRY_SECONDS * 1000).toISOString();
    const { data, error } = await supabase
      .from('invite_tokens')
      .insert({ created_by: au.id, geohash: au.user_metadata.geohash, expires_at: expiresAt })
      .select('id')
      .single();
    if (error || !data) {
      Alert.alert('Error', 'Could not generate code. Try again.');
      return;
    }
    setToken(data.id);
    setSecondsLeft(EXPIRY_SECONDS);
    setInvitedCount((c) => c + 1);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/welcome');
  }

  const address = user?.street_name || authUser?.address_raw || '—';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>profile</Text>

      <View style={styles.section}>
        {authUser && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>name</Text>
              <Text style={styles.value}>{authUser.first_name} {authUser.last_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>email</Text>
              <Text style={styles.value}>{authUser.email}</Text>
            </View>
          </>
        )}
        {user && (
          <View style={styles.row}>
            <Text style={styles.label}>display name</Text>
            <Text style={styles.value}>{user.display_name}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>address</Text>
          <Text style={styles.value}>{address}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>neighbors invited</Text>
          <Text style={styles.value}>{invitedCount}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.inviteSection}>
        <Text style={styles.inviteTitle}>invite a neighbor</Text>
        <Text style={styles.inviteSubtitle}>generate a code for a neighbor standing next to you. it expires in 60 seconds.</Text>
        {token ? (
          <View style={styles.qrWrap}>
            <QRCode value={token} size={180} />
            <Text style={styles.timer}>{secondsLeft}s</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.button} onPress={generateToken}>
            <Text style={styles.buttonText}>generate code</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      <TouchableOpacity
        onPress={() =>
          Alert.alert('Sign out', 'Are you sure?', [
            { text: 'Cancel' },
            { text: 'Sign out', style: 'destructive', onPress: signOut },
          ])
        }
      >
        <Text style={styles.signout}>sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 48 },
  header: { fontSize: 20, fontWeight: '600', padding: 16, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#eee' },
  section: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, color: '#888' },
  value: { fontSize: 14, fontWeight: '500', flexShrink: 1, textAlign: 'right', marginLeft: 16 },
  divider: { height: 1, backgroundColor: '#eee', marginHorizontal: 16 },
  inviteSection: { padding: 16, gap: 12, alignItems: 'center' },
  inviteTitle: { fontSize: 16, fontWeight: '600', alignSelf: 'flex-start' },
  inviteSubtitle: { fontSize: 13, color: '#888', lineHeight: 18, alignSelf: 'flex-start' },
  qrWrap: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  timer: { fontSize: 28, fontWeight: '300', color: '#888' },
  button: { backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 4 },
  buttonText: { color: '#fff', fontSize: 15 },
  signout: { padding: 16, color: '#c00' },
});
