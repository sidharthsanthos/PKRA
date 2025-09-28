import { ActivityIndicator, StyleSheet, Text, View, Platform, StatusBar, TouchableOpacity, Linking, Alert, ScrollView } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../Config';

const MemberDetails = ({ route, navigation }) => {
    const { houseNo } = route.params;
    const [memberData, setMemberData] = useState(null);
    const [annualFee, setAnnualFee] = useState(0);
    const [settingsId, setSettingsId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);

    const fetchAllData = useCallback(async () => {
        if (!settingsId) return;
        setLoading(true);
        try {
            const { data: statusData, error: statusError } = await supabase
                .from('House_Payment_Status')
                .select('*,Members(*)')
                .eq('HouseNumber', houseNo)
                .eq('AssociationId', settingsId)
                .single();

            if (statusError) throw statusError;
            setMemberData(statusData);

            const { data: paymentsData, error: paymentsError } = await supabase
                .from('Payments')
                .select('*')
                .eq('HouseNumber', houseNo)
                .eq('AssociationId', settingsId)
                .order('created_at', { ascending: false });

            if (paymentsError) throw paymentsError;
            setPayments(paymentsData || []);

        } catch (err) {
            console.error('Unexpected Error Occurred', err);
            Alert.alert("Error", "Failed to fetch member details.");
        } finally {
            setLoading(false);
        }
    }, [settingsId, houseNo]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const id = await AsyncStorage.getItem('settingId');
                if (id) {
                    setSettingsId(id);
                    const { data, error } = await supabase
                        .from('Association_Settings')
                        .select('Annual_Fee')
                        .eq('id', id)
                        .single();
                    if (error) throw error;
                    if (data) setAnnualFee(data.Annual_Fee);
                }
            } catch (error) {
                console.error('Error fetching settings', error);
                Alert.alert('Error', 'Could not load association settings.');
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);


    const handleCallMember = () => {
        if (memberData?.Members?.Phno) {
            Linking.openURL(`tel:${memberData.Members.Phno}`);
        } else {
            Alert.alert('Failed', 'No Phone Number available');
        }
    }

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color="#4A90E2" />
            <Text style={styles.loadingText}>Loading member details...</Text>
        </View>
    );

    if (!memberData) return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No data found for this member in the current cycle.</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.headerCard}>
                <Text style={styles.houseNumber}>House {houseNo}</Text>
                <View style={[styles.statusBadge, {backgroundColor: memberData?.Status === 'Completed' ? '#2ECC71' : '#F39C12'}]}>
                    <Text style={styles.statusText}>{memberData?.Status || 'Pending'}</Text>
                </View>
            </View>

            <View style={styles.memberCard}>
                <Text style={styles.cardTitle}>Member Information</Text>
                
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.infoValue}>{memberData?.Members?.Name || 'N/A'}</Text>
                </View>
                
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Division:</Text>
                    <Text style={styles.infoValue}>{memberData?.Members?.Division || 'N/A'}</Text>
                </View>
                
                <TouchableOpacity 
                    style={styles.infoRow} 
                    onPress={handleCallMember}
                    disabled={!memberData?.Members?.Phno}
                >
                    <Text style={styles.infoLabel}>Mobile:</Text>
                    <Text style={[
                        styles.infoValue, 
                        memberData?.Members?.Phno && styles.phoneNumber
                    ]}>
                        {memberData?.Members?.Phno ?? 'Not Available'}
                    </Text>
                </TouchableOpacity>
                
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Amount Paid:</Text>
                    <Text style={styles.amountPaid}>₹{memberData?.PaidAmount || 0}</Text>
                </View>
            </View>

            {annualFee > (memberData?.PaidAmount || 0) && (
                <TouchableOpacity 
                    style={styles.paymentButton}
                    onPress={() => navigation.navigate('PaymentScreen', {houseNo: houseNo})}
                >
                    <Text style={styles.paymentButtonText}>Make Payment</Text>
                </TouchableOpacity>
            )}

            <View style={styles.historyCard}>
                <Text style={styles.cardTitle}>Recent Payment History</Text>
                
                {payments.length > 0 ? (
                    <>
                        {payments.slice(0, 3).map((item) => (
                            <View key={item.id} style={styles.paymentItem}>
                                <View style={styles.paymentHeader}>
                                    <Text style={styles.paymentDate}>
                                        {new Date(item.created_at).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                    <Text style={styles.paymentAmount}>₹{item.Amount_Paid}</Text>
                                </View>
                                <Text style={styles.paymentMode}>
                                    Payment Mode: {item.Mode}
                                </Text>
                            </View>
                        ))}
                    </>
                ) : (
                    <View style={styles.noPaymentsContainer}>
                        <Text style={styles.noPaymentsText}>No payment history available</Text>
                    </View>
                )}

                {payments.length > 0 && (
                    <TouchableOpacity 
                        style={styles.seeMoreButton}
                        onPress={() => navigation.navigate('PaymentHistory', { houseNo })}
                    >
                        <Text style={styles.seeMoreText}>View All Payment History →</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    )
}

export default MemberDetails

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F8F9FA',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    headerCard: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    houseNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statusBadge: {
        backgroundColor: '#2ECC71',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    memberCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
        paddingBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0',
    },
    infoLabel: {
        fontSize: 16,
        color: '#7F8C8D',
        fontWeight: '500',
        flex: 1,
    },
    infoValue: {
        fontSize: 16,
        color: '#2C3E50',
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },
    phoneNumber: {
        color: '#4A90E2',
        textDecorationLine: 'underline',
    },
    amountPaid: {
        fontSize: 18,
        color: '#27AE60',
        fontWeight: 'bold',
        flex: 2,
        textAlign: 'right',
    },
    paymentButton: {
        backgroundColor: '#27AE60',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    paymentButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    historyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    paymentItem: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#4A90E2',
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    paymentDate: {
        fontSize: 14,
        color: '#7F8C8D',
        fontWeight: '500',
    },
    paymentAmount: {
        fontSize: 16,
        color: '#27AE60',
        fontWeight: 'bold',
    },
    paymentMode: {
        fontSize: 12,
        color: '#95A5A6',
        fontStyle: 'italic',
    },
    noPaymentsContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noPaymentsText: {
        fontSize: 14,
        color: '#7F8C8D',
        fontStyle: 'italic',
    },
    seeMoreButton: {
        backgroundColor: '#ECF0F1',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        alignItems: 'center',
        marginBottom:12
    },
    seeMoreText: {
        color: '#4A90E2',
        fontSize: 14,
        fontWeight: '600',
    },
});