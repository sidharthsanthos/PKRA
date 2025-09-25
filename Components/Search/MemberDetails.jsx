import { ActivityIndicator, StyleSheet, Text, View, Platform, StatusBar, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../Config';

const MemberDetails = ({route,navigation}) => {
    const {houseNo}=route.params;
    const [member,setMember]=useState([]);
    const [loading,setLoading]=useState(true);

    const fetchMember=async ()=>{
        try{
            console.log(houseNo);
            
            const {data,error}=await supabase
               .from('Members')
               .select('*')
               .eq('HouseNumber',houseNo);

            if(error){
                console.error('Fetching Error Occured',error.message);
                return;
            }
            console.log(data);
            

            setMember(data);
            setLoading(false);
        }catch(err){
            console.error('Unexpected Error Occured',err);
        }
    }

    useEffect(()=>{
        console.log(houseNo);
        
        fetchMember();
    },[]);

    if(loading) return <ActivityIndicator size='large' style={{flex:1}}/>

    if(!member) return <Text style={{textAlign:'center',marginTop:20}}>No data found</Text>

    return (
        <View style={styles.container}>
            <Text style={styles.title}>House: {houseNo}</Text>
            <Text style={styles.info}>Name: {member[0].Name}</Text>
            <Text style={styles.info}>Division: {member[0].Division}</Text>

            <TouchableOpacity 
                style={styles.feeButton}
                onPress={()=>navigation.navigate('PaymentScreen',{houseNo:houseNo})}
            >
                <Text> Fee Payment</Text>
            </TouchableOpacity>

            <View>
                <Text> Past Payment Details</Text>
            </View>
        </View>
    )
}

export default MemberDetails

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff',    marginTop:Platform.OS==='android'?StatusBar.currentHeight:0 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  info: { fontSize: 18, marginBottom: 10, color: '#555' },
  feeButton:{
    backgroundColor:'lightblue',
    padding:20,
    marginBottom:10,
  }
});