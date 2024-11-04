import axios from 'axios';

const BASE_URL = 'https://hikariflix.vercel.app';

export const hianimeSearch = async (keyword: string, ep: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/a/search?keyword=${keyword}?ep=${ep}`);
    return response.data; // Assuming the response has the anime data you need
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios Error on search: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error(`Search failed: ${error}`);
    }
  }
};

export const hianimeEpisodes = async (id: string) => {
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

export const hianimeStream = async (id: string) => {
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

export const ASSearch = async (keyword: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/s/search?keyword=${keyword}`);
    return response.data; // Assuming the response has the anime data you need
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios Error on search: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error(`Search failed: ${error}`);
    }
  }
};

export const ASEpisodes = async (link: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/s/episodes?link=${link}`);
    return response.data; // Assuming the response has the episode data you need
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios error on episodes: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error(`Fetch episodes failed: ${error}`);
    }
  }
};

export const ASStream = async (url: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/s/stream?url=${url}`);
    return response.data; // Assuming the response has the episode data you need
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios error on episodes: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error(`Fetch episodes failed: ${error}`);
    }
  }
};

export const VASearch = async (keyword: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/v/search?keyword=${keyword}`);
    return response.data; // Assuming the response has the anime data you need
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios Error on search: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error(`Search failed: ${error}`);
    }
  }
};

export const VAEpisodes = async (link: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/v/episodes?link=${link}`);
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
