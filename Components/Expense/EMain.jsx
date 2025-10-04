import { Platform, StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../Config';
import DateTimePicker from '@react-native-community/datetimepicker';

const EMain = () => {
  const [latestYr, setLatestYr] = useState(0);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const fetchAssocID = async () => {
    try {
      const { data, error } = await supabase
        .from('Association_Settings')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Fetching error occurred:', error.message);
        return;
      }

      if (data && data.length > 0) setLatestYr(data[0].id);
    } catch (err) {
      console.error('Unexpected error occurred:', err);
    }
  };

  useEffect(() => {
    fetchAssocID();
  }, []);

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = async () => {
    console.log({
      title,
      desc,
      date: date.toLocaleDateString(),
      amount,
    });

    if(title===''){
        Alert.alert('Failed','Title field should not be empty');
        return;
    }

    if(amount===''){
        Alert.alert('Failed','Amount should not be empty');
        return;
    }

    try{
        const {error}=await supabase
           .from('Expenses')
           .insert({
            Title:title,
            Description:desc,
            Date:date,
            Amount:amount,
            Settings_ID:latestYr
           });

           if(error){
            console.error('Insertion Error Occured',error.message);
            Alert.alert('Failed',error.message);
            return;
           }

           Alert.alert('Success','Expense added successfully');
           setAmount('');
           setDate(new Date());
           setDesc('');
           setTitle('');
    }catch(err){
        console.error('Unexpected Error Occured',err);
        Alert.alert('Failed',err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Add Expense</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="What did you spend on?"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add a note (optional)"
            placeholderTextColor="#999"
            multiline
            value={desc}
            onChangeText={setDesc}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.dateBox} onPress={() => setShowPicker(true)}>
              <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.halfField}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="calendar"
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>Save Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#5a6c7d',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    padding: 14,
    fontSize: 16,
    color: '#2c3e50',
  },
  textArea: {
    height: 90,
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfField: {
    flex: 1,
  },
  dateBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    padding: 14,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  btn: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});