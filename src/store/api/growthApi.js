import childrenApi from './childrenApi';

/**
 * Lấy toàn bộ dữ liệu tăng trưởng, chuẩn và đánh giá mới nhất cho 1 trẻ
 * @param {string} childId
 * @param {string} gender
 * @returns {Promise<{growthData, assessment, heightStandardData, weightStandardData, headCircumferenceStandardData, bmiStandardData}>}
 */
export async function getFullGrowthData(childId, gender) {
  if (!childId) {
    return {
      growthData: null,
      assessment: null,
      heightStandardData: [],
      weightStandardData: [],
      headCircumferenceStandardData: [],
      bmiStandardData: [],
    };
  }

  // Fetch growth records
  let records = [];
  try {
    const res = await childrenApi.getGrowthRecordsByChildId(childId);
    records = res.data || [];
    // Lấy 4 bản ghi mới nhất (theo createdAt) và sắp xếp tăng dần theo ageInDays
    records = records.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
    records = records.sort((a, b) => a.ageInDays - b.ageInDays);
  } catch (err) {
    // Nếu lỗi, trả về rỗng
    records = [];
  }

  const processRecords = (key) =>
    records.map(item => ({
      month: Math.round(item.ageInDays / 30.44),
      ageInDays: item.ageInDays,
      value: item[key],
      status: 'Bình thường',
    })).filter(item => typeof item.value === 'number' && isFinite(item.value));

  // Chuẩn bị các tháng cần lấy chuẩn
  const monthsHeight = processRecords('height').map(item => item.month);
  let allMonthsHeight = [];
  if (monthsHeight.length > 0) {
    const maxMonth = Math.max(...monthsHeight);
    for (let i = 0; i < 4; i++) {
      allMonthsHeight.push(maxMonth + i);
    }
  }
  const monthsWeight = processRecords('weight').map(item => item.month);
  let allMonthsWeight = [];
  if (monthsWeight.length > 0) {
    const maxMonth = Math.max(...monthsWeight);
    for (let i = 0; i < 4; i++) {
      allMonthsWeight.push(maxMonth + i);
    }
  }
  const monthsHead = processRecords('headCircumference').map(item => item.month);
  let allMonthsHead = [];
  if (monthsHead.length > 0) {
    const maxMonth = Math.max(...monthsHead);
    for (let i = 0; i < 4; i++) {
      allMonthsHead.push(maxMonth + i);
    }
  }
  const monthsBMI = processRecords('bmi').map(item => item.month);
  let allMonthsBMI = [];
  if (monthsBMI.length > 0) {
    const maxMonth = Math.max(...monthsBMI);
    for (let i = 0; i < 4; i++) {
      allMonthsBMI.push(maxMonth + i);
    }
  }

  // Fetch chuẩn song song
  const [resultsHeight, resultsWeight, resultsHead, resultsBMI] = await Promise.all([
    Promise.all(allMonthsHeight.map(month => childrenApi.getHeightStandard(gender, month))),
    Promise.all(allMonthsWeight.map(month => childrenApi.getWeightStandard(gender, month))),
    Promise.all(allMonthsHead.map(month => childrenApi.getHeadCircumferenceStandard(gender, month))),
    Promise.all(allMonthsBMI.map(month => childrenApi.getBMIStandard(gender, month))),
  ]);

  const standardDataHeight = resultsHeight.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 ? { month: allMonthsHeight[idx], median: arr[0].median } : { month: allMonthsHeight[idx], median: null };
  });
  const standardDataWeight = resultsWeight.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 ? { month: allMonthsWeight[idx], median: arr[0].median } : { month: allMonthsWeight[idx], median: null };
  });
  const standardDataHead = resultsHead.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 ? { month: allMonthsHead[idx], median: arr[0].median } : { month: allMonthsHead[idx], median: null };
  });
  const standardDataBMI = resultsBMI.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 ? { month: allMonthsBMI[idx], median: arr[0].median } : { month: allMonthsBMI[idx], median: null };
  });

  // Fetch assessment and prediction
  let assessment = null;
  let prediction = null;
  try {
    const [assessmentRes, predictionRes] = await Promise.all([
      childrenApi.getLatestGrowthAssessment(childId),
      childrenApi.getGrowthPrediction(childId, '1week')
    ]);
    assessment = assessmentRes.data;
    prediction = predictionRes.data;
  } catch (err) {
    assessment = null;
    prediction = null;
  }

  // Process prediction data
  const processPredictionData = (key) => {
    if (!prediction || !prediction.predictionPoints || prediction.predictionPoints.length === 0) {
      return [];
    }
    
    return prediction.predictionPoints.map(point => ({
      month: Math.round(point.ageInDays / 30.44),
      ageInDays: point.ageInDays,
      value: point[key],
      status: 'Dự đoán',
    })).filter(item => typeof item.value === 'number' && isFinite(item.value));
  };

  // Merge actual data with prediction data
  const mergeDataWithPrediction = (actualData, predictionData) => {
    if (!predictionData || predictionData.length === 0) {
      return actualData;
    }
    
    // Combine actual and prediction data, sort by ageInDays
    const combinedData = [...actualData, ...predictionData];
    return combinedData.sort((a, b) => a.ageInDays - b.ageInDays);
  };

  const actualHeightData = processRecords('height');
  const actualWeightData = processRecords('weight');
  const actualHeadData = processRecords('headCircumference');
  const actualBMIData = processRecords('bmi');

  const predictionHeightData = processPredictionData('predictedHeight');
  const predictionWeightData = processPredictionData('predictedWeight');
  const predictionHeadData = processPredictionData('predictedHeadCircumference');
  const predictionBMIData = processPredictionData('predictedBMI');

  return {
    growthData: {
      childId,
      data: {
        'Chiều cao': mergeDataWithPrediction(actualHeightData, predictionHeightData),
        'Cân nặng': mergeDataWithPrediction(actualWeightData, predictionWeightData),
        'Vòng đầu': mergeDataWithPrediction(actualHeadData, predictionHeadData),
        'BMI': mergeDataWithPrediction(actualBMIData, predictionBMIData),
      },
    },
    assessment,
    prediction,
    heightStandardData: standardDataHeight,
    weightStandardData: standardDataWeight,
    headCircumferenceStandardData: standardDataHead,
    bmiStandardData: standardDataBMI,
  };
} 