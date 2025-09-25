import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView } from 'react-native';
import React, { useState } from 'react';

const SettingsMain = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Section 1 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* Section 2 */}
      <View style={styles.section}>
        <View style={styles.itemRow}>
          <Text style={styles.itemText}>Enable Notifications</Text>
          <Switch
            value={isNotificationsEnabled}
            onValueChange={setIsNotificationsEnabled}
          />
        </View>
      </View>

      {/* Section 3 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.item}>
          <Text style={[styles.itemText, { color: 'red' }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
