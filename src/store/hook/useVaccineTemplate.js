import { useState, useEffect, useMemo } from 'react';
import axiosClient from '../api/axiosClient';

export default function useVaccineTemplate(childId) {
  const [templateData, setTemplateData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) return;

    const fetchVaccineTemplate = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosClient.get(`/ChildVaccineProfiles/record/${childId}`);
        setTemplateData(response.data || []);
      } catch (err) {
        console.error('Error fetching vaccine template:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVaccineTemplate();
  }, [childId]);

  // Nhóm dữ liệu theo bệnh và tính toán thông tin
  const vaccineBook = useMemo(() => {
    if (!templateData || !Array.isArray(templateData)) return [];

    // Nhóm theo diseaseId và diseaseName
    const grouped = {};
    templateData.forEach(item => {
      const key = `${item.diseaseId}-${item.diseaseName}`;
      if (!grouped[key]) {
        grouped[key] = {
          diseaseId: item.diseaseId,
          diseaseName: item.diseaseName,
          doses: [],
        };
      }
      grouped[key].doses.push({
        doseNum: item.requiredDoseNum,
        completedDoseNum: item.completedDoseNum,
        isRequired: item.isRequired,
        status: item.status,
        periodFrom: item.periodFrom,
        periodTo: item.periodTo,
      });
    });

    // Chuyển đổi thành mảng và sắp xếp
    const result = Object.values(grouped).map(group => {
      // Sắp xếp các mũi theo thứ tự
      group.doses.sort((a, b) => a.doseNum - b.doseNum);
      
      // Tính toán thông tin tổng hợp
      const totalDoses = group.doses.length;
      const completedDoses = group.doses.filter(dose => 
        dose.status === 'Đã đủ liều' || dose.completedDoseNum >= dose.doseNum
      ).length;
      const hasPartialDoses = group.doses.some(dose => 
        dose.status === 'Chưa đủ liều' && dose.completedDoseNum > 0
      );

      let overallStatus = 'Chưa tiêm';
      if (completedDoses === totalDoses) {
        overallStatus = 'Đã đủ liều';
      } else if (completedDoses > 0 || hasPartialDoses) {
        overallStatus = 'Chưa đủ liều';
      }

      return {
        ...group,
        totalDoses,
        completedDoses,
        overallStatus,
      };
    });

    return result;
  }, [templateData]);

  const refetch = () => {
    if (childId) {
      const fetchVaccineTemplate = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await axiosClient.get(`/ChildVaccineProfiles/record/${childId}`);
          setTemplateData(response.data || []);
        } catch (err) {
          console.error('Error fetching vaccine template:', err);
          setError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchVaccineTemplate();
    }
  };

  return { vaccineBook, loading, error, refetch };
}
