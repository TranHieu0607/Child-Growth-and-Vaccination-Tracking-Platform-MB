import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const BlogCard = ({ 
  blog, 
  onPress, 
  variant = 'horizontal', // 'horizontal', 'featured'
  style 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const truncateTitle = (title, maxLength = 50) => {
    if (!title) return 'Tiêu đề chưa có';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={[styles.featuredCard, style]} onPress={onPress}>
        <Image
          source={{ uri: blog.image }}
          style={styles.featuredImage}
          defaultSource={require('../../assets/suckhoe.jpg')}
        />
        <View style={styles.featuredOverlay}>
          <Text style={styles.featuredTag}>{(blog.category || 'TIN TỨC').toUpperCase()}</Text>
          <Text style={styles.featuredTitle}>{truncateTitle(blog.title, 60)}</Text>
          <Text style={styles.featuredInfo}>© {formatDate(blog.createdAt)} - 5 phút đọc</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.horizontalCard, style]} onPress={onPress}>
      <Image
        source={{ uri: blog.image }}
        style={styles.horizontalImage}
        defaultSource={require('../../assets/suckhoe.jpg')}
      />
      <View style={styles.horizontalContent}>
        <Text style={styles.category}>{blog.category || 'Tin tức'}</Text>
        <Text style={styles.title}>{truncateTitle(blog.title)}</Text>
        <Text style={styles.snippet}>{truncateContent(blog.content)}</Text>
        <Text style={styles.date}>{formatDate(blog.createdAt)}</Text>
      </View>
      <Text style={styles.arrow}>{'>'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Horizontal Card Styles
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  horizontalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  horizontalContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  category: {
    fontSize: 12,
    color: '#1565C0',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginBottom: 4,
    lineHeight: 20,
  },
  snippet: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  arrow: {
    fontSize: 18,
    color: '#888',
    marginLeft: 10,
  },

  // Featured Card Styles
  featuredCard: {
    width: 280,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  featuredImage: {
    width: '100%',
    height: 150,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    height: 80,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  featuredTag: {
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
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    lineHeight: 20,
  },
  featuredInfo: {
    fontSize: 12,
    color: '#ddd',
  },
});

export default BlogCard;
