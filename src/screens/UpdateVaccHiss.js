import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, FlatList } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faChevronDown, faSearch, faCalendarAlt, faMapMarkerAlt, faBaby } from '@fortawesome/free-solid-svg-icons';
import childrenApi from '../store/api/childrenApi';
import diseasesApi from '../store/api/diseasesApi';
import vaccinesApi from '../store/api/vaccinesApi';
import childVaccineProfileApi from '../store/api/childVaccineProfileApi';
import DateTimePicker from '@react-native-community/datetimepicker';

const UpdateVaccHiss = ({ navigation }) => {
  const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      diseaseName: '',
      vaccinationShot: '',
      vaccinationDate: '',
      vaccinationFacility: '',
      notes: '',
      doseNum: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        childId: selectedChildId,
        diseaseId: data.diseaseName,
        vaccineId: data.vaccinationShot,
        appointmentId: null,
        doseNum: Number(data.doseNum),
        expectedDate: data.vaccinationDate,
        actualDate: data.vaccinationDate,
        status: 'Completed',
        isRequired: true,
        priority: '',
        note: data.notes,
      };
      await childVaccineProfileApi.createProfile(payload);
      alert('Lưu lịch sử tiêm thành công!');
      reset();
    } catch (e) {
      alert('Lưu lịch sử tiêm thất bại!');
    }
  };

  // Dropdown and children state (like ChartScreen)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Disease dropdown state
  const [diseases, setDiseases] = useState([]);
  const [isDiseaseDropdownVisible, setIsDiseaseDropdownVisible] = useState(false);

  // Vaccine dropdown state
  const [vaccines, setVaccines] = useState([]);
  const [isVaccineDropdownVisible, setIsVaccineDropdownVisible] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await childrenApi.getMyChildren();
        const data = res.data || [];
        setChildren(data);
        if (data.length > 0) setSelectedChildId(data[0].childId);
      } catch (e) {
        setChildren([]);
      }
    };
    fetchChildren();

    // Fetch diseases
    const fetchDiseases = async () => {
      try {
        const res = await diseasesApi.getAllDiseases();
        setDiseases(res.data || []);
      } catch (e) {
        setDiseases([]);
      }
    };
    fetchDiseases();

    // Fetch vaccines
    const fetchVaccines = async () => {
      try {
        const res = await vaccinesApi.getAllVaccines();
        setVaccines(res.data || []);
      } catch (e) {
        setVaccines([]);
      }
    };
    fetchVaccines();
  }, []);

  const handleSelectChildPress = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSelectChild = (childId) => {
    setSelectedChildId(childId);
    setIsDropdownVisible(false);
  };

  // Calculate age from dateOfBirth (copied from ChartScreen)
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    if (years > 0) {
      const remainingMonths = m < 0 ? 12 + m : m;
      return `${years} tuổi${remainingMonths > 0 ? ` ${remainingMonths} tháng` : ''}`;
    }
    let months = today.getMonth() - birthDate.getMonth() + (12 * (today.getFullYear() - birthDate.getFullYear()));
    if(today.getDate() < birthDate.getDate()) {
        months--;
    }
    return `${months} tháng`;
  };

  // Lọc vaccine theo diseaseId đã chọn
  const selectedDiseaseId = control._formValues.diseaseName;
  const filteredVaccines = vaccines.filter(
    v => v.diseases && v.diseases.some(d => String(d.diseaseId) === String(selectedDiseaseId))
  );

  return (
    <ScrollView style={styles.container} nestedScrollEnabled={true}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhập lịch sử tiêm</Text>
      </View>

      {/* Child Info and Dropdown (like ChartScreen) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
        <View style={styles.childInfo}>
          {/* Display profile image of the selected child */}
          {selectedChildId && (
            <>
              {children.find(child => child.childId === selectedChildId)?.imageURL && !imageErrors[children.find(child => child.childId === selectedChildId)?.imageURL] ? (
                <Image
                  source={{ uri: children.find(child => child.childId === selectedChildId)?.imageURL }}
                  style={styles.profileImage}
                  onError={() => setImageErrors(prev => ({ ...prev, [children.find(child => child.childId === selectedChildId)?.imageURL]: true }))}
                />
              ) : (
                <View style={[styles.profileImage, {
                  backgroundColor: '#E6F0FE',
                  justifyContent: 'center',
                  alignItems: 'center'
                }]}>
                  <FontAwesomeIcon icon={faBaby} size={16} color="#2F80ED" />
                </View>
              )}
            </>
          )}
          <View>
            {/* Display name of the selected child */}
            {selectedChildId && (
              <Text style={styles.childName}>
                {children.find(child => child.childId === selectedChildId)?.fullName}
              </Text>
            )}
            {/* Display age of the selected child */}
            {selectedChildId && (
              <Text style={styles.childAge}>
                {calculateAge(children.find(child => child.childId === selectedChildId)?.dateOfBirth)}
              </Text>
            )}
          </View>
        </View>
        {/* Dropdown icon nằm bên phải */}
        <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleSelectChildPress}>
          <FontAwesomeIcon icon={faChevronDown} size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Child Selection Dropdown */}
      {isDropdownVisible && (
        <View style={[styles.dropdownContainer, { marginBottom: 24 }]}>
          {(children || []).map(child => (
            <TouchableOpacity
              key={child.childId}
              style={styles.dropdownItem}
              onPress={() => handleSelectChild(child.childId)}
            >
              {child.imageURL && !imageErrors[child.imageURL] ? (
                <Image
                  source={{ uri: child.imageURL }}
                  style={styles.dropdownItemImage}
                  onError={() => setImageErrors(prev => ({ ...prev, [child.imageURL]: true }))}
                />
              ) : (
                <View style={[styles.dropdownItemImage, {
                  backgroundColor: '#E6F0FE',
                  justifyContent: 'center',
                  alignItems: 'center'
                }]}>
                  <FontAwesomeIcon icon={faBaby} size={12} color="#2F80ED" />
                </View>
              )}
              <View style={styles.dropdownItemTextContainer}>
                <Text style={styles.dropdownItemName}>{child.fullName}</Text>
                <Text style={styles.dropdownItemAge}>{calculateAge(child.dateOfBirth)}</Text>
              </View>
              {selectedChildId === child.childId && <Text style={styles.selectedIcon}> ✅</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Tên bệnh / phòng bệnh */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5, marginTop: 8 }}>Tên bệnh </Text>
      <View style={{ position: 'relative', marginBottom: 24 }}>
        <Controller
          control={control}
          name="diseaseName"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, borderRadius: 5, backgroundColor: '#f9f9f9', height: 50, paddingHorizontal: 10 }}
              onPress={() => setIsDiseaseDropdownVisible(!isDiseaseDropdownVisible)}
              activeOpacity={0.8}
            >
              <Text style={{ flex: 1, color: value ? '#000' : '#888' }}>
                {value ? (diseases.find(d => d.diseaseId === value)?.name || value) : 'Chọn loại bệnh cần tiêm phòng'}
              </Text>
              <FontAwesomeIcon icon={faSearch} size={20} color="gray" style={{ marginRight: 8 }} />
            </TouchableOpacity>
          )}
        />
        {/* Dropdown list disease */}
        {isDiseaseDropdownVisible && (
          <View style={{ position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, zIndex: 10, maxHeight: 200 }}>
            <ScrollView nestedScrollEnabled={true}>
              {diseases.map(disease => (
                <TouchableOpacity
                  key={disease.diseaseId}
                  style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                  onPress={() => {
                    setValue('diseaseName', disease.diseaseId);
                    setIsDiseaseDropdownVisible(false);
                  }}
                >
                  <Text>{disease.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Vaccine */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Vacine</Text>
      <View style={{ position: 'relative', marginBottom: 24 }}>
        <Controller
          control={control}
          name="vaccinationShot"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, borderRadius: 5, backgroundColor: '#f9f9f9', height: 50, paddingHorizontal: 10 }}
              onPress={() => setIsVaccineDropdownVisible(!isVaccineDropdownVisible)}
              activeOpacity={0.8}
              disabled={!selectedDiseaseId}
            >
              <Text style={{ flex: 1, color: value ? '#000' : '#888' }}>
                {value ? (vaccines.find(v => v.vaccineId === value)?.name || value) : (selectedDiseaseId ? 'Chọn vaccine' : 'Chọn bệnh trước')}
              </Text>
              <FontAwesomeIcon icon={faChevronDown} size={18} color="gray" />
            </TouchableOpacity>
          )}
        />
        {/* Dropdown list vaccine */}
        {isVaccineDropdownVisible && selectedDiseaseId && (
          <View style={{ position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, zIndex: 10, maxHeight: 200 }}>
            <ScrollView nestedScrollEnabled={true}>
              {filteredVaccines.length === 0 && (
                <Text style={{ padding: 12, color: '#888' }}>Không có vaccine phù hợp</Text>
              )}
              {filteredVaccines.map(vaccine => (
                <TouchableOpacity
                  key={vaccine.vaccineId}
                  style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                  onPress={() => {
                    setValue('vaccinationShot', vaccine.vaccineId);
                    setIsVaccineDropdownVisible(false);
                  }}
                >
                  <Text>{vaccine.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>


      {/* Ngày tiêm */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Ngày tiêm</Text>
      <View style={{ position: 'relative', marginBottom: 24 }}>
        <Controller
          control={control}
          name="vaccinationDate"
          render={({ field: { value } }) => (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, borderRadius: 5, backgroundColor: '#f9f9f9', height: 50, paddingHorizontal: 10 }}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <FontAwesomeIcon icon={faCalendarAlt} size={20} color="gray" style={{ marginRight: 8 }} />
              <Text style={{ flex: 1, color: value ? '#000' : '#888' }}>
                {value ? value : 'Chọn ngày tiêm'}
              </Text>
            </TouchableOpacity>
          )}
        />
        {showDatePicker && (
          <DateTimePicker
            value={control._formValues.vaccinationDate ? new Date(control._formValues.vaccinationDate) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                // Format date to yyyy-MM-dd
                const d = new Date(selectedDate);
                const formatted = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                setValue('vaccinationDate', formatted);
              }
            }}
          />
        )}
      </View>


      {/* Số mũi tiêm */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Số mũi tiêm</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, marginBottom: 24, borderRadius: 5, backgroundColor: '#f9f9f9' }}>
        <Controller
          control={control}
          name="doseNum"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={{ height: 50, flex: 1, paddingHorizontal: 10 }}
              placeholder="Nhập số mũi tiêm"
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>

      {/* Ghi chú thêm (tùy chọn) */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Ghi chú thêm (tùy chọn)</Text>
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 100, borderColor: 'gray', borderWidth: 1, marginBottom: 32, paddingHorizontal: 10, paddingTop: 10, borderRadius: 5, backgroundColor: '#f9f9f9' }}
            placeholder="Nhập ghi chú về mũi tiêm (nếu có)"
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      {/* LƯU LỊCH SỬ TIÊM button */}
      <TouchableOpacity style={{ backgroundColor: '#007BFF', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 40, marginTop: 8 }} onPress={handleSubmit(onSubmit)}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>LƯU LỊCH SỬ TIÊM</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

// Add new styles for the dropdown
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', // Add background color for consistency
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  childInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  childAge: {
    fontSize: 16,
    color: 'gray',
  },
  dropdownToggle: {
     marginLeft: 'auto',
     paddingHorizontal: 10,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 0,
    marginBottom: 10,
    marginTop: -15,
  },
  dropdownScroll: {
    maxHeight: 150,
  },
   dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  dropdownItemTextContainer: {
    flex: 1,
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
    marginLeft: 10,
  },
});

export default UpdateVaccHiss; 