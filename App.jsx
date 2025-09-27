import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import Home from './Components/Tabs/Home';
import Search from './Components/Tabs/Search';
import Payment from './Components/Tabs/Payment';
import Settings from './Components/Tabs/Settings';
import { supabase } from './Components/Config';

const Tab=createBottomTabNavigator();

export default function App() {

  localStorage.setItem('settingId', fetchSettingId());

  const fetchSettingId = async () => {
    let year;
    if(new Date().getMonth() < 10)
      year = new Date().getFullYear()-1;
    else
      year = new Date().getFullYear();
    try {
      const { data } = await supabase
      .from('Association_Settings')
      .select('id',year)
      .eq('Year', year)

      return data[0]?.id ?? null;
    } catch (error) {
      console.error('Error Fetching Setting ID', error.message);
    }
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route})=>({
          headerShown:false,
          tabBarIcon:({focused,size,color})=>{
            let iconName;

            switch(route.name){
              case 'Home':
                iconName='home';
                break;
              case 'Search':
                iconName='search';
                break;
              case 'Payment':
                iconName='cash-outline';
                break;
              case 'Settings':
                iconName='settings';
                break;
              default:
                iconName='ellipse';
            }

            return(
              <View style={{width:24,height:24,margin:5}}>
                <Ionicons name={iconName} size={size} color={color}/>
              </View>
            )
          },
          tabBarActiveTintColor: '#0a84ff',
          tabBarInactiveTintColor: '#8e8e93',
        })}
      >
        <Tab.Screen name='Home' component={Home}/>
        <Tab.Screen name='Search' component={Search}/>
        <Tab.Screen name='Payment' component={Payment}/>
        <Tab.Screen name='Settings' component={Settings}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
