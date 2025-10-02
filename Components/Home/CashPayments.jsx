import { ActivityIndicator, FlatList, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../Config';

const CashPayments = ({navigation, route}) => {
  const paymentMode = 'Cash'; // 'UPI' or 'Cash'
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchMembers = async () => {
    try {
      const {data, error} = await supabase
        .from('Payments')
        .select('*,Members(*)')
        .eq('Mode', 'Cash')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Fetching Members Error Occured', error.message);
        return;
      }
      
      setMembers(data);
    } catch(err) {
      console.error('Unexpected Error Occured', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, [paymentMode]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 20 }} color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Payments via {paymentMode}</Text>
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryText}>{members.length} Payment{members.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => `${item.HouseNumber}-${item.id || Math.random()}`}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyText}>No {paymentMode} payments received yet</Text>
          </View>
        }
        renderItem={({item}) => {
          const payment = item.Amount_Paid || 0;
          const pending = 1500 - payment;
          const isFullyPaid = pending <= 0;

          return (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate('MemberDetails', {houseNo: item.HouseNumber})}
              activeOpacity={0.7}
            >
              {/* Header Section */}
              <View style={styles.cardHeader}>
                <View style={styles.houseInfo}>
                  <Text style={styles.houseNumber}>House {item.HouseNumber}</Text>
                  <Text style={styles.memberName}>{item.Members?.Name || 'Unknown'}</Text>
                </View>
                <View style={[
                  styles.paymentModeBadge,
                  paymentMode === 'UPI' ? styles.upiBadge : styles.cashBadge
                ]}>
                  <Text style={styles.paymentModeText}>
                    {paymentMode === 'UPI' ? '📱 UPI' : '💵 Cash'}
                  </Text>
                </View>
              </View>

              {/* Status Indicator
              {isFullyPaid && (
                <View style={styles.completedBanner}>
                  <Text style={styles.completedText}>✓ Fully Paid</Text>
                </View>
              )} */}

              {/* Divider */}
              <View style={styles.divider} />

              {/* Payment Details */}
              <View style={styles.paymentSection}>
                <View style={styles.paymentRow}>
                  <View style={styles.labelWithIcon}>
                    <Text style={styles.paymentLabel}>Amount Paid</Text>
                  </View>
                  <Text style={[styles.paymentValue, styles.paidAmount]}>
                    ₹{payment.toLocaleString()}
                  </Text>
                </View>

                {/* {!isFullyPaid && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Remaining</Text>
                    <Text style={[styles.paymentValue, styles.pendingAmount]}>
                      ₹{pending.toLocaleString()}
                    </Text>
                  </View>
                )} */}

                {/* <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Total</Text>
                  <Text style={styles.paymentValue}>₹1,500</Text>
                </View> */}
              </View>

              {/* Progress Bar
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill, 
                    { width: `${Math.min((payment / 1500) * 100, 100)}%` },
                    isFullyPaid && styles.progressFullyPaid
                  ]} />
                </View>
                <Text style={styles.progressText}>
                  {Math.min(Math.round((payment / 1500) * 100), 100)}%
                </Text>
              </View> */}

              {/* Footer - Transaction Info */}
              {item.created_at && (
                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Received: {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

export default CashPayments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 12
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  summaryBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  summaryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#e8e8e8'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  houseInfo: {
    flex: 1
  },
  houseNumber: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
    fontWeight: '500'
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222'
  },
  paymentModeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginLeft: 8
  },
  upiBadge: {
    backgroundColor: '#e3f2fd'
  },
  cashBadge: {
    backgroundColor: '#e8f5e9'
  },
  paymentModeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333'
  },
  completedBanner: {
    backgroundColor: '#d4edda',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  completedText: {
    color: '#155724',
    fontSize: 12,
    fontWeight: '600'
  },
  divider: {
    height: 1,
    backgroundColor: '#e8e8e8',
    marginVertical: 12
  },
  paymentSection: {
    gap: 10
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '700',
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
    marginTop: 14,
    gap: 10
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4
  },
  progressFullyPaid: {
    backgroundColor: '#20c997'
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    minWidth: 38,
    textAlign: 'right'
  },
  footer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic'
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center'
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center'
  }
});