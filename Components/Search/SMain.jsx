import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView,Platform } from 'react-native';
import { StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../Config';

const SMain = ({ navigation }) => {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All');

  const divisions = ['All', 'A', 'B', 'C', 'D', 'E'];

  const fetchHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('Members')
        .select('*');

      if (error) {
        console.error('Error Fetching Rows', error.message);
        return;
      }

      setMembers(data);
      setFiltered(data);
    } catch (err) {
      console.error('Unexpected Error Occurred', err);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const applyFilters = (searchText = query, division = selectedDivision) => {
    let results = members;

    // Filter by division
    if (division !== 'All') {
      results = results.filter(member => member.Division === division);
    }

    // Filter by search query
    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      results = results.filter(
        (member) =>
          member.HouseNumber.toString().toLowerCase().includes(lower) ||
          member.Name.toLowerCase().includes(lower)
      );
    }

    setFiltered(results);
  };

  const handleSearch = (text) => {
    setQuery(text);
    applyFilters(text, selectedDivision);
  };

  const handleDivisionSelect = (division) => {
    setSelectedDivision(division);
    applyFilters(query, division);
  };

  const clearSearch = () => {
    setQuery('');
    applyFilters('', selectedDivision);
  };

  const renderDivisionTab = (division) => (
    <TouchableOpacity
      key={division}
      style={[
        styles.divisionTab,
        selectedDivision === division && styles.activeDivisionTab
      ]}
      onPress={() => handleDivisionSelect(division)}
    >
      <Text style={[
        styles.divisionText,
        selectedDivision === division && styles.activeDivisionText
      ]}>
        {division}
      </Text>
    </TouchableOpacity>
  );

  const renderMemberItem = ({ item }) => (
    <TouchableOpacity
      style={styles.memberItem}
      onPress={() => navigation.navigate('MemberDetails', { houseNo: item.HouseNumber })}
      activeOpacity={0.7}
    >
      <View style={styles.memberInfo}>
        <View style={styles.memberHeader}>
          <View style={styles.houseNumberContainer}>
            <Text style={styles.houseNumber}>#{item.HouseNumber}</Text>
          </View>
          <View style={[styles.divisionBadge, { backgroundColor: getDivisionColor(item.Division) }]}>
            <Text style={styles.divisionBadgeText}>DIV {item.Division}</Text>
          </View>
        </View>
        <Text style={styles.memberName}>{item.Name}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  const getDivisionColor = (division) => {
    const colors = {
      A: '#FF6B6B',
      B: '#4ECDC4',
      C: '#45B7D1',
      D: '#96CEB4',
      E: '#FFEAA7'
    };
    return colors[division] || '#E0E0E0';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Members Directory</Text>
        <Text style={styles.headerSubtitle}>{filtered.length} members found</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by house number or name"
          placeholderTextColor="#8E8E93"
          value={query}
          onChangeText={handleSearch}
        />
        {query ? (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Division Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.divisionContainer}
        contentContainerStyle={styles.divisionContent}
      >
        {divisions.map(renderDivisionTab)}
      </ScrollView>

      {/* Members List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.HouseNumber.toString()}
        renderItem={renderMemberItem}
        style={styles.membersList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.membersListContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No members found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default SMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    marginTop:Platform.OS==='android'?StatusBar.currentHeight:0
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#8E8E93',
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1C1C1E',
  },
  clearButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: 'bold',
  },
  divisionContainer: {
    marginTop: 16,
    maxHeight: 50,
  },
  divisionContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  divisionTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  activeDivisionTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  divisionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeDivisionText: {
    color: '#FFFFFF',
  },
  membersList: {
    flex: 1,
    marginTop: 16,
  },
  membersListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  houseNumberContainer: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  houseNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  divisionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  divisionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  chevron: {
    fontSize: 20,
    color: '#C0C0C0',
    fontWeight: '300',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#C0C0C0',
    textAlign: 'center',
  },
});