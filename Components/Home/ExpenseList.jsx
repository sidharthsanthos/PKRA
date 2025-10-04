import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, Pressable, Platform, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../Config';

const ExpenseList = ({ route }) => {
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const current = route.params.id;

  const fetchExpense = async () => {
    try {
      const { data, error } = await supabase
        .from('Expenses')
        .select('*')
        .eq('Settings_ID', current);

      if (error) {
        console.error('Fetching Error Occurred', error.message);
        return;
      }

      setExpenses(data);
    } catch (err) {
      console.error('Unexpected Error Occurred', err);
    }
  };

  useEffect(() => {
    fetchExpense();
  }, []);

  const openModal = (item) => {
    setSelectedExpense(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedExpense(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => openModal(item)}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.Title}</Text>
          <Text style={styles.desc}>{item.Description}</Text>
        </View>
        <Text style={styles.amount}>₹ {item.Amount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expense List</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses recorded yet.</Text>}
      />

      {/* Modal for detailed view */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedExpense && (
              <>
                <Text style={styles.modalTitle}>{selectedExpense.Title}</Text>
                <Text style={styles.modalDetail}>Description: {selectedExpense.Description}</Text>
                <Text style={styles.modalDetail}>Amount: ₹ {selectedExpense.Amount}</Text>
                <Text style={styles.modalDetail}>Date: {selectedExpense.Date}</Text>
                <Text style={styles.modalDetail}>Settings ID: {selectedExpense.Settings_ID}</Text>
                <Text style={styles.modalDetail}>Created At: {new Date(selectedExpense.created_at).toLocaleString()}</Text>
              </>
            )}
            <Pressable onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExpenseList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    paddingTop: Platform.OS==='android'?StatusBar.currentHeight:0,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  desc: {
    fontSize: 13,
    color: '#777',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  modalDetail: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
  },
  closeButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: '600',
  },
});