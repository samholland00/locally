import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 13, fontFamily: focused ? 'DMSans_600SemiBold' : 'DMSans_400Regular', color: focused ? '#000' : '#bbb' }}>
        {label}
      </Text>
      <View style={{ height: 2, width: 24, backgroundColor: focused ? '#000' : 'transparent', marginTop: 2, borderRadius: 1 }} />
    </View>
  );
}

const noIcon = () => null;

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const TAB_HEIGHT = 48;

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
          height: TAB_HEIGHT + insets.bottom,
          paddingTop: 0,
          paddingBottom: insets.bottom,
        },
        tabBarItemStyle: {
          height: TAB_HEIGHT,
          justifyContent: 'center',
          paddingVertical: 0,
        },
        tabBarIcon: noIcon,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: noIcon,
          tabBarLabel: ({ focused }) => <TabLabel label="Feed" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="compose"
        options={{
          tabBarIcon: noIcon,
          tabBarLabel: ({ focused }) => <TabLabel label="Post" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: noIcon,
          tabBarLabel: ({ focused }) => <TabLabel label="Profile" focused={focused} />,
        }}
      />
      <Tabs.Screen name="thread" options={{ href: null }} />
      <Tabs.Screen name="invite" options={{ href: null }} />
    </Tabs>
  );
}
