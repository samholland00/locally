import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { PostCategory } from '@/types';

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'for_sale', label: 'For sale' },
  { value: 'help_wanted', label: 'Help wanted' },
  { value: 'events', label: 'Events' },
];

export default function Compose() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('general');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const categoryLabel = CATEGORIES.find(c => c.value === category)!.label;

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
        category,
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

      <TouchableOpacity style={styles.categoryRow} onPress={() => setShowPicker(true)}>
        <Text style={styles.categoryLabel}>Category</Text>
        <View style={styles.categoryValue}>
          <Text style={styles.categoryValueText}>{categoryLabel}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>

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

      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowPicker(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Category</Text>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.value}
                style={styles.option}
                onPress={() => { setCategory(c.value); setShowPicker(false); }}
              >
                <Text style={[styles.optionText, c.value === category && styles.optionSelected]}>
                  {c.label}
                </Text>
                {c.value === category && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  categoryLabel: { fontSize: 15, fontFamily: 'DMSans_400Regular', color: '#888' },
  categoryValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  categoryValueText: { fontSize: 15, fontFamily: 'DMSans_500Medium' },
  chevron: { fontSize: 18, color: '#aaa', marginTop: -1 },
  input: { flex: 1, padding: 16, fontSize: 16, fontFamily: 'DMSans_400Regular', lineHeight: 24, textAlignVertical: 'top' },
  count: { padding: 16, textAlign: 'right', fontFamily: 'DMSans_400Regular', color: '#aaa', fontSize: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 24, paddingBottom: 40 },
  sheetTitle: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: '#aaa', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  optionText: { fontSize: 16, fontFamily: 'DMSans_400Regular' },
  optionSelected: { fontFamily: 'DMSans_600SemiBold' },
  check: { fontSize: 16 },
});
