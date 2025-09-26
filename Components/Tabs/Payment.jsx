import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import PaymentMain from '../Payment/PaymentMain';
const Stack = createStackNavigator();

const Payment = () => {
  return (
    <Stack.Navigator initialRouteName='PaymentMain' screenOptions={{ headerShown: false }}>
      <Stack.Screen name='PaymentMain' component={PaymentMain} />
    </Stack.Navigator>
  )
}

export default Payment