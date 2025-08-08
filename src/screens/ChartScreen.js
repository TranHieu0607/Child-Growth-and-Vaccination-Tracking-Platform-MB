import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, Modal, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { LineChart } from 'react-native-chart-kit';
import childrenApi from '../store/api/childrenApi';
import { getFullGrowthData } from '../store/api/growthApi';

// Placeholder components
const TabBar = ({ selectedTab, onSelectTab }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 }}>
    {['Chiều cao', 'Cân nặng', 'Vòng đầu', 'BMI'].map((tab) => (
      <TouchableOpacity
        key={tab}
        onPress={() => onSelectTab(tab)}
        style={{ padding: 8, borderBottomWidth: selectedTab === tab ? 2 : 0, borderBottomColor: 'blue' }}
      >
        <Text style={{ color: selectedTab === tab ? 'blue' : 'black', fontWeight: selectedTab === tab ? 'bold' : 'normal' }}>
          {tab}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// Chart Type Tab Bar (Actual vs Standard)
const ChartTypeTabBar = ({ selectedChartType, onSelectChartType }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, marginBottom: 10 }}>
    {['Thực tế', 'Tiêu chuẩn'].map((type) => (
      <TouchableOpacity
        key={type}
        onPress={() => onSelectChartType(type)}
        style={{ 
          padding: 12, 
          marginHorizontal: 8,
          borderBottomWidth: selectedChartType === type ? 3 : 0, 
          borderBottomColor: selectedChartType === type ? (type === 'Thực tế' ? '#007bff' : '#ff6384') : 'transparent',
          backgroundColor: selectedChartType === type ? (type === 'Thực tế' ? '#e7f3ff' : '#ffe7eb') : 'transparent',
          borderRadius: 8
        }}
      >
        <Text style={{ 
          color: selectedChartType === type ? (type === 'Thực tế' ? '#007bff' : '#ff6384') : '#666', 
          fontWeight: selectedChartType === type ? 'bold' : 'normal',
          fontSize: 16
        }}>
          {type}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);


// Updated DataTable component
const DataTable = ({ data, selectedTab }) => {
  // Determine the unit based on the selected tab
  const unit = selectedTab === 'Chiều cao' || selectedTab === 'Vòng đầu' ? ' cm' : selectedTab === 'Cân nặng' ? ' kg' : '';

  // Function to get status text style based on status value
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Bình thường':
        return styles.statusNormal;
      case 'Tăng nhẹ':
        return styles.statusMildIncrease;
      // Add more cases for other statuses if needed
      default:
        return {}; // Default empty style
    }
  };

  return (
    <View style={styles.dataTableContainer}>
    </View>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  if (!status) return '#000';
  
  const normalStatuses = ['Bình thường', 'Chuẩn', 'Normal'];
  const warningStatuses = ['Tăng nhẹ', 'Giảm nhẹ', 'Hơi thấp', 'Hơi cao'];
  const dangerStatuses = ['Thấp còi', 'Thấp còi nặng', 'Béo phì', 'Béo phì nặng', 'Suy dinh dưỡng', 'Microcephaly', 'Đầu rất nhỏ'];
  
  if (normalStatuses.some(s => status.includes(s))) return '#28a745'; // Green
  if (warningStatuses.some(s => status.includes(s))) return '#ffc107'; // Yellow
  if (dangerStatuses.some(s => status.includes(s))) return '#dc3545'; // Red
  
  return '#6c757d'; // Default gray
};

const ChartScreen = ({ navigation }) => {

  const [selectedTab, setSelectedTab] = useState('Chiều cao');
  const [selectedChartType, setSelectedChartType] = useState('Thực tế'); // New state for chart type

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childGrowthData, setChildGrowthData] = useState(null);
  const [heightStandardData, setHeightStandardData] = useState([]);
  const [weightStandardData, setWeightStandardData] = useState([]);
  const [headCircumferenceStandardData, setHeadCircumferenceStandardData] = useState([]);
  const [bmiStandardData, setBMIStandardData] = useState([]);

  // Assessment state
  const [assessmentData, setAssessmentData] = useState(null);

  // Tooltip state
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: '', label: '', isPrediction: false });

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

  useEffect(() => {
    const fetchAllDataForChild = async () => {
      if (!selectedChildId) {
        setChildGrowthData(null);
        setHeightStandardData([]);
        setWeightStandardData([]);
        setHeadCircumferenceStandardData([]);
        setBMIStandardData([]);
        setAssessmentData(null);
        return;
      }
      // Lấy gender từ danh sách children
      const gender = children.find(child => child.childId === selectedChildId)?.gender || 'male';
      try {
        // Fetch growth data and assessment in parallel
        const [growthResult, assessmentResult] = await Promise.all([
          getFullGrowthData(selectedChildId, gender),
          childrenApi.getLatestGrowthAssessment(selectedChildId)
        ]);

        // Set growth data
        setChildGrowthData(growthResult.growthData);
        setHeightStandardData(growthResult.heightStandardData);
        setWeightStandardData(growthResult.weightStandardData);
        setHeadCircumferenceStandardData(growthResult.headCircumferenceStandardData);
        setBMIStandardData(growthResult.bmiStandardData);

        // Set assessment data
        setAssessmentData(assessmentResult.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setChildGrowthData(null);
        setHeightStandardData([]);
        setWeightStandardData([]);
        setHeadCircumferenceStandardData([]);
        setBMIStandardData([]);
        setAssessmentData(null);
      }
    };
    fetchAllDataForChild();
  }, [selectedChildId, children]);


  const handleSelectChildPress = () => {

    setIsDropdownVisible(!isDropdownVisible);
    console.log('Select child pressed!');
  };


  const handleSelectChild = (childId) => {
    setSelectedChildId(childId);
    setIsDropdownVisible(false);
    console.log('Selected child ID:', childId);
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


  const getChartAndTableData = (tab, chartType) => {
    const data = childGrowthData?.data?.[tab] || [];
    const validData = data.filter(item => typeof item.value === 'number' && isFinite(item.value));
    
    // Chỉ lấy dữ liệu thực tế
    const actualData = validData.filter(item => item.status !== 'Dự đoán');

    if (chartType === 'Thực tế') {
      // Dataset thực tế: thêm điểm 0 ở đầu, sau đó các điểm thực tế
      let actualValues = [0, ...actualData.map(item => item.value)];
      
      // Tạo labels cho trục X của dữ liệu thực tế (ngày)
      let actualLabels = ['0', ...actualData.map(item => item.ageInDays.toString())];

      let datasets = [
        {
          data: actualValues,
          color: (opacity = 1) => `rgba(0,123,255,${opacity})`, 
          strokeWidth: 2,
          withDots: true,
        }
      ];

      const chartKitData = {
        labels: actualLabels,
        datasets,
        legend: []
      };
      return { chartKitData, tableData: actualData };
    } else {
      // Chart type === 'Tiêu chuẩn'
      let standardData = [];
      if (tab === 'Chiều cao') standardData = heightStandardData;
      else if (tab === 'Cân nặng') standardData = weightStandardData;
      else if (tab === 'Vòng đầu') standardData = headCircumferenceStandardData;
      else if (tab === 'BMI') standardData = bmiStandardData;

      if (standardData.length === 0) {
        // No standard data available
        const chartKitData = {
          labels: ['0'],
          datasets: [{ data: [0], color: (opacity = 1) => `rgba(255,99,132,${opacity})` }],
          legend: []
        };
        return { chartKitData, tableData: [] };
      }

      const medianValues = [0, ...standardData.map(item => item.median)];
      const standardLabels = ['0', ...standardData.map(item => item.month.toString())];
      
      let datasets = [
        {
          data: medianValues,
          color: (opacity = 1) => `rgba(255,99,132,${opacity})`,
          withDots: true,
          strokeWidth: 2,
          propsForDots: { r: '5', strokeWidth: '2', stroke: '#ff6384', fill: '#ff6384' }
        }
      ];

      const chartKitData = {
        labels: standardLabels,
        datasets,
        legend: []
      };
      
      // Convert standard data for table display
      const standardTableData = standardData.map(item => ({
        ageInDays: item.month * 30, // Approximate conversion for display
        ageInMonths: item.month,
        value: item.median,
        status: 'Chuẩn',
        measurementDate: null // Standard data doesn't have measurement dates
      }));
      
      return { chartKitData, tableData: standardTableData };
    }
  };
  

  // Get the chart and table data based on the current selection
  const { chartKitData, tableData } = getChartAndTableData(selectedTab, selectedChartType);
  // Ẩn legend mặc định
  chartKitData.legend = [];

  // Get screen width to make chart responsive (subtracting container padding)
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32; // 16 padding on each side

  // Tooltip auto-hide effect
  useEffect(() => {
    let timer;
    if (tooltip.visible) {
      timer = setTimeout(() => setTooltip(t => ({ ...t, visible: false })), 2000);
    }
    return () => clearTimeout(timer);
  }, [tooltip.visible]);

  return (
    <ScrollView style={styles.container}>
      {/* 1. Header Hồ sơ Trẻ */}
      <View style={{...styles.header, marginTop: 20}}>
        {/* Back button - Adjust navigation target if needed */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        {/* Corrected header title */}
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Biểu đồ tăng trưởng</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <View style={styles.childInfo}>
    {/* Display profile image of the first selected child */}
    {/* Use selectedChildId as we are back to single select in display */}
    {selectedChildId && (
      <Image
        source={children.find(child => child.childId === selectedChildId)?.image || require('../../assets/vnvc.jpg')}
        style={styles.profileImage}
      />
    )}
    <View>
      {/* Display name of the first selected child */}
      {/* Use selectedChildId as we are back to single select in display */}
      {selectedChildId && (
        <Text style={styles.childName}>
          {children.find(child => child.childId === selectedChildId)?.fullName}
        </Text>
      )}
      {/* Display age of the first selected child */}
      {/* Use selectedChildId as we are back to single select in display */}
      {selectedChildId && (
        <Text style={styles.childAge}>
          {calculateAge(children.find(child => child.childId === selectedChildId)?.dateOfBirth)}
        </Text>
      )}
    </View>
  </View>

  {/* Dropdown icon nằm bên phải */}
  {/* Add onPress handler */}
  <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleSelectChildPress}>
    <FontAwesomeIcon icon={faChevronDown} size={20} color="black" />
  </TouchableOpacity>
</View>

{/* Child Selection Dropdown */}
{isDropdownVisible && (
  <View style={styles.dropdownContainer}>
    <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll}>
      {children.map(child => (
        <TouchableOpacity
          key={child.childId}
          style={styles.dropdownItem}
          onPress={() => handleSelectChild(child.childId)}
        >
          {/* Add child image */}
          <Image
            source={child.image || require('../../assets/vnvc.jpg')}
            style={styles.dropdownItemImage}
          />
          <View style={styles.dropdownItemTextContainer}>
            <Text style={styles.dropdownItemName}>{child.fullName}</Text>
            <Text style={styles.dropdownItemAge}>{calculateAge(child.dateOfBirth)}</Text>
          </View>
          {/* Indicate selected child */}
          {selectedChildId === child.childId && <Text style={styles.selectedIcon}> ✅</Text>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
)}


      {/* 2. Tab phân loại biểu đồ */}
      <TabBar selectedTab={selectedTab} onSelectTab={setSelectedTab} />
      
      {/* 3. Chart Type Tab Bar */}
      <ChartTypeTabBar selectedChartType={selectedChartType} onSelectChartType={setSelectedChartType} />

<ScrollView style={{ paddingHorizontal: 16 }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
    Biểu đồ {selectedTab.toLowerCase()} - {selectedChartType} ({selectedTab === 'Chiều cao' || selectedTab === 'Vòng đầu' ? 'cm' : selectedTab === 'Cân nặng' ? 'kg' : 'BMI'})
  </Text>

  {/* Single Chart Legend */}
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'center' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ 
        width: 16, 
        height: 4, 
        backgroundColor: selectedChartType === 'Thực tế' ? '#007bff' : '#ff6384', 
        borderRadius: 2, 
        marginRight: 4 
      }} />
      <Text style={{ 
        color: selectedChartType === 'Thực tế' ? '#007bff' : '#ff6384', 
        fontWeight: 'bold' 
      }}>
        {selectedChartType}
      </Text>
    </View>
  </View>

  <View style={{ minHeight: 280, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
    {chartKitData.datasets[0].data.length > 0 && (
      <>
        {/* Y-axis label (at the top-left of Y-axis) */}
        <View style={{
          position: 'absolute',
          left: 10,
          top: 30,
          zIndex: 5
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: selectedChartType === 'Thực tế' ? '#007bff' : '#ff6384',
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
          bottom: 10,
          left: 0,
          right: 0,
          zIndex: 5
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: selectedChartType === 'Thực tế' ? '#007bff' : '#ff6384',
            textAlign: 'center'
          }}>
            {selectedChartType === 'Thực tế' ? 'ngày' : 'tháng'}
          </Text>
        </View>

        <LineChart
          data={chartKitData}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0,123,255,${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            propsForDots: { r: '5', strokeWidth: '2', stroke: '#007bff' },
            formatYLabel: (value) => value.toFixed(1), // Hiển thị 1 chữ số thập phân
            formatXLabel: (value) => {
              // Chỉ hiển thị số, không hiển thị đơn vị để tránh bị dính
              if (value.includes('/')) {
                const parts = value.split('/');
                return parts[0].length <= 3 ? parts[0] : `${parts[0].substring(0,2)}..`;
              }
              return value.length <= 4 ? value : `${value.substring(0,3)}..`;
            }
          }}
          withShadow={false}
          fromZero={true} // Bắt đầu từ 0 - trục Y sẽ luôn bắt đầu từ 0
          segments={5} // Chia trục Y thành 5 phần để hiển thị rõ hơn
          onDataPointClick={({ value, index, x, y, datasetIndex }) => {
            let unit = '';
            if (selectedTab === 'Chiều cao' || selectedTab === 'Vòng đầu') unit = 'cm';
            else if (selectedTab === 'Cân nặng') unit = 'kg';
            else if (selectedTab === 'BMI') unit = '';
            
            let label = '';
            let labelUnit = '';
            
            // Kiểm tra loại biểu đồ hiện tại
            if (selectedChartType === 'Thực tế') {
              // Biểu đồ thực tế - hiển thị ngày
              if (index === 0) {
                // Điểm đầu tiên là điểm 0
                label = '0';
                labelUnit = 'ngày';
              } else {
                // Lấy ngày từ tableData thực tế
                const dataPoint = tableData[index - 1]; // index - 1 vì có thêm điểm 0 ở đầu
                label = dataPoint?.ageInDays || '';
                labelUnit = 'ngày';
              }
            } else {
              // Biểu đồ tiêu chuẩn - hiển thị tháng
              if (index === 0) {
                // Điểm đầu tiên là điểm 0
                label = '0';
                labelUnit = 'tháng';
              } else {
                // Lấy tháng từ standardData tương ứng
                let standardData = [];
                if (selectedTab === 'Chiều cao') standardData = heightStandardData;
                else if (selectedTab === 'Cân nặng') standardData = weightStandardData;
                else if (selectedTab === 'Vòng đầu') standardData = headCircumferenceStandardData;
                else if (selectedTab === 'BMI') standardData = bmiStandardData;
                
                const monthData = standardData[index - 1]; // index - 1 vì có thêm điểm 0 ở đầu
                label = monthData?.month || '';
                labelUnit = 'tháng';
              }
            }
            
            setTooltip({
              visible: true,
              x,
              y,
              value: `${value} ${unit}`,
              label: `${label} ${labelUnit}`,
              isPrediction: false
            });
          }}
          style={{ borderRadius: 16 }}
        />
        {/* Tooltip nhỏ ngay tại mốc */}
        {tooltip.visible && (
          <View style={{
            position: 'absolute',
            left: (tooltip.x || 0) + 8, // 8 để tránh che điểm
            top: (tooltip.y || 0) + 8, // 8 để tránh che điểm
            backgroundColor: 'white',
            borderRadius: 6,
            padding: 6,
            borderWidth: 1,
            borderColor: '#007bff',
            zIndex: 10,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            minWidth: 60
          }}>
            <Text style={{ 
              fontWeight: 'bold', 
              color: '#007bff', 
              fontSize: 14 
            }}>
              {tooltip.value}
            </Text>
            <Text style={{ fontSize: 12, color: '#333' }}>{tooltip.label}</Text>
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
</ScrollView>


      {/* 4. Bảng dữ liệu chi tiết */}
      {/* <DataTable data={tableData} selectedTab={selectedTab} /> */}

    </ScrollView>
  );
};

// Combine all styles
const combinedStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allows child info to take available space
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 10, // Space between back button and child info
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  childAge: {
    fontSize: 14,
    color: '#555',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  selectedTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff', // Blue underline
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  selectedTabText: {
    color: '#007bff', // Blue text for selected tab
    fontWeight: 'bold',
  },
  chartArea: {
    marginBottom: 20,
  },
  chartAreaContent: {
    alignItems: 'center', // Center the chart horizontally when using ScrollView
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoIcon: {
    position: 'absolute',
    top: 0, // Adjust position as needed
    right: 0, // Adjust position as needed
  },
  dataTableContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    marginBottom: 20, // Add some space below the table
    borderRadius: 5, // Optional: add rounded corners
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#555',
  },
  tableBodyScroll: {
    maxHeight: 200, // Limit height for scrollability if table is long
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#eee',
  },
  tableCell: {
    fontSize: 14,
  },
  statusText: {
    // Base style for status text
    fontSize: 14,
  },
  statusNormal: {
    color: 'green', // Green for 'Bình thường'
  },
  statusMildIncrease: {
    color: 'orange', // Orange for 'Tăng nhẹ'
  },
  statusPredicted: {
    color: '#888', // Gray for 'Dự đoán'
    fontStyle: 'italic', // Optional: make predicted text italic
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1, // Ensure the dropdown appears above other content
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 16, // Add horizontal margin to align with container
    marginBottom: 10, // Space between dropdown and tabs
    marginTop: -5, // Adjust to slightly overlap the child info area for visual connection
  },
  dropdownScroll: {
    maxHeight: 150, // Limit height for scrollability if there are many children
  },
   dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15, // Add horizontal padding
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemImage: {
    width: 30, // Adjust size as needed
    height: 30, // Adjust size as needed
    borderRadius: 15, // Make it round
    marginRight: 10, // Space between image and text
  },
  dropdownItemTextContainer: {
    flex: 1, // Allows text to take available space
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
  },
  assessmentContainer: {
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#007bff', // Blue border to distinguish from prediction
    paddingTop: 15,
    backgroundColor: '#f8f9fa', // Light gray-blue background
    borderRadius: 12,
    padding: 16,
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
    paddingBottom: 8,
    marginBottom: 10,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  assessmentLabel: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  assessmentValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  recommendationsContainer: {
    backgroundColor: '#fff',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
    padding: 12,
    marginTop: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  recommendationBullet: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#0056b3',
    flex: 1,
    flexWrap: 'wrap',
  },
  noRecommendationsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  // Prediction styles - khác biệt với assessment
  predictionContainer: {
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#ffa500', // Orange border to distinguish from assessment
    paddingTop: 15,
    backgroundColor: '#fff8f0', // Light orange background
    borderRadius: 8,
    padding: 12,
  },
  predictionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ffa500',
    paddingBottom: 8,
    marginBottom: 10,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b00', // Orange text
    marginBottom: 10,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#ff6b00',
    fontWeight: '600',
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b00',
    fontStyle: 'italic', // Make prediction values italic
  },
  predictionRecommendationsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#d2691e', // Darker orange for recommendations
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ffa500',
  },
});

// Replace the original styles object with the combined styles
const styles = combinedStyles;

export default ChartScreen;