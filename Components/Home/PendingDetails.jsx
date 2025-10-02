import { FlatList, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../Config';

const PendingDetails = ({navigation}) => {
  const [members,setMembers]=useState([]);
  
      const fetchMembers=async ()=>{
          try{
              const {data,error}=await supabase
                 .from('House_Payment_Status')
                 .select('*,Members(*)')
                 .lt('PaidAmount',1500)
                 
              
              if(error){
                  console.error('Fetching Members Error Occured',error.message);
                  return;
              }
  
              // console.log(data);
              
              setMembers(data)
          }catch(err){
              console.error('Unexpected Error Occured',err);
              
          }
      }
  
      useEffect(()=>{
          fetchMembers();
      },[]);
  
      return (
          <View style={styles.container}>
          <Text style={styles.header}>Received Details</Text>
          <FlatList
             data={members}
             keyExtractor={(item)=>item.HouseNumber}
             ListEmptyComponent={
              <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No Members Paid</Text>
              </View>
             }
             renderItem={({item})=>{
              const payment=item.PaidAmount;
              const status=item.Status;
              const pending=1500-payment;
  
              return(
                  <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MemberDetails',{houseNo:item.HouseNumber})}>
                  {/* Header Row */}
                  <View style={styles.cardHeader}>
                      <View style={styles.houseInfo}>
                      <Text style={styles.houseNumber}>House {item.HouseNumber}</Text>
                      <Text style={styles.memberName}>{item.Members?.Name || 'nil'}</Text>
                      </View>
                      <View style={[
                      styles.statusBadge,
                      status === 'Completed' ? styles.statusCompleted :
                      payment > 0 ? styles.statusPartial :
                      styles.statusPending
                      ]}>
                      <Text style={styles.statusText}>
                          {status === 'Completed' ? '✓ Completed' :
                          payment > 0 ? 'Partial' :
                          'Pending'}
                          {-pending}
                      </Text>
                      </View>
                  </View>
  
                  {/* Divider */}
                  <View style={styles.divider} />
  
                  {/* Payment Details */}
                  <View style={styles.paymentSection}>
                      {/* <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Total Amount</Text>
                      <Text style={styles.paymentValue}>₹1,500</Text>
                      </View> */}
                      <View style={styles.paymentRow}>
                      <Text style={[styles.paymentLabel, styles.paidAmount]}>Paid</Text>
                      <Text style={[styles.paymentValue, styles.paidAmount]}>₹{payment.toLocaleString()}</Text>
                      </View>
                      <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Pending</Text>
                      <Text style={[styles.paymentValue, styles.pendingAmount]}>
                          ₹{pending <= 0 ? 0 : pending.toLocaleString()}
                      </Text>
                      </View>
                  </View>
  
                  {/* Progress Bar */}
                  {payment > 0 && (
                      <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${(payment / 1500) * 100}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{Math.round((payment / 1500) * 100)}%</Text>
                      </View>
                  )}
                  </TouchableOpacity>
  
              );
             }}
             />
          </View>
      )
  }
  
  export default PendingDetails
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      paddingHorizontal: 12
    },
    header: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 12
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0'
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent'
    },
    activeTab: {
      borderBottomColor: '#007bff'
    },
    tabText: {
      fontSize: 14,
      color: '#666',
      fontWeight: '500'
    },
    activeTabText: {
      color: '#007bff',
      fontWeight: 'bold'
    },
    card: {
      backgroundColor: '#ffffff',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: '#f0f0f0'
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12
    },
    houseInfo: {
      flex: 1
    },
    houseNumber: {
      fontSize: 14,
      color: '#666',
      marginBottom: 4
    },
    memberName: {
      fontSize: 18,
      fontWeight: '700',
      color: '#333'
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginLeft: 8
    },
    statusCompleted: {
      backgroundColor: '#d4edda'
    },
    statusPartial: {
      backgroundColor: '#fff3cd'
    },
    statusPending: {
      backgroundColor: '#f8d7da'
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#333'
    },
    divider: {
      height: 1,
      backgroundColor: '#e0e0e0',
      marginVertical: 12
    },
    paymentSection: {
      gap: 8
    },
    paymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    paymentLabel: {
      fontSize: 14,
      color: '#666'
    },
    paymentValue: {
      fontSize: 15,
      fontWeight: '600',
      color: '#333'
    },
    paidAmount: {
      color: '#28a745'
    },
    pendingAmount: {
      color: '#dc3545'
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 8
    },
    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: '#e0e0e0',
      borderRadius: 4,
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#28a745',
      borderRadius: 4
    },
    progressText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#666',
      minWidth: 35,
      textAlign: 'right'
    },
    house: {
      fontSize: 16,
      fontWeight: '600'
    },
    emptyContainer: {
      paddingVertical: 40,
      alignItems: 'center'
    },
    emptyText: {
      fontSize: 14,
      color: '#999'
    }
  });