import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import Home from './Components/Tabs/Home';
import Search from './Components/Tabs/Search';
import Settings from './Components/Tabs/Settings';

const Tab=createBottomTabNavigator();

export default function App() {
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
              case 'Settings':
                iconName='settings'
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
        <Tab.Screen name='Settings' component={Settings}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});