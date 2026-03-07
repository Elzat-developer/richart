import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import { GetCategoriesUserDto } from '../types';
import { buildUrl } from '../config/api';

// Стили для скрытия скроллбара
const scrollbarHideStyles = `
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
`;

// Функция для правильного формирования URL изображения
const getCategoryImageUrl = (photoUrl: string): string => {
	return buildUrl(photoUrl);
};

export const CategoriesBlock: React.FC = () => {
	const [categories, setCategories] = useState<GetCategoriesUserDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	// Внедряем стили для скрытия скроллбара
	useEffect(() => {
		const styleElement = document.createElement('style');
		styleElement.textContent = scrollbarHideStyles;
		document.head.appendChild(styleElement);

		return () => {
			document.head.removeChild(styleElement);
		};
	}, []);

	const scrollLeft = () => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
		}
	};

	const scrollRight = () => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
		}
	};

	useEffect(() => {
		const loadCategories = async () => {
			try {
				setLoading(true);
				setError(null);
				console.log('🔄 Loading categories from ApiService...');
				const categoriesData = await ApiService.getCategories('industrial');
				console.log('📦 Categories loaded:', categoriesData);
				setCategories(categoriesData);
			} catch (err) {
				console.error('❌ Error loading categories:', err);
				setError('Не удалось загрузить категории');
			} finally {
				setLoading(false);
			}
		};

		loadCategories();
	}, []);

	if (loading) {
		return (
			<section className="py-8 bg-white">
				<div className="container mx-auto pl-10 pr-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Промышленное категории</h2>
					</div>
					<div className="relative">
						<div ref={scrollContainerRef} className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth">
							{[...Array(10)].map((_, index) => (
								<div key={index} className="flex-shrink-0 shadow-lg h-72 w-60 animate-pulse" style={{ backgroundColor: 'rgb(245,243,241)' }}></div>
							))}
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="py-8 bg-white">
				<div className="container mx-auto pl-10 pr-4">
					<div className="text-center py-12">
						<p className="text-red-600 mb-4">{error}</p>
						<button
							onClick={() => window.location.reload()}
							className="bg-industrial-accent text-white px-6 py-2 rounded-lg hover:bg-industrial-accent/90 transition-colors"
						>
							Попробовать снова
						</button>
					</div>
				</div>
			</section>
		);
	}

	return (


		<section className="py-8 bg-white">
			<div className="container mx-auto pl-10 pr-4">

				<div className="relative">
					{/* Левая стрелка */}
					{categories.length > 0 && (
						<button
							onClick={scrollLeft}
							className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-black p-2 rounded-full shadow-lg transition-colors"
							aria-label="Предыдущие категории"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
					)}

					{/* Контейнер с категориями */}
					<div
						ref={scrollContainerRef}
						className="flex gap-3 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-6 md:px-12"
					>
						{categories.map((category) => {
							const categoryAny = category as any;
							const photoUrl = categoryAny.photoUrl || categoryAny.photo_url || categoryAny.photoURL || '';

							return (
								<Link
									key={categoryAny.categoryId || category.categoryId}
									to={`/catalog?categoryId=${categoryAny.categoryId || category.categoryId}`}
									className="flex-shrink-0 group relative shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-x-110 hover:z-10 flex flex-col w-32 sm:w-40 md:w-48 lg:w-60"
									style={{ backgroundColor: 'rgb(245,243,241)' }}
								>
									{/* Фото категории */}
									<div className="flex-1 overflow-hidden p-3 sm:p-4 flex items-center justify-center" style={{ backgroundColor: 'rgb(245,243,241)' }}>
										<img
											src={getCategoryImageUrl(photoUrl)}
											alt={categoryAny.categoryName || category.categoryName}
											className="max-w-full max-h-full object-contain"
											onError={(e) => {
												(e.target as HTMLImageElement).src = `https://picsum.photos/300/200?error=${categoryAny.categoryId || category.categoryId}`;
											}}
										/>
									</div>

									{/* Название категории под изображением */}
									<div className="p-2 sm:p-3 text-center" style={{ backgroundColor: 'rgb(245,243,241)' }}>
										<h3 className="text-xs sm:text-sm font-bold text-black">
											{categoryAny.categoryName || category.categoryName}
										</h3>
									</div>
								</Link>
							);
						})}
					</div>

					{/* Правая стрелка */}
					{categories.length > 0 && (
						<button
							onClick={scrollRight}
							className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-black p-2 rounded-full shadow-lg transition-colors"
							aria-label="Следующие категории"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					)}
				</div>
			</div>
		</section>

	);
};
