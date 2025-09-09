export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'admin' | 'doctor' | 'patient';
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

export type Tables = {
  profiles: Profile;
  patients: Patient;
  doctors: Doctor;
};
