import { supabase } from './supabase';
import { chatWithFreddy, generatePlantSchedule } from './openrouter';
import type { Plant } from './supabase';

export async function updatePlantSchedule(plant: Plant): Promise<void> {
  try {
    const schedule = await generatePlantSchedule(
      plant.name,
      new Date(plant.planting_date)
    );

    await supabase
      .from('plants')
      .update({
        estimated_harvest_date: schedule.harvestDate.toISOString(),
        watering_frequency: schedule.wateringSchedule.frequency,
        next_watering: schedule.wateringSchedule.nextDate.toISOString()
      })
      .eq('id', plant.id);
  } catch (error) {
    console.error('Failed to update plant schedule:', error);
    throw error;
  }
}

export async function getWateringRecommendation(plant: Plant): Promise<string> {
  try {
    const prompt = `As a gardening expert, please provide specific watering advice for:
      Plant: ${plant.name}
      Stage: ${plant.stage}
      Current Watering Schedule: Every ${plant.watering_frequency} days
      Next Scheduled Watering: ${new Date(plant.next_watering).toISOString().split('T')[0]}
      Days Since Planting: ${Math.floor((new Date().getTime() - new Date(plant.planting_date).getTime()) / (1000 * 60 * 60 * 24))}
      Days Until Harvest: ${Math.floor((new Date(plant.estimated_harvest_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}

      Please provide:
      1. Detailed watering instructions for the current growth stage
      2. Signs to watch for proper watering
      3. Adjustments needed based on growth progress
      4. Tips for optimal water absorption
      5. Common watering mistakes to avoid

      Format the response in clear, actionable points.`;

    const response = await chatWithFreddy([
      { role: 'user', content: prompt }
    ]);

    return response;
  } catch (error) {
    console.error('Failed to get watering recommendation:', error);
    return `Water your ${plant.name} according to the current schedule: every ${plant.watering_frequency} days.`;
  }
}

export async function getGrowthStageAdvice(plant: Plant): Promise<string> {
  try {
    const prompt = `As a gardening expert, please provide growth stage advice for:
      Plant: ${plant.name}
      Current Stage: ${plant.stage}
      Days Since Planting: ${Math.floor((new Date().getTime() - new Date(plant.planting_date).getTime()) / (1000 * 60 * 60 * 24))}
      Expected Harvest: ${new Date(plant.estimated_harvest_date).toLocaleDateString()}

      Please provide:
      1. Key care requirements for the current stage
      2. Signs of healthy growth to look for
      3. Common problems to watch out for
      4. Upcoming stage transitions and preparation
      5. Nutrition and support needs

      Format the response in clear, actionable points.`;

    const response = await chatWithFreddy([
      { role: 'user', content: prompt }
    ]);

    return response;
  } catch (error) {
    console.error('Failed to get growth stage advice:', error);
    return `Continue caring for your ${plant.name} according to its current schedule.`;
  }
}