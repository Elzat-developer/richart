import axios, { AxiosInstance } from 'axios';
import { FilterParams, GetProductDto, GetProductsDto, GetProductsUserDto, CartDto, OrderRequestDto, CartItemDto, OrderResponseDto, BackendProductDto, BackendProductDetailDto, BackendCategoryDto, NewsDto, GetCategoriesUserDto, CompanyDto, CreateCompanyDto, UserNewsDto, NewsIdDto, OrderHistoryUserDto, OrderDetailsDto } from '../types';
import { API_CONFIG, getApiUrl, getImageUrl } from '../config/api';

// Базовый URL API (теперь из конфигурации)
const BASE_URL = API_CONFIG.BASE_URL;

// Функция для получения или создания cart token
const getCartToken = (): string => {
	let token = localStorage.getItem('cartToken');
	if (!token) {
		token = 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
		localStorage.setItem('cartToken', token);
	}
	return token;
};

// --- Axios Instance с интерцептором ---
const apiClient: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Интерцептор для добавления X-Cart-Token
apiClient.interceptors.request.use(
	(config) => {
		const token = getCartToken();
		config.headers['X-Cart-Token'] = token;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Отдельный экземпляр для заказов (другой base URL)
const ordersClient: AxiosInstance = axios.create({
	baseURL: '/api/orders',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Функция для получения admin JWT токена
const getAdminToken = (): string | null => {
	return localStorage.getItem('adminToken');
};

// Отдельный экземпляр для админских запросов
const adminClient: AxiosInstance = axios.create({
	baseURL: '/api/v1/admin',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Интерцептор для добавления JWT токена в админские запросы
adminClient.interceptors.request.use(
	(config) => {
		const token = getAdminToken();
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Интерцептор для обработки ошибок авторизации
adminClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401 || error.response?.status === 403) {
			// Токен истек или неверный - перенаправляем на страницу логина
			localStorage.removeItem('adminToken');
			localStorage.removeItem('adminUser');
			window.location.href = '/admin/login';
		}
		return Promise.reject(error);
	}
);

ordersClient.interceptors.request.use(
	(config) => {
		const token = getCartToken();
		config.headers['X-Cart-Token'] = token;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// --- Mock Data ---
// Mock данные для продуктов (для разработки)
const MOCK_PRODUCTS: GetProductsUserDto[] = [
	// Промышленные товары (productType: 'industrial')
	...Array.from({ length: 12 }, (_, i) => ({
		productId: i + 1,
		productName: `Industrial Worktable Model ${String.fromCharCode(65 + i)}`,
		productPrice: 150000 + (i * 25000),
		material: ['Сталь', 'Алюминий', 'Дерево'][i % 3],
		categoryId: (i % 3) + 1,
		productType: 'industrial' as const,
		active: i < 10, // Первые 10 товаров активны, последние 2 - неактивны
		photoDtoList: {
			photo_id: i + 1,
			photoURL: `/uploads/products/product_${i + 1}.jpg`
		}
	})),
	// Бытовые товары (productType: 'household')
	...Array.from({ length: 8 }, (_, i) => ({
		productId: 13 + i,
		productName: `Household ${['Chair', 'Table', 'Sofa', 'Bed', 'Wardrobe', 'Kitchen Cabinet', 'Shelf', 'Lamp'][i]}`,
		productPrice: 15000 + (i * 8000),
		material: ['Дерево', 'МДФ', 'ЛДСП', 'Металл', 'Ткань', 'Пластик', 'Стекло', 'Керамика'][i],
		categoryId: 4 + (i % 2), // Категории 4-5 для бытовых
		productType: 'household' as const,
		active: i < 6, // Первые 6 товаров активны, последние 2 - неактивны
		photoDtoList: {
			photo_id: 13 + i,
			photoURL: `/uploads/products/household_${i + 1}.jpg`
		}
	}))
];

let MOCK_CART: CartItemDto[] = [];

// Mock данные для категорий (для разработки)
const MOCK_CATEGORIES: GetCategoriesUserDto[] = [
	// Промышленные категории (categoryType: 'industrial')
	{
		categoryId: 1,
		categoryName: 'Рабочие столы',
		photoUrl: '/uploads/categories/industrial_tables.jpg',
		categoryType: 'industrial'
	},
	{
		categoryId: 2,
		categoryName: 'Стеллажи',
		photoUrl: '/uploads/categories/industrial_shelves.jpg',
		categoryType: 'industrial'
	},
	{
		categoryId: 3,
		categoryName: 'Производственное оборудование',
		photoUrl: '/uploads/categories/industrial_equipment.jpg',
		categoryType: 'industrial'
	},
	// Бытовые категории (categoryType: 'household')
	{
		categoryId: 4,
		categoryName: 'Мебель для гостиной',
		photoUrl: '/uploads/categories/household_living.jpg',
		categoryType: 'household'
	},
	{
		categoryId: 5,
		categoryName: 'Кухонная мебель',
		photoUrl: '/uploads/categories/household_kitchen.jpg',
		categoryType: 'household'
	},
	{
		categoryId: 6,
		categoryName: 'Спальня',
		photoUrl: '/uploads/categories/household_bedroom.jpg',
		categoryType: 'household'
	}
];

export const ApiService = {
	getProducts: async (productType: 'industrial' | 'household' = 'industrial'): Promise<GetProductsUserDto[]> => {
		try {
			const response = await apiClient.get<any[]>('/get_products', {
				params: { productType, active: true }
			});

			// Приводим все данные от бэкенда к единому стандарту фронтенда
			return response.data.map(product => ({
				productId: product.productId,
				productName: product.productName,
				// Бэкенд может отдать либо price, либо productPrice. Берем то, что есть.
				productPrice: product.productPrice || product.price,
				material: product.material,
				categoryId: product.categoryId,
				productType: product.productType,
				active: product.active, // Добавляем поле активности из бэкенда
				// Унифицируем фото: фронт будет ждать photoDtoList
				photoDtoList: product.photoDtoList || product.photoDto || { photo_id: 0, photoURL: '' }
			}));
		} catch (error) {
			console.error("API Error in getProducts:", error);
			// Фильтруем мок-данные по типу продукта и активности
			return MOCK_PRODUCTS.filter(p => p.productType === productType && p.active !== false);
		}
	},

	getProduct: async (productId: number): Promise<GetProductDto> => {
		try {
			const response = await apiClient.get<any>(`/get_product/${productId}`);
			console.log('✅ Product detail response:', response.data);
			return response.data;
		} catch (error) {
			console.error("API Error in getProduct:", error);
			throw error;
		}
	},

	getCategories: async (categoryType: 'industrial' | 'household' = 'industrial'): Promise<GetCategoriesUserDto[]> => {
		console.log('🔄 getCategories called with type:', categoryType);
		try {
			console.log('📡 Making request to /get_categories');
			const response = await apiClient.get<GetCategoriesUserDto[]>('/get_categories', {
				params: { categoryType }
			});
			console.log('✅ Raw categories response from backend:', response.data);
			console.log('📊 Response status:', response.status);
			console.log('📏 Response length:', response.data?.length);

			if (response.data && response.data.length > 0) {
				console.log('🔍 First category:', response.data[0]);
				console.log('🔍 First category keys:', Object.keys(response.data[0]));
				console.log('🖼️ First category photoUrl:', (response.data[0] as any).photoUrl);
			}

			return response.data;
		} catch (error) {
			console.error("❌ API Error in getCategories:", error);
			console.error("❌ Error details:", error.response?.data);
			// Возвращаем отфильтрованные мок-данные
			return MOCK_CATEGORIES.filter(c => c.categoryType === categoryType);
		}
	},

	getFilteredProducts: async (params: FilterParams): Promise<GetProductsUserDto[]> => {
		try {
			// Axios сам соберет query string из объекта params
			// и удалит те ключи, которые равны undefined
			const response = await apiClient.get<any[]>('/get_products_filter', {
				params: {
					categoryId: params.categoryId || undefined,
					minPrice: params.minPrice || undefined,
					maxPrice: params.maxPrice || undefined,
					material: params.material || undefined,
					productType: params.productType || undefined,
					active: params.active !== undefined ? params.active : undefined
				}
			});

			console.log('✅ Filtered response:', response.data);

			// ВАЖНО: Трансформируем так же, как в getProducts, 
			// чтобы компоненты (ProductCard) не сломались!
			return response.data.map(item => ({
				productId: item.productId,
				productName: item.productName,
				// Приводим к productPrice, так как CatalogPage ищет именно это поле
				productPrice: item.price || item.productPrice || 0,
				categoryId: item.categoryId,
				material: item.material,
				productType: item.productType || 'industrial', // Добавляем productType
				// Приводим к photoDtoList
				photoDtoList: item.photoDto || item.photoDtoList || { photo_id: 0, photoURL: '' },
				tag: item.tag,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt
			}));
		} catch (error) {
			console.error("❌ API Error in getFilteredProducts:", error);

			// Исправляем мок-фильтрацию для теста
			let filtered = [...MOCK_PRODUCTS];

			// Фильтруем по активности если параметр указан
			if (params.active !== undefined) {
				filtered = filtered.filter(p => p.active === params.active);
			}

			// Затем применяем остальные фильтры
			if (params.categoryId) filtered = filtered.filter(p => p.categoryId?.toString() === params.categoryId);
			if (params.material) filtered = filtered.filter(p => p.material === params.material);
			if (params.minPrice) filtered = filtered.filter(p => p.productPrice >= Number(params.minPrice));
			if (params.maxPrice) filtered = filtered.filter(p => p.productPrice <= Number(params.maxPrice));

			return filtered;
		}
	},

	// --- Cart Methods ---

	getCart: async (): Promise<CartDto> => {
		try {
			const response = await apiClient.get<CartDto>('/get_cart');
			return response.data;
		} catch (error) {
			console.warn("API Error (using mock cart):", error);
			// Simulate server calculation
			const totalPrice = MOCK_CART.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0);
			return { cartId: 1, items: MOCK_CART, totalPrice };
		}
	},

	addToCart: async (productId: number, quantity: number): Promise<void> => {
		try {
			await apiClient.post('/add_product_to_cart', { productId, quantity });
		} catch (error) {
			console.warn("API Error (using mock add):", error);
			const product = MOCK_PRODUCTS.find(p => p.productId === productId && p.active !== false);
			if (product) {
				const existing = MOCK_CART.find(item => item.productId === productId);
				if (existing) {
					existing.quantity += quantity;
				} else {
					MOCK_CART.push({
						cart_item_id: Date.now(),
						productId: product.productId,
						productName: product.productName,
						tag: 'industrial', // Используем статичное значение
						productPrice: product.productPrice || 0, // Используем productPrice
						quantity: quantity
					});
				}
			}
		}
	},

	updateCartItem: async (itemId: number, quantity: number): Promise<void> => {
		try {
			await apiClient.patch(`/items/${itemId}?quantity=${quantity}`);
		} catch (error) {
			console.warn("API Error (using mock update):", error);
			const item = MOCK_CART.find(i => i.cart_item_id === itemId);
			if (item) {
				item.quantity = quantity;
			}
		}
	},

	removeCartItem: async (itemId: number): Promise<void> => {
		try {
			await apiClient.delete(`/items/${itemId}`);
		} catch (error) {
			console.warn("API Error (using mock delete):", error);
			MOCK_CART = MOCK_CART.filter(i => i.cart_item_id !== itemId);
		}
	},

	generateCP: async (items: CartItemDto[]): Promise<Blob> => {
		try {
			const response = await apiClient.post('/generate_cp_pdf', items, {
				responseType: 'blob'
			});
			return response.data;
		} catch (error) {
			console.warn("API Error (using mock PDF):", error);
			return new Blob(["Mock PDF Data"], { type: 'application/pdf' });
		}
	},

	checkout: async (data: OrderRequestDto): Promise<OrderResponseDto> => {
		try {
			const response = await apiClient.post<OrderResponseDto>('/create_order', data);
			return response.data;
		} catch (error) {
			console.warn("API Error (using mock checkout):", error);
			return {
				id: Date.now(),
				orderNumber: `ORD-${Date.now()}`,
				totalAmount: MOCK_CART.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0),
				status: 'pending',
				createdAt: new Date().toISOString()
			};
		}
	},

	// --- Недостающие API методы ---

	// Получить технические спецификации
	getTechSpecs: async (): Promise<any[]> => {
		try {
			const response = await apiClient.get('/get_tech_spec');
			return response.data;
		} catch (error) {
			console.warn("API Error (using mock tech specs):", error);
			return [];
		}
	},

	// Получить промо-акции
	getPromotions: async (): Promise<any[]> => {
		try {
			const response = await apiClient.get('/get_promotions');
			return response.data;
		} catch (error) {
			console.warn("API Error (using mock promotions):", error);
			return [];
		}
	},

	// Получить новости
	getNews: async (): Promise<NewsDto[]> => {
		try {
			console.log('🔄 Loading news from API...');
			const response = await apiClient.get('/get_news_user');
			console.log('📦 Raw news data:', response.data);
			console.log('📊 Data type:', typeof response.data);
			console.log('📏 Data length:', response.data?.length);

			// Показываем структуру первого элемента
			if (response.data && response.data.length > 0) {
				console.log('🔍 First news structure:', response.data[0]);
				console.log('📰 First news title:', response.data[0].name);
				console.log('🖼️ First news photo:', response.data[0].newsPhotoUrl);
			}

			return response.data;
		} catch (error) {
			console.error("❌ API Error in getNews:", error);
			console.warn("📰 Using mock news instead");
			// Возвращаем мок данные если API недоступен
			return [
				{
					newsId: 1,
					name: "Новая коллекция промышленной мебели 2024",
					description: "Представляем нашу новую коллекцию современных промышленных столов и стульев, разработанных с учетом последних тенденций в эргономике и дизайне.",
					newsPhotoUrl: "https://picsum.photos/800/400?random=1",
					dateTime: new Date('2024-01-15').toISOString()
				},
				{
					newsId: 2,
					name: "Расширение производственных мощностей",
					description: "Мы рады сообщить об открытии нового производственного цеха площадью 5000 м², что позволит нам увеличить объемы производства и сократить сроки доставки.",
					newsPhotoUrl: "https://picsum.photos/800/400?random=2",
					dateTime: new Date('2024-01-10').toISOString()
				},
				{
					newsId: 3,
					name: "Сертификация ISO 9001:2015",
					description: "Наша компания успешно прошла сертификацию по международному стандарту качества ISO 9001:2015, что подтверждает высокое качество нашей продукции и процессов.",
					newsPhotoUrl: "https://picsum.photos/800/400?random=3",
					dateTime: new Date('2024-01-05').toISOString()
				}
			];
		}
	},

	// --- Заказы ---
	getOrderHistory: async (phone: string): Promise<OrderHistoryUserDto[]> => {
		// Кодируем телефон для безопасной передачи в URL
		const encodedPhone = encodeURIComponent(phone);
		const response = await apiClient.get(`/get_user_phone_orders_history/${encodedPhone}`);
		return response.data;
	},

	getOrderDetails: async (orderId: number): Promise<OrderDetailsDto> => {
		const response = await apiClient.get(`/order_details/${orderId}`);
		return response.data;
	},

	// Очистить корзину
	clearCart: async (): Promise<void> => {
		try {
			await apiClient.delete('/clear');
		} catch (error) {
			console.warn("API Error (using mock clear):", error);
			MOCK_CART = [];
		}
	},

	// Админские методы
	editCompany: async (companyData: CreateCompanyDto): Promise<void> => {
		const token = getAdminToken();
		if (!token) {
			throw new Error('Требуется авторизация администратора');
		}

		try {
			const formData = new FormData();

			// Добавляем все текстовые поля
			if (companyData.name !== undefined) formData.append('name', companyData.name);
			if (companyData.text !== undefined) formData.append('text', companyData.text);
			if (companyData.email !== undefined) formData.append('email', companyData.email);
			if (companyData.phone !== undefined) formData.append('phone', companyData.phone);
			if (companyData.address !== undefined) formData.append('address', companyData.address);
			if (companyData.requisites !== undefined) formData.append('requisites', companyData.requisites);
			if (companyData.jobStartAndEndDate !== undefined) formData.append('jobStartAndEndDate', companyData.jobStartAndEndDate);

			// Добавляем файл если он есть
			if (companyData.logoUrl) {
				formData.append('logoUrl', companyData.logoUrl);
			}

			await adminClient.put('/edit_company', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
		} catch (error) {
			console.error("API Error in editCompany:", error);
			throw error;
		}
	},

	// --- News API ---
	getUserNews: async (): Promise<UserNewsDto[]> => {
		try {
			console.log('Making request to /get_news_user');
			const response = await apiClient.get<UserNewsDto[]>('/get_news_user');
			console.log('✅ Raw news response from backend:', response.data);
			return response.data;
		} catch (error) {
			console.error("❌ API Error in getUserNews:", error);
			return [];
		}
	},

	getNewsById: async (newsId: number): Promise<NewsIdDto | null> => {
		try {
			console.log(`Making request to /get_news/${newsId}`);
			const response = await apiClient.get<NewsIdDto>(`/get_news/${newsId}`);
			console.log('✅ News detail response:', response.data);
			return response.data;
		} catch (error) {
			console.error(`❌ API Error in getNewsById(${newsId}):`, error);
			return null;
		}
	},

	getSimilarProducts: async (productId: number): Promise<GetProductsUserDto[]> => {
		try {
			console.log(`🔍 Fetching similar products for product ${productId}`);
			const response = await apiClient.get<GetProductsUserDto[]>(`/similar_products/${productId}`);
			console.log('✅ Similar products response:', response.data);
			return response.data;
		} catch (error) {
			console.error("❌ API Error in getSimilarProducts:", error);
			// Возвращаем мок-данные: исключаем текущий товар и неактивные
			return MOCK_PRODUCTS.filter(p => p.productId !== productId && p.active !== false).slice(0, 4);
		}
	},

	// Company methods
	getCompany: async (): Promise<CompanyDto | null> => {
		try {
			console.log('🏢 Fetching company info...');
			const response = await apiClient.get('/get_company');
			console.log('✅ Company response:', response.data);
			return response.data;
		} catch (error) {
			console.error('❌ API Error in getCompany:', error);
			return null;
		}
	},
};