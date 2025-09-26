"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Settings,
  User,
  Bell,
  Shield,
  Eye,
  Smartphone,
  Mail,
  Lock,
  Globe,
  Palette,
  Save,
} from "lucide-react";

interface SettingsSectionProps {
  userId: string;
}

interface UserSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    language: string;
    timezone: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    appointments: boolean;
    medications: boolean;
    labResults: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "doctors-only";
    shareDataForResearch: boolean;
    allowMarketing: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
  };
}

const mockSettings: UserSettings = {
  profile: {
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+34 600 123 456",
    language: "es",
    timezone: "Europe/Madrid",
  },
  notifications: {
    email: true,
    sms: false,
    push: true,
    appointments: true,
    medications: true,
    labResults: true,
  },
  privacy: {
    profileVisibility: "doctors-only",
    shareDataForResearch: false,
    allowMarketing: false,
  },
  security: {
    twoFactorEnabled: true,
    lastPasswordChange: "2024-01-01",
  },
};

export default function SettingsSection({ userId }: SettingsSectionProps) {
  const [settings, setSettings] = useState<UserSettings>(mockSettings);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "privacy" | "security">("profile");
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // Here you would save the settings to your backend
    console.log("Saving settings for user:", userId, settings);
    setHasChanges(false);
  };

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
          <p className="text-gray-600">Gestiona tu cuenta y preferencias</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "profile"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <User className="h-4 w-4 mr-2 inline" />
          Perfil
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "notifications"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Bell className="h-4 w-4 mr-2 inline" />
          Notificaciones
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "privacy"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Eye className="h-4 w-4 mr-2 inline" />
          Privacidad
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "security"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Shield className="h-4 w-4 mr-2 inline" />
          Seguridad
        </button>
      </div>

      {/* Content */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={settings.profile.name}
                  onChange={(e) => updateSetting("profile", "name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateSetting("profile", "email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={settings.profile.phone}
                  onChange={(e) => updateSetting("profile", "phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma
                </label>
                <select
                  value={settings.profile.language}
                  onChange={(e) => updateSetting("profile", "language", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Preferencias de Notificación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Canales de notificación</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => updateSetting("notifications", "email", e.target.checked)}
                    className="mr-3"
                  />
                  <Mail className="h-4 w-4 mr-2" />
                  Notificaciones por email
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) => updateSetting("notifications", "sms", e.target.checked)}
                    className="mr-3"
                  />
                  <Smartphone className="h-4 w-4 mr-2" />
                  Notificaciones por SMS
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) => updateSetting("notifications", "push", e.target.checked)}
                    className="mr-3"
                  />
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaciones push
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tipos de notificación</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.appointments}
                    onChange={(e) => updateSetting("notifications", "appointments", e.target.checked)}
                    className="mr-3"
                  />
                  Recordatorios de citas
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.medications}
                    onChange={(e) => updateSetting("notifications", "medications", e.target.checked)}
                    className="mr-3"
                  />
                  Recordatorios de medicación
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.labResults}
                    onChange={(e) => updateSetting("notifications", "labResults", e.target.checked)}
                    className="mr-3"
                  />
                  Resultados de laboratorio
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "privacy" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Configuración de Privacidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibilidad del perfil
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => updateSetting("privacy", "profileVisibility", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="private">Privado</option>
                <option value="doctors-only">Solo médicos</option>
                <option value="public">Público</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.privacy.shareDataForResearch}
                  onChange={(e) => updateSetting("privacy", "shareDataForResearch", e.target.checked)}
                  className="mr-3"
                />
                Compartir datos para investigación médica
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.privacy.allowMarketing}
                  onChange={(e) => updateSetting("privacy", "allowMarketing", e.target.checked)}
                  className="mr-3"
                />
                Recibir comunicaciones de marketing
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "security" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configuración de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Autenticación de dos factores</h4>
                <p className="text-sm text-gray-600">
                  Añade una capa extra de seguridad a tu cuenta
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={settings.security.twoFactorEnabled ? "default" : "secondary"}>
                  {settings.security.twoFactorEnabled ? "Activado" : "Desactivado"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSetting("security", "twoFactorEnabled", !settings.security.twoFactorEnabled)}
                >
                  {settings.security.twoFactorEnabled ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Contraseña</h4>
                <p className="text-sm text-gray-600">
                  Última actualización: {new Date(settings.security.lastPasswordChange).toLocaleDateString("es-ES")}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Lock className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Consejos de Seguridad</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Usa una contraseña única y segura</li>
                <li>• Activa la autenticación de dos factores</li>
                <li>• No compartas tu información de acceso</li>
                <li>• Revisa regularmente tu actividad de cuenta</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
