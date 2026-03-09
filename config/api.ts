// Конфигурация API
export const API_CONFIG = {
	// Базовый URL API - изменить при переносе на сервер
	BASE_URL: '/api/v1/user',

	// URL для загрузки изображений
	IMAGE_BASE_URL: '/uploads',

	// Базовый URL для всех запросов (относительный)
	BASE_URL_RELATIVE: '',

	// Настройки для разработки/продакшена
	isDevelopment: process.env.NODE_ENV === 'development',

	// Таймауты запросов (в мс)
	TIMEOUT: 10000,
};

// Получение полного URL для API
export const getApiUrl = (endpoint: string) => {
	return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Универсальная функция для построения URL
export const buildUrl = (path: unknown): string => {
	if (typeof path !== 'string') return '';
	if (!path) return '';

	// Если URL уже полный (начинается с http), возвращаем как есть
	if (path.startsWith('http')) {
		return path;
	}

	// Если это абсолютный путь файловой системы, извлекаем относительный путь
	if (path.startsWith('/var/www/industrial-furniture/uploads/')) {
		const relativePath = path.replace('/var/www/industrial-furniture/uploads/', '');
		return `${API_CONFIG.IMAGE_BASE_URL}/${relativePath}`;
	}

	// Если уже начинается с /uploads/, возвращаем как есть
	if (path.startsWith('/uploads/')) {
		return path;
	}

	// Если начинается с /api/, возвращаем как есть (для Nginx проксирования)
	if (path.startsWith('/api/')) {
		return path;
	}

	// Если начинается с /, возвращаем как есть
	if (path.startsWith('/')) {
		return path;
	}

	// Иначе добавляем базовый URL
	return `${API_CONFIG.IMAGE_BASE_URL}/${path}`;
};

// Получение полного URL для изображений
export const getImageUrl = (photoDto: { photoURL?: string } | null | undefined): string => {
	if (!photoDto?.photoURL) {
		return 'https://picsum.photos/200/150?error=no-photo';
	}

	return buildUrl(photoDto.photoURL);
};
