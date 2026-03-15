import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 13, color: focused ? '#000' : '#bbb', fontWeight: focused ? '600' : '400' }}>
        {label}
      </Text>
      <View style={{ height: 2, width: '100%', backgroundColor: focused ? '#000' : 'transparent', marginTop: 3, borderRadius: 1 }} />
    </View>
  );
}

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowIcon: false,
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#eee', elevation: 0, shadowOpacity: 0, height: 56 },
        tabBarItemStyle: { paddingVertical: 8 },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{ tabBarLabel: ({ focused }) => <TabLabel label="feed" focused={focused} /> }}
      />
      <Tabs.Screen
        name="compose"
        options={{ tabBarLabel: ({ focused }) => <TabLabel label="post" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarLabel: ({ focused }) => <TabLabel label="profile" focused={focused} /> }}
      />
      <Tabs.Screen name="thread" options={{ href: null }} />
      <Tabs.Screen name="invite" options={{ href: null }} />
    </Tabs>
  );
}
