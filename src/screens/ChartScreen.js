import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, Modal, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faChevronDown, faBaby } from '@fortawesome/free-solid-svg-icons';
import CustomLineChart from '../components/CustomLineChart';
import childrenApi from '../store/api/childrenApi';
import { getFullGrowthData, getPredictionData } from '../store/api/growthApi';
import membershipApi from '../store/api/membershipApi';
import * as SecureStore from 'expo-secure-store';

// Placeholder components
const TabBar = ({ selectedTab, onSelectTab }) => {
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 375;
  
  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      paddingVertical: Math.max(8, screenWidth * 0.02),
      paddingHorizontal: Math.max(8, screenWidth * 0.02)
    }}>
      {['Chiều cao', 'Cân nặng', 'Vòng đầu', 'BMI'].map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onSelectTab(tab)}
          style={{ 
            padding: isSmallScreen ? 6 : 8, 
            borderBottomWidth: selectedTab === tab ? 2 : 0, 
            borderBottomColor: 'blue',
            flex: 1,
            alignItems: 'center'
          }}
        >
          <Text style={{ 
            color: selectedTab === tab ? 'blue' : 'black', 
            fontWeight: selectedTab === tab ? 'bold' : 'normal',
            fontSize: Math.max(12, Math.min(14, screenWidth / 28)),
            textAlign: 'center'
          }}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};


// Updated DataTable component
const DataTable = ({ data, selectedTab }) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isSmallScreen = screenWidth < 375;
  
  // Determine the unit based on the selected tab
  const unit = selectedTab === 'Chiều cao' || selectedTab === 'Vòng đầu' ? ' cm' : selectedTab === 'Cân nặng' ? ' kg' : '';

  // Function to get status text style based on status value
  const getStatusStyle = (status, isPrediction) => {
    if (isPrediction) {
      return { fontStyle: 'italic', color: '#888' };
    }
    
    switch (status) {
      case 'Bình thường':
        return { color: 'green' };
      case 'Tăng nhẹ':
        return { color: 'orange' };
      case 'Chuẩn':
        return { color: 'green' };
      case 'Dự đoán':
        return { fontStyle: 'italic', color: '#888' };
      // Add more cases for other statuses if needed
      default:
        return {}; // Default empty style
    }
  };

  // Simple inline styles for DataTable since we can't access ChartScreen styles
  const dataTableStyles = {
    dataTableContainer: {
      borderWidth: 1,
      borderColor: '#eee',
      padding: Math.max(8, screenWidth * 0.025),
      marginBottom: Math.max(16, screenHeight * 0.02),
      borderRadius: Math.max(4, screenWidth * 0.012),
    },
    tableTitle: {
      fontSize: Math.max(14, screenWidth * 0.038),
      fontWeight: 'bold',
      marginBottom: Math.max(8, screenHeight * 0.012),
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      paddingBottom: Math.max(4, screenHeight * 0.006),
      marginBottom: Math.max(4, screenHeight * 0.006),
    },
    tableHeaderCell: {
      fontWeight: 'bold',
      fontSize: Math.max(12, screenWidth * 0.032),
      color: '#555',
    },
    tableBodyScroll: {
      maxHeight: Math.max(150, screenHeight * 0.25),
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomColor: '#eee',
    },
    tableCell: {
      fontSize: Math.max(12, screenWidth * 0.032),
    },
    noDataText: {
      textAlign: 'center',
      marginTop: Math.max(8, screenHeight * 0.012),
      color: '#555',
    }
  };

  return null;
};

// Helper function to get status color
const getStatusColor = (status) => {
  if (!status) return '#000';
  
  const normalStatuses = ['Bình thường', 'Chuẩn', 'Normal'];
  const warningStatuses = ['Tăng nhẹ', 'Giảm nhẹ', 'Hơi thấp', 'Hơi cao'];
  const dangerStatuses = ['Thấp còi', 'Thấp còi nặng', 'Béo phì', 'Béo phì nặng', 'Suy dinh dưỡng', 'Microcephaly', 'Đầu rất nhỏ'];
  const predictionStatuses = ['Dự đoán'];
  
  if (normalStatuses.some(s => status.includes(s))) return '#28a745'; // Green
  if (warningStatuses.some(s => status.includes(s))) return '#ffc107'; // Yellow
  if (dangerStatuses.some(s => status.includes(s))) return '#dc3545'; // Red
  if (predictionStatuses.some(s => status.includes(s))) return '#FFA500'; // Orange for prediction
  
  return '#6c757d'; // Default gray
};

