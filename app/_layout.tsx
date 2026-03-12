import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/(auth)/welcome');
      } else {
        router.replace('/(main)/feed');
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
    </Stack>
  );
}
