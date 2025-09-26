import React from 'react';
import HomeContainer from '../Home/Index';
import { createStackNavigator } from '@react-navigation/stack';

const Stack=createStackNavigator();

const Home = () => {
  return (
    <Stack.Navigator initialRouteName='HomeIndex' screenOptions={{headerShown:false}}>
        <Stack.Screen name='HomeIndex' component={HomeContainer} />
    </Stack.Navigator>
  )
}

export default Home
