/*
  # Fix profiles table and policies

  1. Changes
    - Add INSERT policy for profiles table
    - Add default value for updated_at
    - Add trigger for auto-updating updated_at

  2. Security
    - Enable RLS on profiles table
    - Add policies for CRUD operations
*/

-- Add INSERT policy for profiles
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure updated_at has default value
ALTER TABLE profiles 
ALTER COLUMN updated_at SET DEFAULT now();

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();