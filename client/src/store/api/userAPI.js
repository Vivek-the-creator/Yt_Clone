// src/api/userApi.js
import axios from "axios";

const BASE_URL = "http://localhost:5004/api/users";
const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

export const signupUser = (formData) =>
  api.post("/signup", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const loginUser = (data) =>
  api.post("/login", data, {
    headers: { "Content-Type": "application/json" },
  });

export const fetchCurrentUser = () => api.get("/authenticate");

export const logoutUser = () => api.post("/logout");

export const updateUser = (userId, formData) =>
  api.put(`/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteUser = (userId) => api.delete(`/${userId}`);
