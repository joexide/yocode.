/*
  # Add pest information and additional organic remedies

  1. New Content
    - Add remaining organic remedies (eggshells and nettle purin)
    - Add pest information (aphids, white fly, thrips)
    - Add general pest control introduction
    
  2. Categories
    - Organic Remedies
    - Pests & Diseases
*/

-- Update organic remedies tip with additional information
UPDATE plant_tips 
SET content = content || '

6. Eggshell Treatment
How to prepare:
- Dry eggshells thoroughly
- Crush into small pieces
Usage:
- Acts as soil fertilizer
- Natural repellent for snails and caterpillars
- Apply dust around plant base

7. Nettle Purin
How to prepare:
- Mix 100g nettle with 10L water
- Let stand for 4 days
Usage:
- Effective against aphids
- Natural soil fertilizer
- Apply directly to plants'
WHERE title = 'Natural Garden Remedies';

-- Insert pest information
INSERT INTO plant_tips (title, content, category, image_url) VALUES
  (
    'Common Garden Pests and Control',
    'Understanding plant pests and diseases is crucial for maintaining a healthy garden. Early identification and proper treatment can prevent major crop damage.

1. Aphids
Description:
- Most common garden pest
- Multiple species with piercing mouthparts
- Often accompanied by ants feeding on their secretions
Affected Crops:
- Beans, cabbage, potatoes, peas, grapes
Symptoms:
- Deformed or curled buds and leaves
Treatment:
- Plant hyssop as natural repellent
- Introduce ladybugs (Coccinella septempunctata)
- Use organic insecticides

2. White Fly
Description:
- Small white insects on leaf undersides
- Easily visible when disturbing leaves
Affected Crops:
- Tomatoes, beans, peppers, onions, zucchini, carrots, cabbage
Symptoms:
- Yellowing leaves
- Premature leaf drop
Control Methods:
- Plant rosemary or basil nearby
- Use chromatic traps
- Introduce natural predators (Macrolophus caliginosus, Encarsia formosa)

3. Thrips
Description:
- Tiny insects (1-2mm)
- Resemble earwigs
Affected Crops:
- Tomatoes, beans, eggplants
Symptoms:
- Grayish-metallic coloration on affected parts
- Damage to fruits, leaves, stems, and flowers
Control:
- Install blue adhesive traps
- Introduce predatory mites (Neoseiulus barkerii, Amblyseius cucumeris)

Prevention Tips:
- Regular plant inspection
- Maintain garden hygiene
- Use companion planting
- Implement crop rotation
- Support beneficial insects',
    'Pests & Diseases',
    'https://images.unsplash.com/photo-1587334207407-deb137a955ba?q=80&w=400&auto=format&fit=crop'
  );