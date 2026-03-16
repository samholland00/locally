import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Post, PostCategory } from '@/types';

const CATEGORIES: { value: PostCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'for_sale', label: 'For sale' },
  { value: 'help_wanted', label: 'Help wanted' },
  { value: 'events', label: 'Events' },
];

const CATEGORY_LABELS: Record<PostCategory, string> = {
  general: 'General',
  gifts: 'Gifts',
  for_sale: 'For sale',
  help_wanted: 'Help wanted',
  events: 'Events',
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Feed() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all');

  async function loadPosts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const geohash: string = user.user_metadata.geohash;

    let query = supabase
      .from('posts')
      .select('*, user:users(display_name, street_name, photo_url)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (geohash) {
      query = query.like('geohash', geohash.slice(0, 5) + '%');
    }

    const { data } = await query;
    if (data) setPosts(data as Post[]);
  }

  async function refresh() {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => { loadPosts(); }, []));

  const filtered = activeCategory === 'all' ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>locally</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.value}
            style={[styles.pill, activeCategory === c.value && styles.pillActive]}
            onPress={() => setActiveCategory(c.value)}
          >
            <Text style={[styles.pillText, activeCategory === c.value && styles.pillTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.post}
            onPress={() => router.push({ pathname: '/(main)/thread', params: { id: item.id } })}
          >
            <View style={styles.meta}>
              <Text style={styles.name}>{item.user.display_name}</Text>
              <Text style={styles.street}>{item.user.street_name}</Text>
              <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
            </View>
            <Text style={styles.content}>{item.content}</Text>
            <View style={styles.footer}>
              {item.category !== 'general' && (
                <Text style={styles.categoryTag}>{CATEGORY_LABELS[item.category]}</Text>
              )}
              {item.reply_count > 0 && (
                <Text style={styles.replies}>
                  {item.reply_count} {item.reply_count === 1 ? 'reply' : 'replies'}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.empty}>No posts yet. Be the first.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 20, fontFamily: 'DMSans_600SemiBold', padding: 16, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterBar: { borderBottomWidth: 1, borderBottomColor: '#eee', flexGrow: 0 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  pillActive: { backgroundColor: '#000', borderColor: '#000' },
  pillText: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#666' },
  pillTextActive: { color: '#fff', fontFamily: 'DMSans_600SemiBold' },
  post: { padding: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  name: { fontFamily: 'DMSans_600SemiBold', fontSize: 14 },
  street: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#888' },
  time: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#bbb', marginLeft: 'auto' },
  content: { fontSize: 15, fontFamily: 'DMSans_400Regular', lineHeight: 22 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  categoryTag: { fontSize: 12, fontFamily: 'DMSans_500Medium', color: '#555', backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  replies: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#888' },
  separator: { height: 1, backgroundColor: '#eee' },
  empty: { padding: 32, textAlign: 'center', fontFamily: 'DMSans_400Regular', color: '#aaa' },
});
