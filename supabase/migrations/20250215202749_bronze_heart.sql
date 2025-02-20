/*
  # Add additional pest and disease information

  1. New Content
    - Add nematode pest information
    - Add red spider mite information
    - Add fungal disease information (rust, powdery mildew, mildew)
    
  2. Categories
    - Pests & Diseases
*/

-- Update existing pest information with nematodes and red spider
UPDATE plant_tips 
SET content = content || '

4. Nematodes
Description:
- Microscopic worms thriving in humid soils
- Common in orchards
- Difficult to detect early
Symptoms:
- Root damage
- Chlorosis (yellowing)
- Poor plant development
- Similar to water/nutrient deficiency
Affected Crops:
- Most horticultural plants
- Especially eggplant, potato, onion
Treatment:
- Crop rotation
- Plant sage nearby as natural deterrent

5. Red Spider Mites (Tetranichus urticae)
Description:
- Tiny red spiders
- Found mainly on leaf undersides
- More active in hot, dry conditions
Symptoms:
- Yellow spots on leaves
- Leaf drying and dropping
- Severe in hot weather
Affected Crops:
- Potatoes, beans, squash
- Fruit trees and almonds
Treatment:
- Remove affected areas
- Clear surrounding weeds
- Use phytoseiid mites as natural predators'
WHERE title = 'Common Garden Pests and Control';

-- Add fungal disease information
INSERT INTO plant_tips (title, content, category, image_url) VALUES
  (
    'Common Fungal Diseases',
    'Fungal diseases can severely impact your garden. Here are the most common types and their treatments:

1. Rust
Description:
- Easily identifiable fungus
- Characterized by reddish pustules on leaf undersides
- Causes leaf drop in severe cases
Affected Crops:
- Beans
- Peas
- Broad beans
Treatment:
- Horsetail infusion as natural antifungal

2. Powdery Mildew
Description:
- Creates powdery/cottony whitish layer
- Affects leaves and stems
- Common in humid conditions
Affected Crops:
- Cucumber
- Zucchini
- Melon
- Grapevine
Treatment:
- Apply horsetail infusion to affected areas
- Ensure good air circulation
- Avoid overhead watering

3. Mildew (Phytophthora infestans)
Description:
- Causes characteristic color-changing spots
- Progresses from green to yellow
- Affects leaves, stems, and fruits
Affected Crops:
- Potato
- Tomato
- Pepper
Treatment:
- Horsetail infusion application
- Add Trichoderma harzianum to soil
  (antagonistic fungus that controls pathogens)

Prevention Tips:
- Maintain good air circulation
- Avoid overwatering
- Remove infected plant material
- Practice crop rotation
- Use resistant varieties when available',
    'Pests & Diseases',
    'https://images.unsplash.com/photo-1598454444233-9dc334394ed3?q=80&w=400&auto=format&fit=crop'
  );