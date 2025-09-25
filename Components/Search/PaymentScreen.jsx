import { 
  StyleSheet, 
  Text, 
  View, 
  Platform, 
  StatusBar, 
  TextInput, 
  Alert, 
  ScrollView,
  Dimensions 
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../Config';
import { TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons'; // You'll need to install this

const { width, height } = Dimensions.get('window');

const PaymentScreen = ({route}) => {
  const houseNo = route.params.houseNo;
  const [payments, setPayments] = useState([]);
  const [amt, setAmt] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [receiptNo, setReceiptNo] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPaymentDetails = async () => {
    try {
      const {data, error} = await supabase
        .from('House_Payment_Status')
        .select('*,Members(*)')
        .eq('HouseNumber', houseNo);

      if (error) {
        console.error('Fetching Error Occurred', error.message);
        return;
      }

      console.log(data);
      setPayments(data[0])
      
    } catch (err) {
      console.error('Unexpected Error Occurred', err);
    }
  }

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  useEffect(() => {
    if (payments?.PaidAmount !== undefined) {
      const pending = 1500 - payments.PaidAmount;
      setAmt(pending);
    }
  }, [payments]);

  const insertReceipt = async () => {
    setLoading(true);
    const paidAmt = payments?.PaidAmount + amt;
    console.log(paidAmt);
    
    if (amt === 0) {
      Alert.alert('Failed', 'Enter Amount to continue');
      setLoading(false);
      return;
    }

    if (payments?.PaidAmount === 1500) {
      Alert.alert('Failed', 'Member already paid full amount');
      setLoading(false);
      return;
    }

    if (paidAmt > 1500) {
      Alert.alert('Failed', 'You can only pay up to ₹1500');
      setLoading(false);
      return;
    }

    if (receiptNo === 0) {
      setReceiptNo('');
    }

    try {
      const {error} = await supabase
        .from('Payments')
        .insert({
          HouseNumber: houseNo,
          Amount_Paid: amt,
          Mode: paymentMode,
          ReceiptNumber: receiptNo,
          Notes: notes
        })

      if (error) {
        if (error.message.includes('duplicate key value') &&
            error.message.includes('"Payments_ReceiptNumber_key"')) {
          Alert.alert('Failed', 'Receipt number already exists.');
          setLoading(false);
          return;
        } else {
          console.error("Insertion Error Occurred", error.message);
          setLoading(false);
          return;
        }
      }

      console.log(paidAmt);

      if (paidAmt === 1500) {
        const {error2} = await supabase
          .from('House_Payment_Status')
          .update({
              PaidAmount: paidAmt,
              Status: 'Completed'
          })
          .eq('HouseNumber', houseNo);

          if (error2) {
            console.error('Updation Error Occurred', error2.message);
            setLoading(false);
            return;
          }

        Alert.alert('Success', 'Payment completed successfully!', [
          {text: 'OK', onPress: () => console.log('OK Pressed')}
        ]);
        fetchPaymentDetails();
        setAmt('');
        setReceiptNo('');
        setNotes('');
        setLoading(false);
        return;  
      } else {
        const {error2} = await supabase
          .from('House_Payment_Status')
          .update({
              PaidAmount: paidAmt
          })
          .eq('HouseNumber', houseNo);

          if (error2) {
            console.error('Updation Error Occurred', error2.message);
            setLoading(false);
            return;
          }

        Alert.alert('Success', 'Payment recorded successfully!', [
          {text: 'OK', onPress: () => console.log('OK Pressed')}
        ]);
        fetchPaymentDetails();
        setAmt('');
        setReceiptNo('');
        setNotes('');
        setLoading(false);
        return;  
      }
    } catch (err) {
      console.error('Unexpected Error Occurred', err);
      setLoading(false);
    }
  }

  const pendingAmount = 1500 - (payments?.PaidAmount || 0);
  const progressPercentage = ((payments?.PaidAmount || 0) / 1500) * 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.associationTitle}>PKRA 2025</Text>
        <Text style={styles.pageTitle}>Payment Portal</Text>
      </View>

      {/* Member Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="account-circle" size={24} color="#4A90E2" />
          <Text style={styles.cardTitle}>Member Details</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Division:</Text>
          <Text style={styles.detailValue}>{payments?.Members?.Division ?? 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>House Number:</Text>
          <Text style={styles.detailValue}>{houseNo}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Member Name:</Text>
          <Text style={styles.detailValue}>{payments?.Members?.Name ?? 'Name of the Main Member'}</Text>
        </View>
      </View>

      {/* Payment Status Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="payment" size={24} color="#4A90E2" />
          <Text style={styles.cardTitle}>Payment Status</Text>
        </View>
        
        {/* Progress Bar
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPercentage.toFixed(1)}% Complete</Text>
        </View> */}

        <View style={styles.paymentSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Paid </Text>
            <Text style={styles.summaryValue}>₹{payments?.PaidAmount || 0}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pending </Text>
            <Text style={[styles.summaryValue, { color: '#FF6B6B' }]}>₹{pendingAmount}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Status </Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: payments?.Status === 'Completed' ? '#4CAF50' : '#FF9800' }
            ]}>
              <Text style={styles.statusText}>{payments?.Status || 'Pending'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Payment Form */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="add-circle" size={24} color="#4A90E2" />
          <Text style={styles.cardTitle}>Add Payment</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount to Pay (₹)</Text>
          <TextInput 
            style={styles.inputBox} 
            keyboardType='numeric' 
            value={amt.toString()} 
            onChangeText={(text) => setAmt(Number(text))}
            placeholder="Enter amount"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Receipt Number</Text>
          <TextInput 
            style={styles.inputBox} 
            placeholder='e.g., 007' 
            keyboardType='numeric' 
            value={receiptNo?.toString() || ''} 
            onChangeText={(text) => setReceiptNo(text ? Number(text) : null)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Payment Mode</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={paymentMode}
              onValueChange={(itemValue) => setPaymentMode(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="💵 Cash" value="Cash"/>
              <Picker.Item label="📱 UPI" value="UPI"/>
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
          <TextInput
            style={[styles.inputBox, styles.textArea]}
            placeholder='Enter any additional comments...'
            multiline={true}
            numberOfLines={4}
            value={notes}
            onChangeText={(text) => setNotes(text)}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={insertReceipt}
          disabled={loading}
        >
          <Icon name="check-circle" size={20} color="#FFF" />
          <Text style={styles.submitButtonText}>
            {loading ? 'Processing...' : 'Record Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default PaymentScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  associationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  pageTitle: {
    fontSize: 16,
    color: '#E3F2FD',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  paymentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: width * 0.25,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputBox: {
    height: 48,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  picker: {
    height: 48,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});