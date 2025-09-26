import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsMain = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>

      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SettingsMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    marginVertical: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
});
