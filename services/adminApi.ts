import axios, { AxiosInstance } from 'axios';
import {
	CreateCategoryDto,
	EditCategoryDto,
	CreateTechSpec,
	ImportReportDto,
	ImportHistoriesDto,
	ImportHistoryDto,
	SignInRequest,
	JwtAuthenticationResponse
} from '../types';

// Базовый URL для админ API
const BASE_URL = '/api/v1/admin';
const AUTH_URL = '/api/v1/auth';

// Создаем отдельный axios instance для админа с JWT
const createAdminApiClient = (): AxiosInstance => {
	const client = axios.create({
		baseURL: BASE_URL,
		timeout: 30000,
	});

	// Интерцептор для добавления JWT токена
	client.interceptors.request.use(
		(config) => {
			const token = localStorage.getItem('adminToken');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
				console.log('🔑 Adding JWT token to admin request:', config.url);
			} else {
				console.log('❌ No admin token found in localStorage for request:', config.url);
			}
			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	// Интерцептор для обработки истечения токена
	client.interceptors.response.use(
		(response) => {
			console.log('✅ Admin API response:', response.config.url, response.status);
			return response;
		},
		(error) => {
			console.log('❌ Admin API error:', error.config?.url, error.response?.status, error.response?.data);
			if (error.response?.status === 401) {
				// Токен истек, удаляем и перенаправляем на логин
				localStorage.removeItem('adminToken');
				localStorage.removeItem('adminUser');
				window.location.href = '/admin/login';
			}
			return Promise.reject(error);
		}
	);

	return client;
};

const adminApiClient = createAdminApiClient();
const authApiClient = axios.create({ baseURL: AUTH_URL });

// Создаем отдельный axios instance для user API вызовов с JWT
const createUserApiClient = (): AxiosInstance => {
	const client = axios.create({
		baseURL: '/api/v1/user',
		timeout: 30000,
	});

	// Интерцептор для добавления JWT токена
	client.interceptors.request.use(
		(config) => {
			const token = localStorage.getItem('adminToken');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	client.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error.response?.status === 401) {
				// Токен истек, удаляем и перенаправляем на логин
				localStorage.removeItem('adminToken');
				localStorage.removeItem('adminUser');
				window.location.href = '/admin/login';
			}
			return Promise.reject(error);
		}
	);

	return client;
};

const userApiClient = createUserApiClient();

