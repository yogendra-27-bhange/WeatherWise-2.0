'use server';

/**
 * @fileOverview A music playlist query generator based on weather conditions.
 *
 * - generateMusicQuery - A function that generates a music playlist query.
 * - GenerateMusicQueryInput - The input type for the generateMusicQuery function.
 * - GenerateMusicQueryOutput - The return type for the generateMusicQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMusicQueryInputSchema = z.object({
  weatherCondition: z.string().describe('The current weather condition (e.g., sunny, rainy, cloudy).'),
});
export type GenerateMusicQueryInput = z.infer<typeof GenerateMusicQueryInputSchema>;

const GenerateMusicQueryOutputSchema = z.object({
  musicQuery: z.string().describe('A refined music playlist query based on the weather condition.'),
});
export type GenerateMusicQueryOutput = z.infer<typeof GenerateMusicQueryOutputSchema>;

export async function generateMusicQuery(input: GenerateMusicQueryInput): Promise<GenerateMusicQueryOutput> {
  return generateMusicQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMusicQueryPrompt',
  input: {schema: GenerateMusicQueryInputSchema},
  output: {schema: GenerateMusicQueryOutputSchema},
  prompt: `You are a music recommendation expert. Based on the current weather condition, generate a refined music playlist query for YouTube.

Weather condition: {{{weatherCondition}}}

Refined music playlist query:`,
});

const generateMusicQueryFlow = ai.defineFlow(
  {
    name: 'generateMusicQueryFlow',
    inputSchema: GenerateMusicQueryInputSchema,
    outputSchema: GenerateMusicQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
