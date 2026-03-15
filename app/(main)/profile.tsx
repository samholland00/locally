import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase
      .from('users')
      .select('*')
      .single()
      .then(({ data }) => { if (data) setUser(data as User); });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/welcome');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>profile</Text>
      {user && (
        <View style={styles.body}>
          <Text style={styles.name}>{user.display_name}</Text>
          <Text style={styles.street}>{user.street_name}</Text>
        </View>
      )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: '600', padding: 16, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#eee' },
  body: { padding: 16, gap: 4 },
  name: { fontSize: 18, fontWeight: '600' },
  street: { fontSize: 14, color: '#888' },
  signout: { padding: 16, color: '#c00' },
});
