/*
  # Plant Tips Schema

  1. New Tables
    - `plant_tips`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `category` (text)
      - `image_url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `plant_tips` table
    - Add policy for authenticated users to read tips
*/

-- Create plant_tips table
CREATE TABLE IF NOT EXISTS plant_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE plant_tips ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view tips"
  ON plant_tips
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert some initial tips
INSERT INTO plant_tips (title, content, category, image_url) VALUES
  (
    'Starting Your First Vegetable Garden',
    'Begin with easy-to-grow vegetables like tomatoes, lettuce, and peppers. Ensure your garden gets at least 6 hours of sunlight daily.',
    'Vegetables',
    'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=400&auto=format&fit=crop'
  ),
  (
    'Essential Herbs for Every Garden',
    E'Basil, mint, and rosemary are perfect starter herbs. They\'re hardy and can be grown indoors or outdoors.',
    'Herbs',
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=400&auto=format&fit=crop'
  ),
  (
    'Watering Tips for Healthy Plants',
    'Water deeply but less frequently to encourage strong root growth. Most plants prefer morning watering.',
    'General',
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=400&auto=format&fit=crop'
  );