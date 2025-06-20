import React from 'react';
import { View, Text, TouchableOpacity, ScrollView,  StyleSheet, Image, Dimensions, Modal } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { LineChart } from 'react-native-chart-kit';

// Placeholder components
const TabBar = ({ selectedTab, onSelectTab }) => (
  <View style={styles.tabBar}>
    {['Chiều cao', 'Cân nặng', 'Vòng đầu', 'BMI'].map((tab, index) => (
      <TouchableOpacity
        key={tab}
        style={[styles.tabButton, selectedTab === tab && styles.selectedTabButton]}
        onPress={() => onSelectTab(tab)}
      >
        <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText]}>{tab}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// Updated DataTable component
const DataTable = ({ data, selectedTab }) => {
  // Determine the unit based on the selected tab
  const unit = selectedTab === 'Chiều cao' ? ' cm' : selectedTab === 'Cân nặng' ? ' kg' : selectedTab === 'Vòng đầu' ? ' cm' : '';

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
      <Text style={styles.tableTitle}>Bảng dữ liệu chi tiết</Text>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Tháng tuổi</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Giá trị</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Trạng thái</Text>
      </View>
      {/* Table Rows */}
      <ScrollView nestedScrollEnabled={true} style={styles.tableBodyScroll}>
        {data.length > 0 ? data.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.month}</Text>
            {/* Display value with unit */}
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.value}{unit}</Text>
            {/* Display status with color */}
            <Text style={[styles.tableCell, styles.statusText, getStatusStyle(item.status), { flex: 2, textAlign: 'right' }]}>{item.status}</Text>
          </View>
        )) : (
          <Text style={styles.noDataText}>Không có dữ liệu để hiển thị.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const ChartScreen = ({ navigation }) => {

  const [selectedTab, setSelectedTab] = React.useState('Chiều cao');

  const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
  const childName = "Nguyễn Minh Khôi"; 
  const childAge = "3 tuổi"; 
  const profileImage = require('../../assets/vnvc.jpg'); 

  const [children, setChildren] = React.useState([
    { id: 'child1', name: 'Nguyễn Minh Khôi', age: '3 tuổi', image: require('../../assets/vnvc.jpg') },
    { id: 'child2', name: 'Lê Thu Anh', age: '2 tuổi', image: require('../../assets/vnvc.jpg') },
    { id: 'child3', name: 'Trần Văn Bình', age: '4 tuổi', image: require('../../assets/vnvc.jpg') },
  ]);
  const [selectedChildren, setSelectedChildren] = React.useState(['child1']); 

  const [allChildrenGrowthData, setAllChildrenGrowthData] = React.useState([
    {
      childId: 'child1',
      data: {
        'Chiều cao': [
          { month: 24, value: 95, status: 'Bình thường' },
          { month: 27, value: 97, status: 'Bình thường' },
          { month: 30, value: 99, status: 'Bình thường' },
          { month: 33, value: 101, status: 'Bình thường' },
          { month: 36, value: 103, status: 'Bình thường' },
        ],
        'Cân nặng': [
          { month: 24, value: 13, status: 'Bình thường' },
          { month: 27, value: 14, status: 'Bình thường' },
          { month: 30, value: 15, status: 'Bình thường' },
          { month: 33, value: 16, status: 'Bình thường' },
          { month: 36, value: 17, status: 'Bình thường' },
        ],
        'Vòng đầu': [
          { month: 24, value: 48, status: 'Bình thường' },
          { month: 27, value: 48.5, status: 'Bình thường' },
          { month: 30, value: 49, status: 'Bình thường' },
          { month: 33, value: 49.5, status: 'Bình thường' },
          { month: 36, value: 50, status: 'Bình thường' },
        ],
        'BMI': [
          { month: 24, value: 15.5, status: 'Bình thường' },
          { month: 27, value: 15.8, status: 'Bình thường' },
          { month: 30, value: 16, status: 'Bình thường' },
          { month: 33, value: 16.2, status: 'Bình thường' },
          { month: 36, value: 16.5, status: 'Bình thường' },
        ],
      },
    },
    {
      childId: 'child2',
      data: {
        'Chiều cao': [
          { month: 24, value: 93, status: 'Bình thường' },
          { month: 27, value: 95, status: 'Bình thường' },
          { month: 30, value: 97, status: 'Bình thường' },
          { month: 33, value: 99, status: 'Bình thường' },
          { month: 36, value: 101, status: 'Bình thường' },
        ],
        'Cân nặng': [
          { month: 24, value: 12.5, status: 'Bình thường' },
          { month: 27, value: 13.5, status: 'Bình thường' },
          { month: 30, value: 14.5, status: 'Bình thường' },
          { month: 33, value: 15.5, status: 'Bình thường' },
          { month: 36, value: 16.5, status: 'Bình thường' },
        ],
        'Vòng đầu': [
          { month: 24, value: 47.5, status: 'Bình thường' },
          { month: 27, value: 48, status: 'Bình thường' },
          { month: 30, value: 48.5, status: 'Bình thường' },
          { month: 33, value: 49, status: 'Bình thường' },
          { month: 36, value: 49.5, status: 'Bình thường' },
        ],
        'BMI': [
          { month: 24, value: 15.2, status: 'Bình thường' },
          { month: 27, value: 15.6, status: 'Bình thường' },
          { month: 30, value: 15.9, status: 'Bình thường' },
          { month: 33, value: 16.1, status: 'Bình thường' },
          { month: 36, value: 16.4, status: 'Bình thường' },
        ],
      },
    },
    {
      childId: 'child3',
      data: {
        'Chiều cao': [
          { month: 24, value: 93, status: 'Bình thường' },
          { month: 27, value: 95, status: 'Bình thường' },
          { month: 30, value: 97, status: 'Bình thường' },
          { month: 33, value: 99, status: 'Bình thường' },
          { month: 36, value: 101, status: 'Bình thường' },
        ],
        'Cân nặng': [
          { month: 24, value: 12.5, status: 'Bình thường' },
          { month: 27, value: 13.5, status: 'Bình thường' },
          { month: 30, value: 14.5, status: 'Bình thường' },
          { month: 33, value: 15.5, status: 'Bình thường' },
          { month: 36, value: 16.5, status: 'Bình thường' },
        ],
        'Vòng đầu': [
          { month: 24, value: 47.5, status: 'Bình thường' },
          { month: 27, value: 48, status: 'Bình thường' },
          { month: 30, value: 48.5, status: 'Bình thường' },
          { month: 33, value: 49, status: 'Bình thường' },
          { month: 36, value: 49.5, status: 'Bình thường' },
        ],
        'BMI': [
          { month: 24, value: 15.2, status: 'Bình thường' },
          { month: 27, value: 15.6, status: 'Bình thường' },
          { month: 30, value: 15.9, status: 'Bình thường' },
          { month: 33, value: 16.1, status: 'Bình thường' },
          { month: 36, value: 16.4, status: 'Bình thường' },
        ],
      },
    },
  ]);


  const handleSelectChildPress = () => {

    setIsDropdownVisible(!isDropdownVisible);
    console.log('Select child pressed!'); 
  };


  const handleSelectChild = (childId) => {
    setSelectedChildren([childId]); 
    setIsDropdownVisible(false); 
    console.log('Selected child ID:', childId);
  };


  const getChartAndTableData = (childrenIds, tab) => {
    if (!childrenIds || childrenIds.length === 0) {
      return { chartKitData: { labels: [], datasets: [] }, tableData: [] };
    }

    // Get data for the selected children and tab
    const dataForSelectedChildren = allChildrenGrowthData
      .filter(data => childrenIds.includes(data.childId))
      .map(data => ({
        childId: data.childId,
        metricData: data.data[tab] || [],
      }));

    // Collect all unique months from selected children's data for the current metric
    const allMonths = Array.from(
      new Set(dataForSelectedChildren.flatMap(child => child.metricData.map(item => item.month)))
    ).sort((a, b) => a - b);

    // Generate datasets for each selected child
    const datasets = dataForSelectedChildren.map((childInfo, index) => {
      // Map existing data points to the collected months, using null for missing months
      const dataPoints = allMonths.map(month => {
        const dataPoint = childInfo.metricData.find(item => item.month === month);
        return dataPoint ? dataPoint.value : null; // Use null for missing data points
      });

      // Assign a color based on index (can be improved for more distinct colors if needed)
      const colors = [
        (opacity = 1) => `rgba(0, 123, 255, ${opacity})`, // Blue
        (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Red
        (opacity = 1) => `rgba(255, 159, 64, ${opacity})`, // Orange
        (opacity = 1) => `rgba(75, 192, 192, ${opacity})`, // Green
        (opacity = 1) => `rgba(153, 102, 255, ${opacity})`, // Purple
      ];

      return {
        data: dataPoints,
        color: colors[index % colors.length], // Cycle through colors
        // Add a label for the legend (optional but good practice)
        name: children.find(c => c.id === childInfo.childId)?.name || `Child ${index + 1}`,
      };
    });

    const chartKitData = {
      // Add " Tháng" to each label on the X-axis
      labels: allMonths.map(month => `${month} Tháng`),
      datasets: datasets,
      legend: selectedChildren.length > 1 ? datasets.map(d => d.name) : undefined, // Show legend if multiple children selected
    };

    // For the table, we can show the combined data or data for the first selected child.
    // Let's show data for the first selected child for simplicity in the table.
    const tableData = dataForSelectedChildren.length > 0 ? dataForSelectedChildren[0].metricData : [];

    return { chartKitData, tableData };
  };

  // Get the chart and table data based on the current selection
  const { chartKitData, tableData } = getChartAndTableData(selectedChildren, selectedTab);

  // Get screen width to make chart responsive (subtracting container padding)
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32; // 16 padding on each side

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
    {/* Use selectedChildren[0] as we are back to single select in display */}
    {selectedChildren.length > 0 && (
      <Image
        source={children.find(child => child.id === selectedChildren[0])?.image || require('../../assets/vnvc.jpg')}
        style={styles.profileImage}
      />
    )}
    <View>
      {/* Display name of the first selected child */}
      {/* Use selectedChildren[0] as we are back to single select in display */}
      {selectedChildren.length > 0 && (
        <Text style={styles.childName}>
          {children.find(child => child.id === selectedChildren[0])?.name}
        </Text>
      )}
      {/* Display age of the first selected child */}
      {/* Use selectedChildren[0] as we are back to single select in display */}
      {selectedChildren.length > 0 && (
        <Text style={styles.childAge}>
          {children.find(child => child.id === selectedChildren[0])?.age}
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
          key={child.id}
          style={styles.dropdownItem}
          onPress={() => handleSelectChild(child.id)}
        >
          {/* Add child image */}
          <Image
            source={child.image || require('../../assets/vnvc.jpg')}
            style={styles.dropdownItemImage}
          />
          <View style={styles.dropdownItemTextContainer}>
            <Text style={styles.dropdownItemName}>{child.name}</Text>
            <Text style={styles.dropdownItemAge}>{child.age}</Text>
          </View>
          {/* Indicate selected child */}
          {selectedChildren[0] === child.id && <Text style={styles.selectedIcon}> ✅</Text>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
)}


      {/* 2. Tab phân loại biểu đồ */}
      <TabBar selectedTab={selectedTab} onSelectTab={setSelectedTab} />

      {/* 3. Vùng biểu đồ phát triển */}
      <ScrollView style={styles.chartArea} contentContainerStyle={styles.chartAreaContent}>
        <Text style={styles.chartTitle}>Biểu đồ {selectedTab.toLowerCase()} ({selectedTab === 'Chiều cao' ? 'cm' : selectedTab === 'Cân nặng' ? 'kg' : selectedTab === 'Vòng đầu' ? 'cm' : 'BMI'})</Text>
        <LineChart
          data={chartKitData}
          width={chartWidth}
          height={220} // Fixed height for the chart area
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0, // Optional: defaults to 2dp
            color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#007bff"
            },
            // Add yAxisSuffix for units
            yAxisSuffix: selectedTab === 'Chiều cao' ? ' cm' : selectedTab === 'Cân nặng' ? ' kg' : selectedTab === 'Vòng đầu' ? ' cm' : '',
          }}
          bezier={false} // Set to true for curved lines
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
         {/* Info icon placeholder */}
         <TouchableOpacity style={styles.infoIcon}>
             <Text style={{ fontSize: 16, color: '#007bff' }}>ⓘ</Text>
         </TouchableOpacity>
      </ScrollView>

      {/* 4. Bảng dữ liệu chi tiết */}
      <DataTable data={tableData} selectedTab={selectedTab} />

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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
});

// Replace the original styles object with the combined styles
const styles = combinedStyles;

export default ChartScreen;