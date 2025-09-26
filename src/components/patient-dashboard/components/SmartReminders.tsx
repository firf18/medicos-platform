'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  BellIcon, 
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  BeakerIcon,
  HeartIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

interface SmartRemindersProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'medication' | 'appointment' | 'exercise' | 'measurement' | 'checkup' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledTime: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: string;
  snoozeUntil?: string;
  notificationSettings: {
    pushNotification: boolean;
    emailNotification: boolean;
    smsNotification: boolean;
    advanceNotice: number; // minutos
  };
  metadata?: any;
}

interface ReminderStats {
  totalReminders: number;
  activeReminders: number;
  completedToday: number;
  overdue: number;
}

export function SmartReminders({ userId, darkMode, realTimeData }: SmartRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [reminderStats, setReminderStats] = useState<ReminderStats>({
    totalReminders: 0,
    activeReminders: 0,
    completedToday: 0,
    overdue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    type: 'other' as const,
    priority: 'normal' as const,
    scheduledTime: '',
    frequency: 'once' as const,
    pushNotification: true,
    emailNotification: false,
    smsNotification: false,
    advanceNotice: 15
  });
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadReminders();
    
    // Configurar intervalo para actualizar recordatorios
    const interval = setInterval(loadReminders, 60000); // Actualizar cada minuto
    
    return () => clearInterval(interval);
  }, [userId]);

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('smart_reminders')
        .select('*')
        .eq('patient_id', userId)
        .eq('is_active', true)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      if (data) {
        const processedReminders: Reminder[] = data.map(reminder => ({
          id: reminder.id,
          title: reminder.title,
          description: reminder.description,
          type: reminder.reminder_type,
          priority: reminder.priority,
          scheduledTime: reminder.scheduled_time,
          frequency: reminder.frequency,
          isActive: reminder.is_active,
          isCompleted: reminder.is_completed,
          completedAt: reminder.completed_at,
          snoozeUntil: reminder.snooze_until,
          notificationSettings: {
            pushNotification: reminder.push_notification || false,
            emailNotification: reminder.email_notification || false,
            smsNotification: reminder.sms_notification || false,
            advanceNotice: reminder.advance_notice || 15
          },
          metadata: reminder.metadata
        }));

        setReminders(processedReminders);
        
        // Filtrar recordatorios de hoy
        const today = new Date().toDateString();
        const todayReminders = processedReminders.filter(reminder => 
          new Date(reminder.scheduledTime).toDateString() === today
        );
        setTodayReminders(todayReminders);
        
        // Calcular estadísticas
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const stats: ReminderStats = {
          totalReminders: processedReminders.length,
          activeReminders: processedReminders.filter(r => r.isActive && !r.isCompleted).length,
          completedToday: processedReminders.filter(r => 
            r.completedAt && new Date(r.completedAt) >= todayStart
          ).length,
          overdue: processedReminders.filter(r => 
            r.isActive && !r.isCompleted && new Date(r.scheduledTime) < now
          ).length
        };
        
        setReminderStats(stats);
      }

    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addReminder = async () => {
    try {
      const reminderData = {
        patient_id: userId,
        title: newReminder.title,
        description: newReminder.description,
        reminder_type: newReminder.type,
        priority: newReminder.priority,
        scheduled_time: newReminder.scheduledTime,
        frequency: newReminder.frequency,
        is_active: true,
        is_completed: false,
        push_notification: newReminder.pushNotification,
        email_notification: newReminder.emailNotification,
        sms_notification: newReminder.smsNotification,
        advance_notice: newReminder.advanceNotice
      };

      const { error } = await supabase
        .from('smart_reminders')
        .insert([reminderData]);

      if (error) throw error;

      setNewReminder({
        title: '',
        description: '',
        type: 'other',
        priority: 'normal',
        scheduledTime: '',
        frequency: 'once',
        pushNotification: true,
        emailNotification: false,
        smsNotification: false,
        advanceNotice: 15
      });
      setShowAddReminder(false);
      loadReminders();

    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const completeReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('smart_reminders')
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', reminderId);

      if (error) throw error;

      loadReminders();

    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const snoozeReminder = async (reminderId: string, minutes: number) => {
    try {
      const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
      
      const { error } = await supabase
        .from('smart_reminders')
        .update({ snooze_until: snoozeUntil.toISOString() })
        .eq('id', reminderId);

      if (error) throw error;

      loadReminders();

    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('smart_reminders')
        .update({ is_active: false })
        .eq('id', reminderId);

      if (error) throw error;

      loadReminders();

    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'medication': return <BeakerIcon className="w-5 h-5 text-green-500" />;
      case 'appointment': return <CalendarIcon className="w-5 h-5 text-blue-500" />;
      case 'exercise': return <HeartIcon className="w-5 h-5 text-red-500" />;
      case 'measurement': return <ClockIcon className="w-5 h-5 text-purple-500" />;
      case 'checkup': return <UserGroupIcon className="w-5 h-5 text-indigo-500" />;
      default: return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'normal': return 'Normal';
      default: return 'Baja';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'medication': return 'Medicamento';
      case 'appointment': return 'Cita Médica';
      case 'exercise': return 'Ejercicio';
      case 'measurement': return 'Medición';
      case 'checkup': return 'Chequeo';
      default: return 'Otro';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (reminder: Reminder) => {
    const now = new Date();
    const scheduledTime = new Date(reminder.scheduledTime);
    return !reminder.isCompleted && scheduledTime < now && (!reminder.snoozeUntil || new Date(reminder.snoozeUntil) < now);
  };

  const isUpcoming = (reminder: Reminder) => {
    const now = new Date();
    const scheduledTime = new Date(reminder.scheduledTime);
    const timeDiff = scheduledTime.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff <= 60 * 60 * 1000; // Próxima hora
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recordatorios Inteligentes
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {reminderStats.activeReminders} recordatorios activos
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={loadReminders}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <ArrowPathIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={() => setShowAddReminder(true)}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {reminderStats.activeReminders}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Activos
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {reminderStats.completedToday}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Completados Hoy
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {reminderStats.overdue}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Atrasados
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {reminderStats.totalReminders}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total
            </p>
          </div>
        </div>
      </div>

      {/* Recordatorios de hoy */}
      {todayReminders.length > 0 && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
          <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
            Recordatorios de Hoy
          </h4>
          <div className="space-y-2">
            {todayReminders.slice(0, 3).map((reminder) => (
              <div
                key={reminder.id}
                className={`p-3 rounded-lg border ${
                  isOverdue(reminder) 
                    ? 'border-red-300 bg-red-50' 
                    : isUpcoming(reminder)
                    ? 'border-yellow-300 bg-yellow-50'
                    : darkMode 
                    ? 'bg-gray-600 border-gray-500' 
                    : 'bg-white border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getReminderIcon(reminder.type)}
                    <div>
                      <h5 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {reminder.title}
                      </h5>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatTime(reminder.scheduledTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isOverdue(reminder) && (
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                    )}
                    
                    {!reminder.isCompleted && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => completeReminder(reminder.id)}
                          className="p-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                        >
                          <CheckCircleIcon className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => snoozeReminder(reminder.id, 15)}
                          className="p-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                        >
                          <ClockIcon className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de todos los recordatorios */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <BellSolidIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay recordatorios configurados</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-4 rounded-lg border ${
                isOverdue(reminder) 
                  ? 'border-red-300 bg-red-50' 
                  : darkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-200'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  {getReminderIcon(reminder.type)}
                  <div className="flex-1">
                    <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {reminder.title}
                    </h5>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      {reminder.description}
                    </p>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(reminder.priority)}`}>
                        {getPriorityText(reminder.priority)}
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {getTypeText(reminder.type)}
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {formatTime(reminder.scheduledTime)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {reminder.isCompleted ? (
                    <span className="text-green-600 text-xs">
                      Completado
                    </span>
                  ) : (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => completeReminder(reminder.id)}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => snoozeReminder(reminder.id, 30)}
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                      >
                        <ClockIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Configuraciones de notificación */}
              <div className="flex items-center space-x-4 text-xs">
                {reminder.notificationSettings.pushNotification && (
                  <span className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <BellIcon className="w-3 h-3" />
                    <span>Push</span>
                  </span>
                )}
                {reminder.notificationSettings.emailNotification && (
                  <span className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <DocumentTextIcon className="w-3 h-3" />
                    <span>Email</span>
                  </span>
                )}
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {reminder.notificationSettings.advanceNotice} min antes
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para agregar recordatorio */}
      {showAddReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-full mx-4 max-h-[80vh] overflow-y-auto`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Crear Recordatorio
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Título
                </label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Ej: Tomar medicamento"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descripción
                </label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full p-2 rounded-lg border resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  rows={2}
                  placeholder="Descripción del recordatorio..."
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo
                </label>
                <select
                  value={newReminder.type}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, type: e.target.value as any }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="medication">Medicamento</option>
                  <option value="appointment">Cita Médica</option>
                  <option value="exercise">Ejercicio</option>
                  <option value="measurement">Medición</option>
                  <option value="checkup">Chequeo</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Prioridad
                </label>
                <select
                  value={newReminder.priority}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, priority: e.target.value as any }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  value={newReminder.scheduledTime}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Frecuencia
                </label>
                <select
                  value={newReminder.frequency}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="once">Una vez</option>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notificaciones
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pushNotification"
                      checked={newReminder.pushNotification}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, pushNotification: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="pushNotification" className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notificación Push
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotification"
                      checked={newReminder.emailNotification}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, emailNotification: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="emailNotification" className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notificación por Email
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notificar con antelación (minutos)
                </label>
                <input
                  type="number"
                  value={newReminder.advanceNotice}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, advanceNotice: parseInt(e.target.value) || 15 }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  min="0"
                  max="1440"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddReminder(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} text-gray-900 transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={addReminder}
                disabled={!newReminder.title || !newReminder.scheduledTime}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