export const AdminApiService = {
	// --- Аутентификация ---
	login: async (credentials: SignInRequest): Promise<JwtAuthenticationResponse> => {
		const response = await authApiClient.post<JwtAuthenticationResponse>('/sign-in', credentials);
		return response.data;
	},

	// --- Продукты ---
	getProducts: async (productType: 'industrial' | 'household' = 'industrial', active: boolean = true): Promise<any[]> => {
		try {
			console.log(`Fetching products from /api/v1/admin/get_products?productType=${productType}&active=${active}...`);
			const response = await adminApiClient.get(`/get_products?productType=${productType}&active=${active}`);

			console.log('✅ Admin products response:', response.data);
			console.log('Response data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
			return response.data;
		} catch (error) {
			console.error('Error in getProducts:', error);
			console.error('Error response:', error.response);
			throw error;
		}
	},

	getProduct: async (productId: number): Promise<any> => {
		const response = await userApiClient.get(`/get_product/${productId}`);
		return response.data;
	},

	createProduct: async (productData: {
		productName: string;
		description: string;
		tag: string;
		price: number;
		material: string;
		dimensions: string;
		weight: number;
		width?: number;
		depth?: number;
		height?: number;
		power?: string;
		voltage?: string;
		country?: string;
		specifications?: Record<string, string>;
		categoryId: number;
		quantity: number;
		productType?: 'industrial' | 'household';
		photos: File[];
		techSpecFile?: File;
	}) => {
		const formData = new FormData();

		// Создаем объект продукта как в CreateProductDto
		const product = {
			productName: productData.productName,
			description: productData.description,
			tag: productData.tag,
			price: productData.price,
			material: productData.material,
			dimensions: productData.dimensions,
			weight: productData.weight,
			width: productData.width || null,
			depth: productData.depth || null,
			height: productData.height || null,
			power: productData.power || null,
			voltage: productData.voltage || null,
			country: productData.country || null,
			specifications: productData.specifications || {},
			createdAt: new Date().toISOString(),
			categoryId: productData.categoryId,
			quantity: productData.quantity,
			productType: productData.productType || 'industrial'
		};

		// Добавляем продукт как JSON blob
		formData.append('product', new Blob([JSON.stringify(product)], {
			type: 'application/json'
		}));

		// Добавляем все фото
		productData.photos.forEach((photo) => {
			formData.append('photos', photo);
		});

		// Добавляем файл технических спецификаций если есть
		if (productData.techSpecFile) {
			formData.append('techSpecFile', productData.techSpecFile);
		}

		const response = await adminApiClient.post('/create_product', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	editProduct: async (productData: {
		productId: number;
		productName: string;
		description: string;
		tag: string;
		price: number;
		material: string;
		dimensions: string;
		weight: number;
		width?: number;
		depth?: number;
		height?: number;
		power?: string;
		voltage?: string;
		country?: string;
		specifications?: Record<string, string>;
		categoryId: number;
		quantity: number;
		productType: 'industrial' | 'household';
		active: boolean;
		photos?: File[];
		techSpecFile?: File;
	}) => {
		const formData = new FormData();

		// Создаем объект продукта как JSON строку для @RequestPart("product")
		const productJson = {
			productId: productData.productId,
			productName: productData.productName,
			description: productData.description,
			tag: productData.tag,
			price: productData.price,
			material: productData.material,
			dimensions: productData.dimensions,
			weight: productData.weight,
			width: productData.width || null,
			depth: productData.depth || null,
			height: productData.height || null,
			power: productData.power || null,
			voltage: productData.voltage || null,
			country: productData.country || null,
			specifications: productData.specifications || {},
			categoryId: productData.categoryId,
			quantity: productData.quantity,
			productType: productData.productType,
			active: productData.active
		};

		// Добавляем JSON объект как "product" часть
		formData.append('product', new Blob([JSON.stringify(productJson)], { type: 'application/json' }));

		// Добавляем все фото если они есть
		if (productData.photos && productData.photos.length > 0) {
			productData.photos.forEach((photo) => {
				formData.append('photos', photo);
			});
		}

		// Добавляем файл технических спецификаций если есть
		if (productData.techSpecFile) {
			formData.append('techSpecFile', productData.techSpecFile);
		}

		const response = await adminApiClient.put('/edit_product', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	deleteProduct: async (productId: number) => {
		console.log('🔄 Deleting product with ID:', productId);
		try {
			await adminApiClient.delete(`/delete_product/${productId}`);
			console.log('✅ Product deleted successfully:', productId);
		} catch (error) {
			console.error('❌ Error deleting product:', error);
			throw error;
		}
	},

	// --- Категории ---
	createCategory: async (category: CreateCategoryDto): Promise<void> => {
		console.log('🔄 Creating category with data:', category);

		// Создаем FormData для отправки файла (бэкенд ожидает multipart/form-data)
		const formData = new FormData();
		formData.append('categoryName', category.categoryName);
		formData.append('description', category.description);
		formData.append('categoryType', category.categoryType);

		if (category.photoUrl) {
			console.log('📸 Adding photo to category creation:', category.photoUrl.name);
			formData.append('photoUrl', category.photoUrl);
		}

		// Отладка - что отправляем
		console.log('📤 FormData contents:');
		for (let [key, value] of formData.entries()) {
			console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
		}

		// НЕ устанавливаем Content-Type вручную - axios сделает это автоматически для FormData
		const response = await adminApiClient.post('/create_category', formData);

		console.log('✅ Category created successfully:', response.data);
	},

	editCategory: async (category: EditCategoryDto): Promise<void> => {
		console.log('🔄 Editing category with data:', category);

		// Создаем FormData для отправки файла (бэкенд ожидает multipart/form-data)
		const formData = new FormData();
		formData.append('categoryId', category.categoryId.toString());
		formData.append('categoryName', category.categoryName);
		formData.append('description', category.description);
		formData.append('categoryType', category.categoryType);
		formData.append('active', category.active?.toString() || 'true');

		if (category.photoUrl) {
			console.log('📸 Adding photo to category edit:', category.photoUrl.name);
			formData.append('photoUrl', category.photoUrl);
		}

		// Отладка - что отправляем
		console.log('📤 Edit FormData contents:');
		for (let [key, value] of formData.entries()) {
			console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
		}

		// НЕ устанавливаем Content-Type вручную - axios сделает это автоматически для FormData
		await adminApiClient.put('/edit_category', formData);

		console.log('✅ Category edited successfully');
	},

	deleteCategory: async (categoryId: number): Promise<void> => {
		await adminApiClient.delete(`/delete_category/${categoryId}`);
	},

	// --- Активация/деактивация категории ---
	editCategoryActive: async (categoryId: number): Promise<string> => {
		const response = await adminApiClient.patch(`/edit_category_active/${categoryId}`);
		return response.data;
	},

	// --- Получение данных (используем admin эндпоинты) ---
	getCategories: async (categoryType: 'industrial' | 'household' = 'industrial', active: boolean = true): Promise<any[]> => {
		const response = await adminApiClient.get(`/get_categories?categoryType=${categoryType}&active=${active}`);
		console.log('📦 Admin categories response:', response.data);
		return response.data;
	},

	getTechSpecs: async (): Promise<any[]> => {
		const response = await adminApiClient.get('/get_tech_spec');
		return response.data;
	},

	downloadTechSpec: async (fileUrl: string): Promise<Blob> => {
		const response = await userApiClient.get(`/download-tech-spec?file=${encodeURIComponent(fileUrl)}`, {
			responseType: 'blob'
		});
		return response.data;
	},

	// --- Технические спецификации ---
	createTechSpec: async (techSpecData: CreateTechSpec): Promise<string> => {
		const formData = new FormData();
		formData.append('fileName', techSpecData.fileName);
		if (techSpecData.product_id !== null && techSpecData.product_id !== undefined) {
			formData.append('product_id', techSpecData.product_id.toString());
		}
		if (techSpecData.fileTechSpec) {
			formData.append('fileTechSpec', techSpecData.fileTechSpec);
		}

		const response = await adminApiClient.post('/create_tech_spec', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	editTechSpec: async (techSpecId: number, techSpec: any): Promise<void> => {
		const formData = new FormData();

		// Добавляем только те поля которые есть в объекте
		if (techSpec.fileName !== undefined) {
			formData.append('fileName', techSpec.fileName);
		}

		if (techSpec.product_id !== undefined) {
			formData.append('product_id', techSpec.product_id.toString());
		}

		// Добавляем файл только если он существует и не пустой
		if (techSpec.fileTechSpec && techSpec.fileTechSpec.size > 0) {
			formData.append('fileTechSpec', techSpec.fileTechSpec);
		}

		await adminApiClient.put(`/edit_tech_spec/${techSpecId}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
	},

	deleteTechSpec: async (techSpecId: number): Promise<void> => {
		await adminApiClient.delete(`/delete_tech_spec/${techSpecId}`);
	},

	// --- Заказы ---
	getOrders: async (): Promise<any[]> => {
		const response = await adminApiClient.get('/get_orders');
		return response.data;
	},

	editPaidStatusOrder: async (orderId: number, paidStatus: 'PAID' | 'NOTPAY') => {
		const response = await adminApiClient.patch(`/order/${orderId}?paidStatus=${paidStatus}`);
		return response.data;
	},

	deleteOrder: async (orderId: number) => {
		await adminApiClient.delete(`/delete_order/${orderId}`);
	},

	// --- Новости ---
	createNews: async (newsData: { name: string; description: string; newsPhotoUrl: File }) => {
		const formData = new FormData();
		formData.append('name', newsData.name);
		formData.append('description', newsData.description);
		formData.append('newsPhotoUrl', newsData.newsPhotoUrl);

		const response = await adminApiClient.post('/create_news', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	editNews: async (newsId: number, newsData: { name: string; description: string; newsPhotoUrl?: File }) => {
		const formData = new FormData();
		formData.append('name', newsData.name);
		formData.append('description', newsData.description);

		// Добавляем изображение только если оно предоставлено
		if (newsData.newsPhotoUrl) {
			formData.append('newsPhotoUrl', newsData.newsPhotoUrl);
		}

		const response = await adminApiClient.put(`/edit_news/${newsId}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	deleteNews: async (newsId: number) => {
		await adminApiClient.delete(`/delete_news/${newsId}`);
	},

	// --- Промо-акции ---
	createPromotion: async (file: File) => {
		const formData = new FormData();
		formData.append('urlPhoto', file);

		const response = await adminApiClient.post('/create_promotion', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	editPromotionPhoto: async (promotionId: number, file: File) => {
		const formData = new FormData();
		formData.append('urlPhoto', file);

		const response = await adminApiClient.patch(`/edit_promotion_photo/${promotionId}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	deletePromotion: async (promotionId: number) => {
		await adminApiClient.delete(`/delete_promotion/${promotionId}`);
	},

	// --- Импорт Excel (legacy) ---
	importProductsFromExcel: async (file: File): Promise<ImportReportDto> => {
		const formData = new FormData();
		formData.append('file', file);

		const response = await adminApiClient.post<ImportReportDto>('/import_excel', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	// --- Импорт ZIP ---
	importProductsFromZip: async (file: File): Promise<ImportReportDto> => {
		const formData = new FormData();
		formData.append('file', file);

		const response = await adminApiClient.post<ImportReportDto>('/import_zip', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	// --- История импортов ---
	getImportHistories: async (): Promise<ImportHistoriesDto[]> => {
		console.log('🔄 Fetching import histories from /import_histories...');
		const response = await adminApiClient.get<ImportHistoriesDto[]>('/import_histories');
		console.log('✅ Import histories response:', response.data);
		return response.data;
	},

	getImportHistory: async (historyId: number): Promise<ImportHistoryDto> => {
		console.log(`🔄 Fetching import history ${historyId} from /get_import_history/${historyId}...`);
		const response = await adminApiClient.get<ImportHistoryDto>(`/get_import_history/${historyId}`);
		console.log('✅ Import history response:', response.data);
		return response.data;
	},

	deleteImportHistory: async (historyId: number): Promise<string> => {
		console.log(`🗑️ Deleting import history ${historyId}...`);
		const response = await adminApiClient.delete<string>(`/delete_import_history/${historyId}`);
		console.log('✅ Import history deleted:', response.data);
		return response.data;
	},

	// --- Активация/деактивация товара ---
	editProductActive: async (productId: number): Promise<string> => {
		const response = await adminApiClient.patch(`/edit_product_active/${productId}`);
		return response.data;
	},
};
