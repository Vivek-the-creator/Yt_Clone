import axios from "axios";

const BASE_URL = "http://localhost:5004/api/videos";

const axiosConfig = {
  withCredentials: true,
};

export const uploadVideoAPI = (videoData) =>
  axios.post(`${BASE_URL}/upload`, videoData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...axiosConfig,
  });

export const fetchAllVideosAPI = ({
  page,
  limit,
  search = "",
  author = "",
  category = "",
  sort = "",
}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (author) params.author = author;
  if (category) params.category = category;
  if (sort) params.sort = sort;
  return axios.get(`${BASE_URL}`, { ...axiosConfig, params });
};

export const fetchPopularVideosAPI = async (params) => {
  const response = await axios.get(`${BASE_URL}/popular-videos`, {
    ...axiosConfig,
    params,
  });
  return response.data; // unwrap here
};


export const fetchVideoAPI = (videoId) =>
  axios.get(`${BASE_URL}/${videoId}`, axiosConfig);

export const toggleLikeAPI = (videoId) =>
  axios.put(`${BASE_URL}/${videoId}/like`, {}, axiosConfig);

export const toggleBookmarkAPI = (videoId) =>
  axios.put(`${BASE_URL}/${videoId}/bookmark`, {}, axiosConfig);

export const updateVideoAsViewedAPI = (videoId) =>
  axios.put(`${BASE_URL}/${videoId}/viewed`, {}, axiosConfig);

export const addCommentAPI = (videoId, content) =>
  axios.post(`${BASE_URL}/${videoId}/comment`, { content }, axiosConfig);

export const deleteVideoAPI = (videoId) =>
  axios.delete(`${BASE_URL}/${videoId}`, axiosConfig);
