import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({ withCredentials: true });

export default axiosInstance;
