import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import { GetCategoriesUserDto } from '../types';

// Функция для правильного формирования URL изображения (как в акциях)
const getCategoryImageUrl = (photoUrl: string): string => {
	if (!photoUrl) return '';

	if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
		return photoUrl;
	}

	if (photoUrl.match(/^[A-Za-z]:/)) {
		const uploadsMatch = photoUrl.match(/uploads\/(.+)/);
		if (uploadsMatch) {
			return `http://localhost:8080/uploads/${uploadsMatch[1]}`;
		}
		return `http://localhost:8080/${photoUrl.replace(/^[A-Za-z]:\\/, '').replace(/\\/g, '/')}`;
	}

	if (photoUrl.startsWith('/api')) {
		return `http://localhost:8080${photoUrl}`;
	}

	if (photoUrl.startsWith('/')) {
		return `http://localhost:8080${photoUrl}`;
	}

	return `http://localhost:8080/${photoUrl}`;
};

export const CategoriesPage: React.FC = () => {
	const [categories, setCategories] = useState<GetCategoriesUserDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [categoriesPerPage] = useState(20); // 20 категорий на странице (4x5 сетка)

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

	// Пагинация
	const indexOfLastCategory = currentPage * categoriesPerPage;
	const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
	const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
	const totalPages = Math.ceil(categories.length / categoriesPerPage);

	// Функции для навигации по страницам
	const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
	const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
	const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

	// Функция для генерации номеров страниц
	const getPageNumbers = () => {
		const pageNumbers = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pageNumbers.push(i);
			}
		} else {
			const startPage = Math.max(1, currentPage - 2);
			const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

			for (let i = startPage; i <= endPage; i++) {
				pageNumbers.push(i);
			}
		}

		return pageNumbers;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="container mx-auto px-4 py-16">
					<div className="text-center mb-12">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">Категории товаров</h1>
						<p className="text-lg text-gray-600">Выберите категорию для просмотра товаров</p>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
						{[...Array(20)].map((_, index) => (
							<div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
								<div className="h-48 bg-gray-200"></div>
								<div className="p-4">
									<div className="h-4 bg-gray-200 rounded mb-2"></div>
									<div className="h-3 bg-gray-200 rounded w-3/4"></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="container mx-auto px-4 py-16">
					<div className="text-center py-12">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">Категории товаров</h1>
						<p className="text-red-600 mb-8">{error}</p>
						<button
							onClick={() => window.location.reload()}
							className="bg-industrial-accent text-white px-6 py-3 rounded-lg hover:bg-industrial-accent/90 transition-colors"
						>
							Попробовать снова
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-16">
				{/* Заголовок страницы */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">Промышленные категории</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Выберите интересующую вас категорию для просмотра промышленного оборудования.
						Мы предлагаем широкий выбор качественной продукции для вашего бизнеса.
					</p>
					{/* Информация о количестве */}
					<div className="mt-4 text-sm text-gray-500">
						Показано {currentCategories.length} из {categories.length} категорий
						{totalPages > 1 && ` • Страница ${currentPage} из ${totalPages}`}
					</div>
				</div>

				{/* Сетка категорий */}
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
					{currentCategories.map((category) => {
						const categoryAny = category as any;
						const photoUrl = categoryAny.photoUrl || categoryAny.photo_url || categoryAny.photoURL || '';

						return (
							<Link
								key={categoryAny.categoryId || category.categoryId}
								to={`/catalog?categoryId=${categoryAny.categoryId || category.categoryId}`}
								className="group bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:z-10"
							>
								{/* Фото категории */}
								<div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
									<img
										src={getCategoryImageUrl(photoUrl)}
										alt={categoryAny.categoryName || category.categoryName}
										className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
										onError={(e) => {
											(e.target as HTMLImageElement).src = `https://picsum.photos/400/300?error=${categoryAny.categoryId || category.categoryId}`;
										}}
									/>
								</div>

								{/* Название и описание категории */}
								<div className="p-6">
									<h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-industrial-accent transition-colors">
										{categoryAny.categoryName || category.categoryName}
									</h3>
									{/* Кнопка "Смотреть товары" */}
									<div className="flex items-center text-industrial-accent font-semibold text-sm group-hover:text-industrial-accent/80 transition-colors">
										<span>Смотреть товары</span>
										<svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</div>
							</Link>
						);
					})}
				</div>

				{/* Если категорий нет */}
				{categories.length === 0 && (
					<div className="text-center py-12">
						<div className="text-gray-400 mb-4">
							<svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">Категории не найдены</h3>
						<p className="text-gray-600">В настоящее время категории товаров отсутствуют</p>
					</div>
				)}

				{/* Пагинация */}
				{totalPages > 1 && (
					<div className="flex flex-col items-center space-y-4">
						{/* Навигационные кнопки */}
						<div className="flex items-center space-x-2">
							{/* Кнопка "Предыдущая" */}
							<button
								onClick={goToPreviousPage}
								disabled={currentPage === 1}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1
									? 'bg-gray-100 text-gray-400 cursor-not-allowed'
									: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
									}`}
							>
								<div className="flex items-center">
									<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
									Предыдущая
								</div>
							</button>

							{/* Номера страниц */}
							<div className="flex items-center space-x-1">
								{getPageNumbers().map((pageNumber) => (
									<button
										key={pageNumber}
										onClick={() => paginate(pageNumber)}
										className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === pageNumber
											? 'bg-industrial-accent text-white'
											: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
											}`}
									>
										{pageNumber}
									</button>
								))}
							</div>

							{/* Кнопка "Следующая" */}
							<button
								onClick={goToNextPage}
								disabled={currentPage === totalPages}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages
									? 'bg-gray-100 text-gray-400 cursor-not-allowed'
									: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
									}`}
							>
								<div className="flex items-center">
									Следующая
									<svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</div>
							</button>
						</div>

						{/* Информация о текущей странице */}
						<div className="text-sm text-gray-600">
							Страница {currentPage} из {totalPages} • Всего {categories.length} категорий
						</div>

						{/* Быстрый переход к странице */}
						<div className="flex items-center space-x-2 text-sm">
							<span className="text-gray-600">Перейти к странице:</span>
							<div className="flex items-center space-x-1">
								<input
									type="number"
									min="1"
									max={totalPages}
									value={currentPage}
									onChange={(e) => {
										const page = parseInt(e.target.value);
										if (page >= 1 && page <= totalPages) {
											paginate(page);
										}
									}}
									className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-industrial-accent"
								/>
								<span className="text-gray-600">из {totalPages}</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
