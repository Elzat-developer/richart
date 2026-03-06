import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import { NewsIdDto } from '../types';
import { buildUrl } from '../config/api';

const NewsDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [news, setNews] = useState<NewsIdDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchNewsDetail = async () => {
			if (!id) {
				setError('ID новости не указан');
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const newsData = await ApiService.getNewsById(parseInt(id));
				setNews(newsData);
				setError(null);
			} catch (err) {
				console.error('Error fetching news detail:', err);
				setError('Не удалось загрузить новость. Попробуйте позже.');
			} finally {
				setLoading(false);
			}
		};

		fetchNewsDetail();
	}, [id]);

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('ru-RU', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return dateString;
		}
	};

	const getImageUrl = (newsPhotoUrl: string): string => {
		if (!newsPhotoUrl) return 'https://picsum.photos/1200/600?error=no-url';

		return buildUrl(newsPhotoUrl);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Загрузка новости...</p>
				</div>
			</div>
		);
	}

	if (error || !news) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-500 text-6xl mb-4">⚠️</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
					<p className="text-gray-600 mb-6">{error || 'Новость не найдена'}</p>
					<Link
						to="/news"
						className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
						</svg>
						Вернуться к новостям
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 text-white py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-7xl mx-auto">
						{/* Breadcrumb */}
						<nav className="flex items-center gap-2 text-blue-100 mb-6">
							<Link to="/" className="hover:text-white transition-colors">
								Главная
							</Link>
							<span>/</span>
							<Link to="/news" className="hover:text-white transition-colors">
								Новости
							</Link>
							<span>/</span>
							<span className="text-white">{news.name}</span>
						</nav>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
							<div className="lg:col-span-2">
								<div className="flex items-center gap-3 mb-4">
									<div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
										Оборудование
									</div>
									<div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
										Новое поступление
									</div>
								</div>
								<h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
									{news.name}
								</h1>
								<div className="flex flex-wrap items-center gap-6 text-blue-100">
									<div className="flex items-center gap-2">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
										</svg>
										{formatDate(news.dateTime)}
									</div>
									<div className="flex items-center gap-2">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
										</svg>
										Промышленное оборудование
									</div>
								</div>
							</div>
							<div className="lg:col-span-1">
								<div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
									<h3 className="text-lg font-semibold mb-4">Ключевые преимущества</h3>
									<ul className="space-y-2 text-blue-100">
										<li className="flex items-center gap-2">
											<svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
											Высокая производительность
										</li>
										<li className="flex items-center gap-2">
											<svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
											Надежность и долговечность
										</li>
										<li className="flex items-center gap-2">
											<svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
											Соответствие стандартам
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* News Content */}
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Left Content - 2 columns */}
						<div className="lg:col-span-2 space-y-6">
							{/* Main Content Card */}
							<div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
								<div className="flex items-center gap-3 mb-6">
									<div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
										Оборудование
									</div>
									<div className="flex items-center gap-2 text-gray-500 text-sm">
										<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
										</svg>
										{formatDate(news.dateTime)}
									</div>
								</div>

								<div className="prose prose-lg max-w-none">
									<div
										className="text-gray-700 leading-relaxed text-lg [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h1]:border-l-4 [&_h1]:border-blue-600 [&_h1]:pl-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:border-l-4 [&_h2]:border-emerald-600 [&_h2]:pl-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-none [&_ul]:pl-0 [&_ul]:my-4 [&_li]:relative [&_li]:pl-6 [&_li]:mb-2 [&_li]:leading-relaxed [&_li:before]:content-['•'] [&_li:before]:absolute [&_li:before]:left-0 [&_li:before]:text-blue-600 [&_li:before]:font-bold [&_strong]:text-blue-700 [&_strong]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:border-blue-600 [&_blockquote]:pl-4 [&_blockquote]:bg-blue-50 [&_blockquote]:py-2 [&_blockquote]:my-4"
										dangerouslySetInnerHTML={{ __html: news.description }}
									/>
								</div>

								{/* B2B Action Buttons */}
								<div className="mt-8 pt-6 border-t border-gray-200">
									<div className="flex flex-wrap gap-4">
										<a
											href={`https://wa.me/77472164664?text=Здравствуйте!%20Хочу%20получить%20коммерческое%20предложение%20на%20${encodeURIComponent(news.name)}`}
											target="_blank"
											rel="noopener noreferrer"
											className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
										>
											<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
												<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
											</svg>
											Запросить коммерческое предложение
										</a>
										<a
											href={`https://wa.me/77472164664?text=Здравствуйте!%20Хочу%20получить%20консультацию%20по%20оборудованию%20${encodeURIComponent(news.name)}`}
											target="_blank"
											rel="noopener noreferrer"
											className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
										>
											<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
											</svg>
											Консультация специалиста
										</a>
									</div>
								</div>
							</div>

							{/* Technical Specifications Card */}
							<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
								<h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
									<svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
									</svg>
									Наличие и Категория
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="bg-white rounded-lg p-4">
										<div className="text-sm text-gray-500 mb-1">Категория</div>
										<div className="font-medium text-gray-900">Промышленное оборудование</div>
									</div>
									<div className="bg-white rounded-lg p-4">
										<div className="text-sm text-gray-500 mb-1">Статус</div>
										<div className="font-medium text-green-600">В наличии</div>
									</div>
									<div className="bg-white rounded-lg p-4">
										<div className="text-sm text-gray-500 mb-1">Срок поставки</div>
										<div className="font-medium text-gray-900">от 3 дней</div>
									</div>
									<div className="bg-white rounded-lg p-4">
										<div className="text-sm text-gray-500 mb-1">Гарантия</div>
										<div className="font-medium text-gray-900">до 12 месяцев</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right Sidebar - 1 column */}
						<div className="space-y-6">
							{/* Main Image */}
							{news.newsPhotoUrl && (
								<div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
									<img
										src={getImageUrl(news.newsPhotoUrl)}
										alt={news.name}
										className="w-full h-auto object-cover"
										onError={(e) => {
											(e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?error=load-failed';
										}}
									/>
								</div>
							)}

							{/* Quick Actions */}
							<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
								<h3 className="text-lg font-bold text-gray-900 mb-4">Быстрые действия</h3>
								<div className="space-y-3">
									<a
										href="https://wa.me/77472164664?text=Здравствуйте!%20Хочу%20получить%20консультацию%20по%20оборудованию"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
									>
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" />
										</svg>
										Написать в WhatsApp
									</a>

								</div>
							</div>

							{/* Share Section */}
							<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
								<h3 className="text-lg font-bold text-gray-900 mb-4">Поделиться новостью</h3>
								<div className="flex flex-col gap-3">
									<a
										href={`https://wa.me/?text=${encodeURIComponent(`Посмотрите интересную новость: ${news.name}`)}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
									>
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" />
										</svg>
										WhatsApp
									</a>
									<a
										href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Посмотрите интересную новость: ${news.name}`)}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
									>
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21 2.23-1.13 7.62-1.59 10.11-.2 1.06-.58 1.41-.95 1.45-.81.07-1.42-.53-2.21-1.04-1.22-.81-1.91-1.31-3.09-2.1-1.37-.89-.48-1.37.31-2.16.21-.22 1.57-1.44 1.77-1.63.2-.19.37-.12.56.07.14.14.97 1.09 1.24 1.47.27.38.54.32.91-.04.37-.36 1.47-1.18 2.68-1.82 1.02-.54 1.8-.37 2.43-.22.78.19 2.47 1.32 2.47 4.14z" />
										</svg>
										Telegram
									</a>
								</div>
							</div>

							{/* Back button */}
							<Link
								to="/news"
								className="flex items-center gap-2 w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
								</svg>
								Вернуться к новостям
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NewsDetailPage;
