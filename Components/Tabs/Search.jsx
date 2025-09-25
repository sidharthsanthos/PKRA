import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SMain from '../Search/SMain';
import MemberDetails from '../Search/MemberDetails';
import PaymentScreen from '../Search/PaymentScreen';

const Stack=createStackNavigator();

const Search = () => {
  return (
    <Stack.Navigator initialRouteName='SearchMain' screenOptions={{headerShown:false}}>
        <Stack.Screen name='SearchMain' component={SMain}/>
        <Stack.Screen name='MemberDetails' component={MemberDetails}/>
        <Stack.Screen name='PaymentScreen' component={PaymentScreen}/>
    </Stack.Navigator>
  )
}

export default Search

const styles = StyleSheet.create({})