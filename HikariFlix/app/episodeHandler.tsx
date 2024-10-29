import * as api from '../api/restAPI/api';


interface ASResponse {
  success: boolean;
  results: AnimeDetails[];
}

interface AnimeDetails {
  title: string;
  description: string;
  link: string;
  imgSrc: string;
}

interface ASSeasons {
  success: boolean;
  results: Season[];
}

interface Season {
  name: string;
  url: string;
}

interface VAResponse {
    success: boolean;
    results: {
      VO: Array<Res>;
      VF: Array<Res>;
    };
  }
  
  interface Res {
    title: string;
    link: string;
  }

  interface VAEpisodeResponse {
    success: boolean;
    results: {
      currentPageId: string;
      episodes: Array<VAEpisode>;
    };
  }
  
  interface VAEpisode {
    title: string;
    link: string;
  }
  

// Interface for a single source of the video (HLS stream, etc.)
interface AnimeSource {
  file: string;
  type: string;
}

// Interface for a single track (captions, subtitles, thumbnails, etc.)
interface AnimeTrack {
  file: string;
  label?: string;
  kind: string;
  default?: boolean;
}

// Interface for the decryption result
interface hianimeDecryptionResult {
  type: string;
  source: {
    sources: AnimeSource[];
    tracks: AnimeTrack[];
    encrypted: boolean;
  };
  server: string;
}

// Interface for a streamingInfo entry
interface hianimeStreamingInfo {
  status: string;
  value: {
    decryptionResult: hianimeDecryptionResult;
  };
}

// Common Episode Interface
interface CommonEpisode {
  id: string;
  title: string;
  episodeNumber?: string;
  japanese_title?: string;
  slug?: string;
}

// Interface for stream details
interface HentaiStream {
  width: number;
  height: string;
  size_mbs: number;
  url: string;
}

// Interface for episode details
interface HentaiEpisode {
  id: number;
  name: string;
  slug?: string;
  link: string;
}

// Interface for the individual result object
interface HentaiResult {
  name: string;
  streams: HentaiStream[];
  episodes: HentaiEpisode[];
}

// Interface for the main response structure
interface HentaiResponse {
  results: HentaiResult[];
}

interface hianime {
  id: string;
  title: string;
  data_id: string;
  link: string;
}

interface hianimeEpisodeResponse {
  success: boolean;
  results: hianimeEpisode[];
}

interface hianimeEpisode {
  number?: string;
  episode_no?: string;
  id: string;
  title: string;
  japanese_title?: string;
}

interface hianimeResponse {
  success: boolean;
  result: hianime;
}

export const isHentai = (genres: string[]): boolean => {
  return genres.includes('Hentai');
};

export const handleHentaiSearch = async (title: string | null) => {
  if (!title) return { episodes: [], noEpisodesFound: true };
  const sanitizedKeyword = encodeURIComponent(title.replace(/[^\w\s]/gi, ' '));

  try {
    const search: HentaiResponse = await api.fetchHentai(sanitizedKeyword);

    if (search.results.length > 0) {
      const hentaiData = search.results[0];
      const episodes: CommonEpisode[] = hentaiData.episodes.map((episode) => ({
        title: episode.name,
        id: episode.id.toString(),
        slug: episode.slug?.toString(),
      }));
      return { episodes, noEpisodesFound: episodes.length === 0 };
    }
  } catch (hentaiError) {
    console.error('Hentai fetch failed, trying HentaiStream:', hentaiError);

    const searchSuffixes = ['1', '1-episode-1', 'season-1'];

    for (const suffix of searchSuffixes) {
      try {
        const hentaiStreamResponse: HentaiResponse = await api.fetchHentaiStream(sanitizedKeyword, suffix);
        if (hentaiStreamResponse.results.length > 0) {
          const streamData = hentaiStreamResponse.results[0];
          const episodes: CommonEpisode[] = streamData.episodes.map((episode) => ({
            title: episode.name,
            id: episode.id.toString(),
          }));
          return { episodes, noEpisodesFound: episodes.length === 0 };
        }
      } catch (streamError) {
        console.error(`HentaiStream fetch failed with suffix '${suffix}':`, streamError);
      }
    }
  }

  return { episodes: [], noEpisodesFound: true };
};

