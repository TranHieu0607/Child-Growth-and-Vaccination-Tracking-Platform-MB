import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faChevronDown, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import childrenApi from '../api/childrenApi';
import { getDailyRecordsByChildId } from '../api/dailyApi';

const PAGE_SIZE = 3;

const DailyRecordScreen = ({ navigation }) => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await childrenApi.getMyChildren();
        setChildren(res.data);
        if (res.data.length > 0) setSelectedChildId(res.data[0].childId);
      } catch {
        setChildren([]);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;
    setLoading(true);
    const fetchRecords = async () => {
      try {
        const data = await getDailyRecordsByChildId(selectedChildId);
        const sorted = data.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
        setRecords(sorted);
      } catch {
        setRecords([]);
      }
      setLoading(false);
    };
    fetchRecords();
  }, [selectedChildId]);

  const paginatedRecords = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(records.length / PAGE_SIZE);

  const selectedChild = children.find(child => child.childId === selectedChildId);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhật ký hằng ngày</Text>
      </View>

      <View style={styles.childInfoContainer}>
        <View style={styles.childInfo}>
          {selectedChild && (
            <Image source={require('../../assets/vnvc.jpg')} style={styles.profileImage} />
          )}
          <View>
            {selectedChild && (
              <Text style={styles.childName}>{selectedChild.fullName}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.dropdownToggle} onPress={() => setIsDropdownVisible(!isDropdownVisible)}>
          <FontAwesomeIcon icon={faChevronDown} size={20} color="black" />
        </TouchableOpacity>
      </View>
      {isDropdownVisible && (
        <View style={styles.dropdownContainer}>
          <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll}>
            {children.map(child => (
              <TouchableOpacity
                key={child.childId}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedChildId(child.childId);
                  setIsDropdownVisible(false);
                  setPage(1);
                }}
              >
                <Image source={require('../../assets/vnvc.jpg')} style={styles.dropdownItemImage} />
                <View style={styles.dropdownItemTextContainer}>
                  <Text style={styles.dropdownItemName}>{child.fullName}</Text>
                </View>
                {selectedChildId === child.childId && <Text style={styles.selectedIcon}> ✅</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Nhật ký gần đây</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : paginatedRecords.length === 0 ? (
        <Text>Chưa có nhật ký nào.</Text>
      ) : (
        paginatedRecords.map(record => (
          <View key={record.dailyRecordId} style={styles.recordCard}>
            <Text style={styles.recordDate}>Ngày: {record.recordDate}</Text>
            <Text>Sữa: {record.milkAmount} ml</Text>
            <Text>Số lần bú: {record.feedingTimes}</Text>
            <Text>Thay tã: {record.diaperChanges} lần</Text>
            <Text>Ngủ: {record.sleepHours} giờ</Text>
            <Text>Ghi chú: {record.note}</Text>
          </View>
        ))
      )}

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
            style={[styles.pageBtn, page === 1 && { opacity: 0.5 }]}
          >
            <FontAwesomeIcon icon={faChevronLeft} size={18} />
          </TouchableOpacity>
          <Text style={styles.pageText}>{page} / {totalPages}</Text>
          <TouchableOpacity
            disabled={page === totalPages}
            onPress={() => setPage(page + 1)}
            style={[styles.pageBtn, page === totalPages && { opacity: 0.5 }]}
          >
            <FontAwesomeIcon icon={faChevronRight} size={18} />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  childInfoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 20 },
  childInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  childName: { fontSize: 18, fontWeight: 'bold' },
  dropdownToggle: { marginLeft: 'auto', paddingHorizontal: 10 },
  dropdownContainer: { backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#ccc', zIndex: 1, marginBottom: 10, marginTop: -15 },
  dropdownScroll: { maxHeight: 150 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dropdownItemImage: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  dropdownItemTextContainer: { flex: 1 },
  dropdownItemName: { fontSize: 16, fontWeight: 'bold' },
  selectedIcon: { color: 'green', fontSize: 16, marginLeft: 10 },
  recordCard: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  recordDate: { fontWeight: 'bold', marginBottom: 5 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  pageBtn: { padding: 10 },
  pageText: { marginHorizontal: 15, fontWeight: 'bold' },
});

export default DailyRecordScreen; 