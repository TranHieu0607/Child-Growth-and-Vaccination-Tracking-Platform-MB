import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBaby, faCrown, faChartBar, faCalendarDays, faNewspaper, faNotesMedical, faSyringe, faBookMedical, faFileMedical } from '@fortawesome/free-solid-svg-icons';
import useBlogs from '../store/hook/useBlogs';
import BlogCard from '../component/BlogCard';


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
  { key: 'all', label: 'Tất cả tin tức' },
  { key: 'health', label: 'Sức khỏe' },
  { key: 'tiêm chủng', label: 'Tiêm chủng' },
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
                navigation.navigate('ChildRegister');
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
    <TouchableOpacity onPress={() => navigation.navigate('News')}>
      <Text style={styles.sectionTitle}>Tin tức</Text>
    </TouchableOpacity>
  </View>
);

export default function HomeScreen({ navigation }) {
  const [newsTab, setNewsTab] = useState('all');
  const { blogs, loading, error } = useBlogs();

  // Đảm bảo blogs luôn là array
  const blogsArray = Array.isArray(blogs) ? blogs : [];

  // Filter blogs based on selected tab
  const filteredBlogs = newsTab === 'all' 
    ? blogsArray.slice(0, 5) // Show only first 5 blogs on home screen
    : blogsArray.filter(blog => blog.category && blog.category.toLowerCase().includes(newsTab.toLowerCase())).slice(0, 5);

  // HomeScreen chỉ render FlatList
  return (
    <FlatList
      data={filteredBlogs}
      keyExtractor={item => item.blogId.toString()}
      renderItem={({ item }) => (
        <BlogCard
          blog={item}
          variant="horizontal"
          onPress={() => navigation.navigate('BlogDetail', { blogId: item.blogId })}
          style={styles.newsCard}
        />
      )}
      ListHeaderComponent={
        <HomeListHeader
          newsTabs={newsTabs}
          newsTab={newsTab}
          setNewsTab={setNewsTab}
          navigation={navigation}
        />
      }
      ListEmptyComponent={() => {
        if (loading) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1565C0" />
              <Text style={styles.loadingText}>Đang tải tin tức...</Text>
            </View>
          );
        }
        if (error) {
          return (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Không thể tải tin tức</Text>
            </View>
          );
        }
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có tin tức nào</Text>
          </View>
        );
      }}
      style={styles.list}
      contentContainerStyle={styles.listContent}
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
  newsCard: {
    marginHorizontal: 0, // BlogCard đã có margin riêng
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    textAlign: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 