export const handleHianimeSearch = async (englishTitle: string | null, ep: string) => {
  if (!englishTitle) return { episodes: [], noEpisodesFound: true };

  const sanitizedKeyword = encodeURIComponent(englishTitle.replace(/[^\w\s]/gi, ' ')).replace(/%3A/g, ':');

  try {
    const searchResult: hianimeResponse = await api.hianimeSearch(sanitizedKeyword, ep);

    if (!searchResult.success) {
      return { episodes: [], noEpisodesFound: true };
    }

    const animeData = searchResult.result;
    const episodesResponse: hianimeEpisodeResponse = await api.hianimeEpisodes(animeData.id);

    if (episodesResponse.success && Array.isArray(episodesResponse.results) && episodesResponse.results.length > 0) {
      const episodes: CommonEpisode[] = episodesResponse.results.map((episode) => ({
        id: episode.id,
        title: episode.title,
        episodeNumber: episode.episode_no || episode.number,
      }));
      return { episodes, noEpisodesFound: false };
    }
  } catch (animeError) {
    try {
      const searchResult: hianimeResponse = await api.hianimeSearch(sanitizedKeyword, '0');

      if (!searchResult.success) {
        return { episodes: [], noEpisodesFound: true };
      }

      const animeData = searchResult.result;
      const episodesResponse: hianimeEpisodeResponse = await api.hianimeEpisodes(animeData.id);

      if (episodesResponse.success && Array.isArray(episodesResponse.results) && episodesResponse.results.length > 0) {
        const episodes: CommonEpisode[] = episodesResponse.results.map((episode) => ({
          id: episode.id,
          title: episode.title,
          episodeNumber: episode.episode_no || episode.number,
        }));
        return { episodes, noEpisodesFound: false };
      }
    } catch (retryError) {
      console.error('Anime fetch failed on retry:', retryError);
    }
  }

  return { episodes: [], noEpisodesFound: true };
};

export const handleVASearchVO = async (englishTitle: string | null) => {
    if (!englishTitle) return { episodes: [], noEpisodesFound: true };
  
    const sanitizedKeyword = encodeURIComponent(englishTitle.replace(/[^\w\s]/gi, ' ')).replace(/%3A/g, ':');
  
    try {
      const searchResult: VAResponse = await api.VASearch(sanitizedKeyword);
  
      if (!searchResult.success) {
        return { episodes: [], noEpisodesFound: true };
      }
      const animeData = searchResult.results;
      const episodesResponse: VAEpisodeResponse = await api.VAEpisodes(animeData.VO[0].link);
  
      if (episodesResponse.success && Array.isArray(episodesResponse.results) && episodesResponse.results.length > 0) {
        const episodes: CommonEpisode[] = episodesResponse.results.map((episode, index) => ({
          id: episode.link,
          title: episode.title,
          episodeNumber: `${index}+1`,
        }));
        return { episodes, noEpisodesFound: false };
      }
    } catch (error) {
        console.error('Anime fetch failed :', error);
      }
  
    return { episodes: [], noEpisodesFound: true };
  };

  export const handleVASearchVF = async (englishTitle: string | null) => {
    if (!englishTitle) return { episodes: [], noEpisodesFound: true };
  
    const sanitizedKeyword = encodeURIComponent(englishTitle.replace(/[^\w\s]/gi, ' ')).replace(/%3A/g, ':');
  
    try {
      const searchResult: VAResponse = await api.VASearch(sanitizedKeyword);
  
      if (!searchResult.success) {
        return { episodes: [], noEpisodesFound: true };
      }
      const animeData = searchResult.results;
      const episodesResponse: VAEpisodeResponse = await api.VAEpisodes(animeData.VF[0].link);
  
      if (episodesResponse.success && Array.isArray(episodesResponse.results) && episodesResponse.results.length > 0) {
        const episodes: CommonEpisode[] = episodesResponse.results.map((episode, index) => ({
          id: episode.link,
          title: episode.title,
          episodeNumber: `${index}+1`,
        }));
        return { episodes, noEpisodesFound: false };
      }
    }  catch (error) {
        console.error('Anime fetch failed :', error);
      }
  
    return { episodes: [], noEpisodesFound: true };
  };

  export const handleASSearch = async (englishTitle: string | null) => {
    if (!englishTitle) return { episodes: [], noEpisodesFound: true };
  
    const sanitizedKeyword = encodeURIComponent(englishTitle.replace(/[^\w\s]/gi, ' ')).replace(/%3A/g, ':');
  
    try {
      const searchResult: ASResponse = await api.ASSearch(sanitizedKeyword);
  
      if (!searchResult.success) {
        return { episodes: [], noEpisodesFound: true };
      }
      const animeData = searchResult.results;
      const episodesResponse: ASSeasons = await api.ASEpisodes(animeData[0].link);
  
      if (episodesResponse.success && Array.isArray(episodesResponse.results) && episodesResponse.results.length > 0) {
        const episodes: CommonEpisode[] = episodesResponse.results.map((episode, index) => ({
          id: episode.url,
          title: episode.name,
          episodeNumber: `${index}+1`,
        }));
        return { episodes, noEpisodesFound: false };
      }
    } catch (error) {
        console.error('Anime fetch failed :', error);
      }
  
    return { episodes: [], noEpisodesFound: true };
  };

export const handleHianimeStream = async (episodeId: string) => {
  try {
    const search = await api.hianimeStream(episodeId);
    return search.results.streamingInfo;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export type { CommonEpisode, HentaiResponse, hianimeStreamingInfo };
