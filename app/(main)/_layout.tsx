import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 13, color: focused ? '#000' : '#bbb', fontWeight: focused ? '600' : '400' }}>
        {label}
      </Text>
      <View style={{ height: 2, width: 24, backgroundColor: focused ? '#000' : 'transparent', marginTop: 3, borderRadius: 1 }} />
    </View>
  );
}

const noIcon = () => null;

export default function MainLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#bbb',
        tabBarShowIcon: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#eee',
          elevation: 0,
          shadowOpacity: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarItemStyle: { paddingVertical: 10 },
        tabBarIcon: noIcon,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: noIcon,
          tabBarLabel: ({ focused }) => <TabLabel label="feed" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="compose"
        options={{
          tabBarIcon: noIcon,
          tabBarLabel: ({ focused }) => <TabLabel label="post" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: noIcon,
          tabBarLabel: ({ focused }) => <TabLabel label="profile" focused={focused} />,
        }}
      />
      <Tabs.Screen name="thread" options={{ href: null }} />
      <Tabs.Screen name="invite" options={{ href: null }} />
    </Tabs>
  );
}
