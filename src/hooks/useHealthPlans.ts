'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type HealthPlan = Database['public']['Tables']['health_plans']['Row']
type HealthPlanTask = Database['public']['Tables']['health_plan_tasks']['Row']

export const useHealthPlans = (userId: string) => {
  const [plans, setPlans] = useState<HealthPlan[]>([])
  const [tasks, setTasks] = useState<HealthPlanTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchHealthPlans = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      // Obtener planes de salud
      const { data: plansData, error: plansError } = await supabase
        .from('health_plans')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false })

      if (plansError) throw plansError

      // Obtener tareas de los planes
      const { data: tasksData, error: tasksError } = await supabase
        .from('health_plan_tasks')
        .select('*')
        .in('health_plan_id', plansData?.map(plan => plan.id) || [])
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      setPlans(plansData || [])
      setTasks(tasksData || [])
    } catch (err) {
      console.error('Error fetching health plans:', err)
      setError('Error al cargar los planes de salud')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const addPlan = async (planData: Partial<HealthPlan>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('health_plans')
        .insert({
          patient_id: userId,
          ...planData
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      // Refrescar los planes
      await fetchHealthPlans()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error adding health plan:', err)
      return { success: false, error: 'Error al agregar el plan de salud' }
    }
  }

  const updatePlan = async (planId: string, updates: Partial<HealthPlan>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('health_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar los planes
      await fetchHealthPlans()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating health plan:', err)
      return { success: false, error: 'Error al actualizar el plan de salud' }
    }
  }

  const deletePlan = async (planId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('health_plans')
        .delete()
        .eq('id', planId)

      if (deleteError) throw deleteError
      
      // Refrescar los planes
      await fetchHealthPlans()
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting health plan:', err)
      return { success: false, error: 'Error al eliminar el plan de salud' }
    }
  }

  const addTask = async (taskData: Partial<HealthPlanTask>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('health_plan_tasks')
        .insert(taskData)
        .select()
        .single()

      if (insertError) throw insertError
      
      // Refrescar las tareas
      await fetchHealthPlans()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error adding health plan task:', err)
      return { success: false, error: 'Error al agregar la tarea' }
    }
  }

  const updateTask = async (taskId: string, updates: Partial<HealthPlanTask>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('health_plan_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar las tareas
      await fetchHealthPlans()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating health plan task:', err)
      return { success: false, error: 'Error al actualizar la tarea' }
    }
  }

  const markTaskAsCompleted = async (taskId: string, completed: boolean) => {
    try {
      const { data, error: updateError } = await supabase
        .from('health_plan_tasks')
        .update({ 
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', taskId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar las tareas
      await fetchHealthPlans()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error marking task as completed:', err)
      return { success: false, error: 'Error al marcar la tarea como completada' }
    }
  }

  useEffect(() => {
    fetchHealthPlans()
  }, [fetchHealthPlans])

  return {
    plans,
    tasks,
    loading,
    error,
    refetch: fetchHealthPlans,
    addPlan,
    updatePlan,
    deletePlan,
    addTask,
    updateTask,
    markTaskAsCompleted
  }
}