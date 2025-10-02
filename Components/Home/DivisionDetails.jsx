import { ActivityIndicator, FlatList, Platform, StatusBar, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../Config';

const DivisionDetails = ({route,navigation}) => {
    const division=route.params.divisionID;
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'all', 'pending', 'partial', 'completed'

    const fetchDetails=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Members')
               .select('*,House_Payment_Status(Status,PaidAmount)')
               .eq('Division',division);
            
            if(error){
                console.error('Fetching Error Occured',error.message);
                return;
            }

            console.log(JSON.stringify(data,null,2));
            setMembers(data);

            
        }catch(err){
            console.error('Unexpected Error Occured',err);
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchDetails();
    },[]);

    // Filter members based on active tab
    const getFilteredMembers = () => {
        return members.filter(member => {
            const payment = member.House_Payment_Status?.[0];
            const paidAmount = payment?.PaidAmount || 0;
            const status = payment?.Status;

            if (activeTab === 'all') return true;
            if (activeTab === 'pending') return paidAmount === 0 || !payment;
            if (activeTab === 'partial') return paidAmount > 0 && paidAmount < 1500;
            if (activeTab === 'completed') return status === 'Completed';
            
            return true;
        });
    };

    const filteredMembers = getFilteredMembers();

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Division {division} - Members</Text>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                        Pending
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'partial' && styles.activeTab]}
                    onPress={() => setActiveTab('partial')}
                >
                    <Text style={[styles.tabText, activeTab === 'partial' && styles.activeTabText]}>
                        Partial
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
                    onPress={() => setActiveTab('completed')}
                >
                    <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
                        Completed
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                        All
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredMembers}
                keyExtractor={(item) => item.HouseNumber}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No members found in this category</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const payment = item.House_Payment_Status?.[0];
                    const paidAmount = payment?.PaidAmount || 0;
                    const pending = 1500 - paidAmount;
                    const status = payment?.Status || "Pending";
                    
                    return (
                        <TouchableOpacity style={styles.card} onPress={()=>navigation.navigate('MemberDetails',{houseNo:item.HouseNumber})}>
                            {/* Header Section */}
                            <View style={styles.cardHeader}>
                                <View style={styles.houseInfo}>
                                    <Text style={styles.houseNumber}>House {item.HouseNumber}</Text>
                                    <Text style={styles.memberName}>{item.Name}</Text>
                                </View>
                                <View style={[
                                    styles.statusBadge, 
                                    status === 'Completed' ? styles.statusCompleted : 
                                    paidAmount > 0 ? styles.statusPartial : 
                                    styles.statusPending
                                ]}>
                                    <Text style={styles.statusText}>
                                        {status === 'Completed' ? '✓ Completed' : 
                                         paidAmount > 0 ? 'Partial' : 
                                         'Pending'}
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
                                    <Text style={styles.paymentLabel}>Paid</Text>
                                    <Text style={[styles.paymentValue, styles.paidAmount]}>₹{paidAmount.toLocaleString()}</Text>
                                </View>
                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentLabel}>Pending</Text>
                                    <Text style={[styles.paymentValue, styles.pendingAmount]}>
                                        ₹{pending <= 0 ? 0 : pending.toLocaleString()}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            {paidAmount > 0 && (
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: `${(paidAmount / 1500) * 100}%` }]} />
                                    </View>
                                    <Text style={styles.progressText}>{Math.round((paidAmount / 1500) * 100)}%</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

export default DivisionDetails

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