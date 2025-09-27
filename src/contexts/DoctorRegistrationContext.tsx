import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { DoctorRegistrationData } from '@/types/medical/specialties';

const LOCAL_STORAGE_KEY = 'doctor-registration-data';

// Define the steps
export type RegistrationStep = 'personal_info' | 'professional_info' | 'specialty_selection' | 'identity_verification';

const STEP_ORDER: RegistrationStep[] = ['personal_info', 'professional_info', 'specialty_selection', 'identity_verification'];

// Define the shape of the context
interface DoctorRegistrationContextType {
  currentStep: RegistrationStep;
  registrationData: DoctorRegistrationData;
  updateRegistrationData: (data: Partial<DoctorRegistrationData>) => void;
  updateData: (data: Partial<DoctorRegistrationData>) => void; // Alias for compatibility
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

// Create the context
const DoctorRegistrationContext = createContext<DoctorRegistrationContextType | undefined>(undefined);

// Create the provider component
export const DoctorRegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('personal_info');
  const [registrationData, setRegistrationData] = useState<DoctorRegistrationData>(() => {
    try {
      const storedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        specialtyId: '',
        licenseNumber: '',
        licenseState: '',
        licenseExpiry: '',
        yearsOfExperience: 0,
        bio: '',
        selectedFeatures: [],
        workingHours: {
          monday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          tuesday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          wednesday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          thursday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          friday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          saturday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          sunday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' }
        }
      };
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        specialtyId: '',
        licenseNumber: '',
        licenseState: '',
        licenseExpiry: '',
        yearsOfExperience: 0,
        bio: '',
        selectedFeatures: [],
        workingHours: {
          monday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          tuesday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          wednesday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          thursday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          friday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          saturday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
          sunday: { isWorkingDay: false, startTime: '09:00', endTime: '17:00' }
        }
      };
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(registrationData));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [registrationData]);

  const updateRegistrationData = useCallback((data: Partial<DoctorRegistrationData>) => {
    setRegistrationData(prevData => ({ ...prevData, ...data }));
  }, []);

  // Alias for compatibility with existing components
  const updateData = updateRegistrationData;

  const goToNextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  }, [currentStep]);

  const value = useMemo(() => ({
    currentStep,
    registrationData,
    updateRegistrationData,
    updateData,
    goToNextStep,
    goToPreviousStep,
  }), [currentStep, registrationData, updateRegistrationData, updateData, goToNextStep, goToPreviousStep]);

  return (
    <DoctorRegistrationContext.Provider value={value}>
      {children}
    </DoctorRegistrationContext.Provider>
  );
};

// Create a custom hook to use the context
export const useDoctorRegistration = () => {
  const context = useContext(DoctorRegistrationContext);
  if (context === undefined) {
    throw new Error('useDoctorRegistration must be used within a DoctorRegistrationProvider');
  }
  return context;
};
