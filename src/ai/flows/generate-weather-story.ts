'use server';
/**
 * @fileOverview An AI agent for generating short, fun weather-themed stories.
 *
 * - generateWeatherStory - A function that generates a weather story.
 * - GenerateWeatherStoryInput - The input type for the function.
 * - GenerateWeatherStoryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeatherStoryInputSchema = z.object({
  locationName: z.string().describe("The name of the location (e.g., London)."),
  currentConditionText: z.string().describe("The current weather condition text (e.g., Sunny, Gentle Rain, Windy)."),
  temperatureCelcius: z.number().describe("The current temperature in Celsius.")
});
export type GenerateWeatherStoryInput = z.infer<typeof GenerateWeatherStoryInputSchema>;

const GenerateWeatherStoryOutputSchema = z.object({
  story: z.string().describe("A short, imaginative, and fun weather-themed story (2-4 sentences), suitable for all ages. The story should be inspired by the current weather conditions."),
});
export type GenerateWeatherStoryOutput = z.infer<typeof GenerateWeatherStoryOutputSchema>;

export async function generateWeatherStory(input: GenerateWeatherStoryInput): Promise<GenerateWeatherStoryOutput> {
  return generateWeatherStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeatherStoryPrompt',
  input: {schema: GenerateWeatherStoryInputSchema},
  output: {schema: GenerateWeatherStoryOutputSchema},
  prompt: `You are a creative storyteller who writes short, fun, and imaginative weather-themed stories for all ages, especially kids.
The weather in {{locationName}} is currently {{currentConditionText}} with a temperature of {{temperatureCelcius}}°C.

Create a very short story (2-4 sentences) based on this weather. Make it whimsical and engaging.

Examples:
- If sunny: "In {{locationName}}, the sun decided to throw a golden party today! Fluffy clouds danced in the sky, giggling as they played hide-and-seek with the joyful sunbeams."
- If rainy: "The clouds over {{locationName}} were like giant watering cans, giving all the plants a refreshing drink. Little puddles turned into tiny mirrors, reflecting the sky's soft grey blanket."
- If windy: "A playful breeze swept through {{locationName}}, whispering secrets to the trees. Leaves twirled and cartwheeled, enjoying their airy ballet in the {{temperatureCelcius}}°C weather."
- If snowy: "Winter fairies visited {{locationName}} last night, blanketing everything in sparkling white dust. The town looked like a giant frosted cake, waiting for snowmen to come alive!"

Generate a weather story:`,
});

const generateWeatherStoryFlow = ai.defineFlow(
  {
    name: 'generateWeatherStoryFlow',
    inputSchema: GenerateWeatherStoryInputSchema,
    outputSchema: GenerateWeatherStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
