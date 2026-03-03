// Конфигурация API
export const API_CONFIG = {
  // Базовый URL API - изменить при переносе на сервер
  BASE_URL: '/api/v1/user',
  
  // URL для загрузки изображений
  IMAGE_BASE_URL: '/uploads',
  
  // Настройки для разработки/продакшена
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Таймауты запросов (в мс)
  TIMEOUT: 10000,
};

// Получение полного URL для API
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Получение полного URL для изображений
export const getImageUrl = (photoDto: { photoURL?: string } | null | undefined): string => {
  if (!photoDto?.photoURL) {
    return 'https://picsum.photos/200/150?error=no-photo';
  }
  
  // Если URL уже полный (начинается с http), возвращаем как есть
  if (photoDto.photoURL.startsWith('http')) {
    return photoDto.photoURL;
  }
  
  // Иначе добавляем базовый URL
  return `${API_CONFIG.IMAGE_BASE_URL}${photoDto.photoURL}`;
};
