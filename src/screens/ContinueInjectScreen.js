import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarAlt, faChevronLeft, faChevronRight, faMapMarkerAlt, faSyringe, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';

const ContinueInjectScreen = ({ navigation, route }) => {
    const { vaccinePackage } = route.params;
    const checkIcon = faCheckCircle;

    return (
        <ScrollView style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Đăng ký tiêm chủng</Text>
      </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hồ Sơ Bé</Text>
                <Text style={styles.babyName}>Nguyễn Minh Khôi</Text>
                <Text style={styles.babyAge}>3 tuổi</Text>
                <Text style={styles.vaccinePackage}>{vaccinePackage.title}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chi Tiết Gói Tiêm</Text>
                <View style={styles.vaccineDetailsGrid}>
                    {vaccinePackage.vaccines.map((vaccine, index) => (
                        <View key={index} style={styles.vaccineItem}>
                            <FontAwesomeIcon icon={checkIcon} size={16} color="#007bff" />
                            <Text style={styles.vaccineText}>{vaccine.diseases}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.injectionProgress}>
                    {vaccinePackage.vaccines.map((vaccine, index) => (
                        <View key={index} style={styles.injectionStep}>
                            <View style={vaccine.status === 'completed' ? styles.stepIconCompleted : vaccine.status === 'pending' ? styles.stepIconCurrent : styles.stepIconUpcoming}>
                                <Text style={vaccine.status === 'completed' ? styles.stepNumberCompleted : vaccine.status === 'pending' ? styles.stepNumberCurrent : styles.stepNumberUpcoming}>
                                {index + 1}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.stepTitle}>{vaccine.name}</Text>
                                <Text style={styles.stepSubtitle}>{vaccine.status === 'completed' ? 'Đã tiêm' : vaccine.status === 'pending' ? 'Cần đăng ký' : 'Chưa đến lịch'}</Text>
                                <Text style={styles.stepDate}>{vaccine.date || vaccinePackage.suggestedNextShot || '—'}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
            <View style={styles.section}>
                <View style={styles.locationContainer}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} size={20} color="#007bff" style={{ marginRight: 10 }} />
                    <View>
                        <Text style={styles.locationTitle}>Văn phòng VNVC Gò Vấp</Text>
                        <Text style={styles.locationAddress}>Tầng 1, số 123 Quang Trung, Q. Gò Vấp, TP.HCM</Text>
                    </View>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chọn ngày và giờ</Text>
                <View style={styles.calendarContainer}>
                    <View style={styles.calendarHeader}>
                        <FontAwesomeIcon icon={faCalendarAlt} size={18} color="#007bff" style={{ marginRight: 5 }} />
                        <Text style={styles.calendarHeaderText}>Tháng 2, 2024</Text>
                        <View style={{flex: 1}} />
                        <FontAwesomeIcon icon={faChevronLeft} size={15} color="gray" style={{ marginRight: 15 }} />
                        <FontAwesomeIcon icon={faChevronRight} size={15} color="gray" />
                    </View>

                    <View style={styles.weekdaysContainer}>
                        <Text style={styles.weekdayText}>CN</Text>
                        <Text style={styles.weekdayText}>T2</Text>
                        <Text style={styles.weekdayText}>T3</Text>
                        <Text style={styles.weekdayText}>T4</Text>
                        <Text style={styles.weekdayText}>T5</Text>
                        <Text style={styles.weekdayText}>T6</Text>
                        <Text style={styles.weekdayText}>T7</Text>
                    </View>

                    <View style={styles.daysContainer}>
                        {[...Array(4).fill(null), ...Array(29).fill(0).map((_, i) => i + 1)].map((day, index) => {
                            const isSelected = day === 15;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dayButton,
                                        isSelected && styles.dayButtonSelected,
                                        !day && { opacity: 0 }
                                    ]}
                                    disabled={!day}
                                >
                                    <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <Text style={[styles.sectionTitle, styles.timeSlotSectionTitle]}>Chọn giờ</Text>
                <View style={styles.timeSlotContainer}>
                    <TouchableOpacity style={styles.timeSlotButton}><Text style={styles.timeSlotButtonText}>08:00</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.timeSlotButtonSelected}><Text style={styles.timeSlotButtonTextSelected}>09:00</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.timeSlotButton}><Text style={styles.timeSlotButtonText}>10:00</Text></TouchableOpacity>
                </View>
                <View style={styles.timeSlotContainer}>
                    <TouchableOpacity style={styles.timeSlotButton}><Text style={styles.timeSlotButtonText}>14:00</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.timeSlotButton}><Text style={styles.timeSlotButtonText}>15:00</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.timeSlotButton}><Text style={styles.timeSlotButtonText}>16:00</Text></TouchableOpacity>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ghi chú</Text>
                <View style={styles.noteInputContainer}>
                    <Text style={styles.notePlaceholder}>Nhập ghi chú (nếu có)</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.bookButton}>
                <Text style={styles.bookButtonText}>Đặt lịch</Text>
            </TouchableOpacity>

            <View style={{ height: 50 }} />{/* Spacer at the bottom */}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        paddingRight: 15,
    },
    backButtonText: {
        fontSize: 20,
        color: '#000',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: '#fff',
        padding: 15,
        marginTop: 10,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    babyName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    babyAge: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 5,
    },
    vaccinePackage: {
        fontSize: 14,
        color: '#007bff',
        fontWeight: 'bold',
    },
    vaccineDetailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    vaccineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 10,
    },
    vaccineText: {
        marginLeft: 8,
        fontSize: 14,
    },
    injectionProgress: {
        paddingTop: 10,
    },
    injectionStep: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    stepIconCompleted: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stepIconCurrent: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stepNumberCurrent: {
        color: '#007bff',
        fontWeight: 'bold',
    },
    stepIconUpcoming: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stepNumberUpcoming: {
        color: 'gray',
        fontWeight: 'bold',
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    stepSubtitle: {
        fontSize: 13,
        color: 'gray',
    },
    stepDate: {
        fontSize: 13,
        color: 'gray',
    },
    calendarContainer: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
    },
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    calendarHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007bff',
    },
    weekdaysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    weekdayText: {
        fontSize: 13,
        color: 'gray',
        width: '14%',
        textAlign: 'center',
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    dayButton: {
        width: '14%', // 100% / 7 days
        aspectRatio: 1, // Make it a square
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    dayButtonSelected: {
        backgroundColor: '#007bff',
        borderRadius: 15,
    },
    dayButtonText: {
        fontSize: 14,
        color: '#000',
    },
    dayButtonTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    timeSlotSectionTitle: {
        marginTop: 10,
    },
    timeSlotContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    timeSlotButton: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: '32%',
        alignItems: 'center',
        marginBottom: 10,
    },
    timeSlotButtonSelected: {
        backgroundColor: '#007bff',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: '32%',
        alignItems: 'center',
        marginBottom: 10,
    },
    timeSlotButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    timeSlotButtonTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationAddress: {
        fontSize: 14,
        color: 'gray',
    },
    noteInputContainer: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 15,
        minHeight: 100,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    notePlaceholder: {
        color: 'gray',
        fontSize: 14,
    },
    bookButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ContinueInjectScreen; 