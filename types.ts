export interface GetPhotoDto {
	photo_id: number;
	photoURL: string;
}

// Интерфейс для списка товаров пользователя (упрощенный)
export interface GetProductsUserDto {
	productId: number;
	productName: string;
	productPrice: number;
	material: string;
	categoryId: number;
	productType: 'industrial' | 'household';
	photoDtoList?: GetPhotoDto;
	active?: boolean; // Добавляем поле активности
}

export interface GetProductsDto {
	productId: number;
	productName: string;
	tag: string;
	createdAt: string;
	updatedAt: string;
	material: string;
	categoryId: number;
	photoDto: GetPhotoDto;
}

export interface GetProductDto {
	productId: number;
	productName: string;
	description: string;
	tag: string; // артикуль
	price: number;
	material: string;
	dimensions: string;
	weight: number;
	width: number;  // Ширина, мм
	depth: number;  // Глубина, мм
	height: number; // Высота, мм
	power: string;   // Мощность (может быть в кВт или ккал)
	voltage: string; // Напряжение (220В, 380В)
	country: string;
	specifications: Map<string, string>;
	createdAt: string;
	updatedAt: string;
	categoryId: number;
	quantity: number;
	productType: 'industrial' | 'household';
	photos: GetPhotoDto[];
	techSpecUrl: string; // URL для скачивания технических спецификаций
	techSpecName: string; // Красивое имя файла технических спецификаций
	techSpecType?: string; // Тип файла (pdf, docx, xlsx и т.д.)
}

export interface CreateProductDto {
	productName: string;
	description: string;
	tag: string;
	price: number;
	material: string;
	dimensions: string;
	weight: number;
	categoryId: number;
	quantity: number;
	photos: File[];
	techSpecFile?: File; // Файл технических спецификаций
}

export interface EditProductDto {
	productId: number;
	productName: string;
	description: string;
	tag: string;
	price: number;
	material: string;
	dimensions: string;
	weight: number;
	categoryId: number;
	quantity: number;
	photos: File[];
	techSpecFile?: File; // Файл технических спецификаций
}

// Интерфейс для ответа бэкенда (с другими полями)
export interface BackendProductDto {
	productId: number;
	productName: string;
	tag: string;
	createdAt: string;
	updatedAt: string;
	categoryId: number;
	material?: string;
	price?: number;
	photoDto?: {
		photo_id: number;
		photoURL: string;
	};
}

// Интерфейс для ответа бэкенда одного продукта
export interface BackendProductDetailDto {
	productId: number;
	productName: string;
	description: string;
	tag: string;
	price: number;
	material: string;
	dimensions: string;
	weight: number;
	width: number;  // Ширина, мм
	depth: number;  // Глубина, мм
	height: number; // Высота, мм
	power: string;   // Мощность (может быть в кВт или ккал)
	voltage: string; // Напряжение (220В, 380В)
	country: string;
	specifications: Map<string, string>;
	createdAt: string;
	updatedAt: string;
	categoryId: number;
	quantity: number;
	productType: 'industrial' | 'household';
	photos: GetPhotoDto[];
}

export interface GetProductDto extends BackendProductDetailDto { }

export interface FilterParams {
	categoryId?: string;
	minPrice?: string;
	maxPrice?: string;
	material?: string;
	productType?: 'industrial' | 'household';
	active?: boolean; // Добавляем поле активности
}

export interface Category {
	id: number;
	name: string;
}

// Интерфейс для категорий с бэкенда (соответствует GetCategories.java)
export interface BackendCategoryDto {
	categoryId: number;
	categoryName: string;
	description: string;
	photoUrl?: string; // ← Обновлено для соответствия бэкенду
	categoryType: 'industrial' | 'household'; // ← Добавлено поле типа
}

// Интерфейс для категорий пользователя (с фото)
export interface GetCategoriesUserDto {
	categoryId: number;
	categoryName: string;
	photoUrl?: string;
	categoryType: 'industrial' | 'household';
}

export interface CartItemDto {
	cart_item_id: number; // Как в бэкенде
	productId: number;
	productName: string;
	tag: string;
	productPrice: number; // Как в бэкенде
	quantity: number;
	productActive?: boolean;
	characteristics?: string; // Новое: детальное описание
	photoDto?: GetPhotoDto;   // Новое: путь к файлу или URL изображения
	deliveryTerms?: string;   // Новое: срок поставки
	imageUrl?: string; // Optional for UI (legacy)
}

export interface CartDto {
	cartId: number;
	items: CartItemDto[];
	totalPrice: number; // Как в бэкенде
}

export interface OrderRequestDto {
	name: string;
	phone: string;
}

export interface OrderResponseDto {
	id: number;
	orderNumber: string;
	totalAmount: number;
	status: string;
	createdAt: string;
	whatsappLink?: string;
}

