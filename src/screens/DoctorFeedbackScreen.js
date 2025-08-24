import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faUserMd, faChevronDown, faBaby, faFileDownload, faCalendar, faMapMarkerAlt, faCreditCard, faClock } from '@fortawesome/free-solid-svg-icons';

export default function DoctorFeedbackScreen({ navigation }) {
  const [selectedChild, setSelectedChild] = useState('child1');
  const [showFeedback, setShowFeedback] = useState(false);

  const children = [
    { id: 'child1', name: 'Nguyễn Văn A', age: '2 tuổi 3 tháng' },
    { id: 'child2', name: 'Nguyễn Thị B', age: '1 tuổi 8 tháng' },
    { id: 'child3', name: 'Nguyễn Văn C', age: '3 tuổi 1 tháng' },
  ];

  const appointmentData = {
    child1: {
      vaccineType: 'BCG',
      facility: 'Pharmacity - 348 Le Van Viet, Thu Duc, Tp HCM',
      date: '2025-08-31',
      time: '09:00 - 10:00',
      status: 'Paid',
      estimatedCost: '340.000₫',
      daysLeft: '6 ngày nữa'
    },
    child2: {
      vaccineType: 'DTaP',
      facility: 'Bệnh viện Nhi Đồng 1 - 341 Sư Vạn Hạnh, Q10, Tp HCM',
      date: '2025-09-05',
      time: '14:00 - 15:00',
      status: 'Pending',
      estimatedCost: '280.000₫',
      daysLeft: '11 ngày nữa'
    },
    child3: {
      vaccineType: 'MMR',
      facility: 'Trung tâm Y tế Dự phòng - 699 Trần Hưng Đạo, Q5, Tp HCM',
      date: '2025-08-28',
      time: '08:00 - 09:00',
      status: 'Completed',
      estimatedCost: '320.000₫',
      daysLeft: 'Đã hoàn thành'
    }
  };

  const currentChild = appointmentData[selectedChild];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#1565C0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phản hồi từ bác sĩ</Text>
        <View style={styles.headerIcon}>
          <FontAwesomeIcon icon={faUserMd} size={24} color="#1565C0" />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Child Selection */}
        <View style={styles.childSelection}>
          <Text style={styles.sectionTitle}>Chọn trẻ</Text>
          <TouchableOpacity style={styles.childRow} onPress={() => Alert.alert('Chọn trẻ', 'Danh sách trẻ')}>
            <View style={styles.childAvatar}>
              <FontAwesomeIcon icon={faBaby} size={24} color="#1565C0" />
            </View>
            <View style={styles.childInfo}>
              <Text style={styles.childName}>{children.find(c => c.id === selectedChild)?.name}</Text>
              <Text style={styles.childAge}>{children.find(c => c.id === selectedChild)?.age}</Text>
            </View>
            <View style={styles.chevronContainer}>
              <FontAwesomeIcon icon={faChevronDown} size={16} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Appointment Information Card */}
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <FontAwesomeIcon icon={faFileDownload} size={24} color="#1565C0" />
            <Text style={styles.vaccineType}>{currentChild.vaccineType}</Text>
          </View>
          
          <View style={styles.appointmentDetails}>
            <View style={styles.detailRow}>
              <FontAwesomeIcon icon={faMapMarkerAlt} size={16} color="#666" />
              <Text style={styles.detailLabel}>Cơ sở:</Text>
              <Text style={styles.detailValue}>{currentChild.facility}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <FontAwesomeIcon icon={faCalendar} size={16} color="#666" />
              <Text style={styles.detailLabel}>Ngày:</Text>
              <Text style={styles.detailValue}>{currentChild.date} - Giờ: {currentChild.time}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <FontAwesomeIcon icon={faCreditCard} size={16} color="#666" />
              <Text style={styles.detailLabel}>Trạng thái:</Text>
              <Text style={[styles.detailValue, styles.statusText]}>{currentChild.status}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <FontAwesomeIcon icon={faCreditCard} size={16} color="#666" />
              <Text style={styles.detailLabel}>Chi phí dự kiến:</Text>
              <Text style={styles.detailValue}>{currentChild.estimatedCost}</Text>
            </View>
            
          </View>

          {/* Toggle Button for Doctor Feedback */}
          <TouchableOpacity 
            style={styles.feedbackToggle}
            onPress={() => setShowFeedback(!showFeedback)}
          >
            <Text style={styles.feedbackToggleText}>
              {showFeedback ? 'Ẩn phản hồi từ bác sĩ' : 'Xem phản hồi từ bác sĩ'}
            </Text>
            <FontAwesomeIcon 
              icon={faChevronDown} 
              size={16} 
              color="#1565C0" 
              style={[styles.toggleIcon, showFeedback && styles.rotateIcon]}
            />
          </TouchableOpacity>
        </View>

        {/* Doctor Feedback Section - Only show when toggled */}
        {showFeedback && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Phản hồi từ bác sĩ</Text>
            <Text style={styles.feedbackText}>
              Trẻ đã được khám sàng lọc và đủ điều kiện tiêm chủng. 
              Không có chống chỉ định nào được phát hiện.
            </Text>
            
            <View style={styles.feedbackStatus}>
              <Text style={styles.statusLabel}>Kết luận:</Text>
              <Text style={styles.statusValue}>Đủ điều kiện tiêm</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  headerIcon: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
  },
  updateText: {
    fontSize: 12,
    color: '#666',
  },
  childSelection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  childAge: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chevronContainer: {
    padding: 8,
  },

  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaccineType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 8,
  },
  appointmentDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginLeft: 4,
  },
  statusText: {
    color: '#1565C0',
  },
  timeLeftText: {
    color: '#1565C0',
  },
  feedbackToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  feedbackToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
  },
  toggleIcon: {
    transition: 'transform 0.3s ease',
  },
  rotateIcon: {
    transform: [{ rotate: '180deg' }],
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 14,
    color: '#222',
    lineHeight: 20,
    marginBottom: 12,
  },
  feedbackStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1565C0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1565C0',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
  },
});
