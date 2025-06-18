
import type { LucideProps, LucideIcon } from 'lucide-react';
import { Shirt, Wind, Umbrella, CloudSun, CloudSnow, Coffee, GlassWater, CookingPot, Utensils, HeartPulse, ThermometerIcon, Activity, Siren, Cloudy, Sun, Snowflake, Zap, HelpCircle, Home as HomeIcon } from 'lucide-react';

export interface Suggestion {
  item: string;
  icon: LucideIcon;
  details?: string;
}

export interface MedicalTip {
  tip: string;
  icon: LucideIcon;
  category: 'General' | 'Flu/Cough' | 'Heatstroke' | 'Cold Weather';
}

const getIconByWeatherCondition = (conditionText: string): LucideIcon => {
  const condition = conditionText.toLowerCase();
  if (condition.includes('sunny') || condition.includes('clear')) return Sun;
  if (condition.includes('cloudy') || condition.includes('overcast')) return Cloudy;
  if (condition.includes('rain') || condition.includes('drizzle')) return Umbrella;
  if (condition.includes('snow') || condition.includes('blizzard') || condition.includes('ice pellets')) return Snowflake;
  if (condition.includes('thunder')) return Zap;
  if (condition.includes('mist') || condition.includes('fog')) return Wind; // Using Wind for mist/fog as a general icon
  return HelpCircle; // Default icon
};


export const getClothingSuggestions = (condition: string, tempC: number): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle")) {
    suggestions.push({ item: "Raincoat & Umbrella", icon: Umbrella });
  }
  if (lowerCondition.includes("snow") || lowerCondition.includes("blizzard") || lowerCondition.includes("sleet")) {
    suggestions.push({ item: "Heavy winter coat, gloves, hat, and scarf", icon: CloudSnow });
  }

  if (tempC > 25) { // Hot
    suggestions.push({ item: "Light cotton wear, shorts", icon: Shirt });
    suggestions.push({ item: "Sunglasses and Hat", icon: CloudSun });
  } else if (tempC > 15 && tempC <= 25) { // Mild
    suggestions.push({ item: "Light jacket or sweater", icon: Shirt });
  } else if (tempC > 5 && tempC <= 15) { // Cool
    suggestions.push({ item: "Warm jacket or coat", icon: Shirt });
    suggestions.push({ item: "Consider layers", icon: Shirt });
  } else { // Cold
    suggestions.push({ item: "Woolen jacket, thermal wear", icon: CloudSnow });
    if (!lowerCondition.includes("snow")) { // Add if not already added by snow condition
        suggestions.push({ item: "Gloves and beanie", icon: CloudSnow });
    }
  }
  
  if (suggestions.length === 0) {
    suggestions.push({ item: "Dress according to temperature and personal comfort.", icon: Shirt });
  }

  // Deduplicate based on icon (simple way to avoid very similar suggestions)
  const uniqueSuggestions = Array.from(new Set(suggestions.map(s => s.item)))
    .map(item => suggestions.find(s => s.item === item)!);
  
  return uniqueSuggestions.slice(0, 3);
};

export const getFoodSuggestions = (condition: string, tempC: number): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const lowerCondition = condition.toLowerCase();

  if (tempC > 25) { // Hot
    suggestions.push({ item: "Fresh juices, smoothies, and ice cream", icon: GlassWater });
    suggestions.push({ item: "Light salads and fruits", icon: Utensils });
  } else if (tempC <= 10 || lowerCondition.includes("rain") || lowerCondition.includes("snow")) { // Cold or Wet
    suggestions.push({ item: "Hot soup, stews, and broths", icon: CookingPot });
    suggestions.push({ item: "Warm beverages like tea or coffee", icon: Coffee });
    suggestions.push({ item: "Ginger and herbal teas", icon: Coffee });
  } else { // Mild
    suggestions.push({ item: "Comfort food like pasta or rice dishes", icon: Utensils });
    suggestions.push({ item: "Seasonal fruits and vegetables", icon: Utensils });
  }
  
  if (suggestions.length === 0) {
     suggestions.push({ item: "Enjoy a balanced meal suitable for the day!", icon: Utensils });
  }
  
  const uniqueSuggestions = Array.from(new Set(suggestions.map(s => s.item)))
    .map(item => suggestions.find(s => s.item === item)!);

  return uniqueSuggestions.slice(0, 3);
};

export const getMedicalTips = (condition: string, tempC: number): MedicalTip[] => {
  const tips: MedicalTip[] = [];
  const lowerCondition = condition.toLowerCase();

  // General Tips
  tips.push({ tip: "Wash hands frequently to prevent spread of germs.", icon: HeartPulse, category: 'General' });
  tips.push({ tip: "Ensure you get adequate sleep for better immunity.", icon: Activity, category: 'General' });


  if (tempC > 28 || lowerCondition.includes("sunny")) {
    tips.push({ tip: "Stay hydrated: drink plenty of water throughout the day.", icon: GlassWater, category: 'Heatstroke' });
    tips.push({ tip: "Avoid prolonged sun exposure, especially during peak hours (10 AM - 4 PM).", icon: Sun, category: 'Heatstroke' });
    tips.push({ tip: "Wear sunscreen with high SPF to protect your skin.", icon: Sun, category: 'Heatstroke' });
    tips.push({ tip: "Recognize heatstroke symptoms: dizziness, nausea, rapid pulse. Seek shade and cool down if affected.", icon: ThermometerIcon, category: 'Heatstroke' });
  }

  if (tempC < 10 || lowerCondition.includes("snow") || lowerCondition.includes("cold")) {
    tips.push({ tip: "Keep warm to avoid hypothermia. Dress in layers.", icon: Snowflake, category: 'Cold Weather' });
    tips.push({ tip: "Be cautious of icy surfaces to prevent falls.", icon: Activity, category: 'Cold Weather' });
    tips.push({ tip: "Ensure indoor heating is safe and well-ventilated.", icon: HomeIcon, category: 'Cold Weather' }); // HomeIcon is now defined
  }
  
  if (lowerCondition.includes("rain") || lowerCondition.includes("humidity") || tempC < 15) {
     tips.push({ tip: "Be mindful of flu/cough symptoms. Cover your mouth when coughing/sneezing.", icon: ThermometerIcon, category: 'Flu/Cough' });
     tips.push({ tip: "Gargle with warm salt water for a sore throat.", icon: GlassWater, category: 'Flu/Cough' });
     tips.push({ tip: "Boost immunity with vitamin C rich foods.", icon: Utensils, category: 'Flu/Cough' });
  }


  // Fallback if specific conditions didn't add enough tips
  if (tips.length < 3) {
      tips.push({ tip: "Maintain a balanced diet and exercise regularly for overall health.", icon: Activity, category: 'General'});
  }
  
  // Replace HomeIcon if it was used as placeholder. Using Siren for general safety/prevention.
  return tips.map(tip => tip.icon === HomeIcon ? {...tip, icon: Siren} : tip).slice(0,4);
};

export { Shirt, Wind, Umbrella, CloudSun, CloudSnow, Coffee, GlassWater, CookingPot, Utensils, HeartPulse, ThermometerIcon as Thermometer, Activity, Siren, Cloudy, Sun, Snowflake, Zap, HelpCircle as QuestionMark, HomeIcon };
export const WeatherIcon = getIconByWeatherCondition;

