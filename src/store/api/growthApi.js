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

  // Tạo danh sách các ngày cần lấy dữ liệu tiêu chuẩn (đủ để hiển thị từ 30 đến 4320 ngày)
  const generateStandardDays = () => {
    const days = [];
    // Tạo các mốc 30 ngày từ 30 đến 4320 (144 điểm: 30, 60, 90, ..., 4320)
    for (let i = 1; i <= 144; i++) { // 4320 / 30 = 144
      days.push(i * 30);
    }
    return days;
  };

  const allStandardDays = generateStandardDays();

  // Fetch chuẩn song song cho tất cả các ngày
  const [resultsHeight, resultsWeight, resultsHead, resultsBMI] = await Promise.all([
    Promise.all(allStandardDays.map(days => childrenApi.getHeightStandard(gender, days))),
    Promise.all(allStandardDays.map(days => childrenApi.getWeightStandard(gender, days))),
    Promise.all(allStandardDays.map(days => childrenApi.getHeadCircumferenceStandard(gender, days))),
    Promise.all(allStandardDays.map(days => childrenApi.getBMIStandard(gender, days))),
  ]);

  const standardDataHeight = resultsHeight.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 
      ? { 
          ageInDays: allStandardDays[idx], 
          ageInMonths: Math.round(allStandardDays[idx] / 30.44), 
          median: arr[0].median 
        } 
      : { 
          ageInDays: allStandardDays[idx], 
          ageInMonths: Math.round(allStandardDays[idx] / 30.44), 
          median: null 
        };
  }).filter(item => item.median !== null); // Lọc bỏ các điểm không có dữ liệu

  const standardDataWeight = resultsWeight.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 
      ? { 
          ageInDays: allStandardDays[idx], 
          ageInMonths: Math.round(allStandardDays[idx] / 30.44), 
          median: arr[0].median 
        } 
      : { 
          ageInDays: allStandardDays[idx], 
          ageInMonths: Math.round(allStandardDays[idx] / 30.44), 
          median: null 
        };
  }).filter(item => item.median !== null);

  const standardDataHead = resultsHead.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 
      ? { 
          ageInDays: allStandardDays[idx], 
          ageInMonths: Math.round(allStandardDays[idx] / 30.44), 
          median: arr[0].median 
        } 
      : { 
          ageInDays: allStandardDays[idx], 
          ageInMonths: Math.round(allStandardDays[idx] / 30.44), 
          median: null 
        };
  }).filter(item => item.median !== null);

  const standardDataBMI = resultsBMI.map((res, idx) => {
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.length > 0 
      ? { 
          ageInDays: allStandardDays[idx], 
          ageInMonths: Math.round(allStandardDays[idx] / 30.44), 
          median: arr[0].median 
        } 
      : { 
          ageInDays: allStandardDays[idx], 
          ageInMonths: Math.round(allStandardDays[idx] / 30.44), 
          median: null 
        };
  }).filter(item => item.median !== null);

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