/*
  # Plant Management Schema

  1. New Tables
    - `plants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `category` (text)
      - `stage` (text)
      - `planting_date` (timestamptz)
      - `estimated_harvest_date` (timestamptz)
      - `next_watering` (timestamptz)
      - `watering_frequency` (integer, days)
      - `image_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `plants` table
    - Add policies for authenticated users to manage their own plants
*/

-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  stage text NOT NULL,
  planting_date timestamptz NOT NULL DEFAULT now(),
  estimated_harvest_date timestamptz,
  next_watering timestamptz,
  watering_frequency integer NOT NULL DEFAULT 7,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own plants"
  ON plants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants"
  ON plants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants"
  ON plants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants"
  ON plants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();