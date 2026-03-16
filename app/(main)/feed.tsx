import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>locally</Text>
      <FlatList
        data={posts}
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
            {item.reply_count > 0 && (
              <Text style={styles.replies}>
                {item.reply_count} {item.reply_count === 1 ? 'reply' : 'replies'}
              </Text>
            )}
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
  post: { padding: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  name: { fontFamily: 'DMSans_600SemiBold', fontSize: 14 },
  street: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#888' },
  time: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#bbb', marginLeft: 'auto' },
  content: { fontSize: 15, fontFamily: 'DMSans_400Regular', lineHeight: 22 },
  replies: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#888', marginTop: 8 },
  separator: { height: 1, backgroundColor: '#eee' },
  empty: { padding: 32, textAlign: 'center', fontFamily: 'DMSans_400Regular', color: '#aaa' },
});
