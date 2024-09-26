import axios from 'axios';

const BASE_URL = 'http://localhost:6969/'; 

export const searchAnime = async (keyword: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/a/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data; // Assuming the response has the anime data you need
  } catch (error) {
    // Check if the error is an Axios error
    if (axios.isAxiosError(error)) {
      throw new Error(`Search failed: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error(`Search failed: ${error}`);
    }
  }
};

export const fetchEpisodes = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/a/episodes/${id}`);
    return response.data; // Assuming the response has the episode data you need
  } catch (error) {
    // Check if the error is an Axios error
    if (axios.isAxiosError(error)) {
      throw new Error(`Fetch episodes failed: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error(`Fetch episodes failed: ${error}`);
    }
  }
};
