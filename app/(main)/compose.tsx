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
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New post</Text>
        <TouchableOpacity onPress={submit} disabled={loading || !content.trim()}>
          <Text style={[styles.post, (!content.trim() || loading) && styles.postDisabled]}>Post</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="What's going on in the neighborhood?"
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
  cancel: { fontSize: 16, fontFamily: 'DMSans_400Regular', color: '#666' },
  title: { fontSize: 18, fontFamily: 'DMSans_600SemiBold' },
  post: { fontSize: 16, fontFamily: 'DMSans_600SemiBold' },
  postDisabled: { color: '#aaa' },
  input: { flex: 1, padding: 16, fontSize: 16, fontFamily: 'DMSans_400Regular', lineHeight: 24, textAlignVertical: 'top' },
  count: { padding: 16, textAlign: 'right', fontFamily: 'DMSans_400Regular', color: '#aaa', fontSize: 12 },
});
