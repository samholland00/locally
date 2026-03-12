import { Tabs } from 'expo-router';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#eee', elevation: 0, shadowOpacity: 0 },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#bbb',
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen name="feed" options={{ title: 'feed' }} />
      <Tabs.Screen name="compose" options={{ title: 'post' }} />
      <Tabs.Screen name="invite" options={{ title: 'invite' }} />
      <Tabs.Screen name="profile" options={{ title: 'profile' }} />
    </Tabs>
  );
}
