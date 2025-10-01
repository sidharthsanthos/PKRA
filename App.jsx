import { View, Alert, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useState, useEffect } from 'react';
import Home from './Components/Tabs/Home';
import Search from './Components/Tabs/Search';
import Payment from './Components/Tabs/Payment';
import Settings from './Components/Tabs/Settings';
import { supabase } from './Components/Config';

const Tab = createBottomTabNavigator();

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSettingId = async () => {
      let year;
      const currentMonth = new Date().getMonth();
      if (currentMonth < 10) {
        year = new Date().getFullYear() - 1;
      } else {
        year = new Date().getFullYear();
      }

      try {
        const { data, error } = await supabase
          .from('Association_Settings')
          .select('id')
          .eq('Year', year);

        if (error) throw error;

        const newSettingId = data[0]?.id ?? null;
        await AsyncStorage.setItem('settingId', newSettingId!==null ? newSettingId.toString() : '');

      } catch (error) {
        console.error('Error Fetching Setting ID', error.message);
      } finally {
        setLoading(false);
      }
    };

    getSettingId();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const protectedTabListener = ({ navigation }) => ({
    tabPress: async (e) => {
      if ((await AsyncStorage.getItem('settingId')) === null) {
        e.preventDefault();
        Alert.alert(
          "Setup Required",
          "Please create a new cycle in Settings before proceeding.",
          [{ text: "OK", onPress: () => navigation.navigate('Settings') }]
        );
      }
    },
  });

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, size, color }) => {
            let iconName;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Search':
                iconName = focused ? 'search' : 'search-outline';
                break;
              case 'Payment':
                iconName = focused ? 'cash' : 'cash-outline';
                break;
              case 'Settings':
                iconName = focused ? 'settings' : 'settings-outline';
                break;
              default:
                iconName = 'ellipse-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#0a84ff',
          tabBarInactiveTintColor: '#8e8e93',
        })}
      >
        <Tab.Screen name='Home' component={Home} listeners={protectedTabListener} />
        <Tab.Screen name='Search' component={Search} listeners={protectedTabListener} />
        <Tab.Screen name='Payment' component={Payment} listeners={protectedTabListener} />
        <Tab.Screen name='Settings' component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
