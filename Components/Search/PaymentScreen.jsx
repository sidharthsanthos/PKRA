import { KeyboardAvoidingView, StyleSheet, Text, View, Platform, StatusBar, TextInput, Alert, ScrollView, Dimensions } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../Config';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const PaymentScreen = ({ route, navigation }) => {
  const { houseNo } = route.params;
  const [settingsId, setSettingsId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [annualFee, setAnnualFee] = useState(0);
  const [amountToPay, setAmountToPay] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [receiptNo, setReceiptNo] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPaymentDetails = useCallback(async () => {
    if (!settingsId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('House_Payment_Status')
        .select('*,Members(*)')
        .eq('HouseNumber', houseNo)
        .eq('AssociationId', settingsId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore no rows found error
      setPaymentStatus(data);
    } catch (err) {
      console.error('Unexpected Error Occurred while fetching payment details', err);
      Alert.alert('Error', 'Could not fetch payment details.');
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
    fetchPaymentDetails();
  }, [fetchPaymentDetails]);

  const insertReceipt = async () => {
    const amt = Number(amountToPay);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to continue.');
      return;
    }

    if (paymentStatus?.PaidAmount === annualFee) {
      Alert.alert('Payment Complete', 'This member has already paid the full amount.');
      return;
    }

    if ((paymentStatus?.PaidAmount || 0) + amt > annualFee) {
      Alert.alert('Invalid Amount', `Payment exceeds the required annual fee of ₹${annualFee}.`);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('Payments')
        .insert({
          HouseNumber: houseNo,
          Amount_Paid: amt,
          Mode_of_Payment: paymentMode,
          ReceiptNumber: receiptNo,
          Notes: notes,
          AssociationId: settingsId
        });

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Payment recorded successfully!');
      clearForm();
      navigation.navigate('MemberDetails', { houseNo });
    } catch (err) {
      console.error('Unexpected Error Occurred during insert', err);
      if (err.message.includes('duplicate key value')) {
        Alert.alert('Insert Failed', 'This receipt number already exists.');
      } else {
        Alert.alert('Insert Failed', err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const clearForm = () => {
    setAmountToPay('');
    setReceiptNo(null);
    setNotes('');
  }

  const pendingAmount = annualFee - (paymentStatus?.PaidAmount || 0);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.associationTitle}>PKRA 2025</Text>
            <Text style={styles.pageTitle}>Payment Portal</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="account-circle" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Member Details</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Division:</Text>
              <Text style={styles.detailValue}>{paymentStatus?.Members?.Division ?? 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>House Number:</Text>
              <Text style={styles.detailValue}>{houseNo}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Member Name:</Text>
              <Text style={styles.detailValue}>{paymentStatus?.Members?.Name ?? 'Loading...'}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="payment" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Payment Status</Text>
            </View>
            <View style={styles.paymentSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Paid</Text>
                <Text style={styles.summaryValue}>₹{paymentStatus?.PaidAmount || 0}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Pending</Text>
                <Text style={[styles.summaryValue, { color: '#FF6B6B' }]}>₹{pendingAmount > 0 ? pendingAmount : 0}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Status</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: paymentStatus?.Status === 'Completed' ? '#4CAF50' : '#FF9800' }
                ]}>
                  <Text style={styles.statusText}>{paymentStatus?.Status || 'Pending'}</Text>
                </View>
              </View>
            </View>
          </View>

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
                value={amountToPay}
                onChangeText={setAmountToPay}
                placeholder="Enter amount"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Receipt Number</Text>
              <TextInput
                style={styles.inputBox}
                placeholder='e.g., 100'
                keyboardType='numeric'
                value={receiptNo ? String(receiptNo) : ''}
                onChangeText={(text) => setReceiptNo(text ? Number(text) : null)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Mode</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={paymentMode}
                  onValueChange={setPaymentMode}
                  style={styles.picker}
                >
                  <Picker.Item label="💵 Cash" value="Cash" />
                  <Picker.Item label="📱 UPI" value="UPI" />
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
                onChangeText={setNotes}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default PaymentScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingBottom: 40, // Ensures space at the bottom
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