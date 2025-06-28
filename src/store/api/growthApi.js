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
  let allMonthsHeight = [...monthsHeight];
  if (monthsHeight.length > 0) {
    const maxMonth = Math.max(...monthsHeight);
    for (let i = 1; i <= 4; i++) {
      allMonthsHeight.push(maxMonth + i);
    }
    allMonthsHeight = Array.from(new Set(allMonthsHeight)).sort((a, b) => a - b);
  }
  const monthsWeight = processRecords('weight').map(item => item.month);
  let allMonthsWeight = [...monthsWeight];
  if (monthsWeight.length > 0) {
    const maxMonth = Math.max(...monthsWeight);
    for (let i = 1; i <= 4; i++) {
      allMonthsWeight.push(maxMonth + i);
    }
    allMonthsWeight = Array.from(new Set(allMonthsWeight)).sort((a, b) => a - b);
  }
  const monthsHead = processRecords('headCircumference').map(item => item.month);
  let allMonthsHead = [...monthsHead];
  if (monthsHead.length > 0) {
    const maxMonth = Math.max(...monthsHead);
    for (let i = 1; i <= 4; i++) {
      allMonthsHead.push(maxMonth + i);
    }
    allMonthsHead = Array.from(new Set(allMonthsHead)).sort((a, b) => a - b);
  }
  const monthsBMI = processRecords('bmi').map(item => item.month);
  let allMonthsBMI = [...monthsBMI];
  if (monthsBMI.length > 0) {
    const maxMonth = Math.max(...monthsBMI);
    for (let i = 1; i <= 4; i++) {
      allMonthsBMI.push(maxMonth + i);
    }
    allMonthsBMI = Array.from(new Set(allMonthsBMI)).sort((a, b) => a - b);
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

  // Fetch assessment
  let assessment = null;
  try {
    const res = await childrenApi.getLatestGrowthAssessment(childId);
    assessment = res.data;
  } catch (err) {
    assessment = null;
  }

  return {
    growthData: {
      childId,
      data: {
        'Chiều cao': processRecords('height'),
        'Cân nặng': processRecords('weight'),
        'Vòng đầu': processRecords('headCircumference'),
        'BMI': processRecords('bmi'),
      },
    },
    assessment,
    heightStandardData: standardDataHeight,
    weightStandardData: standardDataWeight,
    headCircumferenceStandardData: standardDataHead,
    bmiStandardData: standardDataBMI,
  };
} 