/*
  # Add organic remedies and vermicomposting details

  1. New Content
    - Add vermicomposting temperature and setup details
    - Add organic remedies recipes and applications
    - Add prohibited materials for vermicomposting
    
  2. Categories
    - Vermicomposting
    - Organic Remedies
*/

-- Update vermicomposting tip with additional information
UPDATE plant_tips 
SET content = content || '

Temperature requirements:
- Can withstand 4-30°C
- Ideal temperature around 20°C
- Keep protected from frost if outdoors

What NOT to include:
- Large amounts of citrus, onions, spices, or acidic foods
- Pine leaves
- Animal bones, meat, or fish
- Cheese or dairy products
- Mayonnaise, butter, or heavily seasoned foods
- Glossy paper (contains plastics)
- Plants treated with pesticides

Setup Process:
1. Choose a suitable location (terrace, patio, balcony, or indoors)
2. Ensure shade and frost protection if outside
3. Layer materials in vermicomposter:
   - Bottom: newspaper/cardboard sheet
   - Middle: substrate
   - Add worms
   - Top: organic waste layer

The amount of waste should match the number of worms and composter size. Worms typically consume all substrate in 7-15 days, leaving small lumps when food is depleted.

Reproduction:
- Worms reach breeding age at 3 months
- Each egg produces 2-20 new worms
- Average 36 reproduction cycles per year
- Each worm produces 0.3g humus daily'
WHERE category = 'Vermicomposting';

-- Insert organic remedies
INSERT INTO plant_tips (title, content, category, image_url) VALUES
  (
    'Natural Garden Remedies',
    'Here are effective organic remedies for plant care:

1. Banana Tea
How to prepare:
- Boil 4 well-ripened banana skins in 1L water for 10-15 minutes
Usage:
- Promotes flowering and fruiting
- Dilute 1:2 (1L tea to 2L water)
- Apply directly to plants

2. Garlic Infusion
How to prepare:
- Chop 15g garlic and mix with 10g soap in 1L water
- Mix well and filter
Usage:
- Natural insect repellent and insecticide
- Apply at sunrise or sunset
- Treatment duration: 5 days

3. Milk Fungicide
How to prepare:
- Mix 8 parts water, 2 parts milk, 1 tsp baking soda
Usage:
- Controls mildew, powdery mildew, rust, and botrytis
- Apply as spray, avoid overuse

4. Lentil Rooting Solution
How to prepare:
- Soak 1 part lentils in 4 parts water for 3-4 days
- Crush germinated lentils and filter
Usage:
- Natural rooting agent for cuttings
- Change solution daily for water-based cuttings
- Use only during first week
- Stores in refrigerator for 15 days

5. Quick Compost Boost
How to prepare:
- Blend coffee grounds, banana peels, and eggshells
Usage:
- Mix a few tablespoons with soil
- Provides quick nutrient boost',
    'Organic Remedies',
    'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?q=80&w=400&auto=format&fit=crop'
  );