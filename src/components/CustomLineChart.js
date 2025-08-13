import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, G, Path } from 'react-native-svg';
import * as d3 from 'd3';

const CustomLineChart = ({ 
  data, 
  width, 
  height, 
  chartConfig, 
  onDataPointClick,
  style 
}) => {
  // Padding for the chart - tăng padding để có đủ không gian cho labels
  const paddingLeft = Math.max(60, width * 0.15); // Responsive left padding
  const paddingRight = Math.max(40, width * 0.1); // Responsive right padding
  const paddingTop = Math.max(40, height * 0.15); // Responsive top padding
  const paddingBottom = Math.max(60, height * 0.25); // Responsive bottom padding
  
  // Chart dimensions
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  // Extract data
  const { labels, datasets } = data;
  
  if (!datasets || datasets.length === 0) {
    return (
      <View style={[{ width, height, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text>No data available</Text>
      </View>
    );
  }
  
  // Get all values from all datasets to determine scales
  const allValues = datasets.reduce((acc, dataset) => {
    return acc.concat(dataset.data || []);
  }, []);
  
  if (allValues.length === 0) {
    return (
      <View style={[{ width, height, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text>No data available</Text>
      </View>
    );
  }
  
  // Create scales - tìm giá trị X tối đa từ tất cả datasets
  let allXValues = [];
  datasets.forEach((dataset, datasetIndex) => {
    const datasetLabels = dataset.labels || labels || []; // Đảm bảo datasetLabels luôn là array
    if (Array.isArray(datasetLabels)) {
      datasetLabels.forEach(label => {
        const numValue = parseFloat(label);
        if (!isNaN(numValue)) {
          allXValues.push(numValue);
        }
      });
    }
  });
  
  console.log('All X Values:', allXValues); // Debug log
  
  const maxX = Math.max(...allXValues, 0);
  const xScale = d3.scaleLinear()
    .domain([0, maxX])
    .range([0, chartWidth]);
    
  console.log('X Scale domain:', [0, maxX]); // Debug log
    
  const yMax = d3.max(allValues) || 1;
  const yScale = d3.scaleLinear()
    .domain([0, yMax]) // Always start from 0
    .range([chartHeight, 0]);
    
  // Generate Y-axis ticks
  const yTicks = yScale.ticks(5);
  
  // Generate X-axis ticks (show every other label if too many) - responsive label count
  const maxLabelsToShow = Math.min(6, Math.floor(width / 60)); // Responsive based on width
  const uniqueXValues = [...new Set(allXValues)].sort((a, b) => a - b);
  const labelStep = Math.max(1, Math.ceil(uniqueXValues.length / maxLabelsToShow));
  
  return (
    <TouchableOpacity 
      style={[{ width, height }, style]}
      activeOpacity={1}
      onPress={(event) => {
        // Handle chart area clicks
        const { locationX, locationY } = event.nativeEvent;
        
        // Find the closest data point across all datasets
        let closestPoint = null;
        let minDistance = Infinity;
        
        datasets.forEach((dataset, datasetIndex) => {
          const values = dataset.data || [];
          const datasetLabels = dataset.labels || labels || [];
          const datasetXValues = Array.isArray(datasetLabels) ? datasetLabels.map(label => {
            const numValue = parseFloat(label);
            return isNaN(numValue) ? 0 : numValue;
          }) : [];
          
          values.forEach((value, index) => {
            const pointX = paddingLeft + xScale(datasetXValues[index] || 0);
            const pointY = paddingTop + yScale(value);
            const distance = Math.sqrt(
              Math.pow(locationX - pointX, 2) + Math.pow(locationY - pointY, 2)
            );
            
            if (distance < minDistance && distance < 20) { // 20px tolerance
              minDistance = distance;
              closestPoint = {
                value,
                index,
                x: pointX,
                y: pointY,
                datasetIndex
              };
            }
          });
        });
        
        if (closestPoint && onDataPointClick) {
          onDataPointClick(closestPoint);
        }
      }}
    >
      <Svg width={width} height={height}>
        {/* Chart background */}
        <G transform={`translate(${paddingLeft}, ${paddingTop})`}>
          {/* Grid lines - Y axis */}
          {yTicks.map((tick, index) => (
            <Line
              key={`y-grid-${index}`}
              x1={0}
              y1={yScale(tick)}
              x2={chartWidth}
              y2={yScale(tick)}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
          ))}
          
          {/* Grid lines - X axis - vẽ grid cho các giá trị X unique */}
          {[...new Set(allXValues)].sort((a, b) => a - b).map((xValue, index) => (
            <Line
              key={`x-grid-${xValue}`}
              x1={xScale(xValue)}
              y1={0}
              x2={xScale(xValue)}
              y2={chartHeight}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
          ))}
          
          {/* Render all datasets */}
          {datasets.map((dataset, datasetIndex) => {
            const values = dataset.data || [];
            const datasetLabels = dataset.labels || labels || []; // Đảm bảo có fallback
            const datasetColor = dataset.color;
            const color = typeof datasetColor === 'function' ? datasetColor(1) : (datasetColor || '#007bff');
            const strokeWidth = dataset.strokeWidth || 2;
            
            // Convert labels to X values cho dataset này
            const datasetXValues = Array.isArray(datasetLabels) ? datasetLabels.map(label => {
              const numValue = parseFloat(label);
              return isNaN(numValue) ? 0 : numValue;
            }) : [];
            
            console.log(`Dataset ${datasetIndex} (${dataset.label}):`);
            console.log('  Labels:', datasetLabels);
            console.log('  X Values:', datasetXValues);
            console.log('  Data Values:', values);
            
            // Create line path for this dataset - sử dụng giá trị X riêng cho dataset này
            const line = d3.line()
              .x((d, i) => xScale(datasetXValues[i] || 0))
              .y(d => yScale(d))
              .curve(d3.curveLinear);
              
            const pathData = line(values);
            
            return (
              <G key={`dataset-${datasetIndex}`}>
                {/* Main line */}
                <Path
                  d={pathData}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={dataset.strokeDashArray ? dataset.strokeDashArray.join(',') : undefined}
                />
                
                {/* Data points - sử dụng giá trị X riêng cho dataset này */}
                {values.map((value, index) => (
                  <Circle
                    key={`point-${datasetIndex}-${index}`}
                    cx={xScale(datasetXValues[index] || 0)}
                    cy={yScale(value)}
                    r={Math.max(4, Math.min(6, width / 60))} // Responsive circle size
                    fill={color}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </G>
            );
          })}
          
          {/* Y-axis */}
          <Line
            x1={0}
            y1={0}
            x2={0}
            y2={chartHeight}
            stroke="#000"
            strokeWidth={1}
          />
          
          {/* X-axis */}
          <Line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="#000"
            strokeWidth={1}
          />
          
          {/* Y-axis labels */}
          {yTicks.map((tick, index) => (
            <SvgText
              key={`y-label-${index}`}
              x={-15} // Tăng khoảng cách từ trục Y
              y={yScale(tick)}
              fontSize={Math.max(10, Math.min(12, width / 30))} // Responsive font size
              fill="#666"
              textAnchor="end"
              alignmentBaseline="middle"
            >
              {chartConfig?.formatYLabel ? chartConfig.formatYLabel(tick) : tick.toFixed(1)}
            </SvgText>
          ))}
          
          {/* X-axis labels - ẩn để chỉ hiển thị qua tooltip */}
          {/* Đã ẩn X-axis labels, chỉ hiển thị thông qua tooltip khi click vào điểm */}
        </G>
      </Svg>
    </TouchableOpacity>
  );
};

export default CustomLineChart;
