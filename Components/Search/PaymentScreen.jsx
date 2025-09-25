import { StyleSheet, Text, View, Platform, StatusBar, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../Config';
import MemberDetails from './MemberDetails';

const PaymentScreen = ({route}) => {
  const houseNo=route.params.houseNo;
  const [payments,setPayments]=useState([]);

  const fetchPaymentDetails=async ()=>{
    try{
      const {data,error}=await supabase
        .from('House_Payment_Status')
        .select('*,Members(*)')
        .eq('HouseNumber',houseNo);

      if(error){
        console.error('Fetching Error Occured',error.message);
        return;
      }

      console.log(data);
      setPayments(data[0])
      
    }catch(err){
      console.error('Unexpected Error Occured',err);
    }
  }

  useEffect(()=>{
    fetchPaymentDetails();
  },[]);

  return (
    <View style={styles.container}>
      <Text>PKRA 2025</Text>
      <Text>PaymentScreen</Text>

      <View style={styles.MemberDetails}>
        <Text>Division:{payments?.Members?.Division??'Nil'}</Text>
        <Text>House Number:{houseNo}</Text>
        <Text>Member Name:{payments?.Members?.Name??'Name of the Main Member'}</Text>
      </View>

      <View style={styles.BillDetails}>
        <Text>Fee Payment Details</Text>
        <Text>Pending Amount to Pay: {payments?.PendingAmount} </Text>
        <Text>Paid Amount: {payments?.PaidAmount}</Text>
        <Text>Status: {payments?.Status}</Text>
      </View>

      <View style={styles.AmtInput}>
        <Text>Enter Amount Paid:</Text>
        <TextInput style={styles.inputBox} placeholder='1500' keyboardType='numeric'/>
      </View>


      
    </View>
  )
}

export default PaymentScreen

const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:20,
    backgroundColor:'#fff',
    marginTop:Platform.OS==='android'?StatusBar.currentHeight:0
  },
  MemberDetails:{
    backgroundColor:'yellow'
  },
  BillDetails:{
    backgroundColor:'lightblue',
    marginTop:30
  },
  AmtInput:{
    marginVertical:10,
    paddingHorizontal:15
  },
  inputBox:{
    height:45,
    borderColor:'#ccc',
    borderWidth:1,
    borderRadius:8,
    paddingHorizontal:10,
    marginTop:8,
    backgroundColor:'#fff',
    fontSize:16
  },
})