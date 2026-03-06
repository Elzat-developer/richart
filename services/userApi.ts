import axios from 'axios';
import { OrderDetailsDto } from '../types';

// Создаем отдельный axios клиент для user API
const userApiClient = axios.create({
	baseURL: '/api/v1/user',
});

// Добавляем interceptor для JWT токена
userApiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('adminToken'); // Используем adminToken для админки
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// User API Service
export const UserApiService = {
	// --- Получение данных для админки ---
	getNews: async (): Promise<any[]> => {
		const response = await userApiClient.get('/get_news');
		return response.data;
	},

	getNewsById: async (newsId: number): Promise<any> => {
		const response = await userApiClient.get(`/get_news/${newsId}`);
		return response.data;
	},

	getPromotions: async (): Promise<any[]> => {
		const response = await userApiClient.get('/get_promotions');
		return response.data;
	},

	getCompany: async (): Promise<any> => {
		const response = await userApiClient.get('/get_company');
		return response.data;
	},

	getOrderDetails: async (orderId: number): Promise<OrderDetailsDto> => {
		const response = await userApiClient.get(`/order_details/${orderId}`);
		return response.data;
	},
};