const ChartScreen = ({ navigation }) => {
  // Get screen dimensions for responsive styles
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const [selectedTab, setSelectedTab] = useState('Chiều cao');

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childGrowthData, setChildGrowthData] = useState(null);
  const [heightStandardData, setHeightStandardData] = useState([]);
  const [weightStandardData, setWeightStandardData] = useState([]);
  const [headCircumferenceStandardData, setHeadCircumferenceStandardData] = useState([]);
  const [bmiStandardData, setBMIStandardData] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [isVip, setIsVip] = useState(false);
  const [vipChecked, setVipChecked] = useState(false);

  // Assessment state
  const [assessmentData, setAssessmentData] = useState(null);

  // Tooltip state
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: '', label: '', isPrediction: false });

  // Thêm loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Cache để tránh reload không cần thiết
  const [dataCache, setDataCache] = useState({});

  // Thêm state để xử lý lỗi ảnh
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await childrenApi.getMyChildren();
        const data = res.data || [];
        setChildren(data);
        if (data.length > 0) setSelectedChildId(data[0].childId);
      } catch (e) {
        console.error("Failed to fetch children:", e);
      }
    };
    fetchChildren();
  }, []);

  // Check VIP status once
  useEffect(() => {
    const checkVip = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (!token) {
          setIsVip(false);
          setVipChecked(true);
          return;
        }
        const status = await membershipApi.getUserMembershipStatus(undefined, `Bearer ${token}`);
        const active = !!(status && (status.isActive === true || status.status === true));
        setIsVip(active);
      } catch (e) {
        setIsVip(false);
      } finally {
        setVipChecked(true);
      }
    };
    checkVip();
  }, []);

  useEffect(() => {
    const fetchAllDataForChild = async () => {
      if (!selectedChildId) {
        setChildGrowthData(null);
        setHeightStandardData([]);
        setWeightStandardData([]);
        setHeadCircumferenceStandardData([]);
        setBMIStandardData([]);
        setAssessmentData(null);
        setPredictionData(null);
        setIsLoading(false);
        return;
      }

      // Helper: get latest actual day from growthData across tabs
      const getLatestActualDayFromGrowthData = (growthDataObj) => {
        try {
          const all = Object.values(growthDataObj?.data || {}).flat();
          const ages = all.map(i => i?.ageInDays).filter(n => typeof n === 'number');
          return ages.length > 0 ? Math.max(...ages) : 0;
        } catch {
          return 0;
        }
      };

      // Check cache first
      const cacheKey = `${selectedChildId}-${children.find(child => child.childId === selectedChildId)?.gender || 'male'}`;
      if (dataCache[cacheKey]) {
        console.log('Using cached data');
        const cached = dataCache[cacheKey];
        setChildGrowthData(cached.growthData);
        setHeightStandardData(cached.heightStandardData);
        setWeightStandardData(cached.weightStandardData);
        setHeadCircumferenceStandardData(cached.headCircumferenceStandardData);
        setBMIStandardData(cached.bmiStandardData);
        setAssessmentData(cached.assessmentData);
        setPredictionData(cached.predictionData);
        setIsLoading(false);
        
        // Decide desired horizon based on cached growth data
        const latestDayCached = getLatestActualDayFromGrowthData(cached.growthData);
        const desiredHorizon = latestDayCached > 720 ? 360 : 30;
        // Load prediction data in background if not cached or horizon mismatched
        if (!cached.predictionData || cached.predictionHorizonDays !== desiredHorizon) {
          loadPredictionDataAsync(selectedChildId, desiredHorizon);
        }
        return;
      }

      setIsLoading(true);
      const gender = children.find(child => child.childId === selectedChildId)?.gender || 'male';
      
      try {
        // Load tất cả data cùng lúc và đợi hoàn thành
        const [growthResult, assessmentResult] = await Promise.allSettled([
          getFullGrowthData(selectedChildId, gender),
          childrenApi.getLatestGrowthAssessment(selectedChildId)
        ]);

        // Xử lý prediction data sau khi có growth data
        let predictionData = null;
        if (growthResult.status === 'fulfilled') {
          const growth = growthResult.value;
          if (growth.predictionData) {
            predictionData = growth.predictionData;
          } else {
            // Load prediction data riêng nếu chưa có
            try {
              const latestDay = getLatestActualDayFromGrowthData(growth.growthData);
              const desired = latestDay > 720 ? 360 : 30;
              predictionData = await getPredictionData(selectedChildId, desired);
            } catch (predError) {
              console.warn('Prediction data failed:', predError);
              predictionData = null;
            }
          }
        }

        // Xử lý kết quả growth data
        if (growthResult.status === 'fulfilled') {
          const growth = growthResult.value;
          setChildGrowthData(growth.growthData);
          setHeightStandardData(growth.heightStandardData);
          setWeightStandardData(growth.weightStandardData);
          setHeadCircumferenceStandardData(growth.headCircumferenceStandardData);
          setBMIStandardData(growth.bmiStandardData);
        } else {
          console.error('Growth data failed:', growthResult.reason);
          throw growthResult.reason;
        }

        // Xử lý kết quả assessment data
        if (assessmentResult.status === 'fulfilled') {
          setAssessmentData(assessmentResult.value.data);
        } else {
          console.warn('Assessment data failed:', assessmentResult.reason);
          setAssessmentData(null);
        }

        // Set prediction data
        setPredictionData(predictionData);
        
        // Cache the data
        const growth = growthResult.value;
        setDataCache(prev => ({
          ...prev,
          [cacheKey]: {
            growthData: growth.growthData,
            heightStandardData: growth.heightStandardData,
            weightStandardData: growth.weightStandardData,
            headCircumferenceStandardData: growth.headCircumferenceStandardData,
            bmiStandardData: growth.bmiStandardData,
            assessmentData: assessmentResult.status === 'fulfilled' ? assessmentResult.value.data : null,
            predictionData: predictionData,
            // Set an initial horizon guess from current growth data
            predictionHorizonDays: getLatestActualDayFromGrowthData(growth.growthData) > 720 ? 360 : 30
          }
        }));

        // Chỉ set loading = false khi tất cả data đã load xong
        setIsLoading(false);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
        setChildGrowthData(null);
        setHeightStandardData([]);
        setWeightStandardData([]);
        setHeadCircumferenceStandardData([]);
        setBMIStandardData([]);
        setAssessmentData(null);
        setPredictionData(null);
        setIsLoading(false);
      }
    };
    
    fetchAllDataForChild();
  }, [selectedChildId, children, retryCount]);


  const handleSelectChildPress = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSelectChild = (childId) => {
    setSelectedChildId(childId);
    setIsDropdownVisible(false);
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    if (years > 0) {
      const remainingMonths = m < 0 ? 12 + m : m;
      return `${years} tuổi ${remainingMonths > 0 ? `${remainingMonths} tháng` : ''}`;
    }
    
    let months = today.getMonth() - birthDate.getMonth() + (12 * (today.getFullYear() - birthDate.getFullYear()));
    if(today.getDate() < birthDate.getDate()) {
        months--;
    }
    return `${months} tháng`;
  };


  const getChartAndTableData = (tab) => {
    const actualData = childGrowthData?.data?.[tab] || [];
    const validActualData = actualData.filter(item => typeof item.value === 'number' && isFinite(item.value) && item.status !== 'Dự đoán');

    // Get standard data
    let standardData = [];
    if (tab === 'Chiều cao') standardData = heightStandardData;
    else if (tab === 'Cân nặng') standardData = weightStandardData;
    else if (tab === 'Vòng đầu') standardData = headCircumferenceStandardData;
    else if (tab === 'BMI') standardData = bmiStandardData;

    // Create datasets for both actual and standard data
    let datasets = [];
    let labels = [];
    let tableData = [];

    // Actual data (blue line) - chỉ lấy 3 điểm cuối
    if (validActualData.length > 0) {
      // Lấy tối đa 3 điểm cuối cùng
      const last3ActualData = validActualData.slice(-3);
      const actualValues = [0, ...last3ActualData.map(item => item.value)];
      const actualLabels = ['0', ...last3ActualData.map(item => item.ageInDays.toString())];
      
      datasets.push({
        data: actualValues,
        labels: actualLabels, // Labels riêng cho dataset này
        color: (opacity = 1) => `rgba(0,123,255,${opacity})`, // Blue
        strokeWidth: 2,
        label: 'Thực tế'
      });
      
      labels = actualLabels; // Để tương thích với code cũ
      tableData = last3ActualData;
    }

    // Prediction data (dotted orange line) - nếu ngày thực tế mới nhất > 720 thì lấy theo năm (360 ngày), ngược lại 30 ngày
    if (predictionData && predictionData.predictionPoints && predictionData.predictionPoints.length > 0 && validActualData.length > 0) {
      const lastActualPoint = validActualData[validActualData.length - 1];
      const targetPredictionDay = lastActualPoint.ageInDays + (lastActualPoint.ageInDays > 720 ? 360 : 30);
      
      // Tìm prediction point gần nhất với targetPredictionDay
      const closestPredictionPoint = predictionData.predictionPoints.reduce((closest, current) => {
        const currentDiff = Math.abs(current.ageInDays - targetPredictionDay);
        const closestDiff = Math.abs(closest.ageInDays - targetPredictionDay);
        return currentDiff < closestDiff ? current : closest;
      });
      
      // Map field names based on selected tab
      let predictionFieldMap = {
        'Chiều cao': 'predictedHeight',
        'Cân nặng': 'predictedWeight',
        'Vòng đầu': 'predictedHeadCircumference',
        'BMI': 'predictedBMI'
      };
      
      const predictionField = predictionFieldMap[tab];
      if (predictionField && closestPredictionPoint[predictionField] != null) {
        // Create prediction line with only 2 points: last actual + closest prediction
        const predictionValues = [lastActualPoint.value, closestPredictionPoint[predictionField]];
        const predictionLabels = [lastActualPoint.ageInDays.toString(), closestPredictionPoint.ageInDays.toString()];
        
        datasets.push({
          data: predictionValues,
          labels: predictionLabels,
          color: (opacity = 1) => `rgba(255,165,0,${opacity})`, // Orange
          strokeWidth: 2,
          strokeDashArray: [5, 5], // Dotted line (if supported)
          label: 'Dự đoán'
        });
        
        // Add only the selected prediction data to table
        const predictionTableData = [{
          ageInDays: closestPredictionPoint.ageInDays,
          month: Math.round(closestPredictionPoint.ageInDays / 30.44),
          value: closestPredictionPoint[predictionField],
          status: 'Dự đoán',
          measurementDate: closestPredictionPoint.predictedDate,
          isPrediction: true
        }];
        
        tableData = [...tableData, ...predictionTableData];
      }
    }

    // Standard data (pink line) - chỉ cải thiện phần > 720 ngày
    if (standardData.length > 0) {
      let filteredStandardData = standardData;
      
      // Nếu có dữ liệu thực tế, lọc dữ liệu tiêu chuẩn
      if (validActualData.length > 0) {
        const latestActualDay = validActualData[validActualData.length - 1].ageInDays;
        
        console.log(`Latest actual day: ${latestActualDay}`); // Debug log
        
        if (latestActualDay <= 720) {
          // Logic cũ GIỮ NGUYÊN: ≤ 720 ngày, sử dụng hệ thống 30 ngày
          const standardDays = standardData.map((item, index) => ({
            ...item,
            standardDay: (index + 1) * 30 // 30, 60, 90, 120, 150...
          }));
          
          const rangeStart = Math.max(30, latestActualDay - 30);
          const rangeEnd = latestActualDay + 30;
          
          filteredStandardData = standardDays.filter(item => 
            item.standardDay >= rangeStart && item.standardDay <= rangeEnd
          );
          
          // Đảm bảo có ít nhất 2 điểm
          if (filteredStandardData.length < 2) {
            const expandedStart = Math.max(30, rangeStart - 60);
            const expandedEnd = rangeEnd + 60;
            filteredStandardData = standardDays.filter(item => 
              item.standardDay >= expandedStart && item.standardDay <= expandedEnd
            );
          }
          
          console.log(`Using 30-day system. Range: ${rangeStart}-${rangeEnd}`); // Debug log
        } else {
          // Logic mới CẢI THIỆN CHO > 720 ngày: sử dụng hệ thống 360*x với ageInDays có sẵn
          
          // Tìm 2 mốc 360*x gần nhất với latestActualDay
          const x = latestActualDay / 360; // Ví dụ: 1826/360 = 5.07
          const lowerX = Math.floor(x); // 5
          const upperX = Math.ceil(x); // 6 (hoặc 5 nếu x là số nguyên)
          
          // Đảm bảo có 2 mốc khác nhau
          let targetMultipliers;
          if (lowerX === upperX) {
            // Nếu latestActualDay chính xác là bội số của 360
            targetMultipliers = [Math.max(1, lowerX - 1), lowerX];
          } else {
            targetMultipliers = [lowerX, upperX];
          }
          
          const target1 = 360 * targetMultipliers[0]; // Ví dụ: 360*5 = 1800
          const target2 = 360 * targetMultipliers[1]; // Ví dụ: 360*6 = 2160
          
          console.log(`Using 360-day system. x=${x.toFixed(2)}, lowerX=${lowerX}, upperX=${upperX}`); // Debug log
          console.log(`Target days: ${target1}, ${target2}`); // Debug log
          
          // Tìm 2 điểm gần nhất với target1 và target2 trong standardData
          // SỬA: sử dụng ageInDays có sẵn từ API thay vì tính (index + 1) * 30
          const findClosestStandardPoint = (targetDay) => {
            let closestPoint = null;
            let minDistance = Infinity;
            
            standardData.forEach((item, index) => {
              const currentDay = item.ageInDays; // SỬA: dùng ageInDays có sẵn
              const distance = Math.abs(currentDay - targetDay);
              
              if (distance < minDistance) {
                minDistance = distance;
                closestPoint = { ...item, index, standardDay: currentDay, distance };
              }
            });
            
            return closestPoint;
          };
          
          const point1 = findClosestStandardPoint(target1);
          const point2 = findClosestStandardPoint(target2);
          
          console.log(`Found points:`, { 
            point1: point1 ? `day ${point1.standardDay} (target: ${target1}, distance: ${point1.distance})` : 'null',
            point2: point2 ? `day ${point2.standardDay} (target: ${target2}, distance: ${point2.distance})` : 'null'
          }); // Debug log
          
          // Loại bỏ điểm trùng lặp nếu có và kiểm tra null
          const uniquePoints = [];
          if (point1 && point1.standardDay) uniquePoints.push(point1);
          if (point2 && point2.standardDay && (!point1 || point2.standardDay !== point1.standardDay)) {
            uniquePoints.push(point2);
          }
          
          filteredStandardData = uniquePoints;
          
          // Nếu vẫn chỉ có 1 điểm hoặc 2 điểm quá gần nhau (< 180 ngày), tìm thêm điểm
          if (filteredStandardData.length < 2 || 
              (filteredStandardData.length === 2 && 
               filteredStandardData[0] && filteredStandardData[1] && 
               Math.abs(filteredStandardData[0].standardDay - filteredStandardData[1].standardDay) < 180)) {
            
            console.log('Need to find additional points'); // Debug log
            
            // Tìm tất cả các điểm trong khoảng hợp lý và sắp xếp theo khoảng cách
            // SỬA: sử dụng ageInDays có sẵn thay vì tính (index + 1) * 30
            const allCandidates = standardData
              .map((item, index) => ({ ...item, index, standardDay: item.ageInDays })) // SỬA: dùng ageInDays
              .filter(item => item && typeof item.standardDay === 'number') // Lọc bỏ các item null/undefined
              .map(item => ({
                ...item,
                distance: Math.abs(item.standardDay - latestActualDay)
              }))
              .filter(item => Math.abs(item.standardDay - latestActualDay) <= 720) // Trong phạm vi ±720 ngày
              .sort((a, b) => a.distance - b.distance);
            
            console.log(`Found ${allCandidates.length} candidates within ±720 days range`); // Debug log
            
            if (allCandidates.length > 0) {
              // Chọn 2 điểm có khoảng cách hợp lý (ít nhất 180 ngày)
              filteredStandardData = [allCandidates[0]]; // Điểm gần nhất
              
              for (let i = 1; i < allCandidates.length; i++) {
                const candidate = allCandidates[i];
                const isDistantEnough = filteredStandardData.every(existing => 
                  existing && candidate && 
                  Math.abs(candidate.standardDay - existing.standardDay) >= 180
                );
                
                if (isDistantEnough) {
                  filteredStandardData.push(candidate);
                  break;
                }
              }
              
              // Nếu vẫn chỉ có 1 điểm, thêm điểm gần thứ 2
              if (filteredStandardData.length < 2 && allCandidates.length > 1) {
                filteredStandardData.push(allCandidates[1]);
              }
            }
          }
        }
        
        // Sắp xếp theo ageInDays tăng dần và lọc bỏ các điểm null/undefined
        filteredStandardData = filteredStandardData
          .filter(item => item && typeof item.standardDay === 'number')
          .sort((a, b) => a.standardDay - b.standardDay);
        
        console.log(`Final filtered standard data:`, filteredStandardData.map(d => d ? `day ${d.standardDay}` : 'null')); // Debug log
      }
      
      // Kiểm tra an toàn trước khi tạo datasets
      if (filteredStandardData.length > 0) {
        const standardLabels = ['0', ...filteredStandardData.map(item => item && item.standardDay ? item.standardDay.toString() : '0')];
        
        // Tạo dataset cho đường median (tiêu chuẩn)
        const medianValues = [0, ...filteredStandardData.map(item => item && item.median ? item.median : 0)];
        datasets.push({
          data: medianValues,
          labels: standardLabels,
          color: (opacity = 1) => `rgba(255,99,132,${opacity})`, // Pink
          strokeWidth: 2,
          label: 'Tiêu chuẩn'
        });
        
         // Tạo dataset cho đường sd3neg (min) - Màu xanh lá, nét liền
         const sd3negValues = [0, ...filteredStandardData.map(item => item && item.sd3neg ? item.sd3neg : 0)];
         datasets.push({
           data: sd3negValues,
           labels: standardLabels,
           color: (opacity = 1) => `rgba(40,167,69,${opacity})`, // #28a745 - Xanh lá
           strokeWidth: 2,
           label: 'Min (-3SD)'
         });
         
         // Tạo dataset cho đường sd3pos (max) - Màu đỏ, nét liền
         const sd3posValues = [0, ...filteredStandardData.map(item => item && item.sd3pos ? item.sd3pos : 0)];
         datasets.push({
           data: sd3posValues,
           labels: standardLabels,
           color: (opacity = 1) => `rgba(220,53,69,${opacity})`, // #dc3545 - Đỏ
           strokeWidth: 2,
           label: 'Max (+3SD)'
         });
        
        // Use standard labels if no actual data, otherwise keep actual labels
        if (labels.length === 0) {
          labels = standardLabels;
        }
        
        // Add standard data to table if no actual data
        if (tableData.length === 0) {
          tableData = filteredStandardData
            .filter(item => item && item.standardDay && item.median)
            .map(item => ({
              ageInDays: item.standardDay,
              ageInMonths: item.ageInMonths || Math.round(item.standardDay / 30.44),
              value: item.median,
              status: 'Chuẩn',
              measurementDate: null
            }));
        }
        // Expose count of standard points to gate predictions later
        labels.__standardPointsCount = filteredStandardData.length;
      }
    }

    // If no data available
    if (datasets.length === 0) {
      const chartKitData = {
        labels: ['0'],
        datasets: [{ 
          data: [0], 
          color: (opacity = 1) => `rgba(0,123,255,${opacity})`,
          strokeWidth: 2
        }],
        legend: []
      };
      return { chartKitData, tableData: [] };
    }

    const chartKitData = {
      labels,
      datasets,
      legend: datasets.map(d => d.label)
    };
    
    // Extract standard count from labels helper if present
    const standardPointsCount = typeof labels.__standardPointsCount === 'number' ? labels.__standardPointsCount : 0;
    return { chartKitData, tableData, standardPointsCount };
  };
  

  // Get the chart and table data based on the current selection
  const { chartKitData, tableData, standardPointsCount } = getChartAndTableData(selectedTab);
  const actualData = childGrowthData?.data?.[selectedTab] || [];
  const validActualData = actualData.filter(item => typeof item.value === 'number' && isFinite(item.value) && item.status !== 'Dự đoán');
  const actualPointsCount = validActualData.length;
  const allowPrediction = isVip && (standardPointsCount || 0) >= 2 && actualPointsCount >= 2;
  // Ẩn legend mặc định
  chartKitData.legend = [];
  // Nếu không đủ điều kiện, ẩn dataset dự đoán khỏi biểu đồ (nhưng giữ lại Min/Max)
  if (!allowPrediction && chartKitData && Array.isArray(chartKitData.datasets)) {
    chartKitData.datasets = chartKitData.datasets.filter(d => d && d.label !== 'Dự đoán');
  }

  // validActualData đã được tính ở trên để tính điều kiện allowPrediction
  // Determine whether to display X-axis in years (when latest actual day > 720)
  const latestActualDayForUnit = validActualData.length > 0 ? validActualData[validActualData.length - 1].ageInDays : 0;
  const useYearsOnXAxis = latestActualDayForUnit > 720;
  const convertDaysToYearsString = (days) => {
    if (days == null || isNaN(days)) return '';
    if (days === 0) return '0';
    const years = days / 365;
    return years.toFixed(1);
  };
  const formatXAxisTick = (value) => {
    // value comes as string label from datasets
    let labelStr = value;
    // If label is composite like '123/...' keep the day part
    if (typeof labelStr === 'string' && labelStr.includes('/')) {
      const parts = labelStr.split('/');
      labelStr = parts[0];
    }
    const dayNumber = parseFloat(labelStr);
    if (useYearsOnXAxis && !isNaN(dayNumber)) {
      return convertDaysToYearsString(dayNumber);
    }
    // default behaviour (days)
    if (typeof labelStr === 'string') {
      return labelStr.length <= 4 ? labelStr : `${labelStr.substring(0,3)}..`;
    }
    return String(labelStr ?? '');
  };

  // Get screen width to make chart responsive (subtracting container padding)
  const chartWidth = screenWidth - 32; // 16 padding on each side
  const chartHeight = Math.max(250, Math.min(350, screenHeight * 0.4)); // Responsive height

  // Tooltip auto-hide effect
  useEffect(() => {
    let timer;
    if (tooltip.visible) {
      timer = setTimeout(() => setTooltip(t => ({ ...t, visible: false })), 2000);
    }
    return () => clearTimeout(timer);
  }, [tooltip.visible]);

  // Generate responsive styles
  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Math.max(12, screenWidth * 0.03),
    },
    childInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    profileImage: {
      width: Math.max(48, screenWidth * 0.12),
      height: Math.max(48, screenWidth * 0.12),
      borderRadius: Math.max(24, screenWidth * 0.06),
      marginRight: Math.max(8, screenWidth * 0.025),
    },
    childName: {
      fontSize: Math.max(16, screenWidth * 0.045),
      fontWeight: 'bold',
    },
    childAge: {
      fontSize: Math.max(13, screenWidth * 0.035),
      color: '#555',
    },
    tabBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: Math.max(16, screenHeight * 0.02),
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    tabButton: {
      paddingVertical: Math.max(8, screenHeight * 0.012),
      paddingHorizontal: Math.max(12, screenWidth * 0.03),
    },
    selectedTabButton: {
      borderBottomWidth: 2,
      borderBottomColor: '#007bff',
    },
    tabText: {
      fontSize: Math.max(14, screenWidth * 0.038),
      color: '#555',
    },
    selectedTabText: {
      color: '#007bff',
      fontWeight: 'bold',
    },
    chartArea: {
      marginBottom: Math.max(16, screenHeight * 0.02),
    },
    chartAreaContent: {
      alignItems: 'center',
    },
    chartTitle: {
      fontSize: Math.max(16, screenWidth * 0.045),
      fontWeight: 'bold',
      marginBottom: Math.max(8, screenHeight * 0.012),
    },
    infoIcon: {
      position: 'absolute',
      top: 0,
      right: 0,
    },
    dataTableContainer: {
      borderWidth: 1,
      borderColor: '#eee',
      padding: Math.max(8, screenWidth * 0.025),
      marginBottom: Math.max(16, screenHeight * 0.02),
      borderRadius: Math.max(4, screenWidth * 0.012),
    },
    tableTitle: {
      fontSize: Math.max(14, screenWidth * 0.038),
      fontWeight: 'bold',
      marginBottom: Math.max(8, screenHeight * 0.012),
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      paddingBottom: Math.max(4, screenHeight * 0.006),
      marginBottom: Math.max(4, screenHeight * 0.006),
    },
    tableHeaderCell: {
      fontWeight: 'bold',
      fontSize: Math.max(12, screenWidth * 0.032),
      color: '#555',
    },
    tableBodyScroll: {
      maxHeight: Math.max(150, screenHeight * 0.25),
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomColor: '#eee',
    },
    tableCell: {
      fontSize: Math.max(12, screenWidth * 0.032),
    },
    statusText: {
      fontSize: Math.max(12, screenWidth * 0.032),
    },
    statusNormal: {
      color: 'green',
    },
    statusMildIncrease: {
      color: 'orange',
    },
    statusPredicted: {
      color: '#888',
      fontStyle: 'italic',
    },
    noDataText: {
      textAlign: 'center',
      marginTop: Math.max(8, screenHeight * 0.012),
      color: '#555',
    },
    dropdownContainer: {
      backgroundColor: '#fff',
      borderRadius: Math.max(5, screenWidth * 0.01),
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
      marginHorizontal: Math.max(10, screenWidth * 0.04),
      marginBottom: Math.max(8, screenHeight * 0.01),
      marginTop: -5,
    },
    dropdownScroll: {
      maxHeight: Math.max(120, screenHeight * 0.18),
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Math.max(8, screenHeight * 0.012),
      paddingHorizontal: Math.max(12, screenWidth * 0.04),
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    dropdownItemImage: {
      width: Math.max(28, screenWidth * 0.08),
      height: Math.max(28, screenWidth * 0.08),
      borderRadius: Math.max(14, screenWidth * 0.04),
      marginRight: Math.max(8, screenWidth * 0.025),
    },
    dropdownItemTextContainer: {
      flex: 1,
    },
    dropdownItemName: {
      fontSize: Math.max(14, Math.min(16, screenWidth / 23))
    },
    dropdownItemAge: {
      fontSize: Math.max(10, Math.min(12, screenWidth / 30))
    },
    selectedIcon: {
      color: 'green',
      fontSize: Math.max(14, Math.min(16, screenWidth / 23))
    },
    assessmentContainer: {
      marginTop: Math.max(4, screenHeight * 0.01),
      borderTopWidth: 2,
      borderTopColor: '#007bff',
      paddingTop: Math.max(12, screenHeight * 0.018),
      backgroundColor: '#fff',
      borderRadius: Math.max(10, screenWidth * 0.03),
      padding: Math.max(14, screenWidth * 0.04),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    assessmentHeader: {
      borderBottomWidth: 1,
      borderBottomColor: '#007bff',
      paddingBottom: Math.max(6, screenHeight * 0.01),
      marginBottom: Math.max(8, screenHeight * 0.012),
    },
    assessmentTitle: {
      fontSize: Math.max(15, screenWidth * 0.042),
      fontWeight: 'bold',
      marginBottom: Math.max(8, screenHeight * 0.012),
    },
    assessmentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Math.max(5, screenHeight * 0.008),
      backgroundColor: '#fff',
      borderRadius: 4,
      paddingHorizontal: Math.max(6, screenWidth * 0.02),
      marginVertical: 2,
    },
    assessmentLabel: {
      fontSize: Math.max(13, screenWidth * 0.035),
      color: '#007bff',
      fontWeight: '600',
    },
    assessmentValue: {
      fontSize: Math.max(13, screenWidth * 0.035),
      fontWeight: 'bold',
      color: '#000',
    },
    recommendationsContainer: {
      backgroundColor: '#fff',
      borderRadius: 4,
      borderLeftWidth: 3,
      borderLeftColor: '#007bff',
      padding: Math.max(10, screenWidth * 0.03),
      marginTop: Math.max(6, screenHeight * 0.01),
    },
    recommendationItem: {
      flexDirection: 'row',
      marginBottom: Math.max(6, screenHeight * 0.01),
      alignItems: 'flex-start',
    },
    recommendationBullet: {
      fontSize: Math.max(14, screenWidth * 0.04),
      fontWeight: 'bold',
      color: '#007bff',
      marginRight: Math.max(6, screenWidth * 0.02),
      marginTop: 2,
    },
    recommendationsText: {
      fontSize: Math.max(13, screenWidth * 0.035),
      lineHeight: Math.max(20, screenWidth * 0.055),
      color: '#0056b3',
      flex: 1,
      flexWrap: 'wrap',
    },
    noRecommendationsText: {
      fontSize: Math.max(13, screenWidth * 0.035),
      color: '#666',
      fontStyle: 'italic',
      textAlign: 'center',
      padding: Math.max(10, screenWidth * 0.03),
    },
    predictionContainer: {
      marginTop: Math.max(16, screenHeight * 0.025),
      marginBottom: 20,
      borderTopWidth: 2,
      borderTopColor: '#ffa500',
      paddingTop: Math.max(12, screenHeight * 0.018),
      backgroundColor: '#fff8f0',
      borderRadius: Math.max(6, screenWidth * 0.02),
      padding: Math.max(10, screenWidth * 0.03),
    },
    predictionHeader: {
      borderBottomWidth: 1,
      borderBottomColor: '#ffa500',
      paddingBottom: Math.max(6, screenHeight * 0.01),
      marginBottom: Math.max(8, screenHeight * 0.012),
    },
    predictionTitle: {
      fontSize: Math.max(15, screenWidth * 0.042),
      fontWeight: 'bold',
      color: '#ff6b00',
      marginBottom: Math.max(8, screenHeight * 0.012),
    },
    predictionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Math.max(5, screenHeight * 0.008),
      backgroundColor: '#fff',
      borderRadius: 4,
      paddingHorizontal: Math.max(6, screenWidth * 0.02),
      marginVertical: 2,
    },
    predictionLabel: {
      fontSize: Math.max(13, screenWidth * 0.035),
      color: '#ff6b00',
      fontWeight: '600',
    },
    predictionValue: {
      fontSize: Math.max(13, screenWidth * 0.035),
      fontWeight: 'bold',
      color: '#ff6b00',
      fontStyle: 'italic',
    },
    predictionRecommendationsText: {
      fontSize: Math.max(13, screenWidth * 0.035),
      lineHeight: Math.max(18, screenWidth * 0.05),
      color: '#d2691e',
      backgroundColor: '#fff',
      padding: Math.max(6, screenWidth * 0.02),
      borderRadius: 4,
      borderLeftWidth: 3,
      borderLeftColor: '#ffa500',
    },
  }), [screenWidth, screenHeight]);

  // Show loading indicator
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#666' }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 18, color: '#dc3545', marginBottom: 10, textAlign: 'center' }}>
          Không thể tải dữ liệu
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' }}>
          {error.message || 'Có lỗi xảy ra khi kết nối đến server'}
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          style={{
            backgroundColor: '#007bff',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            Thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { padding: Math.max(12, screenWidth * 0.03) }]}>
      {/* 1. Header Hồ sơ Trẻ */}
      <View style={{
        ...styles.header, 
        marginBottom: Math.max(15, screenWidth * 0.04),
        marginTop: Math.max(10, screenWidth * 0.025)
      }}>
        {/* Back button - Adjust navigation target if needed */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={Math.max(20, Math.min(25, screenWidth / 15))} color="black" />
        </TouchableOpacity>
        {/* Corrected header title */}
        <Text style={{ 
          fontSize: Math.max(18, Math.min(24, screenWidth / 15)), 
          fontWeight: 'bold', 
          textAlign: 'center', 
          flex: 1 
        }}>
          Biểu đồ tăng trưởng
        </Text>
      </View>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center',
        paddingHorizontal: Math.max(8, screenWidth * 0.02)
      }}>
  <View style={[styles.childInfo, {
    marginLeft: Math.max(10, screenWidth * 0.025),
    marginVertical: Math.max(8, screenWidth * 0.02)
  }]}>
    {/* Display profile image of the first selected child */}
    {/* Use selectedChildId as we are back to single select in display */}
    {selectedChildId && (
      <>
        {children.find(child => child.childId === selectedChildId)?.imageURL && !imageErrors[children.find(child => child.childId === selectedChildId)?.imageURL] ? (
          <Image
            source={{ uri: children.find(child => child.childId === selectedChildId)?.imageURL }}
            style={[styles.profileImage, {
              width: Math.max(35, Math.min(40, screenWidth * 0.1)),
              height: Math.max(35, Math.min(40, screenWidth * 0.1)),
              borderRadius: Math.max(17.5, Math.min(20, screenWidth * 0.05))
            }]}
            onError={() => setImageErrors(prev => ({ ...prev, [children.find(child => child.childId === selectedChildId)?.imageURL]: true }))}
          />
        ) : (
          <View style={[styles.profileImage, {
            width: Math.max(35, Math.min(40, screenWidth * 0.1)),
            height: Math.max(35, Math.min(40, screenWidth * 0.1)),
            borderRadius: Math.max(17.5, Math.min(20, screenWidth * 0.05)),
            backgroundColor: '#E6F0FE',
            justifyContent: 'center',
            alignItems: 'center'
          }]}>
            <FontAwesomeIcon icon={faBaby} size={Math.max(16, Math.min(18, screenWidth / 22))} color="#2F80ED" />
          </View>
        )}
      </>
    )}
    <View>
      {/* Display name of the first selected child */}
      {/* Use selectedChildId as we are back to single select in display */}
      {selectedChildId && (
        <Text style={[styles.childName, {
          fontSize: Math.max(16, Math.min(18, screenWidth / 20))
        }]}>
          {children.find(child => child.childId === selectedChildId)?.fullName}
        </Text>
      )}
      {/* Display age of the first selected child */}
      {/* Use selectedChildId as we are back to single select in display */}
      {selectedChildId && (
        <Text style={[styles.childAge, {
          fontSize: Math.max(12, Math.min(14, screenWidth / 26))
        }]}>
          {calculateAge(children.find(child => child.childId === selectedChildId)?.dateOfBirth)}
        </Text>
      )}
    </View>
  </View>

  {/* Dropdown icon nằm bên phải */}
  {/* Add onPress handler */}
  <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleSelectChildPress}>
    <FontAwesomeIcon icon={faChevronDown} size={Math.max(18, Math.min(20, screenWidth / 18))} color="black" />
  </TouchableOpacity>
