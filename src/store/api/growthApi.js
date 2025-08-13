import childrenApi from './childrenApi';
import growthPredictionApi from './growthPredictionApi';

/**
 * Lấy toàn bộ dữ liệu tăng trưởng và chuẩn cho 1 trẻ
 * @param {string} childId
 * @param {string} gender
 * @returns {Promise<{growthData, heightStandardData, weightStandardData, headCircumferenceStandardData, bmiStandardData, predictionData}>}
 */
export async function getFullGrowthData(childId, gender) {
  if (!childId) {
    return {
      growthData: null,
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

  // Chuẩn bị các ngày cần lấy chuẩn
  const daysHeight = processRecords('height').map(item => item.ageInDays);
  let allDaysHeight = [];
  if (daysHeight.length > 0) {
    const maxDays = Math.max(...daysHeight);
    for (let i = 0; i < 4; i++) {
      allDaysHeight.push(maxDays + (i * 30)); // Thêm mỗi 30 ngày
    }
  }
  const daysWeight = processRecords('weight').map(item => item.ageInDays);
  let allDaysWeight = [];
  if (daysWeight.length > 0) {
    const maxDays = Math.max(...daysWeight);
    for (let i = 0; i < 4; i++) {
      allDaysWeight.push(maxDays + (i * 30));
    }
  }
  const daysHead = processRecords('headCircumference').map(item => item.ageInDays);
  let allDaysHead = [];
  if (daysHead.length > 0) {
    const maxDays = Math.max(...daysHead);
    for (let i = 0; i < 4; i++) {
      allDaysHead.push(maxDays + (i * 30));
    }
  }
  const daysBMI = processRecords('bmi').map(item => item.ageInDays);
  let allDaysBMI = [];
  if (daysBMI.length > 0) {
    const maxDays = Math.max(...daysBMI);
    for (let i = 0; i < 4; i++) {
      allDaysBMI.push(maxDays + (i * 30));
    }
  }

  // Fetch chuẩn song song
  const [resultsHeight, resultsWeight, resultsHead, resultsBMI] = await Promise.all([
    Promise.all(allDaysHeight.map(days => childrenApi.getHeightStandard(gender, days))),
    Promise.all(allDaysWeight.map(days => childrenApi.getWeightStandard(gender, days))),
    Promise.all(allDaysHead.map(days => childrenApi.getHeadCircumferenceStandard(gender, days))),
    Promise.all(allDaysBMI.map(days => childrenApi.getBMIStandard(gender, days))),
  ]);

  const standardDataHeight = resultsHeight.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 ? { ageInDays: allDaysHeight[idx], month: Math.round(allDaysHeight[idx] / 30.44), median: arr[0].median } : { ageInDays: allDaysHeight[idx], month: Math.round(allDaysHeight[idx] / 30.44), median: null };
  });
  const standardDataWeight = resultsWeight.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 ? { ageInDays: allDaysWeight[idx], month: Math.round(allDaysWeight[idx] / 30.44), median: arr[0].median } : { ageInDays: allDaysWeight[idx], month: Math.round(allDaysWeight[idx] / 30.44), median: null };
  });
  const standardDataHead = resultsHead.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 ? { ageInDays: allDaysHead[idx], month: Math.round(allDaysHead[idx] / 30.44), median: arr[0].median } : { ageInDays: allDaysHead[idx], month: Math.round(allDaysHead[idx] / 30.44), median: null };
  });
  const standardDataBMI = resultsBMI.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 ? { ageInDays: allDaysBMI[idx], month: Math.round(allDaysBMI[idx] / 30.44), median: arr[0].median } : { ageInDays: allDaysBMI[idx], month: Math.round(allDaysBMI[idx] / 30.44), median: null };
  });

  const actualHeightData = processRecords('height');
  const actualWeightData = processRecords('weight');
  const actualHeadData = processRecords('headCircumference');
  const actualBMIData = processRecords('bmi');

  // Fetch prediction data
  let predictionData = null;
  try {
    const predictionResponse = await growthPredictionApi.getGrowthPrediction(childId, 30);
    predictionData = predictionResponse.data;
  } catch (err) {
    console.log('Không thể lấy dữ liệu dự đoán:', err);
    predictionData = null;
  }

  return {
    growthData: {
      childId,
      data: {
        'Chiều cao': actualHeightData,
        'Cân nặng': actualWeightData,
        'Vòng đầu': actualHeadData,
        'BMI': actualBMIData,
      },
    },
    heightStandardData: standardDataHeight,
    weightStandardData: standardDataWeight,
    headCircumferenceStandardData: standardDataHead,
    bmiStandardData: standardDataBMI,
    predictionData: predictionData,
  };
} 