import { useMemo } from 'react';
import useChildVaccineProfile from './useChildVaccineProfile';
import useVaccines from './useVaccines';
import useDiseases from './useDiseases';

export default function useVaccinationBook(childId) {
  const { profile: profileData, loading: loadingProfile, error: errorProfile, refetch: refetchProfile } = useChildVaccineProfile(childId);
  const { vaccines, loading: loadingVaccines, error: errorVaccines, refetch: refetchVaccines } = useVaccines();
  const { diseases, loading: loadingDiseases, error: errorDiseases, refetch: refetchDiseases } = useDiseases();

  const loading = loadingProfile || loadingVaccines || loadingDiseases;
  const error = errorProfile || errorVaccines || errorDiseases;

  // Mapping dữ liệu
  const vaccineBook = useMemo(() => {
    if (!profileData || !Array.isArray(profileData) || !vaccines.length || !diseases.length) return [];
    const vaccineMap = Object.fromEntries(vaccines.map(v => [v.vaccineId, v]));
    const diseaseMap = Object.fromEntries(diseases.map(d => [d.diseaseId, d]));
    const grouped = {};
    profileData.forEach(item => {
      const vaccine = vaccineMap[item.vaccineId];
      const disease = diseaseMap[item.diseaseId];
      if (!vaccine || !disease) return;
      const groupKey = vaccine.name + '-' + disease.name;
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          vaccine,
          disease,
          doses: [],
          numberOfDoses: vaccine.numberOfDoses,
        };
      }
      grouped[groupKey].doses.push({
        doseNum: item.doseNum,
        expectedDate: item.expectedDate,
        actualDate: item.actualDate,
        status: item.status,
        note: item.note,
      });
    });
    // Đảm bảo đủ số mũi cho mỗi vaccine (doseNum backend bắt đầu từ 1)
    Object.values(grouped).forEach(group => {
      const dosesArr = [];
      for (let i = 0; i < group.numberOfDoses; i++) {
        const found = group.doses.find(d => d.doseNum === i + 1);
        if (found) {
          dosesArr.push(found);
        } else {
          dosesArr.push({
            doseNum: i + 1,
            expectedDate: null,
            actualDate: null,
            status: 'pending',
            note: 'Chưa tiêm',
          });
        }
      }
      group.doses = dosesArr;
    });
    return Object.values(grouped);
  }, [profileData, vaccines, diseases]);

  const refetch = () => {
    refetchProfile();
    refetchVaccines();
    refetchDiseases();
  };

  return { vaccineBook, loading, error, refetch };
} 