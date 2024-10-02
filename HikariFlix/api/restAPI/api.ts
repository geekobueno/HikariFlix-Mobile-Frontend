import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:6969';

export const searchAnime = async (keyword: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/a/search?keyword=${keyword}`);
    return response.data; // Assuming the response has the anime data you need
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios Error on search: ${error.response?.data?.message || error.message}`);
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
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios error on episodes: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error(`Fetch episodes failed: ${error}`);
    }
  }
};

export const fetchStream = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/a/stream?id=${id}`);
    return response.data; // Assuming the response has the episode data you need
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios error on episodes: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error(`Fetch episodes failed: ${error}`);
    }
  }
};

export const fetchHentai = async (slug: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/h/watch/${slug}`);
    return response.data; // Assuming the response has the episode data you need
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios error on hentai: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error(`Fetch hentai failed: ${error}`);
    }
  }
};

export const fetchHentaiStream = async (slug: string,ep_num: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/h/watch/${slug}/${ep_num}`);
    return response.data; // Assuming the response has the episode data you need
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios error on hentaiStream: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error(`Fetch hentaiStream failed: ${error}`);
    }
  }
};
