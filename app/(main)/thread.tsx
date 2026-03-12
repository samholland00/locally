import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Post, Reply } from '@/types';

export default function Thread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('posts')
      .select('*, user:users(display_name, street_name, photo_url)')
      .eq('id', id)
      .single()
      .then(({ data }) => { if (data) setPost(data as Post); });

    supabase
      .from('replies')
      .select('*, user:users(display_name, street_name, photo_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setReplies(data as Reply[]); });
  }, [id]);

  async function submitReply() {
    if (!reply.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('replies').insert({
        post_id: id,
        user_id: user.id,
        content: reply.trim(),
      });
      if (error) throw error;
      setReply('');
      const { data } = await supabase
        .from('replies')
        .select('*, user:users(display_name, street_name, photo_url)')
        .eq('post_id', id)
        .order('created_at', { ascending: true });
      if (data) setReplies(data as Reply[]);
    } catch {
      Alert.alert('Error', 'Could not post reply.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>back</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={replies}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={post ? (
          <View style={styles.post}>
            <View style={styles.meta}>
              <Text style={styles.name}>{post.user.display_name}</Text>
              <Text style={styles.street}>{post.user.street_name}</Text>
            </View>
            <Text style={styles.content}>{post.content}</Text>
          </View>
        ) : null}
        renderItem={({ item }) => (
          <View style={styles.reply}>
            <View style={styles.meta}>
              <Text style={styles.name}>{item.user.display_name}</Text>
              <Text style={styles.street}>{item.user.street_name}</Text>
            </View>
            <Text style={styles.replyContent}>{item.content}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="reply..."
          value={reply}
          onChangeText={setReply}
          maxLength={500}
        />
        <TouchableOpacity onPress={submitReply} disabled={loading || !reply.trim()}>
          <Text style={[styles.send, (!reply.trim() || loading) && styles.sendDisabled]}>send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#eee' },
  back: { fontSize: 16, color: '#000' },
  post: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  reply: { padding: 16, paddingLeft: 24 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontWeight: '600', fontSize: 14 },
  street: { fontSize: 13, color: '#888' },
  content: { fontSize: 15, lineHeight: 22 },
  replyContent: { fontSize: 14, lineHeight: 20, color: '#333' },
  separator: { height: 1, backgroundColor: '#eee' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', gap: 12 },
  input: { flex: 1, fontSize: 15, padding: 8 },
  send: { fontSize: 15, fontWeight: '600' },
  sendDisabled: { color: '#aaa' },
});
