import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Index from '../Home/Index';
import { createStackNavigator } from '@react-navigation/stack';

const Stack=createStackNavigator();

const Home = () => {
  return (
    <Stack.Navigator initialRouteName='HomeIndex' screenOptions={{headerShown:false}}>
        <Stack.Screen name='HomeIndex' component={Index} />
    </Stack.Navigator>
  )
}

export default Home

const styles = StyleSheet.create({})