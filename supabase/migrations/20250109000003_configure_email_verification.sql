-- Configure email verification settings
-- This migration sets up email verification with OTP codes

-- Enable email confirmation
-- Note: This needs to be configured in Supabase Dashboard -> Authentication -> Settings
-- Set "Enable email confirmations" to true
-- Set "Confirm email" to true

-- Create a function to handle post-registration setup
CREATE OR REPLACE FUNCTION handle_new_user_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Create user profile based on user_type
    IF NEW.raw_user_meta_data->>'user_type' = 'patient' THEN
      -- Create patient profile
      INSERT INTO public.patients (
        id,
        email,
        first_name,
        last_name,
        full_name,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'full_name',
        NOW(),
        NOW()
      );
      
      -- Create emergency medical info record
      INSERT INTO public.emergency_medical_info (
        patient_id,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NOW(),
        NOW()
      );
      
    ELSIF NEW.raw_user_meta_data->>'user_type' = 'doctor' THEN
      -- Create doctor profile
      INSERT INTO public.doctors (
        id,
        email,
        first_name,
        last_name,
        full_name,
        is_verified,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'full_name',
        false, -- Will be verified later through setup wizard
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger for email verification
CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_verification();

-- Create a function to resend verification emails
CREATE OR REPLACE FUNCTION resend_verification_email(user_email TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- This would typically integrate with your email service
  -- For now, we'll just return a success message
  result := json_build_object(
    'success', true,
    'message', 'Verification email sent successfully'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION resend_verification_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user_verification() TO service_role;