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


// Updated DataTable component
const DataTable = ({ data, selectedTab, assessment }) => {
  // Determine the unit based on the selected tab
  const unit = selectedTab === 'Chiều cao' || selectedTab === 'Vòng đầu' ? ' cm' : selectedTab === 'Cân nặng' ? ' kg' : '';

  // Function to get status text style based on status value
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Bình thường':
        return styles.statusNormal;
      case 'Tăng nhẹ':
        return styles.statusMildIncrease;
      case 'Dự đoán':
        return styles.statusPredicted;
      // Add more cases for other statuses if needed
      default:
        return {}; // Default empty style
    }
  };

  return (
    <View style={styles.dataTableContainer}>
      

      {assessment && (
        <View style={styles.assessmentContainer}>
          <Text style={styles.assessmentTitle}>
            Đánh giá mới nhất ({new Date(assessment.measurementDate).toLocaleDateString('vi-VN')})
          </Text>
          <View style={styles.assessmentRow}>
            <Text style={styles.assessmentLabel}>Chiều cao:</Text>
            <Text style={styles.assessmentValue}>{`${assessment.height} cm - ${assessment.assessments.heightStatus}`}</Text>
          </View>
          <View style={styles.assessmentRow}>
            <Text style={styles.assessmentLabel}>Cân nặng:</Text>
            <Text style={styles.assessmentValue}>{`${assessment.weight} kg - ${assessment.assessments.weightStatus}`}</Text>
          </View>
          <View style={styles.assessmentRow}>
            <Text style={styles.assessmentLabel}>BMI:</Text>
            <Text style={styles.assessmentValue}>{`${assessment.bmi} - ${assessment.assessments.bmiStatus}`}</Text>
          </View>
          <View style={styles.assessmentRow}>
            <Text style={styles.assessmentLabel}>Vòng đầu:</Text>
            <Text style={styles.assessmentValue}>{`${assessment.headCircumference} cm - ${assessment.assessments.headCircumferenceStatus}`}</Text>
          </View>
          <Text style={[styles.assessmentTitle, { marginTop: 10 }]}>Khuyến nghị</Text>
          <Text style={styles.recommendationsText}>{assessment.recommendations}</Text>
        </View>
      )}
    </View>
  );
};

