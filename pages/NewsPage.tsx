import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import { UserNewsDto } from '../types';
import { buildUrl } from '../config/api';

const NewsPage: React.FC = () => {
	const [news, setNews] = useState<UserNewsDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(12); // 12 новостей на странице (3x4)

	useEffect(() => {
		const fetchNews = async () => {
			try {
				setLoading(true);
				const newsData = await ApiService.getUserNews();
				setNews(newsData);
				setError(null);
			} catch (err) {
				console.error('Error fetching news:', err);
				setError('Не удалось загрузить новости. Попробуйте позже.');
			} finally {
				setLoading(false);
			}
		};

		fetchNews();
	}, []);

	// Пагинация
	const totalPages = Math.ceil(news.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentNews = news.slice(startIndex, endIndex);

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('ru-RU', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			});
		} catch {
			return dateString;
		}
	};

	const getImageUrl = (newsPhotoUrl: string): string => {
		if (!newsPhotoUrl) return 'https://picsum.photos/400/225?error=no-url';

		return buildUrl(newsPhotoUrl);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const renderPagination = () => {
		if (totalPages <= 1) return null;

		const pages = [];
		const maxVisiblePages = 5;
		let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

		if (endPage - startPage + 1 < maxVisiblePages) {
			startPage = Math.max(1, endPage - maxVisiblePages + 1);
		}

		// Первая страница и многоточие
		if (startPage > 1) {
			pages.push(
				<button
					key={1}
					onClick={() => handlePageChange(1)}
					className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
				>
					1
				</button>
			);
			if (startPage > 2) {
				pages.push(
					<span key="start-ellipsis" className="px-3 py-2 text-sm text-gray-500">
						...
					</span>
				);
			}
		}

		// Основные страницы
		for (let i = startPage; i <= endPage; i++) {
			pages.push(
				<button
					key={i}
					onClick={() => handlePageChange(i)}
					className={`px-3 py-2 text-sm font-medium rounded-md ${i === currentPage
						? 'bg-emerald-600 text-white border-emerald-600'
						: 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
						}`}
				>
					{i}
				</button>
			);
		}

		// Многоточие и последняя страница
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				pages.push(
					<span key="end-ellipsis" className="px-3 py-2 text-sm text-gray-500">
						...
					</span>
				);
			}
			pages.push(
				<button
					key={totalPages}
					onClick={() => handlePageChange(totalPages)}
					className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
				>
					{totalPages}
				</button>
			);
		}

		return pages;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Загрузка новостей...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-500 text-6xl mb-4">⚠️</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
					>
						Попробовать снова
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h1 className="text-4xl lg:text-5xl font-bold mb-4">
							Новости компании
						</h1>
						<p className="text-xl text-emerald-100 mb-8">
							Последние события и достижения RichArt
						</p>
						<div className="w-20 h-1 bg-white mx-auto"></div>
					</div>
				</div>
			</div>

			{/* News List */}
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-6xl mx-auto">
					{news.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-gray-400 text-6xl mb-4">📰</div>
							<h3 className="text-2xl font-semibold text-gray-900 mb-2">
								Новостей пока нет
							</h3>
							<p className="text-gray-600">
								Следите за обновлениями - скоро здесь появятся свежие новости
							</p>
						</div>
					) : (
						<>
							{/* Results count and page info */}
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
								<div className="text-gray-600">
									{news.length > 0 && (
										<span>
											Показано <span className="font-medium text-gray-900">{startIndex + 1}-{Math.min(endIndex, news.length)}</span> из{' '}
											<span className="font-medium text-gray-900">{news.length}</span> новостей
										</span>
									)}
								</div>
								{totalPages > 1 && (
									<div className="text-sm text-gray-500">
										Страница {currentPage} из {totalPages}
									</div>
								)}
							</div>

							{/* News Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{currentNews.map((item) => (
									<Link
										key={item.newsId}
										to={`/news/${item.newsId}`}
										className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
									>
										{/* Image */}
										<div className="relative h-40 bg-gray-100 overflow-hidden">
											<img
												src={getImageUrl(item.newsPhotoUrl)}
												alt={item.name}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
												onError={(e) => {
													(e.target as HTMLImageElement).src = 'https://picsum.photos/400/225?error=load-failed';
												}}
											/>

											{/* Date overlay */}
											<div className="absolute top-3 right-3 bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium">
												{formatDate(item.createDateNews)}
											</div>

											{/* Equipment badge */}
											<div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
												Оборудование
											</div>
										</div>

										{/* Content */}
										<div className="p-4">
											<h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
												{item.name}
											</h3>

											<div className="flex items-center justify-between">
												<span className="text-emerald-600 font-medium text-sm flex items-center gap-1">
													Подробнее
													<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
													</svg>
												</span>
											</div>
										</div>
									</Link>
								))}
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
									{/* Previous/Next buttons */}
									<div className="flex items-center gap-2">
										<button
											onClick={() => handlePageChange(currentPage - 1)}
											disabled={currentPage === 1}
											className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
										>
											<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
											Предыдущая
										</button>
										<button
											onClick={() => handlePageChange(currentPage + 1)}
											disabled={currentPage === totalPages}
											className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
										>
											Следующая
											<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
											</svg>
										</button>
									</div>

									{/* Page numbers */}
									<div className="flex items-center gap-1">
										{renderPagination()}
									</div>

									{/* Page info */}
									<div className="text-sm text-gray-600">
										Страница {currentPage} из {totalPages}
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default NewsPage;
