"use client";

import { useEffect, useState } from 'react';
import type { YouTubeSearchItem, YouTubeSearchResponse } from "@/types/youtube";
import { generateMusicQuery } from '@/ai/flows/generate-music-query';
import { SectionCard } from "./SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, ThumbsUp, Youtube } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";

interface MusicRecommendationsProps {
  weatherCondition: string | null;
}

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export function MusicRecommendations({ weatherCondition }: MusicRecommendationsProps) {
  const [videos, setVideos] = useState<YouTubeSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (weatherCondition) {
      fetchRecommendations(weatherCondition);
    }
  }, [weatherCondition]);

  const fetchRecommendations = async (condition: string, customQuery?: string) => {
    setLoading(true);
    setError(null);
    setVideos([]);

    try {
      let searchQuery = customQuery;
      if (!searchQuery) {
        const aiResponse = await generateMusicQuery({ weatherCondition: condition });
        searchQuery = aiResponse.musicQuery;
        setQuery(searchQuery); // Update displayed query
      }
      
      if (!YOUTUBE_API_KEY) {
        throw new Error("YouTube API key is not configured.");
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `YouTube API request failed with status ${response.status}`);
      }
      const data: YouTubeSearchResponse = await response.json();
      setVideos(data.items || []);
    } catch (err: any) {
      console.error("Error fetching music recommendations:", err);
      setError(err.message || "Failed to fetch music recommendations.");
      toast({
        variant: "destructive",
        title: "Music Recommendation Error",
        description: err.message || "Could not load music suggestions.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query && weatherCondition) {
      fetchRecommendations(weatherCondition, query);
    } else if (!weatherCondition) {
        setError("Weather condition not available to generate AI query. Please enter a manual search term.");
        toast({variant: "destructive", title: "Missing Information", description: "Weather condition needed for AI search."});
    }
  };

  return (
    <SectionCard title="Mood-Based Music" icon={Music}>
      <form onSubmit={handleManualSearch} className="flex gap-2 mb-4">
        <Input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Or enter your own music query..."
          aria-label="Music search query"
          className="flex-grow"
        />
        <Button type="submit" variant="outline" disabled={loading}>
          Search
        </Button>
      </form>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-20 w-32 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-destructive text-center">{error}</p>}
      {!loading && !error && videos.length === 0 && weatherCondition && (
        <p className="text-muted-foreground text-center">No music recommendations found. Try a different query.</p>
      )}
      {!loading && !error && videos.length === 0 && !weatherCondition && (
        <p className="text-muted-foreground text-center">Waiting for weather data to suggest music or enter a query.</p>
      )}

      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <a
              key={video.id.videoId}
              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={`Watch ${video.snippet.title} on YouTube`}
            >
              <div className="relative w-full aspect-video">
                <Image
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="youtube thumbnail"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Youtube className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary" title={video.snippet.title}>
                  {video.snippet.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate" title={video.snippet.channelTitle}>
                  {video.snippet.channelTitle}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
