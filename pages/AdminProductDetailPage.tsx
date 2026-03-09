import React, { useState, useEffect } from 'react';
import { buildUrl } from '../config/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminApiService } from '../services/adminApi';
import { GetProductDto, GetPhotoDto } from '../types';
import { AdminNavigation } from '../components/AdminNavigation';
import {
	EditIcon,
	TrashIcon,
	PackageIcon,
	DollarSignIcon,
	BoxIcon,
	WeightIcon,
	RulerIcon,
	TagIcon
} from '../components/Icons';

export const AdminProductDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { admin } = useAdminAuth();
	const [product, setProduct] = useState<GetProductDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
	const [deleting, setDeleting] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false); // Добавляем состояние для полноэкранного режима

	useEffect(() => {
		const loadProduct = async () => {
			if (!id) return;

			try {
				console.log('Loading product details for ID:', id);
				const productData = await AdminApiService.getProduct(parseInt(id));
				console.log('Product loaded:', productData);
				setProduct(productData);
			} catch (error) {
				console.error('Error loading product:', error);
			} finally {
				setLoading(false);
			}
		};

		loadProduct();
	}, []);

	// Функции для переключения фото
	const goToPreviousPhoto = () => {
		if (product && product.photos.length > 0) {
			setCurrentPhotoIndex((prev) =>
				prev === 0 ? product.photos.length - 1 : prev - 1
			);
		}
	};

	const goToNextPhoto = () => {
		if (product && product.photos.length > 0) {
			setCurrentPhotoIndex((prev) =>
				prev === product.photos.length - 1 ? 0 : prev + 1
			);
		}
	};

	const selectPhoto = (index: number) => {
		setCurrentPhotoIndex(index);
	};

	// Функции для полноэкранного режима
	const openFullscreen = () => {
		setIsFullscreen(true);
	};

	const closeFullscreen = () => {
		setIsFullscreen(false);
	};

	// Закрытие полноэкранного режима по Escape
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isFullscreen) {
				closeFullscreen();
			}
		};

		if (isFullscreen) {
			window.addEventListener('keydown', handleEscape);
			return () => window.removeEventListener('keydown', handleEscape);
		}
	}, [isFullscreen]);

	// Сбрасываем индекс фото при загрузке нового продукта
	useEffect(() => {
		if (product) {
			setCurrentPhotoIndex(0);
		}
	}, [product]);

	// Поддержка клавиатурной навигации
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!product || product.photos.length <= 1) return;

			if (e.key === 'ArrowLeft') {
				goToPreviousPhoto();
			} else if (e.key === 'ArrowRight') {
				goToNextPhoto();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [product]);

	const handleDelete = async () => {
		if (!product || !confirm('Вы уверены, что хотите удалить этот товар?')) return;

		setDeleting(true);
		try {
			await AdminApiService.deleteProduct(product.productId);
			// Перенаправляем обратно к списку товаров
			window.location.href = '/admin/products';
		} catch (error) {
			console.error('Error deleting product:', error);
			alert('Ошибка при удалении товара');
			setDeleting(false);
		}
	};

	const getImageUrl = (photoOrUrl: GetPhotoDto | string | null | undefined): string => {
		if (!photoOrUrl) return '';
		if (typeof photoOrUrl === 'string') return buildUrl(photoOrUrl);
		return buildUrl(photoOrUrl.photoURL);
	};

	const getTechSpecUrl = (url: string | null | undefined): string => {
		return buildUrl(url);
	};

	const handleDownloadTechSpec = async (fileUrl: string, fileName: string) => {
		try {
			console.log('Downloading file:', fileUrl);

			// Используем ту же логику что и в технических спецификациях
			const downloadUrl = getTechSpecUrl(fileUrl);
			console.log('Download URL:', downloadUrl);

			// Скачиваем файл через fetch
			const response = await fetch(downloadUrl);
			if (!response.ok) {
				throw new Error('Failed to download file');
			}

			// Создаем blob из ответа
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = fileName; // Указываем имя файла для скачивания
			document.body.appendChild(link);
			link.click();

			// Очищаем
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading file:', error);
			alert('Ошибка при скачивании файла');
		}
	};

	const getFileIcon = (fileName?: string, fileType?: string) => {
		const extension = (fileType || fileName || '').toLowerCase();
		if (extension.includes('pdf') || extension.includes('.pdf')) {
			return '📄'; // PDF
		} else if (extension.includes('doc') || extension.includes('.doc')) {
			return '📝'; // Word
		} else if (extension.includes('xls') || extension.includes('.xls')) {
			return '📊'; // Excel
		} else if (extension.includes('ppt') || extension.includes('.ppt')) {
			return '📈'; // PowerPoint
		} else if (extension.includes('txt') || extension.includes('.txt')) {
			return '📄'; // Text
		} else {
			return '📄'; // Default
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-industrial-accent mx-auto"></div>
					<p className="mt-4 text-gray-600">Загрузка товара...</p>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<>
				<div className="min-h-screen bg-gray-100">
					{/* Header */}
					<header className="bg-industrial-900 text-white shadow-lg">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="flex justify-between items-center h-16">
								<div className="flex items-center">
									<Link to="/admin/products" className="text-gray-300 hover:text-white mr-4">
										← Назад к товарам
									</Link>
									<h1 className="text-xl font-bold">
										Товар не найден
									</h1>
								</div>
								<span className="text-sm text-gray-300">
									{admin?.email}
								</span>
							</div>
						</div>
					</header>

					<div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
						<div className="text-center py-12">
							<h2 className="text-2xl font-bold text-gray-900 mb-4">Товар не найден</h2>
							<Link
								to="/admin/products"
								className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-industrial-accent hover:bg-orange-700"
							>
								← Вернуться к списку товаров
							</Link>
						</div>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="min-h-screen bg-gray-100">
				{/* Header */}
				<header className="bg-industrial-900 text-white shadow-lg">
					<div className="px-4 sm:px-6 lg:px-8">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:h-16 space-y-2 sm:space-y-0">
							<div className="flex items-center w-full sm:w-auto">
								<Link to="/admin/products" className="text-gray-300 hover:text-white mr-3 sm:mr-4 flex items-center">
									<svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
									<span className="hidden sm:inline">← Назад к товарам</span>
									<span className="sm:hidden">← Назад</span>
								</Link>
								<h1 className="text-lg sm:text-xl font-bold truncate flex-1">
									{product?.productName || 'Детали товара'}
								</h1>
							</div>
							<span className="text-xs sm:text-sm text-gray-300 whitespace-nowrap">
								{admin?.email}
							</span>
						</div>
					</div>
				</header>

				<div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
					{/* Actions */}
					<div className="flex flex-col sm:flex-row justify-start sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
						<Link
							to={`/admin/products/${product.productId}/edit`}
							className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-industrial-accent hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent w-full sm:w-auto"
						>
							<EditIcon className="h-4 w-4 mr-2" />
							Редактировать
						</Link>
						<button
							onClick={handleDelete}
							disabled={deleting}
							className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
						>
							<TrashIcon className="h-4 w-4 mr-2" />
							{deleting ? 'Удаление...' : 'Удалить товар'}
						</button>
					</div>

					{/* Product Details */}
					<div className="bg-white shadow overflow-hidden sm:rounded-lg">
						<div className="px-4 py-5 sm:px-6">
							<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
								Основная информация
							</h3>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								{/* Изображение товара */}
								<div className="lg:col-span-2">
									{/* Галерея фото */}
									{product.photos && product.photos.length > 0 ? (
										<div className="space-y-4">
											{/* Основное фото с навигацией */}
											<div className="relative bg-gray-100 rounded-lg overflow-hidden max-h-[400px] sm:max-h-[600px] flex items-center justify-center">
												<img
													src={getImageUrl(product.photos[currentPhotoIndex])}
													alt={`${product.productName} - фото ${currentPhotoIndex + 1}`}
													className="max-w-full max-h-[400px] sm:max-h-[600px] object-contain cursor-pointer transition-transform hover:scale-105 w-full"
													onClick={openFullscreen}
													onError={(e) => {
														console.error('Failed to load product image:', product.photos[currentPhotoIndex]?.photoURL);
														(e.target as HTMLImageElement).src = 'https://picsum.photos/800/600?error=load-failed&id=' + product.photos[currentPhotoIndex]?.photo_id;
													}}
												/>

												{/* Кнопки навигации */}
												{product.photos.length > 1 && (
													<>
														{/* Кнопка влево */}
														<button
															onClick={goToPreviousPhoto}
															className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors"
															aria-label="Предыдущее фото"
														>
															<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
															</svg>
														</button>

														{/* Кнопка вправо */}
														<button
															onClick={goToNextPhoto}
															className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors"
															aria-label="Следующее фото"
														>
															<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
															</svg>
														</button>
													</>
												)}

												{/* Индикатор фото */}
												<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">
													{currentPhotoIndex + 1} / {product.photos.length}
												</div>
											</div>

											{/* Превьюшки */}
											{product.photos.length > 1 && (
												<div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
													{product.photos.map((photo, index) => (
														<button
															key={photo.photo_id}
															onClick={() => setCurrentPhotoIndex(index)}
															className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === currentPhotoIndex
																? 'border-industrial-accent shadow-lg scale-105'
																: 'border-gray-200 hover:border-gray-300'
																}`}
														>
															<img
																src={getImageUrl(photo)}
																alt={`Превью ${index + 1}`}
																className="w-full h-full object-cover"
																onError={(e) => {
																	(e.target as HTMLImageElement).src = 'https://picsum.photos/100/100?error=thumb&id=' + photo.photo_id;
																}}
															/>
														</button>
													))}
												</div>
											)}
										</div>
									) : (
										<div className="relative bg-gray-100 rounded-lg overflow-hidden max-h-[600px] flex items-center justify-center">
											<PackageIcon className="h-16 w-16 text-gray-400" />
											<p className="text-gray-500 ml-4">Нет фото</p>
										</div>
									)}
								</div>

								{/* Название и артикул */}
								<div className="lg:col-span-2">
									<label className="block text-sm font-medium text-gray-500">Название товара</label>
									<p className="mt-1 text-lg sm:text-xl font-semibold text-gray-900 break-words">{product.productName}</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-500">Артикул</label>
									<p className="mt-1 text-sm text-gray-900 font-mono">{product.tag}</p>
								</div>

								{/* Цена и количество */}
								<div className="lg:col-span-2">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
										<div>
											<label className="block text-sm font-medium text-gray-500">Цена</label>
											<p className="mt-1 text-lg sm:text-xl font-bold text-green-600">
												{product.price.toLocaleString('ru-RU')} ₸
											</p>
										</div>
										<div className="text-right">
											<label className="block text-sm font-medium text-gray-500">Количество на складе</label>
											<p className={`mt-1 text-sm font-medium ${product.quantity > 10 ? 'text-green-600' :
												product.quantity > 0 ? 'text-yellow-600' : 'text-red-600'
												}`}>
												{product.quantity} шт.
											</p>
										</div>
									</div>
								</div>

								{/* Описание */}
								<div className="lg:col-span-2">
									<label className="block text-sm font-medium text-gray-500 mb-2">Описание</label>
									<div className="bg-gray-50 rounded-lg p-3 sm:p-4">
										<p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{product.description}</p>
									</div>
								</div>

								{/* Характеристики */}
								<div>
									<label className="block text-sm font-medium text-gray-500">Материал</label>
									<p className="mt-1 text-sm text-gray-900">{product.material}</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-500">Габариты</label>
									<p className="mt-1 text-sm text-gray-900">{product.dimensions}</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-500">Вес</label>
									<p className="mt-1 text-sm text-gray-900">{product.weight} кг</p>
								</div>

								{/* Дополнительные размеры */}
								{product.width && (
									<div>
										<label className="block text-sm font-medium text-gray-500">Ширина</label>
										<p className="mt-1 text-sm text-gray-900">{product.width} мм</p>
									</div>
								)}

								{product.depth && (
									<div>
										<label className="block text-sm font-medium text-gray-500">Глубина</label>
										<p className="mt-1 text-sm text-gray-900">{product.depth} мм</p>
									</div>
								)}

								{product.height && (
									<div>
										<label className="block text-sm font-medium text-gray-500">Высота</label>
										<p className="mt-1 text-sm text-gray-900">{product.height} мм</p>
									</div>
								)}

								{/* Электрические характеристики */}
								{product.power && (
									<div>
										<label className="block text-sm font-medium text-gray-500">Мощность</label>
										<p className="mt-1 text-sm text-gray-900">{product.power}</p>
									</div>
								)}

								{product.voltage && (
									<div>
										<label className="block text-sm font-medium text-gray-500">Напряжение</label>
										<p className="mt-1 text-sm text-gray-900">{product.voltage}</p>
									</div>
								)}

								{/* Страна производства */}
								{product.country && (
									<div>
										<label className="block text-sm font-medium text-gray-500">Страна</label>
										<p className="mt-1 text-sm text-gray-900">{product.country}</p>
									</div>
								)}

								{/* Категория */}
								<div>
									<label className="block text-sm font-medium text-gray-500">Категория</label>
									<p className="mt-1 text-sm text-gray-900">ID: {product.categoryId}</p>
								</div>

								{/* Даты */}
								<div>
									<label className="block text-sm font-medium text-gray-500">Дата создания</label>
									<p className="mt-1 text-sm text-gray-900">
										{new Date(product.createdAt).toLocaleString('ru-RU')}
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-500">Дата обновления</label>
									<p className="mt-1 text-sm text-gray-900">
										{new Date(product.updatedAt).toLocaleString('ru-RU')}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Спецификации */}
					<div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
						<div className="px-4 py-5 sm:px-6">
							<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
								Технические характеристики
							</h3>
							{product.specifications && Object.keys(product.specifications).length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{Object.entries(product.specifications)
										.filter(([_, value]) => value && typeof value === 'string' && value.trim() !== '')
										.map(([key, value]) => (
											<div key={key} className="flex justify-between py-2 border-b border-gray-100">
												<span className="text-gray-600 capitalize">{key}:</span>
												<span className="font-medium">{value}</span>
											</div>
										))}
								</div>
							) : (
								<div className="text-center text-gray-500 py-8">
									<BoxIcon className="mx-auto h-12 w-12 text-gray-400" />
									<p className="mt-2">Технические спецификации не указаны</p>
								</div>
							)}
						</div>
					</div>

					{/* Технические спецификации (файл) */}
					{product.techSpecUrl && product.techSpecName && (
						<div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
							<div className="px-4 py-5 sm:px-6">
								<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
									Технические спецификации
								</h3>
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
									<div className="flex items-center mb-3 sm:mb-0">
										<span className="text-3xl mr-3">{getFileIcon(product.techSpecName, product.techSpecType)}</span>
										<div>
											<p className="font-medium text-gray-900">{product.techSpecName}</p>
											<p className="text-sm text-gray-500">
												Файл с техническими спецификациями {product.techSpecType}
											</p>
										</div>
									</div>
									<button
										onClick={() => handleDownloadTechSpec(product.techSpecUrl, product.techSpecName)}
										className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
									>
										<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
										Скачать файл
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Полноэкранный модал для фото */}
			{isFullscreen && product && product.photos.length > 0 && (
				<div
					className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
					onClick={closeFullscreen}
				>
					<div className="relative max-w-[90vw] max-h-[90vh]">
						<img
							src={getImageUrl(product.photos[currentPhotoIndex])}
							alt={`${product.productName} - фото ${currentPhotoIndex + 1}`}
							className="max-w-full max-h-full object-contain"
							onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на фото
						/>

						{/* Кнопка закрытия */}
						<button
							onClick={closeFullscreen}
							className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
							aria-label="Закрыть"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>

						{/* Навигация в полноэкранном режиме */}
						{product.photos.length > 1 && (
							<>
								<button
									onClick={(e) => {
										e.stopPropagation();
										goToPreviousPhoto();
									}}
									className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
									aria-label="Предыдущее фото"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
									</svg>
								</button>

								<button
									onClick={(e) => {
										e.stopPropagation();
										goToNextPhoto();
									}}
									className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
									aria-label="Следующее фото"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
									</svg>
								</button>

								{/* Индикатор фото */}
								<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
									{currentPhotoIndex + 1} / {product.photos.length}
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
};
