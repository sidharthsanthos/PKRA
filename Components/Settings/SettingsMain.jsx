import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {Picker} from '@react-native-picker/picker';
import { useState, useEffect, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../Config';

const SettingsMain = () => {
  const [loading, setLoading] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [newSetting, setNewSetting] = useState({
    Annual_Fee: 0,
    Due_date: new Date(),
  });
  const [settings, setSettings] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const createSetting = async () => {
    setLoading(true);
    try {
      await supabase
      .from('Association_Settings')
      .insert({
        Year: currentCycle,
        Annual_Fee: newSetting.Annual_Fee,
        Due_date: newSetting.Due_date,
      })
      fetchSettings();
    } catch (error) {
      console.error('Error Creating Setting', error.message);
    } finally {
      setLoading(false);
    }
  }

  const updateSetting = async () => {
    setLoading(true);
    try {
      await supabase
      .from('Association_Settings')
      .update({
        'Annual_Fee': newSetting.Annual_Fee,
        'Due_date': newSetting.Due_date,
      })
      .eq('id', currentSetting.id)
      fetchSettings();
    } catch (error) {
      console.error('Error Updating Setting', error.message);
    } finally {
      setLoading(false);
    }
  }

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
      .from('Association_Settings')
      .select('*')
      .order('Year', { ascending: false });
      setSettings(data);
      if (data && data.length > 0) {
        setCurrentSetting(data[0]);
      }
    } catch (error) {
      console.error('Error Fetching Settings', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
    if(new Date().getMonth() < 9) 
      setCurrentCycle(new Date().getFullYear()-1);
    else
      setCurrentCycle(new Date().getFullYear());
  },[])

  useEffect(() => {
    if (currentSetting) {
      setNewSetting({
        Annual_Fee: currentSetting.Annual_Fee || 0,
        Due_date: currentSetting.Due_date ? new Date(currentSetting.Due_date) : new Date(),
      });
    }
  }, [currentSetting]);

  const handleDateChange = (selectedDate) => {
    const currentDate = selectedDate || newSetting.Due_date;
    setShowDatePicker(false);
    setNewSetting({ ...newSetting, Due_date: currentDate });
  };

  const isCurrentCycleSelected = currentSetting && currentCycle === currentSetting.Year;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Settings</Text>
          
          {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />}

          <View style={styles.section}>
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>Year Cycle</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={currentSetting?.Year}
                  onValueChange={(itemValue) => {
                    const selected = settings.find(s => s.Year === itemValue);
                    setCurrentSetting(selected);
                  }}
                  style={styles.picker}
                >  
                  {settings.map((setting) => (
                    <Picker.Item 
                      key={setting.id}
                      label={`Oct ${setting.Year} - Sep ${setting.Year + 1}`}
                      value={setting.Year}
                    />)
                  )}
                </Picker>
              </View>
            </View>
            {isCurrentCycleSelected && (
              <Text style={styles.currentCycleText}>*Current Cycle*</Text>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>Annual Fee</Text>
              <TextInput 
                style={styles.input}
                placeholder='Amount'
                value={newSetting.Annual_Fee.toString()}
                onChangeText={(text) => setNewSetting({...newSetting, Annual_Fee: parseInt(text, 10) || 0})}
                keyboardType='numeric'
                editable={isCurrentCycleSelected}
              />
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>Due Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} disabled={!isCurrentCycleSelected}>
                <Text style={styles.dateText}>{newSetting.Due_date.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker 
                mode='date'
                value={newSetting.Due_date}
                onChange={handleDateChange}
                display='default'
              />
            )}
          </View>

          {isCurrentCycleSelected ? (
            <TouchableOpacity style={styles.button} onPress={updateSetting} disabled={loading}>
              <Text style={styles.buttonText}>Update Settings</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={createSetting} disabled={loading}>
              <Text style={styles.buttonText}>Create New Cycle</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SettingsMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 24,
    textAlign: 'center',
    color: '#1e293b',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  pickerContainer: {
    flex: 1,
    marginLeft: 16,
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
  },
  currentCycleText: {
    textAlign: 'center',
    paddingVertical: 8,
    color: '#007bff',
    fontSize: 14,
    fontStyle: 'italic',
  },
  input: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
