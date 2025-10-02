import React from 'react';
import HomeContainer from '../Home/Index';
import { createStackNavigator } from '@react-navigation/stack';
import DivisionDetails from '../Home/DivisionDetails';
import MemberDetails from '../Search/MemberDetails';
import PaymentScreen from '../Search/PaymentScreen';
import PaymentsHistory from '../Search/PaymentsHistory';
import RecievedDetails from '../Home/RecievedDetails';
import PendingDetails from '../Home/PendingDetails';
import UPIPayments from '../Home/UPIPayments';
import CashPayments from '../Home/CashPayments';

const Stack=createStackNavigator();

const Home = () => {
  return (
    <Stack.Navigator initialRouteName='HomeIndex' screenOptions={{headerShown:false}}>
        <Stack.Screen name='HomeIndex' component={HomeContainer} />
        <Stack.Screen name='DivisionDetails' component={DivisionDetails}/>
        <Stack.Screen name='MemberDetails' component={MemberDetails}/>
        <Stack.Screen name='PaymentScreen' component={PaymentScreen}/>
        <Stack.Screen name='PaymentHistory' component={PaymentsHistory}/>
        <Stack.Screen name='ReceivedDetails' component={RecievedDetails}/>
        <Stack.Screen name='PendingDetails' component={PendingDetails}/>
        <Stack.Screen name='UPIPayments' component={UPIPayments}/>
        <Stack.Screen name='CashPayments' component={CashPayments}/>
    </Stack.Navigator>
  )
}

export default Home
