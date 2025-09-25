import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsMain from '../Settings/SettingsMain';

const Stack=createStackNavigator();

const Settings = () => {
  return (
    <Stack.Navigator initialRouteName='SettingsMain' screenOptions={{headerShown:false}}>
        <Stack.Screen name='SettingsMain' component={SettingsMain}/>
    </Stack.Navigator>
  )
}

export default Settings

const styles = StyleSheet.create({})