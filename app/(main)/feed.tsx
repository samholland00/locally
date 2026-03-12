import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';

export default function Feed() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadPosts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const geohash: string = user.user_metadata.geohash;

    const { data } = await supabase
      .from('posts')
      .select('*, user:users(display_name, street_name, photo_url)')
      .like('geohash', geohash.slice(0, 5) + '%')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setPosts(data as Post[]);
  }

  async function refresh() {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }

  useEffect(() => { loadPosts(); }, []);

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
        ListEmptyComponent={<Text style={styles.empty}>no posts yet. be the first.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: '600', padding: 16, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#eee' },
  post: { padding: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  name: { fontWeight: '600', fontSize: 14 },
  street: { fontSize: 13, color: '#888' },
  content: { fontSize: 15, lineHeight: 22 },
  replies: { fontSize: 13, color: '#888', marginTop: 8 },
  separator: { height: 1, backgroundColor: '#eee' },
  empty: { padding: 32, textAlign: 'center', color: '#aaa' },
});
