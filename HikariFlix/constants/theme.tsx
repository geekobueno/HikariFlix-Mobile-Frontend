import { useColorScheme } from 'react-native';

const lightTheme = {
  primaryColor: '#b0b0b0',
  backgroundColor: '#fff',
  textColor: '#000',
  tabBarColor: '#e5e5e5',
  tabBarIconColor: '#000',
  tabBarInactiveTintColor: '#888',
  headerBackgroundColor: '#fff',
  headerTextColor: '#000',
  accentColor: '#007aff'
};

const darkTheme = {
  primaryColor: '#b0b0b0',
  backgroundColor: '#121212',
  textColor: '#fff',
  tabBarColor: '#1e1e1e',
  tabBarIconColor: '#fff',
  tabBarInactiveTintColor: '#888',
  headerBackgroundColor: '#000',
  headerTextColor: '#fff',
  accentColor: '#007aff'
};

export const useTheme = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};
