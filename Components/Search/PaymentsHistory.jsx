import { StyleSheet, Text, View, Platform, StatusBar, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../Config';

const PaymentsHistory = ({ route }) => {
    const houseNo = route.params.houseNo;
    const [settingsId, setSettingsId] = useState(null);
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);

    const fetchPayments = useCallback(async () => {
        if (!settingsId) return;
        console.log(houseNo);
        setLoading(true);
        
        try {
            const { data, error } = await supabase
                .from('Payments')
                .select('*')
                .eq('HouseNumber', houseNo)
                .eq('AssociationId', settingsId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Fetching Payments Error', error.message);
                return;
            }

            console.log(data);
            setPayments(data);
            
            const { data: total} = await supabase
            .from('House_Payment_Status')
            .select('PaidAmount')
            .eq('HouseNumber', houseNo)
            .eq('AssociationId', settingsId)
            .single();

            setTotalAmount(total.PaidAmount || 0);
        } catch (err) {
            console.error('Unexpected Error Occurred', err);
        } finally {
            setLoading(false);
        }
    }, [settingsId, houseNo]);

    useEffect(() => {
        const fetchSettingsId = async () => {
            const id = await AsyncStorage.getItem('settingId');
            if (id) {
                setSettingsId(id);
            } else {
                console.warn('No Settings ID found in storage');
                setLoading(false);
            }
        }
        fetchSettingsId();
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
            time: date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
        };
    };

    const PaymentCard = ({ item }) => (
        <TouchableOpacity
            style={styles.paymentCard}
            onPress={() => setSelectedPayment(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.paymentDate}>{formatDate(item.created_at)}</Text>
                <Text style={styles.paymentAmount}>₹{item.Amount_Paid}</Text>
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.modeContainer}>
                    <Text style={styles.modeLabel}>Mode:</Text>
                    <Text style={styles.modeValue}>{item.Mode}</Text>
                </View>
                <Text style={styles.receiptText}>Receipt: {item.ReceiptNumber ? item.ReceiptNumber : 'N/A'}</Text>
            </View>
        </TouchableOpacity>
    );

    const PaymentModal = () => {
        if (!selectedPayment) return null;
        
        const dateTime = formatDateTime(selectedPayment.created_at);
        
        return (
            <Modal 
                visible={!!selectedPayment} 
                animationType='slide' 
                transparent
                onRequestClose={() => setSelectedPayment(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Payment Details</Text>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Date & Time:</Text>
                            <View>
                                <Text style={styles.detailValue}>{dateTime.date}</Text>
                                <Text style={styles.detailValueSecondary}>{dateTime.time}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Amount Paid:</Text>
                            <Text style={[styles.detailValue, styles.amountValue]}>₹{selectedPayment.Amount_Paid}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Mode:</Text>
                            <Text style={styles.detailValue}>{selectedPayment.Mode}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Receipt No:</Text>
                            <Text style={styles.detailValue}>{selectedPayment.ReceiptNumber}</Text>
                        </View>
                        
                        {selectedPayment.Notes && (
                            <View style={styles.notesContainer}>
                                <Text style={styles.notesLabel}>Notes:</Text>
                                <Text style={styles.notesValue}>{selectedPayment.Notes}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setSelectedPayment(null)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.closeBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Payments History</Text>
                <Text style={styles.subtitle}>House No: {houseNo}</Text>
                
                {!loading && payments.length > 0 && (
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Total Amount Paid</Text>
                        <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
                    </View>
                )}
            </View>

            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading payments...</Text>
                    </View>
                ) : payments.length > 0 ? (
                    payments.map((item) => (
                        <PaymentCard key={item.id} item={item} />
                    ))
                ) : (
                    <View style={styles.noRecordsContainer}>
                        <Text style={styles.noRecordsIcon}>📋</Text>
                        <Text style={styles.noRecordsText}>No payment records found</Text>
                        <Text style={styles.noRecordsSubtext}>Your payment history will appear here</Text>
                    </View>
                )}
            </ScrollView>

            <PaymentModal />
        </View>
    );
};

export default PaymentsHistory;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    },
    header: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#7F8C8D',
        fontWeight: '500',
        marginBottom: 16,
    },
    totalContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#27AE60',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5A6C7D',
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: '700',
        color: '#27AE60',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    paymentCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F3F4',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    paymentDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5A6C7D',
    },
    paymentAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#27AE60',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modeLabel: {
        fontSize: 14,
        color: '#7F8C8D',
        marginRight: 6,
    },
    modeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C3E50',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    receiptText: {
        fontSize: 12,
        color: '#95A5A6',
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#7F8C8D',
        fontWeight: '500',
    },
    noRecordsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginTop: 20,
    },
    noRecordsIcon: {
        fontSize: 48,
        marginBottom: 16,
        opacity: 0.5,
    },
    noRecordsText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#7F8C8D',
        marginBottom: 8,
    },
    noRecordsSubtext: {
        fontSize: 14,
        color: '#BDC3C7',
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 20,
    },
    modalBox: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingVertical: 4,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5A6C7D',
        flex: 1,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2C3E50',
        textAlign: 'right',
        flex: 1,
    },
    detailValueSecondary: {
        fontSize: 14,
        color: '#7F8C8D',
        textAlign: 'right',
        marginTop: 2,
    },
    amountValue: {
        color: '#27AE60',
        fontWeight: '700',
        fontSize: 18,
    },
    notesContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        marginVertical: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#3498DB',
    },
    notesLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5A6C7D',
        marginBottom: 6,
    },
    notesValue: {
        fontSize: 14,
        color: '#2C3E50',
        lineHeight: 20,
    },
    closeBtn: {
        backgroundColor: '#E74C3C',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 24,
        marginTop: 20,
        shadowColor: '#E74C3C',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    closeBtnText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
});