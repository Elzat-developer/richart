import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import { ShoppingCartIcon, ArrowLeftIcon } from '../components/Icons';
import { useCart } from '../context/CartContext';
import { GetProductDto, GetProductsUserDto } from '../types';
import { ProductCard } from '../components/ProductCard';
import { buildUrl } from '../config/api';

export const ProductDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { addToCart, refreshCart } = useCart();
	const [product, setProduct] = useState<GetProductDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [activeTab, setActiveTab] = useState<'specs' | 'techSpecs' | 'description'>('specs');
	const [similarProducts, setSimilarProducts] = useState<GetProductsUserDto[]>([]);
	const [loadingSimilar, setLoadingSimilar] = useState(false);

	useEffect(() => {
		const fetchProductDetail = async () => {
			if (!id) {
				setError('ID продукта не указан');
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const productData = await ApiService.getProduct(parseInt(id));
				setProduct(productData);
				setError(null);
			} catch (err) {
				console.error('Error fetching product detail:', err);
				setError('Не удалось загрузить товар. Попробуйте позже.');
			} finally {
				setLoading(false);
			}
		};

		fetchProductDetail();
	}, [id]);

	// Загрузка похожих товаров
	useEffect(() => {
		const fetchSimilarProducts = async () => {
			if (!id) return;

			try {
				setLoadingSimilar(true);
				const similarData = await ApiService.getSimilarProducts(parseInt(id));
				setSimilarProducts(similarData);
			} catch (err) {
				console.error('Error fetching similar products:', err);
			} finally {
				setLoadingSimilar(false);
			}
		};

		fetchSimilarProducts();
	}, [id]);

	// Функция для получения URL изображения
	const getImageUrl = (photoURL: string): string => {
		if (!photoURL) return 'https://picsum.photos/800/600?error=no-url';

		return buildUrl(photoURL);
	};

	const getTechSpecUrl = (techSpecUrl: string): string => {
		if (!techSpecUrl) return '';

		return buildUrl(techSpecUrl);
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

	// Функция для получения URL изображения
	const getAdminImageUrl = (photoDto: any): string => {
		if (!photoDto || !photoDto.photoURL) return 'https://picsum.photos/800/600?error=no-photo';

		return buildUrl(photoDto.photoURL);
	};

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

	const handleAddToCart = async () => {
		try {
			// Добавляем товар через API
			await ApiService.addToCart(product.productId, quantity);

			// Обновляем состояние корзины через контекст
			await refreshCart();

			// Показываем сообщение без перенаправления
			alert(`Товар "${product.productName}" (${quantity} шт.) добавлен в корзину!`);
		} catch (error) {
			console.error('Error adding to cart:', error);
			alert('Ошибка при добавлении в корзину');
		}
	};

	const handleWhatsApp = () => {
		if (product) {
			const text = `Я хочу закупить ${product.productName} Количество: ${quantity}`;
			window.open(`https://wa.me/77472164664?text=${encodeURIComponent(text)}`, '_blank');
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						<div className="bg-gray-200 h-96 rounded-lg"></div>
						<div className="space-y-4">
							<div className="bg-gray-200 h-8 rounded"></div>
							<div className="bg-gray-200 h-6 rounded w-3/4"></div>
							<div className="bg-gray-200 h-6 rounded w-1/2"></div>
							<div className="bg-gray-200 h-12 rounded"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !product) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-20">
					<p className="text-red-600 text-lg mb-4">{error || 'Товар не найден'}</p>
					<Link
						to="/catalog"
						className="inline-flex items-center bg-industrial-900 text-white px-6 py-3 rounded-lg hover:bg-industrial-800 transition-colors"
					>
						<ArrowLeftIcon size={16} className="mr-2" />
						Вернуться к каталогу
					</Link>
				</div>
			</div>
		);
	}

	const photos = product.photos || [];
	const mainImage = photos[selectedImageIndex];

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Breadcrumb */}
			<nav className="mb-8">
				<ol className="flex items-center space-x-2 text-sm text-gray-600">
					<li>
						<Link to="/" className="hover:text-industrial-accent">Главная</Link>
					</li>
					<li className="flex items-center">
						<span className="mx-2">/</span>
						<Link to="/catalog" className="hover:text-industrial-accent">Каталог</Link>
					</li>
					<li className="flex items-center">
						<span className="mx-2">/</span>
						<span className="text-gray-900">{product.productName}</span>
					</li>
				</ol>
			</nav>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
				{/* Images Section */}
				<div className="space-y-4">
					{/* Main Image */}
					<div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
						{mainImage ? (
							<img
								src={getImageUrl(mainImage.photoURL)}
								alt={product.productName}
								className="w-full h-[500px] object-contain"
								onError={(e) => {
									(e.target as HTMLImageElement).src = `https://picsum.photos/800/600?error=${product.productId}`;
								}}
							/>
						) : (
							<div className="w-full h-[500px] bg-gray-200 flex items-center justify-center">
								<span className="text-gray-500">Нет изображения</span>
							</div>
						)}
					</div>

					{/* Thumbnail Gallery */}
					{photos.length > 1 && (
						<div className="grid grid-cols-4 gap-2">
							{photos.map((photo, index: number) => (
								<button
									key={photo.photo_id}
									onClick={() => setSelectedImageIndex(index)}
									className={`border-2 rounded overflow-hidden transition-all ${selectedImageIndex === index
										? 'border-industrial-accent'
										: 'border-gray-200 hover:border-gray-300'
										}`}
								>
									<img
										src={getImageUrl(photo.photoURL)}
										alt={`${product.productName} ${index + 1}`}
										className="w-full h-24 sm:h-32 object-contain bg-white"
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Product Info Section */}
				<div className="space-y-6">
					{/* Product Header */}
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">{product.productName}</h1>
						<p className="text-lg text-industrial-accent font-semibold">Артикул: {product.tag}</p>
					</div>

					{/* Price and Stock */}
					<div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
						<div className="flex items-center justify-between mb-4">
							<div>
								<p className="text-sm text-gray-600 mb-1">Цена за единицу</p>
								<p className="text-3xl font-bold text-gray-900">
									{new Intl.NumberFormat('ru-KZ').format(product.price)} ₸
								</p>
							</div>
							<div className="text-right">
								<p className="text-sm text-gray-600 mb-1">В наличии</p>
								<p className="text-lg font-semibold text-green-600">{product.quantity} шт.</p>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-6">
							{/* Quantity Selector */}
							<div className="flex items-center justify-between md:justify-start gap-3 md:gap-2 w-full md:w-auto">
								<label className="text-sm font-medium text-gray-700 whitespace-nowrap">Количество:</label>
								<div className="flex items-center border border-gray-300 rounded-lg">
									<button
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
										className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
									>
										-
									</button>
									<input
										type="number"
										min="1"
										value={quantity}
										onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
										className="w-20 text-center border-0 focus:outline-none"
									/>
									<button
										onClick={() => setQuantity(quantity + 1)}
										className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
									>
										+
									</button>
								</div>
							</div>

							{/* Add to Cart Button */}
							<button
								onClick={handleAddToCart}
								className="w-full md:w-auto bg-industrial-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-industrial-800 transition-colors flex items-center justify-center gap-2"
							>
								<ShoppingCartIcon size={20} />
								Добавить в корзину
							</button>

							{/* WhatsApp Button */}
							<button
								onClick={handleWhatsApp}
								className="w-full md:w-auto bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
								</svg>
								WhatsApp
							</button>
						</div>

						{/* Guarantees */}
						<div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span className="font-medium text-blue-900">Гарантия есть</span>
								</div>
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<div>
										<span className="font-medium text-blue-900">Рассрочка</span>
										<p className="text-xs text-blue-700 mt-1">
											от {new Intl.NumberFormat('ru-KZ').format(Math.round(product.price / 12))} ₸/ 12 мес
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span className="font-medium text-blue-900">Самовывоз сегодня</span>
								</div>
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span className="font-medium text-blue-900">Доставка по всему Казахстану и по СНГ</span>
								</div>
							</div>
						</div>
					</div>

					{/* Tabs Section - Under Photos */}
					<div className="lg:col-span-2 space-y-6">
						{/* Tab Buttons */}
						<div className="flex flex-wrap sm:flex-nowrap sm:overflow-x-auto border-b border-gray-200">
							<button
								onClick={() => setActiveTab('specs')}
								className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'specs'
									? 'text-industrial-accent border-b-2 border-industrial-accent'
									: 'text-gray-600 hover:text-gray-900'
									}`}
							>
								Характеристики
							</button>
							{product.description && (
								<button
									onClick={() => setActiveTab('description')}
									className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'description'
										? 'text-industrial-accent border-b-2 border-industrial-accent'
										: 'text-gray-600 hover:text-gray-900'
										}`}
								>
									Описание
								</button>
							)}
							{product.techSpecUrl && product.techSpecName && (
								<button
									onClick={() => setActiveTab('techSpecs')}
									className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'techSpecs'
										? 'text-industrial-accent border-b-2 border-industrial-accent'
										: 'text-gray-600 hover:text-gray-900'
										}`}
								>
									Технические спецификации
								</button>
							)}
						</div>

						{/* Tab Content */}
						{activeTab === 'specs' && (
							<div className="bg-white rounded-lg p-6 border border-gray-200 max-w-full overflow-hidden">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">Характеристики</h3>
								<div className="space-y-3">
									{/* Базовые характеристики */}
									{product.material && typeof product.material === 'string' && product.material.trim() !== '' && (
										<div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-6">
											<span className="text-gray-600">Материал:</span>
											<span className="font-medium break-words">{product.material}</span>
										</div>
									)}
									{product.dimensions && typeof product.dimensions === 'string' && product.dimensions.trim() !== '' && (
										<div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-6">
											<span className="text-gray-600">Габариты:</span>
											<span className="font-medium break-words">{product.dimensions}</span>
										</div>
									)}
									{product.weight && typeof product.weight === 'number' && product.weight > 0 && (
										<div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-6">
											<span className="text-gray-600">Вес:</span>
											<span className="font-medium break-words">{product.weight} кг</span>
										</div>
									)}

									{/* Дополнительные размеры */}
									{product.width && typeof product.width === 'number' && product.width > 0 && (
										<div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-6">
											<span className="text-gray-600">Ширина:</span>
											<span className="font-medium break-words">{product.width} мм</span>
										</div>
									)}
									{product.depth && typeof product.depth === 'number' && product.depth > 0 && (
										<div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-6">
											<span className="text-gray-600">Глубина:</span>
											<span className="font-medium break-words">{product.depth} мм</span>
										</div>
									)}
									{product.height && typeof product.height === 'number' && product.height > 0 && (
										<div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-6">
											<span className="text-gray-600">Высота:</span>
											<span className="font-medium break-words">{product.height} мм</span>
										</div>
									)}

									{/* Электрические характеристики */}
									{product.power && typeof product.power === 'string' && product.power.trim() !== '' && (
										<div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-6">
											<span className="text-gray-600">Мощность:</span>
											<span className="font-medium break-words">{product.power} kW</span>
										</div>
									)}
									{product.voltage && typeof product.voltage === 'string' && product.voltage.trim() !== '' && (
										<div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-6">
											<span className="text-gray-600">Напряжение:</span>
											<span className="font-medium break-words">{product.voltage} В</span>
										</div>
									)}

									{/* Страна производства */}
									{product.country && typeof product.country === 'string' && product.country.trim() !== '' && (
										<div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-6">
											<span className="text-gray-600">Страна:</span>
											<span className="font-medium break-words">{product.country}</span>
										</div>
									)}

									{/* Динамические характеристики из specifications */}
									{product.specifications && Object.keys(product.specifications).length > 0 && (
										<>
											{Object.entries(product.specifications)
												.filter(([_, value]) => value && typeof value === 'string' && value.trim() !== '')
												.map(([key, value]) => (
													<div key={key} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-6">
														<span className="text-gray-600 capitalize">{key}:</span>
														<span className="font-medium break-words">{value}</span>
													</div>
												))}
										</>
									)}

									{/* Стандартные характеристики */}
									<div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-6">
										<span className="text-gray-600">Артикул:</span>
										<span className="font-medium break-words">{product.tag}</span>
									</div>
									<div className="flex justify-between py-2">
										<span className="text-gray-600">В наличии:</span>
										<span className="font-medium text-green-600">{product.quantity} шт.</span>
									</div>
								</div>
							</div>
						)}

						{activeTab === 'techSpecs' && product.techSpecUrl && product.techSpecName && (
							<div className="bg-white rounded-lg p-6 border border-gray-200 max-w-full overflow-hidden">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Технические спецификации
								</h3>
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-full overflow-hidden">
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
						)}

						{activeTab === 'description' && product.description && (
							<div className="bg-white rounded-lg p-6 border border-gray-200 max-w-full overflow-hidden">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">Описание</h3>
								<p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
									{product.description}
								</p>
							</div>
						)}

						{/* Dates */}
						<div className="text-sm text-gray-500">
							<p>Добавлен: {formatDate(product.createdAt)}</p>
							{product.updatedAt && product.updatedAt !== product.createdAt && (
								<p>Обновлен: {formatDate(product.updatedAt)}</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Похожие товары */}
			{similarProducts.length > 0 && (
				<div className="container mx-auto px-4 py-12">
					<div className="mb-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-2">Похожие товары</h2>
						<p className="text-gray-600">Возможно вас также заинтересуют эти товары</p>
					</div>

					{loadingSimilar ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{Array.from({ length: 4 }).map((_, index) => (
								<div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
									<div className="h-48 bg-gray-200"></div>
									<div className="p-4">
										<div className="h-4 bg-gray-200 rounded mb-2"></div>
										<div className="h-4 bg-gray-200 rounded w-3/4"></div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
							{similarProducts.map((similarProduct) => (
								<ProductCard
									key={similarProduct.productId}
									product={similarProduct}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ProductDetailPage;