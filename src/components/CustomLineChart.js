import React, { useMemo, useCallback } from 'react';
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
  // Memoize paddings and dimensions
  const { paddingLeft, paddingRight, paddingTop, paddingBottom, chartWidth, chartHeight } = useMemo(() => {
    const padLeft = Math.max(60, width * 0.15);
    const padRight = Math.max(40, width * 0.1);
    const padTop = Math.max(40, height * 0.15);
    const padBottom = Math.max(60, height * 0.25);
    return {
      paddingLeft: padLeft,
      paddingRight: padRight,
      paddingTop: padTop,
      paddingBottom: padBottom,
      chartWidth: width - padLeft - padRight,
      chartHeight: height - padTop - padBottom,
    };
  }, [width, height]);
  
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
  const allValues = useMemo(() => {
    return datasets.reduce((acc, dataset) => acc.concat(dataset.data || []), []);
  }, [datasets]);
  
  if (allValues.length === 0) {
    return (
      <View style={[{ width, height, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text>No data available</Text>
      </View>
    );
  }
  
  // Create scales - tìm giá trị X tối đa từ tất cả datasets
  const allXValues = useMemo(() => {
    const arr = [];
    datasets.forEach((dataset) => {
      const datasetLabels = dataset.labels || labels || [];
      if (Array.isArray(datasetLabels)) {
        for (let i = 0; i < datasetLabels.length; i++) {
          const numValue = parseFloat(datasetLabels[i]);
          if (!isNaN(numValue)) arr.push(numValue);
        }
      }
    });
    return arr;
  }, [datasets, labels]);
  
  
  
  const { xScale } = useMemo(() => {
    const maxX = Math.max(...allXValues, 0);
    return {
      xScale: d3.scaleLinear().domain([0, maxX]).range([0, chartWidth])
    };
  }, [allXValues, chartWidth]);
    
  
    
  const { yScale, yTicks } = useMemo(() => {
    const yMax = d3.max(allValues) || 1;
    const ys = d3.scaleLinear().domain([0, yMax]).range([chartHeight, 0]);
    return { yScale: ys, yTicks: ys.ticks(5) };
  }, [allValues, chartHeight]);
  
  
  // Generate X-axis ticks (show every other label if too many) - responsive label count
  const { uniqueXValues, labelStep } = useMemo(() => {
    const maxLabelsToShow = Math.min(6, Math.floor(width / 60));
    const uniq = [...new Set(allXValues)].sort((a, b) => a - b);
    return {
      uniqueXValues: uniq,
      labelStep: Math.max(1, Math.ceil(uniq.length / maxLabelsToShow))
    };
  }, [allXValues, width]);
  
  const handlePress = useCallback((event) => {
    const { locationX, locationY } = event.nativeEvent;
    let closestPoint = null;
    let minDistance = Infinity;
    datasets.forEach((dataset, datasetIndex) => {
      const values = dataset.data || [];
      const datasetLabels = dataset.labels || labels || [];
      const datasetXValues = Array.isArray(datasetLabels) ? datasetLabels.map(label => {
        const numValue = parseFloat(label);
        return isNaN(numValue) ? 0 : numValue;
      }) : [];
      for (let index = 0; index < values.length; index++) {
        const pointX = paddingLeft + xScale(datasetXValues[index] || 0);
        const pointY = paddingTop + yScale(values[index]);
        const dx = locationX - pointX;
        const dy = locationY - pointY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance && distance < 20) {
          minDistance = distance;
          closestPoint = { value: values[index], index, x: pointX, y: pointY, datasetIndex };
        }
      }
    });
    if (closestPoint && onDataPointClick) onDataPointClick(closestPoint);
  }, [datasets, labels, paddingLeft, paddingTop, xScale, yScale, onDataPointClick]);

  return (
    <TouchableOpacity 
      style={[{ width, height }, style]}
      activeOpacity={1}
      onPress={handlePress}
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
