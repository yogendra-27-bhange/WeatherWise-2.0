
'use server';
/**
 * @fileOverview A weather summary AI agent.
 *
 * - generateWeatherSummary - A function that generates a conversational weather summary.
 * - GenerateWeatherSummaryInput - The input type for the generateWeatherSummary function.
 * - GenerateWeatherSummaryOutput - The return type for the generateWeatherSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeatherSummaryInputSchema = z.object({
  locationName: z.string().describe("The name of the location (e.g., London)."),
  currentTempC: z.number().describe("The current temperature in Celsius."),
  currentConditionText: z.string().describe("The current weather condition text (e.g., Sunny, Partly cloudy)."),
  feelsLikeTempC: z.number().describe("What the current temperature feels like in Celsius."),
  humidity: z.number().describe("Current humidity percentage."),
  windKph: z.number().describe("Current wind speed in km/h."),
  forecastTodayMaxTempC: z.number().describe("Today's maximum forecasted temperature in Celsius."),
  forecastTodayMinTempC: z.number().describe("Today's minimum forecasted temperature in Celsius."),
  forecastTodayConditionText: z.string().describe("Today's overall forecasted condition text."),
  country: z.string().describe("The country of the location.")
});
export type GenerateWeatherSummaryInput = z.infer<typeof GenerateWeatherSummaryInputSchema>;

const GenerateWeatherSummaryOutputSchema = z.object({
  summary: z.string().describe("A concise and conversational summary of the weather, 2-3 sentences long."),
});
export type GenerateWeatherSummaryOutput = z.infer<typeof GenerateWeatherSummaryOutputSchema>;

export async function generateWeatherSummary(input: GenerateWeatherSummaryInput): Promise<GenerateWeatherSummaryOutput> {
  return generateWeatherSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeatherSummaryPrompt',
  input: {schema: GenerateWeatherSummaryInputSchema},
  output: {schema: GenerateWeatherSummaryOutputSchema},
  prompt: `You are a friendly and enthusiastic weather reporter. Based on the following weather data for {{locationName}}, {{country}}, provide a short (2-3 sentences), engaging, and conversational summary. Highlight the most important aspects for someone planning their day.

Current Temperature: {{currentTempC}}°C (feels like {{feelsLikeTempC}}°C)
Current Condition: {{currentConditionText}}
Humidity: {{humidity}}%
Wind: {{windKph}} km/h

Today's Forecast:
High: {{forecastTodayMaxTempC}}°C
Low: {{forecastTodayMinTempC}}°C
Outlook: {{forecastTodayConditionText}}

Generate a weather summary:`,
});

const generateWeatherSummaryFlow = ai.defineFlow(
  {
    name: 'generateWeatherSummaryFlow',
    inputSchema: GenerateWeatherSummaryInputSchema,
    outputSchema: GenerateWeatherSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
