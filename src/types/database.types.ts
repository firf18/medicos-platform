export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'admin' | 'doctor' | 'patient' | 'clinic' | 'laboratory';
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Patient = {
  id: string;
  date_of_birth: string | null;
  blood_type: string | null;
  allergies: string[];
  created_at: string;
  updated_at: string;
};

export type Doctor = {
  id: string;
  specialty_id: string | null;
  license_number: string | null;
  bio: string | null;
  experience_years: number;
  consultation_fee: number;
  created_at: string;
  updated_at: string;
};

export type Clinic = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
};

export type Laboratory = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
};

export type ClinicDoctor = {
  id: string;
  clinic_id: string | null;
  doctor_id: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

export type LaboratoryService = {
  id: string;
  laboratory_id: string | null;
  name: string;
  description: string | null;
  price: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

export type LabResult = {
  id: string;
  laboratory_id: string | null;
  patient_id: string | null;
  doctor_id: string | null;
  service_id: string | null;
  test_name: string;
  result: string | null;
  result_file_url: string | null;
  is_critical: boolean | null;
  performed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Tables = {
  profiles: Profile;
  patients: Patient;
  doctors: Doctor;
  clinics: Clinic;
  laboratories: Laboratory;
  clinic_doctors: ClinicDoctor;
  laboratory_services: LaboratoryService;
  lab_results: LabResult;
  notifications: Notification;
};