</View>

{/* Child Selection Dropdown */}
{isDropdownVisible && (
  <View style={[styles.dropdownContainer, {
    marginHorizontal: Math.max(12, screenWidth * 0.03),
    maxHeight: Math.max(120, screenHeight * 0.25)
  }]}>
    <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll}>
      {children.map(child => (
        <TouchableOpacity
          key={child.childId}
          style={[styles.dropdownItem, {
            paddingVertical: Math.max(8, screenWidth * 0.02),
            paddingHorizontal: Math.max(12, screenWidth * 0.03)
          }]}
          onPress={() => handleSelectChild(child.childId)}
        >
          {/* Add child image */}
          {child.imageURL && !imageErrors[child.imageURL] ? (
            <Image
              source={{ uri: child.imageURL }}
              style={[styles.dropdownItemImage, {
                width: Math.max(25, Math.min(30, screenWidth * 0.08)),
                height: Math.max(25, Math.min(30, screenWidth * 0.08)),
                borderRadius: Math.max(12.5, Math.min(15, screenWidth * 0.04))
              }]}
              onError={() => setImageErrors(prev => ({ ...prev, [child.imageURL]: true }))}
            />
          ) : (
            <View style={[styles.dropdownItemImage, {
              width: Math.max(25, Math.min(30, screenWidth * 0.08)),
              height: Math.max(25, Math.min(30, screenWidth * 0.08)),
              borderRadius: Math.max(12.5, Math.min(15, screenWidth * 0.04)),
              backgroundColor: '#E6F0FE',
              justifyContent: 'center',
              alignItems: 'center'
            }]}>
              <FontAwesomeIcon icon={faBaby} size={Math.max(12, Math.min(14, screenWidth / 28))} color="#2F80ED" />
            </View>
          )}
          <View style={styles.dropdownItemTextContainer}>
            <Text style={[styles.dropdownItemName, {
              fontSize: Math.max(14, Math.min(16, screenWidth / 23))
            }]}>{child.fullName}</Text>
            <Text style={[styles.dropdownItemAge, {
              fontSize: Math.max(10, Math.min(12, screenWidth / 30))
            }]}>{calculateAge(child.dateOfBirth)}</Text>
          </View>
          {/* Indicate selected child */}
          {selectedChildId === child.childId && (
            <Text style={[styles.selectedIcon, {
              fontSize: Math.max(14, Math.min(16, screenWidth / 23))
            }]}> ✅</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
)}


      {/* 2. Tab phân loại biểu đồ */}
      <TabBar selectedTab={selectedTab} onSelectTab={setSelectedTab} />

<ScrollView style={{ paddingHorizontal: Math.max(12, screenWidth * 0.03) }}>
  <Text style={{ 
    fontSize: Math.max(16, Math.min(18, screenWidth / 20)), 
    fontWeight: 'bold', 
    marginBottom: Math.max(6, screenWidth * 0.02)
  }}>
    Biểu đồ {selectedTab.toLowerCase()} ({selectedTab === 'Chiều cao' || selectedTab === 'Vòng đầu' ? 'cm' : selectedTab === 'Cân nặng' ? 'kg' : 'BMI'})
  </Text>

  {/* Info notice when prediction cannot be shown */}
  {vipChecked && (!allowPrediction) && (
    <View style={{
      backgroundColor: '#fff3cd',
      borderColor: '#ffeeba',
      borderWidth: 1,
      borderRadius: 8,
      padding: Math.max(10, screenWidth * 0.03),
      marginBottom: Math.max(8, screenWidth * 0.02),
      borderLeftWidth: 4,
      borderLeftColor: '#ffc107'
    }}>
      {!isVip && (
        <Text style={{ color: '#856404', fontSize: Math.max(12, screenWidth * 0.032), marginBottom: 4 }}>
          Tính năng dự đoán chỉ dành cho tài khoản VIP.
        </Text>
      )}
      {(standardPointsCount || 0) < 2 && (
        <Text style={{ color: '#856404', fontSize: Math.max(12, screenWidth * 0.032) }}>
          Cần ít nhất 2 mốc tiêu chuẩn gần đây để hiển thị đường dự đoán.
        </Text>
      )}
      {actualPointsCount < 2 && (
        <Text style={{ color: '#856404', fontSize: Math.max(12, screenWidth * 0.032), marginTop: 4 }}>
          Cần ít nhất 2 lần đo thực tế để hiển thị đường dự đoán.
        </Text>
      )}
    </View>
  )}

  {/* Chart Legend */}
  <View style={{ 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: Math.max(6, screenWidth * 0.02), 
    justifyContent: 'center', 
    flexWrap: 'wrap',
    paddingHorizontal: Math.max(4, screenWidth * 0.01)
  }}>
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginRight: Math.max(12, screenWidth * 0.03), 
      marginBottom: 4 
    }}>
      <View style={{ 
        width: Math.max(12, screenWidth * 0.035), 
        height: Math.max(3, screenWidth * 0.01), 
        backgroundColor: '#007bff', 
        borderRadius: 2, 
        marginRight: Math.max(3, screenWidth * 0.01)
      }} />
      <Text style={{ 
        color: '#007bff', 
        fontWeight: 'bold',
        fontSize: Math.max(10, Math.min(12, screenWidth / 30))
      }}>
        Thực tế
      </Text>
    </View>
    {/* Prediction legend - only show if we have prediction data and allowed */}
    {allowPrediction && predictionData && predictionData.predictionPoints && predictionData.predictionPoints.length > 0 && (
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginRight: Math.max(12, screenWidth * 0.03), 
        marginBottom: 4 
      }}>
        <View style={{ 
          width: Math.max(12, screenWidth * 0.035), 
          height: Math.max(3, screenWidth * 0.01), 
          backgroundColor: '#FFA500', 
          borderRadius: 2, 
          marginRight: Math.max(3, screenWidth * 0.01),
          borderStyle: 'dashed',
          borderWidth: 1,
          borderColor: '#FFA500'
        }} />
        <Text style={{ 
          color: '#FFA500', 
          fontWeight: 'bold',
          fontSize: Math.max(10, Math.min(12, screenWidth / 30))
        }}>
          Dự đoán 📈
        </Text>
      </View>
    )}
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginRight: Math.max(12, screenWidth * 0.03), 
      marginBottom: 4 
    }}>
      <View style={{ 
        width: Math.max(12, screenWidth * 0.035), 
        height: Math.max(3, screenWidth * 0.01), 
        backgroundColor: '#ff6384', 
        borderRadius: 2, 
        marginRight: Math.max(3, screenWidth * 0.01)
      }} />
      <Text style={{ 
        color: '#ff6384', 
        fontWeight: 'bold',
        fontSize: Math.max(10, Math.min(12, screenWidth / 30))
      }}>
        Tiêu chuẩn
      </Text>
    </View>
     {/* Min (-3SD) */}
     <View style={{ 
       flexDirection: 'row', 
       alignItems: 'center', 
       marginRight: Math.max(12, screenWidth * 0.03), 
       marginBottom: 4 
     }}>
       <View style={{ 
         width: Math.max(12, screenWidth * 0.035), 
         height: Math.max(3, screenWidth * 0.01), 
         backgroundColor: '#28a745', 
         borderRadius: 2, 
         marginRight: Math.max(3, screenWidth * 0.01)
       }} />
       <Text style={{ 
         color: '#28a745', 
         fontWeight: 'bold',
         fontSize: Math.max(10, Math.min(12, screenWidth / 30))
       }}>
         Min (-3SD)
       </Text>
     </View>
     
     {/* Max (+3SD) */}
     <View style={{ 
       flexDirection: 'row', 
       alignItems: 'center', 
       marginBottom: 4 
     }}>
       <View style={{ 
         width: Math.max(12, screenWidth * 0.035), 
         height: Math.max(3, screenWidth * 0.01), 
         backgroundColor: '#dc3545', 
         borderRadius: 2, 
         marginRight: Math.max(3, screenWidth * 0.01)
       }} />
       <Text style={{ 
         color: '#dc3545', 
         fontWeight: 'bold',
         fontSize: Math.max(10, Math.min(12, screenWidth / 30))
       }}>
         Max (+3SD)
       </Text>
     </View>
  </View>

  <View style={{ 
    minHeight: chartHeight + Math.max(30, screenWidth * 0.08), 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'relative',
    marginVertical: Math.max(8, screenWidth * 0.02)
  }}>
    {chartKitData.datasets[0].data.length > 0 && (
      <>
        {/* Y-axis label (at the top-left of Y-axis) */}
        <View style={{
          position: 'absolute',
          left: 5,
          top: 20,
          zIndex: 5
        }}>
          <Text style={{
            fontSize: Math.max(12, Math.min(14, screenWidth / 25)),
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'left'
          }}>
            {selectedTab === 'Chiều cao' ? 'cm' : 
             selectedTab === 'Cân nặng' ? 'kg' : 
             selectedTab === 'Vòng đầu' ? 'cm' : 'BMI'}
          </Text>
        </View>

        {/* X-axis label (horizontal text at the bottom) */}
        <View style={{
          position: 'absolute',
          bottom: 5,
          left: 0,
          right: 0,
          zIndex: 5
        }}>
          <Text style={{
            fontSize: Math.max(12, Math.min(14, screenWidth / 25)),
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center'
          }}>
            {useYearsOnXAxis ? 'năm' : 'ngày'}
          </Text>
        </View>

        <CustomLineChart
          data={chartKitData}
          width={chartWidth}
          height={chartHeight}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 1,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            formatYLabel: (value) => value.toFixed(1),
            formatXLabel: (value) => formatXAxisTick(value)
          }}
          onDataPointClick={({ value, index, x, y, datasetIndex }) => {
            let unit = '';
            if (selectedTab === 'Chiều cao' || selectedTab === 'Vòng đầu') unit = 'cm';
            else if (selectedTab === 'Cân nặng') unit = 'kg';
            else if (selectedTab === 'BMI') unit = '';
            
            let label = '';
            let labelUnit = '';
            
            // Determine data type based on datasetIndex and dataset label
            const currentDataset = chartKitData.datasets[datasetIndex];
            const isPredictionData = currentDataset?.label === 'Dự đoán';
            const isStandardData = currentDataset?.label === 'Tiêu chuẩn';
            const isActualData = currentDataset?.label === 'Thực tế';
            
            if (isActualData) {
              // Biểu đồ thực tế - hiển thị ngày
              if (index === 0) {
                label = '0';
                labelUnit = useYearsOnXAxis ? 'năm' : 'ngày';
              } else {
                // Lấy label từ dataset labels của actual data
                if (currentDataset && currentDataset.labels && currentDataset.labels[index]) {
                  const dayStr = currentDataset.labels[index];
                  if (useYearsOnXAxis) {
                    label = convertDaysToYearsString(parseFloat(dayStr));
                    labelUnit = 'năm';
                  } else {
                    label = dayStr;
                    labelUnit = 'ngày';
                  }
                } else {
                  // Fallback: tìm điểm dữ liệu thực tế tương ứng với index
                  const actualDataPoints = tableData.filter(item => !item.isPrediction && !item.status?.includes('Chuẩn'));
                  const dataPoint = actualDataPoints[index - 1]; // index - 1 vì index 0 là điểm gốc
                  if (dataPoint) {
                    if (useYearsOnXAxis) {
                      label = convertDaysToYearsString(dataPoint.ageInDays);
                      labelUnit = 'năm';
                    } else {
                      label = dataPoint.ageInDays || '';
                      labelUnit = 'ngày';
                    }
                  }
                }
              }
            } else if (isPredictionData) {
              // Biểu đồ dự đoán - hiển thị ngày dự đoán
              if (index === 0) {
                // First point is last actual point
                const lastActualPoint = tableData.find(item => !item.isPrediction && !item.status?.includes('Chuẩn'));
                if (lastActualPoint) {
                  if (useYearsOnXAxis) {
                    label = convertDaysToYearsString(lastActualPoint.ageInDays);
                    labelUnit = 'năm';
                  } else {
                    label = lastActualPoint.ageInDays || '';
                    labelUnit = 'ngày';
                  }
                }
              } else {
                // Prediction point (chỉ có 1 điểm dự đoán)
                const predictionPoint = tableData.find(item => item.isPrediction);
                if (predictionPoint) {
                  if (useYearsOnXAxis) {
                    label = convertDaysToYearsString(predictionPoint.ageInDays);
                    labelUnit = 'năm (dự đoán)';
                  } else {
                    label = predictionPoint.ageInDays || '';
                    labelUnit = 'ngày (dự đoán)';
                  }
                }
              }
            } else if (isStandardData) {
              // Biểu đồ tiêu chuẩn - lấy ngày từ labels thật sự của dataset
              if (index === 0) {
                label = '0';
                labelUnit = useYearsOnXAxis ? 'năm' : 'ngày';
              } else {
                // Lấy label thực từ dataset labels
                if (currentDataset && currentDataset.labels && currentDataset.labels[index]) {
                  const dayStr = currentDataset.labels[index];
                  if (useYearsOnXAxis) {
                    label = convertDaysToYearsString(parseFloat(dayStr));
                    labelUnit = 'năm';
                  } else {
                    label = dayStr;
                    labelUnit = 'ngày';
                  }
                } else {
                  // Fallback: tính theo index * 30
                  if (useYearsOnXAxis) {
                    label = convertDaysToYearsString(index * 30);
                    labelUnit = 'năm';
                  } else {
                    label = (index * 30).toString();
                    labelUnit = 'ngày';
                  }
                }
              }
            } else {
              // Các đường Min/Max - xử lý tương tự standard data
              if (index === 0) {
                label = '0';
                labelUnit = useYearsOnXAxis ? 'năm' : 'ngày';
              } else {
                if (currentDataset && currentDataset.labels && currentDataset.labels[index]) {
                  const dayStr = currentDataset.labels[index];
                  if (useYearsOnXAxis) {
                    label = convertDaysToYearsString(parseFloat(dayStr));
                    labelUnit = 'năm';
                  } else {
                    label = dayStr;
                    labelUnit = 'ngày';
                  }
                } else {
                  if (useYearsOnXAxis) {
                    label = convertDaysToYearsString(index * 30);
                    labelUnit = 'năm';
                  } else {
                    label = (index * 30).toString();
                    labelUnit = 'ngày';
                  }
                }
              }
            }
            
            setTooltip({
              visible: true,
              x,
              y,
              value: `${value} ${unit}`,
              label: `${label} ${labelUnit}`,
              isPrediction: isPredictionData
            });
          }}
          style={{ borderRadius: 16 }}
        />
        {/* Tooltip nhỏ ngay tại mốc */}
        {tooltip.visible && (
          <View style={{
            position: 'absolute',
            left: Math.min(
              Math.max((tooltip.x || 0) - 40, 10), // Tránh bị cắt bên trái
              screenWidth - Math.max(140, screenWidth * 0.4) - 10 // Tránh bị cắt bên phải với width động
            ),
            top: Math.max(
              Math.min((tooltip.y || 0) - 60, chartHeight - 80), // Tránh bị cắt bên dưới
              20 // Tránh bị cắt bên trên
            ),
            backgroundColor: tooltip.isPrediction ? '#fff8e1' : '#f0f8ff',
            borderRadius: Math.max(6, screenWidth * 0.015),
            padding: Math.max(8, screenWidth * 0.02),
            borderWidth: 1,
            borderColor: tooltip.isPrediction ? '#FFA500' : '#007bff',
            zIndex: 10,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            minWidth: Math.max(80, screenWidth * 0.2),
            maxWidth: Math.max(160, screenWidth * 0.45), // Tăng maxWidth để hiển thị đủ text
            alignSelf: 'flex-start'
          }}>
            <Text style={{ 
              fontWeight: 'bold', 
              color: tooltip.isPrediction ? '#FFA500' : '#007bff', 
              fontSize: Math.max(11, Math.min(13, screenWidth / 28)),
              textAlign: 'center',
              marginBottom: 2
            }}>
              {tooltip.isPrediction && '📈 '}
              {tooltip.value}
            </Text>
            <Text style={{ 
              fontSize: Math.max(9, Math.min(11, screenWidth / 32)), 
              color: tooltip.isPrediction ? '#ff6b00' : '#333',
              fontStyle: tooltip.isPrediction ? 'italic' : 'normal',
              textAlign: 'center',
              flexWrap: 'wrap' // Cho phép text wrap nếu cần
            }}>
              {tooltip.label}
            </Text>
          </View>
        )}
      </>
    )}
  </View>

  {/* Bảng dữ liệu chi tiết nếu muốn hiển thị */}
  <DataTable data={tableData} selectedTab={selectedTab} />

  {/* Assessment section */}
  {assessmentData && (
    <View style={styles.assessmentContainer}>
      <View style={styles.assessmentHeader}>
        <Text style={styles.assessmentTitle}>📊 Đánh giá tăng trưởng mới nhất</Text>
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>
          Ngày đo: {new Date(assessmentData.measurementDate).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      
      {/* Current measurements */}
      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#007bff', marginBottom: 8 }}>
          Chỉ số hiện tại:
        </Text>
        <View style={styles.assessmentRow}>
          <Text style={styles.assessmentLabel}>Chiều cao:</Text>
          <Text style={styles.assessmentValue}>{assessmentData.height} cm</Text>
        </View>
        <View style={styles.assessmentRow}>
          <Text style={styles.assessmentLabel}>Cân nặng:</Text>
          <Text style={styles.assessmentValue}>{assessmentData.weight} kg</Text>
        </View>
        <View style={styles.assessmentRow}>
          <Text style={styles.assessmentLabel}>BMI:</Text>
          <Text style={styles.assessmentValue}>{assessmentData.bmi}</Text>
        </View>
        <View style={styles.assessmentRow}>
          <Text style={styles.assessmentLabel}>Vòng đầu:</Text>
          <Text style={styles.assessmentValue}>{assessmentData.headCircumference} cm</Text>
        </View>
      </View>

      {/* Assessment results */}
      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#007bff', marginBottom: 8 }}>
          Kết quả đánh giá:
        </Text>
        <View style={styles.assessmentRow}>
          <Text style={styles.assessmentLabel}>Chiều cao:</Text>
          <Text style={[styles.assessmentValue, { color: getStatusColor(assessmentData.assessments.heightStatus) }]}>
            {assessmentData.assessments.heightStatus}
          </Text>
        </View>
        <View style={styles.assessmentRow}>
          <Text style={styles.assessmentLabel}>Cân nặng:</Text>
          <Text style={[styles.assessmentValue, { color: getStatusColor(assessmentData.assessments.weightStatus) }]}>
            {assessmentData.assessments.weightStatus}
          </Text>
        </View>
        <View style={styles.assessmentRow}>
          <Text style={styles.assessmentLabel}>BMI:</Text>
          <Text style={[styles.assessmentValue, { color: getStatusColor(assessmentData.assessments.bmiStatus) }]}>
            {assessmentData.assessments.bmiStatus}
          </Text>
        </View>
        <View style={styles.assessmentRow}>
          <Text style={styles.assessmentLabel}>Vòng đầu:</Text>
          <Text style={[styles.assessmentValue, { color: getStatusColor(assessmentData.assessments.headCircumferenceStatus) }]}>
            {assessmentData.assessments.headCircumferenceStatus}
          </Text>
        </View>
      </View>

      {/* Recommendations */}
      {assessmentData.recommendations && (
        <View style={styles.recommendationsContainer}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#007bff', marginBottom: 8 }}>
            💡 Khuyến nghị:
          </Text>
          {assessmentData.recommendations.split('\n').filter(line => line.trim()).map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationsText}>
                {recommendation.replace(/^- /, '')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )}

  {/* Prediction section */}
  {allowPrediction && predictionData && (
    <View style={styles.predictionContainer}>
      <View style={styles.predictionHeader}>
        <Text style={styles.predictionTitle}>
          📈 Dự đoán tăng trưởng
        </Text>
      </View>
      
      {predictionData ? (
        <>
          {/* Medical Disclaimer - hiển thị đầu tiên */}
          {predictionData.medicalDisclaimer && (
            <View style={{ 
              backgroundColor: '#fff3cd', 
              borderColor: '#856404',
              borderWidth: 1,
              borderRadius: 8,
              padding: Math.max(12, screenWidth * 0.03),
              marginBottom: 15,
              borderLeftWidth: 4,
              borderLeftColor: '#dc3545'
            }}>
              <Text style={{ 
                fontSize: Math.max(13, screenWidth * 0.035),
                color: '#856404',
                fontWeight: 'bold',
                lineHeight: Math.max(20, screenWidth * 0.055),
                textAlign: 'center'
              }}>
                {predictionData.medicalDisclaimer}
              </Text>
            </View>
          )}


          {/* Prediction points */}
          {predictionData.predictionPoints && predictionData.predictionPoints.length > 0 && validActualData.length > 0 && (
            <View style={{ marginBottom: 15 }}>
              {(() => {
                // Giữ nguyên logic tìm prediction point (như code cũ)
                const lastActualPoint = validActualData[validActualData.length - 1];
                const targetPredictionDay = lastActualPoint.ageInDays + (lastActualPoint.ageInDays > 720 ? 360 : 30);
                const selectedPredictionPoint = predictionData.predictionPoints.reduce((closest, current) => {
                  const currentDiff = Math.abs(current.ageInDays - targetPredictionDay);
                  const closestDiff = Math.abs(closest.ageInDays - targetPredictionDay);
                  return currentDiff < closestDiff ? current : closest;
                });
                
                return (
                  <>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#ff6b00', marginBottom: 8 }}>
                      Dự đoán sau {Math.round((selectedPredictionPoint.ageInDays - lastActualPoint.ageInDays))} ngày:
                    </Text>
                    <View style={styles.predictionRow}>
                      <Text style={styles.predictionLabel}>Chiều cao:</Text>
                      <Text style={styles.predictionValue}>{selectedPredictionPoint.predictedHeight.toFixed(1)} cm</Text>
                    </View>
                    <View style={styles.predictionRow}>
                      <Text style={styles.predictionLabel}>Cân nặng:</Text>
                      <Text style={styles.predictionValue}>{selectedPredictionPoint.predictedWeight.toFixed(1)} kg</Text>
                    </View>
                    <View style={styles.predictionRow}>
                      <Text style={styles.predictionLabel}>BMI:</Text>
                      <Text style={styles.predictionValue}>{selectedPredictionPoint.predictedBMI.toFixed(1)}</Text>
                    </View>
                    <View style={styles.predictionRow}>
                      <Text style={styles.predictionLabel}>Vòng đầu:</Text>
                      <Text style={styles.predictionValue}>{selectedPredictionPoint.predictedHeadCircumference.toFixed(1)} cm</Text>
                    </View>
                  </>
                );
              })()}
            </View>
          )}

          {/* Prediction recommendations */}
          {predictionData.recommendations && (
            <View style={{ backgroundColor: '#fff', borderRadius: 4, padding: 8, marginBottom: 15 }}>
              <Text style={styles.predictionRecommendationsText}>
                {predictionData.recommendations}
              </Text>
            </View>
          )}

          {/* Data limitations */}
          {predictionData.dataLimitations && predictionData.dataLimitations.length > 0 && (
            <View style={{ 
              backgroundColor: '#fff', 
              borderColor: '#6c757d',
              borderWidth: 1,
              borderRadius: 4,
              padding: 8
            }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#6c757d', marginBottom: 5 }}>
                📋 Giới hạn dữ liệu:
              </Text>
              {predictionData.dataLimitations.map((limitation, index) => (
                <Text key={index} style={{ 
                  fontSize: 12, 
                  color: '#6c757d',
                  marginBottom: 3,
                  lineHeight: 16
                }}>
                  {limitation}
                </Text>
              ))}
            </View>
          )}
        </>
      ) : null}
    </View>
  )}

</ScrollView>

      {/* 4. Bảng dữ liệu chi tiết */}
      {/* <DataTable data={tableData} selectedTab={selectedTab} /> */}

    </ScrollView>
  );
};

export default ChartScreen;