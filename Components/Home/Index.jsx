import { StyleSheet, Text, View, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../Config';

const StatCard = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const StatRow = ({ label, value }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const ProgressBar = ({ progress }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBar, { width: `${progress}%` }]} />
  </View>
);

const HomeContainer = () => {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState([]);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('Association_Settings')
        .select('*')
        .order('Year', { ascending: false });
      setSettings(data || []);

      if (data && data.length > 0) {
        const storedSettingId = await AsyncStorage.getItem('settingId');
        const initialSetting = storedSettingId ? data.find(s => s.id.toString() === storedSettingId) : data[0];
        setCurrentSetting(initialSetting || data[0]);
      }
    } catch (error) {
      console.error('Error Fetching Settings', error.message);
    }
  }, []);

  const fetchStats = async () => {
    if (!currentSetting) return;
    setLoading(true);
    try {
      const { id: settingId, Annual_Fee: annualFee } = currentSetting;

      const { data: members, error: membersError } = await supabase.
      from('Members').
      select('HouseNumber, Division');
      
      if (membersError) throw membersError;

      const { data: payments, error: paymentsError } = await supabase
      .from('Payments')
      .select('Amount_Paid, Mode, HouseNumber') 
      .eq('AssociationId', settingId);
      
      if (paymentsError) throw paymentsError;

      const paymentsByHouse = payments.reduce((acc, p) => {
        acc[p.HouseNumber] = (acc[p.HouseNumber] || 0) + p.Amount_Paid;
        return acc;
      }, {});

      let calculatedStats = {
        amountReceived: 0,
        cashInHand: 0,
        cashInUpi: 0,
        byDivision: {'A': {paid: 0}, 'B': {paid: 0}, 'C': {paid: 0}, 'D': {paid: 0}, 'E': {paid: 0}},
      };

      calculatedStats.amountReceived = payments.reduce((sum, p) => sum + p.Amount_Paid, 0);
      calculatedStats.cashInHand = payments.filter(p => p.Mode === 'Cash').reduce((sum, p) => sum + p.Amount_Paid, 0);
      calculatedStats.cashInUpi = payments.filter(p => p.Mode === 'UPI').reduce((sum, p) => sum + p.Amount_Paid, 0);

      members.forEach(member => {
        const divisionData = calculatedStats.byDivision[member.Division];
        if (divisionData) {
          divisionData.paid += paymentsByHouse[member.HouseNumber] || 0;
        }
      });

      const totalPossible = members.length * annualFee;
      calculatedStats.amountPending = totalPossible - calculatedStats.amountReceived;

      setStats(calculatedStats);
    } catch (error) {
      Alert.alert('Error fetching stats', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [fetchSettings]) 
  );

  useEffect(() => {
    if (currentSetting) {
      fetchStats();
    }
  }, [currentSetting]);

  const progress = stats && (stats.amountReceived + stats.amountPending) > 0 ? (stats.amountReceived / (stats.amountReceived + stats.amountPending)) * 100 : 0;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Dashboard</Text>

          <View style={styles.pickerCard}>
            <Text style={styles.pickerLabel}>Showing Stats For</Text>
            <Picker
              selectedValue={currentSetting?.id}
              onValueChange={(itemValue) => {
                const selected = settings.find(s => s.id === itemValue);
                setCurrentSetting(selected);
              }}
              style={styles.picker}
            >
              {settings.map((setting) => (
                <Picker.Item
                  key={setting.id}
                  label={`Oct ${setting.Year} - Sep ${setting.Year + 1}`}
                  value={setting.id}
                />)
              )}
            </Picker>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
          ) : !stats ? (
            <Text style={styles.centerText}>No stats available for this cycle.</Text>
          ) : (
            <>
              <StatCard title="Financial Summary">
                <StatRow label="Amount Received" value={`₹ ${stats.amountReceived.toLocaleString()}`} />
                <StatRow label="Amount Pending" value={`₹ ${stats.amountPending.toLocaleString()}`} />
                <ProgressBar progress={progress} />
                <Text style={styles.progressLabel}>{progress.toFixed(1)}% Collected</Text>
              </StatCard>

              <StatCard title="Cash Flow">
                <StatRow label="Cash in Hand" value={`₹ ${stats.cashInHand.toLocaleString()}`} />
                <StatRow label="Received via UPI" value={`₹ ${stats.cashInUpi.toLocaleString()}`} />
              </StatCard>

              <StatCard title="Division Breakdown">
                {Object.entries(stats.byDivision).map(([div, data]) => (
                  <StatRow key={div} label={`Division ${div} Paid`} value={`₹ ${data.paid.toLocaleString()}`} />
                ))}
              </StatCard>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default HomeContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  centerText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#64748b',
  },
  pickerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  pickerLabel: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 10,
    marginTop: 5,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#475569',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 5,
  },
  progressLabel: {
    textAlign: 'right',
    marginTop: 5,
    fontSize: 12,
    color: '#64748b',
  },
});