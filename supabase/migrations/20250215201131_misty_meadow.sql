/*
  # Add detailed gardening tips

  1. New Content
    - Add detailed tips for starting a garden
    - Add composting guide
    - Add vermicomposting guide
    
  2. Categories
    - Getting Started
    - Composting
    - Vermicomposting
*/

-- Insert new tips
INSERT INTO plant_tips (title, content, category, image_url) VALUES
  (
    'Understanding Plant Cycles',
    'The cycle of vegetables is crucial for planning your garden throughout the year. You can distribute short-cycle plants (like root and leaf vegetables) with longer-cycle plants (fruit-bearing vegetables). This allows for efficient use of space and continuous harvesting.

Some vegetables cannot grow side by side due to nutrient competition or root secretions that affect neighboring plants. However, some combinations can be beneficial, protecting against parasites and supporting each other''s growth.

Check the planner section for visual information about sowing calendars, care requirements, and plant associations for common vegetables.',
    'Getting Started',
    'https://images.unsplash.com/photo-1599598425947-5202edd56bdb?q=80&w=400&auto=format&fit=crop'
  ),
  (
    'Creating Your Own Compost',
    'Making compost is simple and rewarding. Layer organic materials (garden clippings, kitchen scraps) with dry materials (leaves, paper) and soil to create nutrient-rich humus.

To create a hot-compost heap:
1. Build a pile at least 3 feet deep
2. Create alternating 4-8 inch layers of green materials (kitchen scraps, fresh leaves) and brown materials (dried leaves, paper)
3. Maintain dampness like a wrung-out sponge
4. Monitor temperature (130-150°F is ideal)
5. Turn weekly during growing season

Materials you can use:
- Green/Organic: Fruit waste, vegetable scraps, coffee grounds, tea bags, fresh manure
- Brown/Dry: Leaves, cardboard, paper, sawdust, straw

Your compost is ready when it''s brown, crumbly, and no longer generating heat.',
    'Composting',
    'https://images.unsplash.com/photo-1583485646409-f9feb9af2a08?q=80&w=400&auto=format&fit=crop'
  ),
  (
    'Introduction to Vermicomposting',
    'Vermicomposting is an efficient way to convert organic waste into high-quality fertilizer using earthworms. It''s perfect for small spaces like balconies or patios.

Key requirements for successful vermicomposting:
1. Use California red worms (5-9cm long)
2. Maintain constant moisture
3. Ensure darkness (worms are light-sensitive)
4. Keep pH above 4.5

The process produces:
- Rich vermicompost
- Liquid leachate (excellent fertilizer)

Essential ingredients:
- Nitrogen sources: Fruit/vegetable scraps
- Carbon sources: Paper, cardboard, cereal husks
- Supplements: Crushed eggshells (calcium), coffee grounds

Chop materials finely and cover fresh waste with paper to prevent flies.',
    'Vermicomposting',
    'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=400&auto=format&fit=crop'
  );