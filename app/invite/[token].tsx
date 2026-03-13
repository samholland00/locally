import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

// Handles deep links: locally://invite/TOKEN
// Admin creates tokens in Supabase with no expiry and no GPS check required.
// Send the link via text/email to seed the first users in a neighborhood.

export default function InviteDeepLink() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState('verifying your invite...');

  useEffect(() => {
    redeem();
  }, [token]);

  async function redeem() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace({ pathname: '/(auth)/signup', params: { inviteToken: token } });
        return;
      }

      const { data: invite, error } = await supabase
        .from('invite_tokens')
        .select('*')
        .eq('id', token)
        .eq('used', false)
        .single();

      if (error || !invite) {
        setStatus('this invite is invalid or has already been used.');
        return;
      }

      await supabase.from('invite_tokens').update({ used: true }).eq('id', invite.id);
      await supabase.auth.updateUser({ data: { verified: true, geohash: invite.geohash } });

      router.replace('/(main)/feed');
    } catch {
      setStatus('something went wrong. please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  text: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 },
});
