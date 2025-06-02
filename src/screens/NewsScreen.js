import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const NewsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Tin tức</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bài viết"
          placeholderTextColor="#888"
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        <TouchableOpacity style={[styles.categoryButton, styles.categoryButtonActive]}>
          <Text style={[styles.categoryButtonText, styles.categoryButtonTextActive]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>Tiêm chủng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>Dinh dưỡng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>Phá</Text>
        </TouchableOpacity>
        {/* Add more categories as needed */}
      </ScrollView>

      {/* Featured Article Section */}
      <Text style={styles.sectionTitle}>Bài Viết Nổi Bật</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
        {/* Featured Article Item 1 */}
        <View style={styles.featuredArticle}>
          <Image
            source={require('../../assets/suckhoe.jpg')}
            style={styles.featuredArticleImage}
          />
          <View style={styles.featuredArticleOverlay}>
            <Text style={styles.featuredArticleTag}>NỔI BẬT</Text>
            <Text style={styles.featuredArticleTitle}>Hướng dẫn chi tiết lịch tiêm chủng cho trẻ từ 0-12 tháng tuổi</Text>
            <Text style={styles.featuredArticleInfo}>© 15/02/2024 - 5 phút đọc</Text>
          </View>
        </View>

        {/* Featured Article Item 2 - Placeholder */}
        <View style={styles.featuredArticle}>
          <Image
            source={require('../../assets/suckhoe.jpg')}
            style={styles.featuredArticleImage}
          />
          <View style={styles.featuredArticleOverlay}>
            <Text style={styles.featuredArticleTag}>KHÁM PHÁ</Text>
            <Text style={styles.featuredArticleTitle}>Những lợi ích bất ngờ của việc cho trẻ tắm nắng đúng cách</Text>
            <Text style={styles.featuredArticleInfo}>© 14/02/2024 - 3 phút đọc</Text>
          </View>
        </View>

        {/* Featured Article Item 3 - Placeholder */}
        <View style={styles.featuredArticle}>
          <Image
            source={require('../../assets/suckhoe.jpg')}
            style={styles.featuredArticleImage}
          />
          <View style={styles.featuredArticleOverlay}>
            <Text style={styles.featuredArticleTag}>TIPS</Text>
            <Text style={styles.featuredArticleTitle}>Cách chọn sữa công thức phù hợp cho bé yêu</Text>
            <Text style={styles.featuredArticleInfo}>© 13/02/2024 - 4 phút đọc</Text>
          </View>
        </View>

      </ScrollView>

      {/* Latest Articles Section */}
      <Text style={styles.sectionTitle}>Bài Viết Mới Nhất</Text>
      <ScrollView style={styles.latestArticlesScroll}>
        {/* Latest Article Item */}
        <View style={styles.latestArticle}>
          <Image
            source={require('../../assets/suckhoe.jpg')}
            style={styles.latestArticleImage}
          />
          <View style={styles.latestArticleContent}>
            <Text style={styles.latestArticleTitle}>Chế độ dinh dưỡng cho trẻ biếng ăn</Text>
            <Text style={styles.latestArticleSnippet}>Tổng hợp những thực phẩm và cách chế biến giúp trẻ ăn ngon</Text>
            <Text style={styles.latestArticleDate}>13/02/2024</Text>
          </View>
          <Text style={styles.latestArticleArrow}>{'>'}</Text>
        </View>
        {/* Latest Article Item */}
        <View style={styles.latestArticle}>
          <Image
            source={require('../../assets/suckhoe.jpg')}
            style={styles.latestArticleImage}
          />
          <View style={styles.latestArticleContent}>
            <Text style={styles.latestArticleTitle}>Cách phòng ngừa bệnh tay chân miệng ở trẻ</Text>
            <Text style={styles.latestArticleSnippet}>Các biện pháp phòng ngừa hiệu quả và dấu hiệu nhận biết sớm...</Text>
            <Text style={styles.latestArticleDate}>12/02/2024</Text>
          </View>
          <Text style={styles.latestArticleArrow}>{'>'}</Text>
        </View>
         {/* Latest Article Item */}
        <View style={styles.latestArticle}>
          <Image
            source={require('../../assets/suckhoe.jpg')}
            style={styles.latestArticleImage}
          />
          <View style={styles.latestArticleContent}>
            <Text style={styles.latestArticleTitle}>Những mốc phát triển quan trọng của trẻ 1-3 tuổi</Text>
            <Text style={styles.latestArticleSnippet}>Theo dõi sự phát triển của con qua các cột mốc quan trọng...</Text>
            <Text style={styles.latestArticleDate}>11/02/2024</Text>
          </View>
          <Text style={styles.latestArticleArrow}>{'>'}</Text>
        </View>
        {/* Add more latest articles */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 40, // Adjust for status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: -30, // Adjust to center title despite back button
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 5,
    color: '#888',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoriesScroll: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  categoryButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginVertical: 10,
    color: '#333',
  },
  featuredScroll: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  featuredArticle: {
    width: 280, // Adjusted width to show more items
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3, // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  featuredArticleImage: {
    width: '100%',
    height: 150,
  },
  featuredArticleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  featuredArticleTag: {
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  featuredArticleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  featuredArticleInfo: {
    fontSize: 12,
    color: '#ddd',
  },
  latestArticlesScroll: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  latestArticle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    alignItems: 'center',
  },
  latestArticleImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  latestArticleContent: {
    flex: 1,
    justifyContent: 'center',
  },
  latestArticleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  latestArticleSnippet: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  latestArticleDate: {
    fontSize: 12,
    color: '#888',
  },
  latestArticleArrow: {
    fontSize: 18,
    color: '#888',
    marginLeft: 10,
  },
});

export default NewsScreen; 