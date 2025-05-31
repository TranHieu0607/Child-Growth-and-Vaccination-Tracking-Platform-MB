import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ username }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Chào buổi sáng,</Text>
        <Text style={styles.username}>TRẦN MINH HIẾU</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  greeting: {
    color: '#fff',
    fontSize: 14,
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
  },
}); 