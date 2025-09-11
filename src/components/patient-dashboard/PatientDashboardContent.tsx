"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { PatientDashboardLayout } from "./PatientDashboardLayout";
import { DashboardOverview } from "./sections/DashboardOverview";
import { AppointmentsSection } from "./sections/AppointmentsSection";
import { MedicalHistorySection } from "./sections/MedicalHistorySection";
import { MedicationsSection } from "./sections/MedicationsSection";
import { LabResultsSection } from "./sections/LabResultsSection";
import { MedicalTeamSection } from "./sections/MedicalTeamSection";
import { HealthMetricsSection } from "./sections/HealthMetricsSection";
import { DocumentsSection } from "./sections/DocumentsSection";
import { CaregiversSection } from "./sections/CaregiversSection";
import { EmergencySection } from "./sections/EmergencySection";
import HealthPlansSection from "./sections/HealthPlansSection";
import SecondOpinionSection from "./sections/SecondOpinionSection";
import NotificationsSection from "./sections/NotificationsSection";
import SettingsSection from "./sections/SettingsSection";

export type DashboardSection =
  | "overview"
  | "appointments"
  | "history"
  | "medications"
  | "lab-results"
  | "medical-team"
  | "health-metrics"
  | "documents"
  | "caregivers"
  | "emergency"
  | "health-plans"
  | "second-opinion"
  | "notifications"
  | "settings";

export function PatientDashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error('Error getting user:', error);
          
          // Si es error de cookies corruptas, limpiar y redirigir
          if (error.message?.includes('Failed to parse') || error.message?.includes('Invalid token')) {
            await supabase.auth.signOut();
            window.location.href = '/auth/login';
            return;
          }
          
          router.push("/auth/login");
          return;
        }

        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Verify user is a patient
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        // Check user metadata if profile doesn't exist
        const userType = profile?.user_type || user.user_metadata?.role || 'patient';
        
        if (userType !== "patient") {
          router.push("/auth/unauthorized");
          return;
        }

        setUser(user);
      } catch (error) {
        console.error('Unexpected error:', error);
        // En caso de error inesperado, limpiar estado y redirigir
        await supabase.auth.signOut();
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview userId={user.id} />;
      case "appointments":
        return <AppointmentsSection userId={user.id} />;
      case "history":
        return <MedicalHistorySection userId={user.id} />;
      case "medications":
        return <MedicationsSection userId={user.id} />;
      case "lab-results":
        return <LabResultsSection userId={user.id} />;
      case "medical-team":
        return <MedicalTeamSection userId={user.id} />;
      case "health-metrics":
        return <HealthMetricsSection userId={user.id} />;
      case "documents":
        return <DocumentsSection userId={user.id} />;
      case "caregivers":
        return <CaregiversSection userId={user.id} />;
      case "emergency":
        return <EmergencySection userId={user.id} />;
      case "health-plans":
        return <HealthPlansSection userId={user.id} />;
      case "second-opinion":
        return <SecondOpinionSection userId={user.id} />;
      case "notifications":
        return <NotificationsSection userId={user.id} />;
      case "settings":
        return <SettingsSection userId={user.id} />;
      default:
        return <DashboardOverview userId={user.id} />;
    }
  };

  return (
    <PatientDashboardLayout
      user={user}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderActiveSection()}
    </PatientDashboardLayout>
  );
}
