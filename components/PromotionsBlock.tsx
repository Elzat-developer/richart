import React, { useEffect, useState } from 'react';
import { NewsDto } from '../types';
import { ApiService } from '../services/api';
import { getImageUrl } from '../config/api';

interface Promotion {
	promotion_id: number; // promotion_id как в админке
	urlPhoto: string; // urlPhoto как в админке
}

export const PromotionsBlock: React.FC = () => {
	const [promotions, setPromotions] = useState<Promotion[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [cacheInitialized, setCacheInitialized] = useState(false);

	// Кеширование акций на клиенте
	useEffect(() => {
		const loadPromotions = async () => {
			try {
				setLoading(true);
				console.log('🔄 Loading promotions from ApiService...');

				// Проверяем есть ли в кеше
				const cachedData = localStorage.getItem('promotionsCache');
				const cacheTime = localStorage.getItem('promotionsCacheTime');
				const now = Date.now();

				// Если кеш есть и он не старше 5 минут (300000 мс)
				if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 300000) {
					console.log('📦 Using cached promotions data');
					const parsedData = JSON.parse(cachedData);
					console.log('📊 Cached data:', parsedData);

					// Сортируем по promotion_id по возрастанию (1, 2, 3...)
					const sortedPromotions = parsedData.sort((a: Promotion, b: Promotion) => a.promotion_id - b.promotion_id);
					console.log('✅ Sorted cached promotions:', sortedPromotions);
					setPromotions(sortedPromotions);
					setCacheInitialized(true);
				} else {
					// Загружаем из API
					console.log('🌐 Loading promotions from API (cache expired or empty)');
					const data = await ApiService.getPromotions();
					console.log('📦 Raw promotions data:', data);
					console.log('📊 Data type:', typeof data);
					console.log('📏 Data length:', data?.length);

					// Показываем структуру первого элемента
					if (data && data.length > 0) {
						console.log('🔍 First promotion structure:', data[0]);
						console.log('🖼️ First promotion URL:', data[0].urlPhoto || data[0].url_photo);
					}

					// Сортируем по promotion_id по возрастанию (1, 2, 3...)
					const sortedPromotions = data.sort((a: Promotion, b: Promotion) => a.promotion_id - b.promotion_id);
					console.log('✅ Sorted promotions:', sortedPromotions);

					// Сохраняем в кеш
					localStorage.setItem('promotionsCache', JSON.stringify(sortedPromotions));
					localStorage.setItem('promotionsCacheTime', now.toString());
					console.log('💾 Promotions cached for 5 minutes');

					setPromotions(sortedPromotions);
					setCacheInitialized(true);
				}
			} catch (err) {
				console.error('❌ Error loading promotions:', err);
				setError('Не удалось загрузить акции');
			} finally {
				setLoading(false);
			}
		};

		loadPromotions();
	}, []); // Загружаем только один раз при монтировании

	// Функции для ручного переключения
	const goToPrevious = () => {
		setCurrentIndex((prevIndex) => (prevIndex - 1 + promotions.length) % promotions.length);
	};

	const goToNext = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % promotions.length);
	};

	const goToSlide = (index: number) => {
		setCurrentIndex(index);
	};

	if (loading) {
		return (
			<section className="relative w-full aspect-video md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
				<div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
			</section>
		);
	}

	if (error || promotions.length === 0) {
		console.log('⚠️ No promotions or error:', { error, promotionsLength: promotions.length });
		return null; // Не показываем блок если нет акций
	}

	const currentPromotion = promotions[currentIndex];
	console.log('🎯 Rendering promotion:', currentPromotion);
	console.log('🖼️ Image URL:', getImageUrl({ photoURL: currentPromotion.urlPhoto }));

	return (
		<section className="relative w-full aspect-video md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-black">
			{/* Background фото акции */}
			<div className="absolute inset-0">
				{currentPromotion && currentPromotion.urlPhoto ? (
					<img
						src={getImageUrl({ photoURL: currentPromotion.urlPhoto })}
						alt={`Акция ${currentPromotion.promotion_id}`}
						className="w-full h-full object-cover"
						onLoad={() => {
							console.log('✅ Promotion image loaded successfully!');
						}}
						onError={(e) => {
							console.error('❌ Failed to load promotion image:', {
								originalUrl: currentPromotion.urlPhoto,
								generatedUrl: getImageUrl({ photoURL: currentPromotion.urlPhoto }),
								naturalWidth: (e.target as HTMLImageElement).naturalWidth,
								naturalHeight: (e.target as HTMLImageElement).naturalHeight
							});
						}}
					/>
				) : (
					<div className="w-full h-full bg-gray-300 flex items-center justify-center">
						<div className="text-center text-gray-600">
							<div className="text-4xl mb-2">🏷️</div>
							<div>Нет изображения акции</div>
							<div className="text-sm mt-2">URL: {currentPromotion?.urlPhoto || 'undefined'}</div>
						</div>
					</div>
				)}

				{/* Затемнение для лучшей читаемости */}
				<div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/25"></div>
			</div>

			{/* Контент поверх фото */}
			<div className="relative z-10 h-full flex items-center justify-center">
				{/* Левая стрелка */}
				{promotions.length > 1 && (
					<button
						onClick={goToPrevious}
						className="absolute left-2 sm:left-4 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-black p-2 sm:p-3 transition-colors shadow-lg rounded-lg"
						aria-label="Предыдущая акция"
					>
						<svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
				)}

				{/* Правая стрелка */}
				{promotions.length > 1 && (
					<button
						onClick={goToNext}
						className="absolute right-2 sm:right-4 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-black p-2 sm:p-3 transition-colors shadow-lg rounded-lg"
						aria-label="Следующая акция"
					>
						<svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
				)}

				{/* Индикаторы слайдов - внутри блока, адаптивные */}
				{promotions.length > 1 && (
					<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg">
						{promotions.map((_, index) => (
							<button
								key={index}
								onClick={() => goToSlide(index)}
								className={`transition-all duration-300 ${index === currentIndex
									? 'w-6 h-2 sm:w-8 sm:h-2 bg-gray-800 shadow-lg'
									: 'w-2 h-2 sm:w-2 sm:h-2 bg-gray-400 hover:bg-gray-500'
									} rounded-full`}
								aria-label={`Перейти к акции ${index + 1}`}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
};
