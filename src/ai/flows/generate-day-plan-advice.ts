'use server';
/**
 * @fileOverview An AI agent for generating personalized day planning advice based on weather.
 *
 * - generateDayPlanAdvice - A function that generates actionable advice.
 * - GenerateDayPlanAdviceInput - The input type for the function.
 * - GenerateDayPlanAdviceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDayPlanAdviceInputSchema = z.object({
  locationName: z.string().describe("The name of the location (e.g., London)."),
  currentTempC: z.number().describe("The current temperature in Celsius."),
  currentConditionText: z.string().describe("The current weather condition text (e.g., Sunny, Partly cloudy)."),
  feelsLikeTempC: z.number().describe("What the current temperature feels like in Celsius."),
  humidity: z.number().describe("Current humidity percentage."),
  windKph: z.number().describe("Current wind speed in km/h."),
  uvIndex: z.number().describe("Current UV index."),
  forecastTodayMaxTempC: z.number().describe("Today's maximum forecasted temperature in Celsius."),
  forecastTodayMinTempC: z.number().describe("Today's minimum forecasted temperature in Celsius."),
  forecastTodayConditionText: z.string().describe("Today's overall forecasted condition text."),
  chanceOfRainToday: z.number().describe("Percentage chance of rain today."),
  expectedRainTime: z.string().optional().describe("Expected time of rain, if applicable (e.g., 'around 4 PM', 'this afternoon')."),
});
export type GenerateDayPlanAdviceInput = z.infer<typeof GenerateDayPlanAdviceInputSchema>;

const GenerateDayPlanAdviceOutputSchema = z.object({
  advice: z.string().describe("A concise, actionable piece of advice for the day, 1-2 sentences. Examples: 'Carry an umbrella; rain expected around 4 PM.' or 'High UV levels today; consider limiting outdoor activities between 10 AM and 4 PM.'"),
});
export type GenerateDayPlanAdviceOutput = z.infer<typeof GenerateDayPlanAdviceOutputSchema>;

export async function generateDayPlanAdvice(input: GenerateDayPlanAdviceInput): Promise<GenerateDayPlanAdviceOutput> {
  return generateDayPlanAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDayPlanAdvicePrompt',
  input: {schema: GenerateDayPlanAdviceInputSchema},
  output: {schema: GenerateDayPlanAdviceOutputSchema},
  prompt: `You are a helpful assistant providing personalized day planning advice based on weather conditions for {{locationName}}.
Current weather: {{currentConditionText}}, {{currentTempC}}°C (feels like {{feelsLikeTempC}}°C). Humidity: {{humidity}}%. Wind: {{windKph}} km/h. UV Index: {{uvIndex}}.
Today's forecast: High {{forecastTodayMaxTempC}}°C, Low {{forecastTodayMinTempC}}°C. Outlook: {{forecastTodayConditionText}}. Chance of rain: {{chanceOfRainToday}}%.
{{#if expectedRainTime}}Rain is expected {{expectedRainTime}}.{{/if}}

Provide a single, concise, and actionable piece of advice. Focus on the most impactful weather aspect.
Examples:
- If high chance of rain: "Carry an umbrella; rain expected {{expectedRainTime}}."
- If high UV index: "High UV levels ({{uvIndex}}) today; limit sun exposure between 10 AM and 4 PM and use sunscreen."
- If very cold: "It's quite cold ({{currentTempC}}°C). Dress in warm layers if heading out."
- If very hot: "Expect a hot day (up to {{forecastTodayMaxTempC}}°C). Stay hydrated and avoid strenuous outdoor activity during peak heat."
- If generally pleasant: "Looks like a pleasant day in {{locationName}}! Enjoy."

Generate one piece of advice:`,
});

const generateDayPlanAdviceFlow = ai.defineFlow(
  {
    name: 'generateDayPlanAdviceFlow',
    inputSchema: GenerateDayPlanAdviceInputSchema,
    outputSchema: GenerateDayPlanAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
