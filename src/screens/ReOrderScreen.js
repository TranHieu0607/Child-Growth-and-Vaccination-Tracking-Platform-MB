import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { useSelector } from 'react-redux';

import { getMyChildren } from '../store/api/growthRecordApi';
import orderApi from '../store/api/orderApi';
import scheduleApi from '../store/api/scheduleApi';
import bookingApi from '../store/api/bookingApi';

const ReOrderScreen = ({ navigation }) => {
	// Lấy token từ Redux store
	const { token } = useSelector((state) => state.auth);
	
	const [children, setChildren] = useState([]);
	const [selectedChildId, setSelectedChildId] = useState(null);
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const [orders, setOrders] = useState([]); // Danh sách order đã mua
	const [selectedPackage, setSelectedPackage] = useState(null); // Gói đã mua (order)
	const [selectedDiseaseId, setSelectedDiseaseId] = useState(null); // Bệnh được chọn
	const [selectedVaccineId, setSelectedVaccineId] = useState(null); // Vaccine được chọn
	const [facilitySearch, setFacilitySearch] = useState('');
	const [note, setNote] = useState('');
	const [filter, setFilter] = useState('Gần nhất');
	const today = dayjs();
	const [calendarMonth, setCalendarMonth] = useState(today.month() + 1); // 1-12
	const [calendarYear, setCalendarYear] = useState(today.year());
	const [selectedDate, setSelectedDate] = useState(today.format('YYYY-MM-DD'));
	const [availableSlots, setAvailableSlots] = useState([]); // slot lấy từ API
	const [selectedSlot, setSelectedSlot] = useState(null);

	// Log khi chọn gói
	const handleSelectPackage = (pkg) => {
	    // Nếu đang chọn gói này rồi thì bỏ chọn
	    if (selectedPackage?.id === pkg.id) {
	        setSelectedPackage(null);
	        setSelectedDiseaseId(null);
	        setSelectedVaccineId(null);
	        return;
	    }
	    
	    setSelectedPackage(pkg);
	    setSelectedDiseaseId(null);
	    setSelectedVaccineId(null);
	    
	    // Kiểm tra tất cả facilityId trong orderDetails
	    const facilityIds = pkg?.order?.orderDetails?.map(od => od.facilityVaccine?.facilityId).filter(id => id);
	    const uniqueFacilityIds = [...new Set(facilityIds)];
	    
	    if (uniqueFacilityIds.length === 0) {
	        console.warn('❌ Gói không có facilityId nào!');
	    } else if (uniqueFacilityIds.length > 1) {
	        console.warn('⚠️ Gói có nhiều facilityId khác nhau:', uniqueFacilityIds);
	    }
	};



	// Lấy slot lịch tiêm khi đã chọn vaccine, ngày, token
	useEffect(() => {
		const fetchSlots = async () => {
			// Lấy facilityId từ selectedVaccine
			const facilityId = selectedVaccine?.facilityId;
			
			if (!selectedPackage || !selectedVaccineId || !selectedDate || !token) {
				setAvailableSlots([]);
				setSelectedSlot(null);
				return;
			}
			if (!facilityId) {
				console.warn('❌ Không có facilityId từ selectedVaccine');
				setAvailableSlots([]);
				setSelectedSlot(null);
				return;
			}
			try {
				const res = await scheduleApi.getFacilitySchedules(facilityId, selectedDate, selectedDate, token);
				const slots = res.data?.dailySchedules?.[0]?.availableSlots || [];
				setAvailableSlots(slots);
				if (slots.length > 0) {
					setSelectedSlot(slots[0]);
				} else {
					setSelectedSlot(null);
				}
			} catch (e) {
				console.error('Lỗi khi lấy slot:', e);
				setAvailableSlots([]);
				setSelectedSlot(null);
			}
		};
		fetchSlots();
	}, [selectedPackage, selectedVaccineId, selectedDate, token]);

	useEffect(() => {
		const fetchChildren = async () => {
			try {
				const res = await getMyChildren();
				setChildren(res);
				if (res.length > 0) {
					setSelectedChildId(res[0].childId);
				}
			} catch (e) {
				setChildren([]);
			}
		};
		fetchChildren();
	}, []);

	useEffect(() => {
		// Lấy order đã mua
		const fetchOrders = async () => {
			try {
				const res = await orderApi.getMyOrders(1, 10, token);
				let data = res && res.data && Array.isArray(res.data.data) ? res.data.data : [];
				
				// Lọc chỉ lấy những order có status là "Paid" (viết hoa chữ P)
				const paidOrders = data.filter(order => order.status === 'Paid');
				
				setOrders(paidOrders);
			} catch (e) {
				setOrders([]);
			}
		};
		fetchOrders();
	}, []);

	const handleSelectChild = (childId) => {
		setSelectedChildId(childId);
		setIsDropdownVisible(false);
	};

	const selectedChild = children.find(child => child.childId === selectedChildId);

	// Helpers for calendar
	const getDaysInMonth = (month, year) => dayjs(`${year}-${month}-01`).daysInMonth();
	const getFirstDayOfWeek = (month, year) => dayjs(`${year}-${month}-01`).day(); // 0=CN
	const isPastDate = (year, month, day) => {
		const date = dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
		return date.isBefore(dayjs(), 'day');
	};

	const vaccinePackages = Array.isArray(orders) ? orders.map(order => ({
		id: order.orderId,
		name: order.packageName,
		price: order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') + 'đ' : '',
		desc: Array.isArray(order.orderDetails) ? order.orderDetails.map(od => od.disease?.name).filter(Boolean).join(', ') : '',
		order,
	})) : [];

	// Khi chọn gói, lấy ra tất cả vaccine còn mũi tiêm (gộp các vaccine trùng lặp)
	const availableVaccines = selectedPackage
		? selectedPackage.order.orderDetails
				.filter(od => od.remainingQuantity > 0)
				.reduce((acc, od) => {
					const existingVaccine = acc.find(v => 
						v.vaccineId === od.facilityVaccine?.vaccine?.vaccineId && 
						v.diseaseId === od.diseaseId
					);
					if (existingVaccine) {
						// Nếu vaccine + bệnh đã tồn tại, cộng dồn remainingQuantity
						existingVaccine.remainingQuantity += od.remainingQuantity;
					} else {
						// Nếu vaccine + bệnh chưa tồn tại, thêm mới
						acc.push({
							vaccineId: od.facilityVaccine?.vaccine?.vaccineId,
							vaccineName: od.facilityVaccine?.vaccine?.name || 'Chưa đặt tên',
							diseaseId: od.diseaseId,
							diseaseName: od.disease?.name || 'Chưa đặt tên',
							numberOfDoses: od.facilityVaccine?.vaccine?.numberOfDoses || 0,
							remainingQuantity: od.remainingQuantity,
							price: od.price,
							facilityVaccineId: od.facilityVaccineId,
							facilityId: od.facilityVaccine?.facilityId,
						});
					}
					return acc;
				}, [])
		: [];

	// Lấy thông tin vaccine đã chọn (ràng buộc theo cả vaccineId và diseaseId để tránh nhầm)
	const selectedVaccine = availableVaccines.find(v => v.vaccineId === selectedVaccineId && v.diseaseId === selectedDiseaseId);

	// Cơ sở tiêm của gói
	const facility = selectedPackage ? {
		name: selectedPackage.order.facilityName,
		// Có thể bổ sung thêm address nếu API trả về
	} : null;

	// Chọn vaccine
	const handleSelectVaccine = (vaccineId, diseaseId) => {
		setSelectedVaccineId(vaccineId);
		setSelectedSlot(null); // reset slot khi đổi vaccine
		
		// Lấy thông tin vaccine được chọn
		const found = availableVaccines.find(v => v.vaccineId === vaccineId && v.diseaseId === diseaseId);
		if (found) {
			setSelectedDiseaseId(found.diseaseId);
		}
	};

	// Helper function để lấy thông tin hiện tại đã chọn
	const getSelectedInfo = () => {
		const info = {
			facilityId: selectedVaccine?.facilityId || null,
			facilityName: selectedPackage?.order?.facilityName || null,
			packageId: selectedPackage?.id || null,
			packageName: selectedPackage?.name || null,
			diseaseId: selectedDiseaseId || null,
			diseaseName: selectedVaccine?.diseaseName || null,
			vaccineId: selectedVaccineId || null,
			vaccineName: selectedVaccine?.vaccineName || null,
		};
		return info;
	};

	// Hàm đặt lịch tiêm chủng
	const handleBookAppointment = async () => {
		// Kiểm tra thông tin bắt buộc
		if (!selectedChildId) {
			Alert.alert('Thiếu thông tin', 'Vui lòng chọn bé cần tiêm!');
			return;
		}

		if (!selectedPackage) {
			Alert.alert('Thiếu thông tin', 'Vui lòng chọn gói đã mua!');
			return;
		}

		if (!selectedVaccineId) {
			Alert.alert('Thiếu thông tin', 'Vui lòng chọn vaccine cần tiêm!');
			return;
		}

		if (!selectedSlot) {
			Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngày và giờ tiêm!');
			return;
		}

		// Bắt buộc phải có scheduleId rõ ràng
		if (!selectedSlot?.scheduleId) {
			Alert.alert('Thiếu thông tin', 'Không tìm thấy scheduleId hợp lệ cho khung giờ đã chọn!');
			return;
		}

		// Tạo payload theo đúng format yêu cầu
		const payload = {
			childId: selectedChildId,
			diseaseId: selectedDiseaseId,
			facilityId: selectedVaccine?.facilityId,
			scheduleId: selectedSlot.scheduleId,
			note: note.trim(),
			orderId: selectedPackage.id // Sử dụng orderId đã có thay vì tạo mới
		};

		// Hiển thị payload để kiểm tra
		console.log('ReOrder booking payload:', payload);
		Alert.alert('Payload gửi đi', JSON.stringify(payload, null, 2));

		try {
			// Gọi API đặt lịch
			const response = await bookingApi.bookAppointment(payload, token);
			const apiStatus = response?.data?.status;
			const apiMessage = response?.data?.message;

			// Nếu API trả về status=false (kể cả 200), hiển thị message từ server
			if (apiStatus !== true) {
				Alert.alert('Đặt lịch thất bại', apiMessage || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!');
				return;
			}

			// Thông báo thành công
			Alert.alert(
				'Đặt lịch thành công!', 
				apiMessage || 'Lịch tiêm chủng đã được xác nhận!',
				[
					{ 
						text: 'OK', 
						onPress: () => {
							// Reset form
							setSelectedPackage(null);
							setSelectedDiseaseId(null);
							setSelectedVaccineId(null);
							setSelectedSlot(null);
							setNote('');
							setSelectedDate(today.format('YYYY-MM-DD'));
							setAvailableSlots([]);
							
							// Navigate về trang Home
							navigation.navigate('Home');
						}
					}
				]
			);
			
		} catch (error) {
			console.error('❌ Lỗi đặt lịch:', error);
			Alert.alert(
				'Đặt lịch thất bại', 
				error.message || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!'
			);
		}
	};

	return (
		<ScrollView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity 
					onPress={() => navigation.goBack()} 
					style={styles.backButton}
				>
					<Text style={styles.backIcon}>←</Text>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Đặt Lịch Tiêm Chủng</Text>
				<View style={styles.placeholder} />
			</View>

			{/* Chọn bé */}
			<Text style={styles.label}>Chọn bé</Text>
			<View style={{ marginBottom: 10 }}>
				<TouchableOpacity
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						backgroundColor: '#fff',
						borderRadius: 8,
						padding: 12,
						borderWidth: 1,
						borderColor: '#ddd',
					}}
					onPress={() => setIsDropdownVisible(!isDropdownVisible)}
					activeOpacity={0.8}
				>
					{selectedChild && (
						<Image
							source={require('../../assets/vnvc.jpg')}
							style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
						/>
					)}
					<Text style={{ flex: 1, color: selectedChild ? '#000' : '#888', fontWeight: 'bold', fontSize: 15 }}>
						{selectedChild ? selectedChild.fullName : 'Chọn hồ sơ bé'}
					</Text>
					<Text style={{ color: '#1976d2', fontSize: 18 }}>{isDropdownVisible ? '▲' : '▼'}</Text>
				</TouchableOpacity>
				{isDropdownVisible && (
					<View style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginTop: 2, maxHeight: 200 }}>
						<ScrollView>
							{children.map(child => (
								<TouchableOpacity
									key={child.childId}
									style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
									onPress={() => handleSelectChild(child.childId)}
								>
									<Image
										source={require('../../assets/vnvc.jpg')}
										style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }}
									/>
									<Text style={{ flex: 1, color: '#222', fontSize: 15 }}>{child.fullName}</Text>
									{selectedChildId === child.childId && <Text style={{ color: '#1976d2', fontSize: 16 }}>✓</Text>}
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				)}
			</View>

						{/* Chọn gói đã mua */}
						<Text style={styles.label}>Chọn gói đã mua</Text>
						<View style={styles.packageBox}>
							{vaccinePackages.length === 0 && <Text style={{ color: '#888' }}>Bạn chưa có gói nào đã thanh toán</Text>}
							{vaccinePackages.map((pkg) => (
								<TouchableOpacity
									key={pkg.id}
									style={[styles.packageItem, selectedPackage?.id === pkg.id && styles.packageItemActive]}
									onPress={() => handleSelectPackage(pkg)}
								>
									<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
										<Text style={styles.packageName}>{pkg.name}</Text>
										<Text style={styles.packagePrice}>{pkg.price}</Text>
									</View>
									<Text style={styles.packageDesc}>{pkg.desc}</Text>
								</TouchableOpacity>
							))}
						</View>

						{/* Chọn vaccine cần tiêm trong gói */}
						{selectedPackage && (
							<>
								<Text style={styles.label}>Chọn vaccine cần tiêm</Text>
								<View style={styles.vaccineGrid}>
									{availableVaccines.length === 0 && (
										<View style={styles.emptyState}>
											<Text style={styles.emptyStateText}>Tất cả vaccine trong gói đã tiêm xong</Text>
										</View>
									)}
									{availableVaccines.map((vaccine) => (
										<TouchableOpacity
											key={`${vaccine.vaccineId}-${vaccine.diseaseId}`}
											style={[
												styles.vaccineCard,
												selectedVaccineId === vaccine.vaccineId && styles.vaccineCardActive,
											]}
											onPress={() => handleSelectVaccine(vaccine.vaccineId, vaccine.diseaseId)}
											disabled={vaccine.remainingQuantity === 0}
											activeOpacity={0.7}
										>
											<View style={styles.vaccineHeader}>
												<Text style={[
													styles.vaccineName,
													selectedVaccineId === vaccine.vaccineId && styles.vaccineNameActive
												]}>
													{vaccine.vaccineName}
												</Text>
												<View style={[
													styles.doseBadge,
													selectedVaccineId === vaccine.vaccineId && styles.doseBadgeActive
												]}>
													<Text style={[
														styles.doseText,
														selectedVaccineId === vaccine.vaccineId && styles.doseTextActive
													]}>
														{vaccine.remainingQuantity}/{vaccine.numberOfDoses}
													</Text>
												</View>
											</View>
											<Text style={[
												styles.diseaseName,
												selectedVaccineId === vaccine.vaccineId && styles.diseaseNameActive
											]}>
												{vaccine.diseaseName}
											</Text>
											{vaccine.remainingQuantity === 0 && (
												<View style={styles.completedBadge}>
													<Text style={styles.completedText}>Đã tiêm xong</Text>
												</View>
											)}
										</TouchableOpacity>
									))}
								</View>
							</>
						)}

						{/* Cơ sở tiêm chủng của gói */}
						{selectedPackage && facility && (
							<View style={styles.facilityCardActive}>
								<Text style={styles.facilityName}>{facility.name}</Text>
							</View>
						)}

						{/* Thông tin vaccine đã chọn */}
						{selectedPackage && selectedVaccineId && selectedVaccine && (
							<View style={styles.suggestionBox}>
								<Text style={styles.suggestionTitle}>Thông tin vaccine đã chọn</Text>
								<Text style={styles.suggestionItem}>
									- <Text style={{ fontWeight: 'bold' }}>Vaccine:</Text> {selectedVaccine.vaccineName}
								</Text>
								<Text style={styles.suggestionItem}>
									- <Text style={{ fontWeight: 'bold' }}>Bệnh:</Text> {selectedVaccine.diseaseName}
								</Text>
								<Text style={styles.suggestionItem}>
									- <Text style={{ fontWeight: 'bold' }}>Số mũi:</Text> {selectedVaccine.remainingQuantity}/{selectedVaccine.numberOfDoses}
								</Text>
							</View>
						)}

												{/* Chọn ngày và giờ */}
												<View style={styles.dateBox}>
													<Text style={styles.label}>Chọn ngày và giờ</Text>
													{/* Calendar */}
													<View style={{ backgroundColor: '#f7fafd', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0' }}>
														{/* Header lịch */}
														<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
															<Text style={{ fontWeight: 'bold', color: '#1976d2', fontSize: 16 }}>
																Tháng {calendarMonth}, {calendarYear}
															</Text>
															<View style={{ flex: 1 }} />
															<TouchableOpacity
																onPress={() => {
																	if (calendarMonth === 1) {
																		setCalendarMonth(12);
																		setCalendarYear(calendarYear - 1);
																	} else {
																		setCalendarMonth(calendarMonth - 1);
																	}
																}}
																style={{ padding: 6 }}
															>
																<Text style={{ fontSize: 18, color: '#1976d2', marginRight: 8 }}>{'<'}</Text>
															</TouchableOpacity>
															<TouchableOpacity
																onPress={() => {
																	if (calendarMonth === 12) {
																		setCalendarMonth(1);
																		setCalendarYear(calendarYear + 1);
																	} else {
																		setCalendarMonth(calendarMonth + 1);
																	}
																}}
																style={{ padding: 6 }}
															>
																<Text style={{ fontSize: 18, color: '#1976d2' }}>{'>'}</Text>
															</TouchableOpacity>
														</View>
														{/* Tên thứ */}
														<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
															{['CN','T2','T3','T4','T5','T6','T7'].map((d, i) => (
																<Text key={`day-${i}`} style={{ width: 32, textAlign: 'center', color: '#888', fontWeight: 'bold' }}>{d}</Text>
															))}
														</View>
														{/* Lưới ngày */}
														<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
															{/* Padding đầu tháng */}
															{Array(getFirstDayOfWeek(calendarMonth, calendarYear)).fill(0).map((_, idx) => (
																<View key={`pad-${calendarMonth}-${calendarYear}-${idx}`} style={{ width: 32, height: 32 }} />
															))}
															{/* Ngày trong tháng */}
															{Array(getDaysInMonth(calendarMonth, calendarYear)).fill(0).map((_, index) => {
																const day = index + 1;
																const isToday = today.date() === day && today.month() + 1 === calendarMonth && today.year() === calendarYear;
																const isSelected = dayjs(selectedDate).date() === day && dayjs(selectedDate).month() + 1 === calendarMonth && dayjs(selectedDate).year() === calendarYear;
																const isDisabled = isPastDate(calendarYear, calendarMonth, day);
																return (
																	<TouchableOpacity
																		key={`${calendarYear}-${calendarMonth}-${day}`}
																		disabled={isDisabled}
																		onPress={() => {
																			const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
																			setSelectedDate(dateStr);
																			setSelectedSlot(null); // reset slot khi đổi ngày
																		}}
																		style={{
																			width: 32,
																			height: 32,
																			borderRadius: 16,
																			margin: 2,
																			justifyContent: 'center',
																			alignItems: 'center',
																			backgroundColor: isSelected ? '#1976d2' : isToday ? '#e3f0ff' : '#fff',
																			borderWidth: isSelected ? 2 : 1,
																			borderColor: isSelected ? '#1976d2' : '#e0e0e0',
																			opacity: isDisabled ? 0.3 : 1,
																		}}
																	>
																		<Text style={{ color: isSelected ? '#fff' : '#222', fontWeight: isToday ? 'bold' : 'normal' }}>{day}</Text>
																	</TouchableOpacity>
																);
															})}
														</View>
													</View>
													{/* Chọn giờ (slot) */}
													<View style={styles.hourRow}>
														{availableSlots.length === 0 && (
															<Text style={{ color: '#888', marginTop: 8 }}>Không có khung giờ nào khả dụng cho ngày này</Text>
														)}
														{availableSlots.map((slot, idx) => (
															<TouchableOpacity
																key={slot.slotId}
																onPress={() => setSelectedSlot(slot)}
																style={[
																	styles.hourBtn,
																	selectedSlot?.slotId === slot.slotId && styles.hourBtnActive
																]}
															>
																<Text style={{ color: selectedSlot?.slotId === slot.slotId ? '#fff' : '#222' }}>
																	{slot.slotTime}
																</Text>
															</TouchableOpacity>
														))}
													</View>
												</View>

			{/* Ghi chú */}
			<Text style={styles.label}>Ghi chú</Text>
			<TextInput
				style={styles.input}
				placeholder="Nhập ghi chú (nếu có)"
				value={note}
				onChangeText={setNote}
				multiline
			/>


			{/* Nút đặt lịch */}
			<TouchableOpacity 
				style={styles.submitBtn} 
				onPress={handleBookAppointment}
			>
				<Text style={styles.submitBtnText}>Đặt lịch</Text>
			</TouchableOpacity>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff', padding: 16 },
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
	headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
	backButton: { padding: 8 },
	backIcon: { fontSize: 24, color: '#000', fontWeight: 'bold' },
	placeholder: { width: 36 }, // Để cân bằng layout với nút back
	label: { fontWeight: 'bold', marginTop: 16, marginBottom: 6, fontSize: 15 },
	dropdown: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8 },
	dropdownList: { flexDirection: 'row', marginTop: 4 },
	suggestionBox: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8 },
	suggestionTitle: { color: '#1976d2', fontWeight: 'bold', marginBottom: 2 },
	suggestionItem: { color: '#1976d2', fontSize: 13 },
	diseaseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
	diseaseBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, margin: 4, backgroundColor: '#fff' },
	diseaseBtnActive: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
	vaccineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
	vaccineCard: { 
		width: '48%', 
		borderWidth: 1, 
		borderColor: '#e0e0e0', 
		borderRadius: 12, 
		padding: 16, 
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		minHeight: 100,
		justifyContent: 'space-between'
	},
	vaccineCardActive: { 
		borderColor: '#1976d2', 
		backgroundColor: '#e3f2fd',
		shadowColor: '#1976d2',
		shadowOpacity: 0.2,
		elevation: 5
	},
	vaccineHeader: { 
		flexDirection: 'row', 
		justifyContent: 'space-between', 
		alignItems: 'flex-start', 
		marginBottom: 8 
	},
	vaccineName: { 
		fontWeight: '600', 
		fontSize: 14, 
		color: '#333', 
		flex: 1, 
		marginRight: 8,
		lineHeight: 18
	},
	vaccineNameActive: { color: '#1976d2' },
	doseBadge: { 
		backgroundColor: '#f5f5f5', 
		paddingHorizontal: 8, 
		paddingVertical: 4, 
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e0e0e0'
	},
	doseBadgeActive: { 
		backgroundColor: '#1976d2', 
		borderColor: '#1976d2' 
	},
	doseText: { 
		fontSize: 11, 
		fontWeight: '600', 
		color: '#666' 
	},
	doseTextActive: { color: '#fff' },
	diseaseName: { 
		fontSize: 12, 
		color: '#666', 
		lineHeight: 16,
		marginBottom: 8
	},
	diseaseNameActive: { color: '#1976d2' },
	completedBadge: { 
		backgroundColor: '#ffebee', 
		paddingHorizontal: 8, 
		paddingVertical: 4, 
		borderRadius: 8,
		alignSelf: 'flex-start'
	},
	completedText: { 
		fontSize: 10, 
		color: '#d32f2f', 
		fontWeight: '500' 
	},
	emptyState: { 
		width: '100%', 
		padding: 20, 
		alignItems: 'center',
		backgroundColor: '#f8f9fa',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#e9ecef',
		borderStyle: 'dashed'
	},
	emptyStateText: { 
		color: '#6c757d', 
		fontSize: 14,
		textAlign: 'center'
	},
	input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8 },
	filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
	filterBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16, backgroundColor: '#fff', marginRight: 8 },
	filterBtnActive: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
	facilityCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8, backgroundColor: '#fff' },
	facilityCardActive: { borderColor: '#1976d2', backgroundColor: '#e3f0ff' },
	facilityName: { fontWeight: 'bold', fontSize: 16 },
	facilityAddress: { color: '#666', fontSize: 13, marginVertical: 2 },
	facilityInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
	facilityRating: { color: '#fbc02d', fontWeight: 'bold' },
	facilityDistance: { color: '#1976d2', fontWeight: 'bold' },
	packageBox: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8 },
	packageItem: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#fff' },
	packageItemActive: { borderColor: '#1976d2', backgroundColor: '#e3f0ff' },
	packageName: { fontWeight: 'bold', fontSize: 15 },
	packagePrice: { color: '#1976d2', fontWeight: 'bold' },
	packageDesc: { color: '#666', fontSize: 13 },
	dateBox: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8 },
	calendarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
	calendarMonth: { fontWeight: 'bold', fontSize: 15 },
	calendarDays: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
	calendarDayLabel: { width: 32, textAlign: 'center', color: '#888', fontWeight: 'bold' },
	calendarDayNum: { width: 32, textAlign: 'center', color: '#888' },
	calendarDayBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
	calendarDayBtnActive: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
	hourRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
	hourBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16, backgroundColor: '#fff', margin: 4 },
	hourBtnActive: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
	submitBtn: { backgroundColor: '#1976d2', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 18, marginBottom: 24 },
	submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ReOrderScreen;
