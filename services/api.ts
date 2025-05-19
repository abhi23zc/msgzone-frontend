
import axios from 'axios';

const api = axios.create({
  baseURL:'http://localhost:8080/api/v1',
  
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    console.log('Axios Error (intercepted):', error.message);

 
    if (error.response) {
      console.log('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('No response from server. Possibly a network/CORS issue.');
    }
    return Promise.reject(error);
  }
);

export default api;
