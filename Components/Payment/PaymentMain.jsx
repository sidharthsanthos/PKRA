import { KeyboardAvoidingView, Alert, ActivityIndicator, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState, useEffect, useRef, useCallback} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import { supabase } from '../Config';

const PaymentMain = () => {
  const [settingId, setSettingId] = useState(null);
  const [selectedDivision, setSelectedDivision ] = useState('');
  const [ houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState('');
  const [mode, setMode] = useState('');
  const [amount, setAmount] = useState(0);
  const [receiptNumber, setReceiptNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const divisionRef = useRef();
  const houseRef = useRef();
  const paymentRef = useRef();

  const division = ['A', 'B', 'C', 'D', 'E'];

  const clearForm = () => {
    setSelectedDivision('');
    setSelectedHouse('');
    setAmount(0);
    setMode('');
    setReceiptNumber(0);
    setHouses([]);
  }

  useFocusEffect(
    useCallback(() => {
      clearForm();
    }, [])
  )
   const fetchHouses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
      .from('Members')
      .select('*')
      .eq('Division', selectedDivision);

      if (error) throw error;
      setHouses(data);

    } catch (error) {
      console.error('Error Fetching Houses', error.message);
    } finally {
      setLoading(false);
    }
  }

  const fetchInfo = async () => {
    setLoading(true);
    if (!selectedHouse) return;
    try {
      const { data, error } = await supabase
      .from('House_Payment_Status')
      .select('PaidAmount, Status')
      .eq('HouseNumber',selectedHouse.HouseNumber);
      
      if (error) throw error;
      setAmount(data[0]?.PaidAmount ?? 0);

    } catch (error){
      console.error('Error Fetching Amount', error.message);
    } finally {
      setLoading(false);
    }
  }

  const addPayment = async() => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Payments')
        .insert({
          'AssociationId': settingId,
          'HouseNumber': selectedHouse.HouseNumber,
          'Amount_Paid': amount,
          'Mode': mode,
          'ReceiptNumber': receiptNumber
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        Alert.alert('Success', 'Payment Added Successfully');
        clearForm();
      } else {
        Alert.alert('Error', 'Payment could not be added. Please try again.');
      }

    } catch (error) {
      Alert.alert('Error Adding Payment', error.message);
      console.error('Error Adding Payment', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchAssociationId = async () => {
      const associationId = await AsyncStorage.getItem('settingId');
      setSettingId(associationId);
    }
    fetchAssociationId();
  },[])

  useEffect(() => {
    setHouses([]);
    setSelectedHouse('');
    setAmount(0);
    if (selectedDivision) {
      fetchHouses();
    }
  }, [selectedDivision]);

  useEffect(() => {
    setAmount(0);
    if (selectedHouse) {
      fetchInfo();
    }
  }, [selectedHouse]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4299E1" />
            </View>
          )}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.card}>
            <Text style={styles.title}>Make a Payment</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Division</Text>
              <View style={styles.pickerContainer}>
                {loading ? (
                  <ActivityIndicator size="small" color="#4299E1" />
                ) : (
                  <Picker
                  required
                  ref={divisionRef}
                  selectedValue={selectedDivision}
                  placeholderTextColor="#A9A9A9"
                  onValueChange={setSelectedDivision}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Division" value="" />
                  {division.map((div) => <Picker.Item label={div} value={div} key={div}/>)}
                </Picker>)}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select House </Text>
              <View style={styles.pickerContainer}>
                {loading ? (
                  <ActivityIndicator size="small" color="#4299E1" />
                ) : (
                  <Picker 
                    required
                    ref={houseRef}
                    selectedValue={selectedHouse}
                    onValueChange={setSelectedHouse}
                    style={styles.picker}
                    placeholderTextColor="#A9A9A9"
                  >
                    <Picker.Item label="Select House" value="" />
                    {houses.map((house) => (
                      <Picker.Item
                        label={house.HouseNumber}
                        value={house}
                        key={house.HouseNumber}
                      />
                    ))}
                  </Picker>
                )}
              </View>
            </View>


            <View style={styles.infoGroup}>
              <Text style={styles.label}>Owner</Text>
              <Text style={styles.infoText}>{selectedHouse?.Name || '...'}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mode of Payment</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  required
                  ref={paymentRef}
                  selectedValue={mode}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Payment Method" value='' />
                  <Picker.Item label="Cash" value="Cash" />
                  <Picker.Item label="UPI" value="UPI" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                placeholderTextColor="#A9A9A9"
                style={styles.input}
                onChangeText={text => setAmount(Number(text))}
                value={String(amount)}
                keyboardType='numeric'
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Receipt Number</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => setReceiptNumber(Number(text))}
                value={receiptNumber ? String(receiptNumber) : ''}
                placeholder='Receipt Number'
                keyboardType='numeric'
                placeholderTextColor="#A9A9A9"
              />
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={addPayment}
            >
              <Text style={styles.buttonText}>Pay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default PaymentMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1A202C',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4A5568',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F7FAFC',
  },
  infoGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#EDF2F7',
    padding: 12,
    borderRadius: 8,
  },
  picker: {
    width: '100%',
    height: 50,
    color: 'black',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
  },
  button: {
    backgroundColor: '#4299E1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
})