const ChartScreen = ({ navigation }) => {

  const [selectedTab, setSelectedTab] = useState('Chiều cao');

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childGrowthData, setChildGrowthData] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [heightStandardData, setHeightStandardData] = useState([]);
  const [weightStandardData, setWeightStandardData] = useState([]);
  const [headCircumferenceStandardData, setHeadCircumferenceStandardData] = useState([]);
  const [bmiStandardData, setBMIStandardData] = useState([]);

  // Tooltip state
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: '', label: '' });

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
        setAssessment(null);
        setHeightStandardData([]);
        setWeightStandardData([]);
        setHeadCircumferenceStandardData([]);
        setBMIStandardData([]);
        return;
      }
      // Lấy gender từ danh sách children
      const gender = children.find(child => child.childId === selectedChildId)?.gender || 'male';
      try {
        const result = await getFullGrowthData(selectedChildId, gender);
        setChildGrowthData(result.growthData);
        setAssessment(result.assessment);
        setHeightStandardData(result.heightStandardData);
        setWeightStandardData(result.weightStandardData);
        setHeadCircumferenceStandardData(result.headCircumferenceStandardData);
        setBMIStandardData(result.bmiStandardData);
      } catch (err) {
        setChildGrowthData(null);
        setAssessment(null);
        setHeightStandardData([]);
        setWeightStandardData([]);
        setHeadCircumferenceStandardData([]);
        setBMIStandardData([]);
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


  const getChartAndTableData = (tab) => {
    const data = childGrowthData?.data?.[tab] || [];
    const validData = data.filter(item => typeof item.value === 'number' && isFinite(item.value));
    // Không hiện gì ở trục Ox
    let labels = [];
    let values = validData.map(item => item.value);
    if (values.length === 1) {
      values = [values[0], null];
    }
    let datasets = [{ data: values, color: (opacity = 1) => `rgba(0,123,255,${opacity})` }];
    let legend = [tab];
    if (tab === 'Chiều cao' && heightStandardData.length > 0) {
      const medianValues = heightStandardData.map(item => item.median);
      datasets.push({
        data: medianValues,
        color: (opacity = 1) => `rgba(255,99,132,${opacity})`,
        withDots: true,
        propsForDots: { r: '5', strokeWidth: '2', stroke: '#ff6384', fill: '#ff6384' }
      });
      legend.push('Chuẩn (median)');
    }
    if (tab === 'Cân nặng' && weightStandardData.length > 0) {
      const medianValues = weightStandardData.map(item => item.median);
      datasets.push({
        data: medianValues,
        color: (opacity = 1) => `rgba(255,99,132,${opacity})`,
        withDots: true,
        propsForDots: { r: '5', strokeWidth: '2', stroke: '#ff6384', fill: '#ff6384' }
      });
      legend.push('Chuẩn (median)');
    }
    if (tab === 'Vòng đầu' && headCircumferenceStandardData.length > 0) {
      const medianValues = headCircumferenceStandardData.map(item => item.median);
      datasets.push({
        data: medianValues,
        color: (opacity = 1) => `rgba(255,99,132,${opacity})`,
        withDots: true,
        propsForDots: { r: '5', strokeWidth: '2', stroke: '#ff6384', fill: '#ff6384' }
      });
      legend.push('Chuẩn (median)');
    }
    if (tab === 'BMI' && bmiStandardData.length > 0) {
      const medianValues = bmiStandardData.map(item => item.median);
      datasets.push({
        data: medianValues,
        color: (opacity = 1) => `rgba(255,99,132,${opacity})`,
        withDots: true,
        propsForDots: { r: '5', strokeWidth: '2', stroke: '#ff6384', fill: '#ff6384' }
      });
      legend.push('Chuẩn (median)');
    }
    const chartKitData = {
      labels,
      datasets,
      legend
    };
    return { chartKitData, tableData: validData };
  };
  

  // Get the chart and table data based on the current selection
  const { chartKitData, tableData } = getChartAndTableData(selectedTab);

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
      <View style={styles.header}>
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

<ScrollView style={{ paddingHorizontal: 16 }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
    Biểu đồ {selectedTab.toLowerCase()} ({selectedTab === 'Chiều cao' || selectedTab === 'Vòng đầu' ? 'cm' : selectedTab === 'Cân nặng' ? 'kg' : 'BMI'})
  </Text>

  <View style={{ minHeight: 220, justifyContent: 'center' }}>
    {chartKitData.datasets[0].data.length > 0 && (
      <>
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
            yAxisSuffix: '' // Không có đơn vị ở trục Oy
          }}
          withShadow={false}
          onDataPointClick={({ value, index, x, y }) => {
            let unit = '';
            if (selectedTab === 'Chiều cao' || selectedTab === 'Vòng đầu') unit = 'cm';
            else if (selectedTab === 'Cân nặng') unit = 'kg';
            else if (selectedTab === 'BMI') unit = '';
            // Lấy lại label gốc (số ngày/tháng)
            const label = tableData[index]?.ageInDays;
            let labelUnit = '';
            if (selectedTab === 'Chiều cao' || selectedTab === 'Cân nặng' || selectedTab === 'Vòng đầu') labelUnit = 'ngày';
            else if (selectedTab === 'BMI') labelUnit = '';
            setTooltip({
              visible: true,
              x,
              y,
              value: `${value} ${unit}`,
              label: `${label} ${labelUnit}`
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
            <Text style={{ fontWeight: 'bold', color: '#007bff', fontSize: 14 }}>{tooltip.value}</Text>
            <Text style={{ fontSize: 12, color: '#333' }}>{tooltip.label}</Text>
          </View>
        )}
      </>
    )}
  </View>

  {/* Bảng dữ liệu chi tiết nếu muốn hiển thị */}
  <DataTable data={tableData} selectedTab={selectedTab} assessment={assessment} />
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
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  assessmentLabel: {
    fontSize: 14,
    color: '#333',
  },
  assessmentValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  recommendationsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

// Replace the original styles object with the combined styles
const styles = combinedStyles;

export default ChartScreen;