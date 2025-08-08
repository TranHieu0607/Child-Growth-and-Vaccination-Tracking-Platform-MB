import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import useBlogs from '../store/hook/useBlogs';
import BlogCard from '../component/BlogCard';

const NewsScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { blogs, loading, error, refetch } = useBlogs();

  // Đảm bảo blogs luôn là array
  const blogsArray = Array.isArray(blogs) ? blogs : [];

  // Filter blogs based on search and category
  const filteredBlogs = blogsArray.filter(blog => {
    const title = blog.title || '';
    const content = blog.content || '';
    const category = blog.category || '';
    
    const matchesSearch = title.toLowerCase().includes(searchText.toLowerCase()) ||
                         content.toLowerCase().includes(searchText.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    return matchesSearch && category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  // Get featured articles (first 3 blogs)
  const featuredArticles = filteredBlogs.slice(0, 3);
  // Get latest articles (remaining blogs)
  const latestArticles = filteredBlogs.slice(3);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Tin tức</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refetch} />
      }
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
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
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        <TouchableOpacity 
          style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryButtonActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.categoryButtonText, selectedCategory === 'all' && styles.categoryButtonTextActive]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.categoryButton, selectedCategory === 'tiêm chủng' && styles.categoryButtonActive]}
          onPress={() => setSelectedCategory('tiêm chủng')}
        >
          <Text style={[styles.categoryButtonText, selectedCategory === 'tiêm chủng' && styles.categoryButtonTextActive]}>Tiêm chủng</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.categoryButton, selectedCategory === 'health' && styles.categoryButtonActive]}
          onPress={() => setSelectedCategory('health')}
        >
          <Text style={[styles.categoryButtonText, selectedCategory === 'health' && styles.categoryButtonTextActive]}>Sức khỏe</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.categoryButton, selectedCategory === 'dinh dưỡng' && styles.categoryButtonActive]}
          onPress={() => setSelectedCategory('dinh dưỡng')}
        >
          <Text style={[styles.categoryButtonText, selectedCategory === 'dinh dưỡng' && styles.categoryButtonTextActive]}>Dinh dưỡng</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Đang tải tin tức...</Text>
        </View>
      )}

      {!loading && featuredArticles.length > 0 && (
        <>
          {/* Featured Article Section */}
          <Text style={styles.sectionTitle}>Bài Viết Nổi Bật</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
            {featuredArticles.map((article) => (
              <BlogCard
                key={article.blogId}
                blog={article}
                variant="featured"
                onPress={() => navigation.navigate('BlogDetail', { blogId: article.blogId })}
              />
            ))}
          </ScrollView>
        </>
      )}

      {!loading && latestArticles.length > 0 && (
        <>
          {/* Latest Articles Section */}
          <Text style={styles.sectionTitle}>Bài Viết Mới Nhất</Text>
          <ScrollView style={styles.latestArticlesScroll}>
            {latestArticles.map((article) => (
              <BlogCard
                key={article.blogId}
                blog={article}
                variant="horizontal"
                onPress={() => navigation.navigate('BlogDetail', { blogId: article.blogId })}
                style={styles.latestArticleCard}
              />
            ))}
          </ScrollView>
        </>
      )}

      {!loading && filteredBlogs.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy bài viết nào</Text>
        </View>
      )}
    </ScrollView>
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
    paddingHorizontal: 0,
    paddingBottom: 15,
  },
  latestArticleCard: {
    marginHorizontal: 15,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default NewsScreen; 