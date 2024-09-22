import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useTheme } from '../../constants/theme'; // Import the useTheme hook

export default function TabLayout() {
  const currentTheme = useTheme(); // Use the useTheme hook to get the current theme

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentTheme.tabBarIconColor,
        tabBarInactiveTintColor: currentTheme.tabBarInactiveTintColor || '#888', // Fallback color if not defined
        tabBarStyle: {
          backgroundColor: currentTheme.tabBarColor,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
