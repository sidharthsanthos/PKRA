import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import EMain from '../Expense/EMain';

const Stack=createStackNavigator();

const Expenses = () => {
  return (
    <Stack.Navigator initialRouteName='EMain' screenOptions={{headerShown:false}}>
        <Stack.Screen name='EMain' component={EMain}/>
    </Stack.Navigator>
  )
}

export default Expenses

const styles = StyleSheet.create({})