// --- Admin Types ---
export interface CreateProductDto {
	productName: string;
	description: string;
	tag: string;
	price: number;
	material: string;
	dimensions: string;
	weight: number;
	width?: number;  // Ширина, мм
	depth?: number;  // Глубина, мм
	height?: number; // Высота, мм
	power?: string;   // Мощность (может быть в кВт или ккал)
	voltage?: string; // Напряжение (220В, 380В)
	country?: string;
	specifications?: Record<string, string>;
	createdAt: string;
	categoryId: number;
	quantity: number;
	productType?: 'industrial' | 'household';
}

export interface CreateCategoryDto {
	categoryName: string;
	description: string;
	photoUrl?: File;
	categoryType: 'industrial' | 'household';
}

export interface EditCategoryDto {
	categoryId: number;
	categoryName: string;
	description: string;
	photoUrl?: File;
	categoryType: 'industrial' | 'household';
	active?: boolean;
}

export interface CompanyDto {
	companyId: number;
	name: string;
	text: string;
	email: string;
	phone: string;
	logoUrl: string;
	address: string;
	requisites: string;
	jobStartAndEndDate: string;
}

export interface CreateCompanyDto {
	name: string;
	text: string;
	email: string;
	phone: string;
	logoUrl?: File;
	address: string;
	requisites: string;
	jobStartAndEndDate: string;
}

export interface NewsDto {
	newsId: number;
	name: string;
	description: string;
	newsPhotoUrl: string;
}

export interface UserNewsDto {
	newsId: number;
	name: string;
	newsPhotoUrl: string;
	createDateNews: string;
}

export interface NewsIdDto {
	newsId: number;
	name: string;
	description: string;
	newsPhotoUrl: string;
	dateTime: string;
}

export interface CreateTechSpec {
	fileName: string;
	product_id: number | null;
	fileTechSpec: File;
}

export interface CompanyDto {
	companyId: number;
	name: string;
	text: string;
	email: string;
	phone: string;
	logoUrl: string;
	address: string;
	requisites: string;
	jobStartAndEndDate: string;
}

export interface GetOrdersDto {
	orderId: number;
	orderNumber: string;
	customerName: string;
	customerPhone: string;
	orderStartDate: string;
	totalPrice: number;
	paidStatus: 'PAID' | 'NOTPAY';
}

export interface OrderHistoryUserDto {
	orderId: number;
	orderNumber: string;
	totalPrice: number;
	paidStatus: 'PAID' | 'NOTPAY';
	createOrder: string;
	customerName: string;
	customerPhone: string;
	whatsappLink: string;
}

export interface NewsDto {
	newsId: number;
	name: string;
	description: string;
	newsPhotoUrl: string;
	dateTime: string;
}

export interface NewsIdDto {
	newsId: number;
	name: string;
	description: string;
	newPhotoUrl: string;
	dateTime: string;
}

export interface OrderDetailsDto {
	orderId: number;
	orderNumber: string;
	totalPrice: number;
	paidStatus: 'PAID' | 'NOTPAY';
	createOrder: string;
	customerName: string;
	customerPhone: string;
	whatsappLink: string;
	itemDto: OrderItemDto[];
}

export interface OrderItemDto {
	quantity: number;
	productInfo: OrderItemProductDTOS;
}

export interface OrderItemProductDTOS {
	productId: number;
	productName: string;
	productPrice: number;
	photo: GetPhotoDto;
	active: boolean;
}

export interface CreateNewsDto {
	name: string;
	description: string;
	newsPhotoUrl: File;
}

export interface NewsFormErrors {
	name?: string;
	description?: string;
	newsPhotoUrl?: string;
}

export interface OrderItemDto {
	quantity: number;
	productInfo: OrderItemProductDTOS;
}

export interface OrderItemProductDTOS {
	productId: number;
	productName: string;
	productPrice: number;
	photo: GetPhotoDto;
	active: boolean;
}

export interface PromotionDto {
	promotion_id: number;
	urlPhoto: string;
}

// Для создания акции нужен только файл
export interface PromotionFormErrors {
	urlPhoto?: string;
}

export interface ImportReportDto {
	successCount: number;
	errorCount: number;
	errorMessages: string[];
}

// --- Import History Types ---
export enum ImportStatus {
	SUCCESS = 'SUCCESS',
	PARTIAL = 'PARTIAL',
	FAILED = 'FAILED'
}

export interface ImportHistoriesDto {
	id: number;
	fileName: string;
	importStatus: ImportStatus;
	createdAt: string;
}

export interface ImportHistoryDto {
	id: number;
	fileName: string;
	successCount: number;
	errorCount: number;
	importStatus: ImportStatus;
	errorsLog: string;
	createdAt: string;
}

// --- Auth Types ---
export interface SignInRequest {
	email: string;
	password: string;
}

export interface JwtAuthenticationResponse {
	token: string;
}

export interface AuthContextType {
	admin: AdminUser | null;
	login: (credentials: SignInRequest) => Promise<void>;
	logout: () => void;
	loading: boolean;
	error: string | null;
}

export interface AdminUser {
	email: string;
	token: string;
}