import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Compose() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: content.trim(),
        geohash: user.user_metadata.geohash,
      });
      if (error) throw error;
      setContent('');
      router.replace('/(main)/feed');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not post. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>new post</Text>
        <TouchableOpacity onPress={submit} disabled={loading || !content.trim()}>
          <Text style={[styles.post, (!content.trim() || loading) && styles.postDisabled]}>post</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="what's going on in the neighborhood?"
        value={content}
        onChangeText={setContent}
        multiline
        maxLength={500}
        autoFocus
      />
      <Text style={styles.count}>{content.length}/500</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cancel: { fontSize: 16, color: '#666' },
  title: { fontSize: 18, fontWeight: '600' },
  post: { fontSize: 16, fontWeight: '600' },
  postDisabled: { color: '#aaa' },
  input: { flex: 1, padding: 16, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' },
  count: { padding: 16, textAlign: 'right', color: '#aaa', fontSize: 12 },
});
