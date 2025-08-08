import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBaby, faCrown, faChartBar, faCalendarDays, faNewspaper, faNotesMedical, faSyringe, faBookMedical, faFileMedical } from '@fortawesome/free-solid-svg-icons';


const features = [
  { key: 'add_baby', label: 'Thêm bé', icon: <FontAwesomeIcon icon={faBaby} size={32} color="#1565C0" /> },
  { key: 'add_vaccine', label: 'Vip', icon: <FontAwesomeIcon icon={faCrown} size={32} color="#1565C0" /> },
  { key: 'growth_chart', label: 'Biểu đồ tăng trưởng', icon: <FontAwesomeIcon icon={faChartBar} size={32} color="#1565C0" /> },
  { key: 'vaccination_schedule', label: 'Lịch tiêm chủng', icon: <FontAwesomeIcon icon={faCalendarDays} size={32} color="#1565C0" /> },
  { key: 'vaccine_spot', label: 'Theo dõi hàng ngày', icon: <FontAwesomeIcon icon={faNotesMedical} size={32} color="#1565C0" /> },
  { key: 'health_record', label: 'Nhập lịch sử tiêm', icon: <FontAwesomeIcon icon={faFileMedical} size={32} color="#1565C0" /> },
  { key: 'payment_history', label: 'Đặt lại lịch tiêm', icon: <FontAwesomeIcon icon={faSyringe} size={32} color="#1565C0" /> },
  { key: 'news', label: 'Tin tức', icon: <FontAwesomeIcon icon={faNewspaper} size={32} color="#1565C0" /> },
  { key: 'rating', label: 'Sổ tiêm chủng', icon: <FontAwesomeIcon icon={faBookMedical} size={32} color="#1565C0" /> },
];

const newsTabs = [
  { key: 'facility', label: 'Cơ sở tiêm chủng' },
  { key: 'area', label: 'Vắc xin cho trẻ' },
  { key: 'vip', label: 'Gói Vắc xin' },
];

const facilities = [
  { key: '1', name: 'VNVC Đà Nẵng', address: '99 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', image: require('../../assets/vnvc.jpg') },
  { key: '2', name: 'VNVC Đà Nẵng', address: '99 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', image: require('../../assets/vnvc.jpg') },
  { key: '3', name: 'VNVC Đà Nẵng', address: '99 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', image: require('../../assets/vnvc.jpg') },
  { key: '4', name: 'VNVC Đà Nẵng', address: '99 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', image: require('../../assets/vnvc.jpg') },
  { key: '5', name: 'VNVC Đà Nẵng', address: '99 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', image: require('../../assets/vnvc.jpg') },
];

// Component cho phần Header của FlatList (chứa các thành phần tĩnh)
const HomeListHeader = ({ newsTabs, newsTab, setNewsTab, navigation }) => (
  <View>
    <Image source={require('../../assets/suckhoe.jpg')} style={styles.banner} />
    <View style={styles.grid}>
      {features.map((item, idx) => (
        <View style={styles.gridItem} key={item.key}>
          <TouchableOpacity 
            style={styles.iconCircle}
            onPress={() => {
              if (item.key === 'add_baby') {
                navigation.navigate('Register');
              } else if (item.key === 'news') {
                navigation.navigate('News');
              } else if (item.key === 'vaccination_schedule') {
                navigation.navigate('HistoryVacc');
              } else if (item.key === 'growth_chart') {
                navigation.navigate('Chart');
              } else if (item.key === 'add_vaccine') {
                navigation.navigate('VipScreen');
              } else if (item.key === 'health_record') {
                navigation.navigate('UpdateVaccHiss');
              } else if (item.key === 'payment_history') {
                navigation.navigate('ReOrder');
              }  
              else if (item.key === 'rating') {
                navigation.navigate('VaccBook');
              } 
              else if (item.key === 'vaccine_spot') {
                navigation.navigate('CreateDaily');
              }
            }}
          >
            {item.icon}
          </TouchableOpacity>
          <Text style={styles.gridLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
    <View style={styles.newsTabs}>
      {newsTabs.map(tab => (
        <TouchableOpacity key={tab.key} style={[styles.newsTab, newsTab === tab.key && styles.activeNewsTab]} onPress={() => setNewsTab(tab.key)}>
          <Text style={[styles.newsTabText, newsTab === tab.key && styles.activeNewsTabText]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <TouchableOpacity >
      <Text style={styles.sectionTitle}>Tin tức</Text>
    </TouchableOpacity>
  </View>
);

export default function HomeScreen({ navigation }) {
  const [newsTab, setNewsTab] = useState('facility');

  // HomeScreen chỉ render FlatList
  return (
    <FlatList
      data={facilities}
      keyExtractor={item => item.key}
      renderItem={({ item }) => (
        <View style={styles.facilityCard}>
          <Image source={item.image} style={styles.facilityImage} />
          <View style={styles.facilityInfo}>
            <Text style={styles.facilityName}>{item.name}</Text>
            <Text style={styles.facilityAddress}>{item.address}</Text>
          </View>
        </View>
      )}
      // Sử dụng HomeListHeader làm header của FlatList
      ListHeaderComponent={
        <HomeListHeader
          newsTabs={newsTabs}
          newsTab={newsTab}
          setNewsTab={setNewsTab}
          navigation={navigation}
        />
      }
      style={styles.list} // Style cho FlatList
      contentContainerStyle={styles.listContent} // Style cho nội dung bên trong FlatList
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1, 
    backgroundColor: '#f7fafd', 
  },
  listContent: {
    paddingBottom: 20, // Thêm padding cuối để nội dung không bị Footer che
  },
  banner: {
    width: '92%',
    height: 120,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    marginVertical: 10,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  gridLabel: {
    fontSize: 13,
    color: '#222',
    textAlign: 'center',
  },
  newsTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 12,
    marginBottom: 8,
  },
  newsTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#e3eafc',
  },
  activeNewsTab: {
    backgroundColor: '#1565C0',
  },
  newsTabText: {
    color: '#1565C0',
    fontSize: 13,
  },
  activeNewsTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 8,
    color: '#222',
  },
  facilityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 10,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  facilityImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#1565C0',
  },
  facilityAddress: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
}); 