// api/tmdbApi.ts

export interface Movie {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    release_date: string;
    vote_average: number;
  }
  
  const API_KEY = '4c81a23dcc5134d45fe85d42bb19c4a2'; // Replace with your actual TMDb API key
  const BASE_URL = 'https://api.themoviedb.org/3';
  export const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
  
  export const fetchPopularMovies = async (): Promise<Movie[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
      );
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  };
  
  export const fetchTrendingMovies = async (): Promise<Movie[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
      );
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      throw error;
    }
  };
  
  export const fetchMovieDetails = async (movieId: number): Promise<Movie> => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  };