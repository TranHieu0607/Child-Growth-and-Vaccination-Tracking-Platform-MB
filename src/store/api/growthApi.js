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

  // OPTIMIZE: Chỉ tạo các mốc cần thiết dựa trên dữ liệu thực tế
  const generateOptimizedStandardDays = (actualRecords) => {
    const days = new Set();
    
    if (actualRecords.length === 0) {
      // Nếu không có dữ liệu thực tế, chỉ load một số mốc cơ bản
      return [30, 60, 90, 180, 360, 720, 1080, 1440, 1800, 2160];
    }
    
    const latestDay = Math.max(...actualRecords.map(r => r.ageInDays));
    
    if (latestDay <= 720) {
      // Logic cho ≤ 720 ngày: mỗi 30 ngày
      const start = Math.max(30, latestDay - 60);
      const end = latestDay + 60;
      for (let day = start; day <= end; day += 30) {
        days.add(day);
      }
    } else {
      // Logic cho > 720 ngày: chỉ load 2 mốc 360*x gần nhất
      const x = latestDay / 360;
      const lowerX = Math.floor(x);
      const upperX = Math.ceil(x);
      
      if (lowerX === upperX) {
        days.add(360 * Math.max(1, lowerX - 1));
        days.add(360 * lowerX);
      } else {
        days.add(360 * lowerX);
        days.add(360 * upperX);
      }
      
      // Thêm một số mốc gần để backup
      const backup = latestDay - 360;
      if (backup > 0) days.add(Math.round(backup / 30) * 30);
      const backup2 = latestDay + 360;
      days.add(Math.round(backup2 / 30) * 30);
    }
    
    return Array.from(days).sort((a, b) => a - b);
  };

  const actualData = processRecords('height'); // Dùng height để estimate
  const optimizedStandardDays = generateOptimizedStandardDays(records);
  
  console.log('Optimized standard days:', optimizedStandardDays); // Debug log

  // OPTIMIZE: Fetch song song nhưng ít API calls hơn
  const [resultsHeight, resultsWeight, resultsHead, resultsBMI] = await Promise.all([
    Promise.all(optimizedStandardDays.map(days => childrenApi.getHeightStandard(gender, days))),
    Promise.all(optimizedStandardDays.map(days => childrenApi.getWeightStandard(gender, days))),
    Promise.all(optimizedStandardDays.map(days => childrenApi.getHeadCircumferenceStandard(gender, days))),
    Promise.all(optimizedStandardDays.map(days => childrenApi.getBMIStandard(gender, days))),
  ]);

  const createStandardData = (results, days) => {
    return results.map((res, idx) => {
      const arr = Array.isArray(res.data) ? res.data : [];
      return arr.length > 0 
        ? { 
            ageInDays: days[idx], 
            ageInMonths: Math.round(days[idx] / 30.44), 
            median: arr[0].median 
          } 
        : null;
    }).filter(item => item !== null && item.median !== null);
  };

  const standardDataHeight = createStandardData(resultsHeight, optimizedStandardDays);
  const standardDataWeight = createStandardData(resultsWeight, optimizedStandardDays);
  const standardDataHead = createStandardData(resultsHead, optimizedStandardDays);
  const standardDataBMI = createStandardData(resultsBMI, optimizedStandardDays);

  const actualHeightData = processRecords('height');
  const actualWeightData = processRecords('weight');
  const actualHeadData = processRecords('headCircumference');
  const actualBMIData = processRecords('bmi');

  // OPTIMIZE: Load prediction data sau, không block UI
  let predictionData = null;
  // Chọn horizon động: nếu latestDay > 720 thì 360 ngày, ngược lại 30 ngày
  const latestDay = records.length > 0 ? Math.max(...records.map(r => r.ageInDays)) : 0;
  const predictionHorizonDays = latestDay > 720 ? 360 : 30;
  // Không await prediction để không block UI chính
  growthPredictionApi.getGrowthPrediction(childId, predictionHorizonDays)
    .then(response => predictionData = response.data)
    .catch(() => predictionData = null);

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

/**
 * Load prediction data riêng biệt
 */
export async function getPredictionData(childId, days = 30) {
  try {
    const response = await growthPredictionApi.getGrowthPrediction(childId, days);
    return response.data;
  } catch (err) {
    return null;
  }
}