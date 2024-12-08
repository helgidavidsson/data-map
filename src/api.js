// src/api.js

import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Add token to headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers['Authorization'] = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token has expired or is invalid
      localStorage.removeItem('token');
      // Optionally, redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { API };

// Existing exports
export const signUp = (formData) => API.post('/auth/signup', formData);
export const logIn = (formData) => API.post('/auth/login', formData);
export const fetchMaps = () => API.get('/maps');
export const createMap = (mapData) => API.post('/maps', mapData);
export const updateMap = (id, mapData) => API.put(`/maps/${id}`, mapData);
export const deleteMap = (id) => API.delete(`/maps/${id}`);

// New exports for profile
export const fetchUserProfile = () => API.get('/profile'); // GET /profile

export const updateUserProfile = (profileData) =>
  API.put('/profile', profileData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// Fetch a map by ID
export const fetchMapById = (id) => API.get(`/maps/${id}`);

// Save a map
export const saveMap = (mapId) => API.post(`/maps/${mapId}/save`);

// Unsave a map
export const unsaveMap = (mapId) => API.post(`/maps/${mapId}/unsave`);

// Fetch comments for a map
export const fetchComments = (mapId) => API.get(`/maps/${mapId}/comments`);

// Post a comment on a map
export const postComment = (mapId, commentData) =>
  API.post(`/maps/${mapId}/comments`, commentData);

// Fetch user profile by username
export const fetchUserProfileByUsername = (username) => API.get(`/profile/${username}`);


// Fetch maps by user ID with pagination
export const fetchMapsByUserId = (userId, offset = 0, limit = 10) =>
  API.get(`/maps/user/${userId}?offset=${offset}&limit=${limit}`);


// **Add this function** to fetch starred maps by user ID
export const fetchStarredMapsByUserId = (userId, offset = 0, limit = 10) =>
  API.get(`/maps/user/${userId}/starred?offset=${offset}&limit=${limit}`);

// Fetch saved maps for the authenticated user
export const fetchSavedMaps = () => API.get('/maps/saved');

// Fetch notifications
export const fetchNotifications = () => API.get('/notifications');

// Mark notification as read
export const markNotificationAsRead = (id) => API.put(`/notifications/${id}/read`);

// Mark all notifications as read
export const markAllNotificationsAsRead = () => API.put('/notifications/read-all');

// Like a comment
export const likeComment = (commentId) => API.post(`/comments/${commentId}/like`);

// Dislike a comment
export const dislikeComment = (commentId) => API.post(`/comments/${commentId}/dislike`);

// Delete a notification
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// Fetch user activity with pagination
export const fetchUserActivity = (username, offset = 0, limit = 10) =>
  API.get(`/users/${username}/activity?offset=${offset}&limit=${limit}`);

// Fetch user map stats (total maps and total stars)
export const fetchUserMapStats = (userId) =>
  API.get(`/maps/user/${userId}/stats`);

// Fetch the most starred map by user ID
export const fetchMostStarredMapByUserId = (userId) =>
  API.get(`/maps/user/${userId}/most-starred`);

