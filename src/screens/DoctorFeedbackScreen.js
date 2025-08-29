import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faUserMd, faChevronDown, faBaby, faFileDownload, faCalendar, faMapMarkerAlt, faCreditCard, faClock } from '@fortawesome/free-solid-svg-icons';
import childrenApi from '../store/api/childrenApi';
import appointmentApi from '../store/api/appointmentApi';
import { useSelector } from 'react-redux';
import surveyApi from '../store/api/surveyApi';

export default function DoctorFeedbackScreen({ navigation }) {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false); // legacy, kept but unused for global toggle
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const token = useSelector(state => state.auth.token);
  const [surveyByAppointmentId, setSurveyByAppointmentId] = useState({});
  const [expandedSurveyIds, setExpandedSurveyIds] = useState([]); // track which appointment ids are expanded
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await childrenApi.getMyChildren();
        const data = res.data || [];
        setChildren(data);
        if (data.length > 0) setSelectedChildId(data[0].childId);
      } catch (e) {
        setChildren([]);
      }
    };
    fetchChildren();
  }, []);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    if (years > 0) {
      const remainingMonths = monthDiff < 0 ? 12 + monthDiff : monthDiff;
      return `${years} tuổi${remainingMonths > 0 ? ` ${remainingMonths} tháng` : ''}`;
    }
    let months = today.getMonth() - birthDate.getMonth() + (12 * (today.getFullYear() - birthDate.getFullYear()));
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }
    return `${months} tháng`;
  };

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

  const currentChild = appointmentData.child1;
  const selectedChild = children.find(child => child.childId === selectedChildId);
  const handleSelectChildPress = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };
  const handleSelectChild = (childId) => {
    setSelectedChildId(childId);
    setIsDropdownVisible(false);
  };

  useEffect(() => {
    const loadAppointments = async () => {
      if (!selectedChildId || !token) {
        setAppointments([]);
        return;
      }
      try {
        const res = await appointmentApi.getMyAppointmentHistory(selectedChildId, token);
        const list = res.data?.appointments || [];
        const filtered = list
          .filter(a => ['Cancelled', 'Completed', 'Approval'].includes(a.status))
          .sort((a, b) => {
            const ta = new Date(a.updatedAt).getTime();
            const tb = new Date(b.updatedAt).getTime();
            return tb - ta; // newest first
          });
        setAppointments(filtered);
        setCurrentPage(1);
        setExpandedSurveyIds([]);
      } catch (e) {
        setAppointments([]);
      }
    };
    loadAppointments();
  }, [selectedChildId, token]);

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
          <View style={styles.childInfoContainer}>
            <View style={styles.childInfo}>
              {selectedChildId && (
                <Image
                  source={selectedChild?.image || require('../../assets/vnvc.jpg')}
                  style={styles.avatar}
                />
              )}
              <View>
                {selectedChildId && (
                  <Text style={styles.userName}>
                    {selectedChild?.fullName}
                  </Text>
                )}
                {selectedChildId && (
                  <Text style={styles.userAge}>
                    {calculateAge(selectedChild?.dateOfBirth)}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.dropdownToggle} onPress={handleSelectChildPress}>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {isDropdownVisible && (
            <View style={styles.dropdownContainer}>
              {(children || []).map(child => (
                <TouchableOpacity
                  key={child.childId}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectChild(child.childId)}
                >
                  <Image
                    source={child.image || require('../../assets/vnvc.jpg')}
                    style={styles.dropdownItemImage}
                  />
                  <View style={styles.dropdownItemTextContainer}>
                    <Text style={styles.dropdownItemName}>{child.fullName}</Text>
                    <Text style={styles.dropdownItemAge}>{calculateAge(child.dateOfBirth)}</Text>
                  </View>
                  {selectedChildId === child.childId && <Text style={styles.selectedIcon}> ✅</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Appointment Information Cards (from API, filtered) */}
        {appointments.length > 0 && appointments
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map(app => (
          <View key={app.appointmentId} style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <FontAwesomeIcon icon={faFileDownload} size={24} color="#1565C0" />
              <Text style={styles.vaccineType}>{app.packageName || app.vaccineNames?.join(', ') || 'Lịch tiêm'}</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <View style={styles.detailRow}>
                <FontAwesomeIcon icon={faMapMarkerAlt} size={16} color="#666" />
                <Text style={styles.detailLabel}>Cơ sở:</Text>
                <Text style={styles.detailValue}>{app.facilityName} - {app.facilityAddress}</Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesomeIcon icon={faCalendar} size={16} color="#666" />
                <Text style={styles.detailLabel}>Ngày:</Text>
                <Text style={styles.detailValue}>{app.appointmentDate} - Giờ: {app.appointmentTime}</Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesomeIcon icon={faCreditCard} size={16} color="#666" />
                <Text style={styles.detailLabel}>Trạng thái:</Text>
                <Text style={[styles.detailValue, styles.statusText]}>{app.status}</Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesomeIcon icon={faCreditCard} size={16} color="#666" />
                <Text style={styles.detailLabel}>Chi phí dự kiến:</Text>
                <Text style={styles.detailValue}>{(app.estimatedCost || 0).toLocaleString('vi-VN')}đ</Text>
              </View>
              {app.note ? (
                <View style={styles.detailRow}>
                  <FontAwesomeIcon icon={faClock} size={16} color="#666" />
                  <Text style={styles.detailLabel}>Ghi chú:</Text>
                  <Text style={styles.detailValue}>{app.note}</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity 
              style={styles.feedbackToggle}
              onPress={async () => {
                const isExpanded = expandedSurveyIds.includes(app.appointmentId);
                if (isExpanded) {
                  setExpandedSurveyIds(prev => prev.filter(id => id !== app.appointmentId));
                  return;
                }
                // expand and load survey if not cached
                setExpandedSurveyIds(prev => [...prev, app.appointmentId]);
                if (!surveyByAppointmentId[app.appointmentId]) {
                  try {
                    const res = await surveyApi.getSurveyResponses(app.appointmentId, 1, 10, token);
                    setSurveyByAppointmentId(prev => ({ ...prev, [app.appointmentId]: res.data?.data }));
                  } catch (e) {
                    // ignore load error
                  }
                }
              }}
            >
              <Text style={styles.feedbackToggleText}>
                {expandedSurveyIds.includes(app.appointmentId) ? 'Ẩn' : 'Kết quả thăm khám trước khi tiêm'}
              </Text>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                size={16} 
                color="#1565C0" 
                style={[styles.toggleIcon, expandedSurveyIds.includes(app.appointmentId) && styles.rotateIcon]}
              />
            </TouchableOpacity>
            {expandedSurveyIds.includes(app.appointmentId) && surveyByAppointmentId[app.appointmentId] && (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackTitle}>Khảo sát trước tiêm </Text>
                <View style={styles.feedbackStatus}>
                  <Text style={styles.statusLabel}>Kết luận:</Text>
                  <Text style={styles.statusValue}>{surveyByAppointmentId[app.appointmentId].decisionNote || '—'}</Text>
                </View>
                <Text style={styles.feedbackText}>Nhiệt độ: {surveyByAppointmentId[app.appointmentId].temperatureC ?? '—'}°C • Mạch: {surveyByAppointmentId[app.appointmentId].heartRateBpm ?? '—'} bpm</Text>
                <Text style={styles.feedbackText}>Huyết áp: {surveyByAppointmentId[app.appointmentId].systolicBpmmHg ?? '—'}/{surveyByAppointmentId[app.appointmentId].diastolicBpmmHg ?? '—'} mmHg • SpO2: {surveyByAppointmentId[app.appointmentId].oxygenSatPercent ?? '—'}%</Text>
                {Array.isArray(surveyByAppointmentId[app.appointmentId].questions) && surveyByAppointmentId[app.appointmentId].questions.map(q => (
                  <View key={q.questionId} style={{ marginTop: 8 }}>
                    <Text style={{ fontWeight: '600', color: '#222' }}>{q.questionText}</Text>
                    <Text style={{ color: '#444', marginTop: 2 }}>Trả lời: {q.answerText}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {appointments.length > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              disabled={currentPage === 1}
              onPress={() => {
                const next = Math.max(1, currentPage - 1);
                setCurrentPage(next);
                const visibleIds = appointments
                  .slice((next - 1) * pageSize, next * pageSize)
                  .map(a => a.appointmentId);
                setExpandedSurveyIds(prev => prev.filter(id => visibleIds.includes(id)));
              }}
            >
              <Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonTextDisabled]}>Trước</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfoText}>{currentPage} / {Math.max(1, Math.ceil(appointments.length / pageSize))}</Text>
            <TouchableOpacity
              style={[styles.pageButton, currentPage >= Math.ceil(appointments.length / pageSize) && styles.pageButtonDisabled]}
              disabled={currentPage >= Math.ceil(appointments.length / pageSize)}
              onPress={() => {
                const total = Math.max(1, Math.ceil(appointments.length / pageSize));
                const next = Math.min(total, currentPage + 1);
                setCurrentPage(next);
                const visibleIds = appointments
                  .slice((next - 1) * pageSize, next * pageSize)
                  .map(a => a.appointmentId);
                setExpandedSurveyIds(prev => prev.filter(id => visibleIds.includes(id)));
              }}
            >
              <Text style={[styles.pageButtonText, currentPage >= Math.ceil(appointments.length / pageSize) && styles.pageButtonTextDisabled]}>Sau</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Inline survey rendering handled per appointment card above */}
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
    paddingTop: 12,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  pageButton: {
    backgroundColor: '#1565C0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  pageButtonDisabled: {
    backgroundColor: '#c5d9f2',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pageButtonTextDisabled: {
    color: '#fff',
    opacity: 0.7,
  },
  pageInfoText: {
    color: '#1565C0',
    fontWeight: '600',
  },
  // Child selector styles copied to match HistoryVacc.js
  childInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userAge: {
    fontSize: 14,
    color: 'gray',
  },
  dropdownToggle: {
    paddingHorizontal: 10,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: -15,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  dropdownItemTextContainer: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownItemAge: {
    fontSize: 12,
    color: '#555',
  },
  selectedIcon: {
    color: 'green',
    fontSize: 16,
    marginLeft: 10,
  },
});
