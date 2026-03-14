import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminApiService } from '../services/adminApi';
import { GetProductsDto, BackendCategoryDto, GetPhotoDto } from '../types';
import { AdminNavigation } from '../components/AdminNavigation';
import { buildUrl } from '../config/api';
import {
	EditIcon,
	TrashIcon,
	PlusIcon,
	PackageIcon,
	SearchIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	CheckIcon
} from '../components/Icons';

export const AdminProductsPage: React.FC = () => {
	const { admin } = useAdminAuth();
	const navigate = useNavigate();
	const [products, setProducts] = useState<GetProductsDto[]>([]);
	const [categories, setCategories] = useState<BackendCategoryDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterCategory, setFilterCategory] = useState('');
	const [filterMaterial, setFilterMaterial] = useState('');
	const [filterDateFrom, setFilterDateFrom] = useState('');
	const [filterDateTo, setFilterDateTo] = useState('');
	const [filterDateType, setFilterDateType] = useState<'created' | 'updated'>('created');
	const [currentPage, setCurrentPage] = useState(1);
	const [productType, setProductType] = useState<'industrial' | 'household'>('industrial');
	const [showArchived, setShowArchived] = useState(false);
	const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
	const [itemsPerPage, setItemsPerPage] = useState(viewMode === 'table' ? 25 : 12); // Разное количество для разных режимов
	const [selectedProduct, setSelectedProduct] = useState<GetProductsDto | null>(null);
	const [showProductModal, setShowProductModal] = useState(false);

	useEffect(() => {
		loadData();
	}, [productType, showArchived]);

	useEffect(() => {
		// Меняем количество элементов при смене вида
		setItemsPerPage(viewMode === 'table' ? 25 : 12);
		setCurrentPage(1); // Сбрасываем на первую страницу
	}, [viewMode]);

	useEffect(() => {
		const handleFocus = () => {
			console.log('Window focused, reloading products...');
			loadData();
		};

		window.addEventListener('focus', handleFocus);
		return () => window.removeEventListener('focus', handleFocus);
	}, []);

	const loadData = async () => {
		try {
			console.log(`Loading products and categories... productType: ${productType}, showArchived: ${showArchived}`);
			setLoading(true);
			const [productsData, categoriesData] = await Promise.all([
				AdminApiService.getProducts(productType, !showArchived),
				AdminApiService.getCategories(productType)
			]);

			console.log('Products loaded:', productsData);
			console.log('Categories loaded:', categoriesData);

			// Логируем даты для отладки
			if (Array.isArray(productsData)) {
				productsData.slice(0, 3).forEach((product, index) => {
					console.log(`Product ${index + 1} dates:`, {
						id: product.productId,
						name: product.productName,
						createdAt: product.createdAt,
						updatedAt: product.updatedAt,
						createdAtType: typeof product.createdAt,
						updatedAtType: typeof product.updatedAt
					});
				});
			}

			// Проверяем что данные пришли в правильном формате
			if (Array.isArray(productsData)) {
				setProducts(productsData);
			} else {
				console.error('Products data is not an array:', productsData);
				setProducts([]);
			}

			if (Array.isArray(categoriesData)) {
				setCategories(categoriesData);
			} else {
				console.error('Categories data is not an array:', categoriesData);
				setCategories([]);
			}
		} catch (error) {
			console.error('Error loading data:', error);
			// Показываем ошибку пользователю
			alert('Ошибка при загрузке данных. Проверьте консоль для деталей.');
			setProducts([]);
			setCategories([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteProduct = async (productId: number) => {
		console.log('🗑️ Attempting to delete product:', productId);
		if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

		try {
			console.log('🔄 Calling deleteProduct API...');
			await AdminApiService.deleteProduct(productId);
			console.log('✅ Product deleted successfully');
			loadData();
		} catch (error) {
			console.error('❌ Error deleting product:', error);
			alert('Ошибка при удалении товара. Проверьте консоль для деталей.');
		}
	};

	const handleActivateProduct = async (productId: number) => {
		console.log('✅ Attempting to activate product:', productId);
		if (!confirm('Вы уверены, что хотите активировать этот товар?')) return;

		try {
			console.log('🔄 Calling editProductActive API...');
			await AdminApiService.editProductActive(productId);
			console.log('✅ Product activated successfully');
			loadData();
		} catch (error) {
			console.error('❌ Error activating product:', error);
			alert('Ошибка при активации товара. Проверьте консоль для деталей.');
		}
	};

	const handleProductClick = (product: GetProductsDto) => {
		setSelectedProduct(product);
		setShowProductModal(true);
	};

	const handleCloseModal = () => {
		setSelectedProduct(null);
		setShowProductModal(false);
	};

	// Сбрасываем страницу при изменении фильтров
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filterCategory, filterMaterial, filterDateFrom, filterDateTo, filterDateType]);

	// Получаем уникальные материалы для фильтра
	const uniqueMaterials = [...new Set(products.map(p => p.material).filter(Boolean))].sort();

	const filteredProducts = products.filter(product => {
		const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.tag.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = !filterCategory || product.categoryId.toString() === filterCategory;
		const matchesMaterial = !filterMaterial || product.material === filterMaterial;

		// Фильтрация по дате
		let matchesDate = true;
		if (filterDateFrom || filterDateTo) {
			const productDate = filterDateType === 'created' ? product.createdAt : product.updatedAt;
			console.log(`Product ${product.productId}:`, {
				filterDateType,
				productDate,
				filterDateFrom,
				filterDateTo
			});

			if (productDate) {
				try {
					const productDateTime = new Date(productDate);
					console.log(`Parsed date:`, productDateTime);

					if (filterDateFrom) {
						const fromDate = new Date(filterDateFrom);
						console.log(`From date:`, fromDate);
						matchesDate = matchesDate && productDateTime >= fromDate;
					}
					if (filterDateTo) {
						const toDate = new Date(filterDateTo);
						toDate.setHours(23, 59, 59, 999); // До конца дня
						console.log(`To date:`, toDate);
						matchesDate = matchesDate && productDateTime <= toDate;
					}
				} catch (error) {
					console.error('Error parsing date:', productDate, error);
					matchesDate = false;
				}
			} else {
				console.log(`Product ${product.productId} has no ${filterDateType} date`);
				matchesDate = false; // Если даты нет, не включать в фильтр
			}

			console.log(`Product ${product.productId} matches date:`, matchesDate);
		}

		return matchesSearch && matchesCategory && matchesMaterial && matchesDate;
	});

	// Пагинация
	const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentProducts = filteredProducts.slice(startIndex, endIndex);

	// Функция для генерации номеров страниц
	const getPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
			const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

			if (startPage > 1) pages.push(1, '...');
			for (let i = startPage; i <= endPage; i++) {
				pages.push(i);
			}
			if (endPage < totalPages) pages.push('...', totalPages);
		}

		return pages;
	};

	console.log('Total products:', products.length);
	console.log('Filtered products:', filteredProducts.length);
	console.log('Search term:', searchTerm);
	console.log('Filter category:', filterCategory);

	const getCategoryName = (categoryId: number) => {
		const category = categories.find(cat => cat.categoryId === categoryId);
		return category ? category.categoryName : 'Категория не найдена';
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return 'Нет данных';
		return new Date(dateString).toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const clearFilters = () => {
		setSearchTerm('');
		setFilterCategory('');
		setFilterMaterial('');
		setFilterDateFrom('');
		setFilterDateTo('');
		setFilterDateType('created');
		setCurrentPage(1);
	};

	const getImageUrl = (photoDto: GetPhotoDto | null): string => {
		if (!photoDto || !photoDto.photoURL) return 'https://picsum.photos/400/300?error=no-photo';

		return buildUrl(photoDto.photoURL);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-industrial-accent mx-auto"></div>
					<p className="mt-4 text-gray-600">Загрузка товаров...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Navigation */}
			<AdminNavigation />

			<div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-8">
				{/* Page Header with Actions */}
				<div className="flex flex-col gap-3 mb-4 sm:mb-6">
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
						<h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 text-center sm:text-left">
							📦 Управление товарами
						</h1>
					</div>
					<div className="flex flex-col gap-2">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
							<button
								onClick={loadData}
								className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
							>
								🔄 Обновить
							</button>
							<Link
								to="/admin/import"
								className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
							>
								📥 Импорт Zip
							</Link>
							<Link
								to="/admin/products/new"
								className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors"
							>
								➕ Добавить товар
							</Link>
						</div>
					</div>
				</div>

				{/* Product Type and Status Switchers */}
				<div className="bg-white shadow rounded-lg mb-4 sm:mb-6 p-3 sm:p-4">
					<div className="space-y-4">
						{/* Product Type Switcher */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								🏭 Тип товаров
							</label>
							<div className="grid grid-cols-2 gap-2">
								<button
									onClick={() => setProductType('industrial')}
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${productType === 'industrial'
										? 'bg-industrial-accent text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
								>
									🏭 Промышленные
								</button>
								<button
									onClick={() => setProductType('household')}
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${productType === 'household'
										? 'bg-industrial-accent text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
								>
									🏠 Бытовые
								</button>
							</div>
						</div>

						{/* Archive Status Switcher */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								📊 Статус товаров
							</label>
							<div className="grid grid-cols-2 gap-2">
								<button
									onClick={() => setShowArchived(false)}
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${!showArchived
										? 'bg-green-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
								>
									✅ Активные
								</button>
								<button
									onClick={() => setShowArchived(true)}
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${showArchived
										? 'bg-red-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
								>
									🗑️ Архивные
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white shadow rounded-lg mb-6 p-3 sm:p-4">
					<div className="space-y-4">
						{/* First row - Main filters */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
								</div>
								<input
									type="text"
									placeholder="Поиск по названию..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-industrial-accent focus:border-industrial-accent"
								/>
							</div>

							<select
								value={filterCategory}
								onChange={(e) => setFilterCategory(e.target.value)}
								className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-industrial-accent focus:border-industrial-accent"
							>
								<option value="">Все категории</option>
								{categories.map(category => (
									<option key={category.categoryId} value={category.categoryId}>
										{category.categoryName}
									</option>
								))}
							</select>

							<select
								value={filterMaterial}
								onChange={(e) => setFilterMaterial(e.target.value)}
								className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-industrial-accent focus:border-industrial-accent"
							>
								<option value="">Все материалы</option>
								{uniqueMaterials.map(material => (
									<option key={material} value={material}>
										{material}
									</option>
								))}
							</select>
						</div>

						{/* Second row - Date filters */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									📅 Тип даты
								</label>
								<select
									value={filterDateType}
									onChange={(e) => setFilterDateType(e.target.value as 'created' | 'updated')}
									className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-industrial-accent focus:border-industrial-accent"
								>
									<option value="created">Создания</option>
									<option value="updated">Обновления</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									📆 Дата от
								</label>
								<input
									type="date"
									value={filterDateFrom}
									onChange={(e) => setFilterDateFrom(e.target.value)}
									className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-industrial-accent focus:border-industrial-accent"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									📆 Дата до
								</label>
								<input
									type="date"
									value={filterDateTo}
									onChange={(e) => setFilterDateTo(e.target.value)}
									className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-industrial-accent focus:border-industrial-accent"
								/>
							</div>

							<div className="lg:col-span-2 flex flex-col sm:flex-row gap-2">
								<button
									onClick={applyFilters}
									className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors"
								>
									🔍 Применить
								</button>
								<button
									onClick={resetFilters}
									className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
								>
									🔄 Сбросить
								</button>
							</div>
						</div>
					</div>
				</button>
			</div>
		</div>

			{/* Stats row */ }
	<div className="text-sm text-gray-500 flex items-center justify-between pt-2 border-t border-gray-200">
		<div className="flex items-center">
			<PackageIcon className="h-4 w-4 mr-1" />
			Всего: {products.length} | Найдено: {filteredProducts.length} товаров
			{(filterMaterial || filterDateFrom || filterDateTo) && (
				<span className="ml-2 text-industrial-accent">
					(фильтры активны)
				</span>
			)}
		</div>
		<div className="flex items-center space-x-4">
			{/* View Mode Switcher */}
			<div className="flex items-center space-x-2">
				<span className="text-gray-600">Вид:</span>
				<button
					onClick={() => setViewMode('grid')}
					className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'grid'
						? 'bg-industrial-accent text-white'
						: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
				>
					📱 Карточки
				</button>
				<button
					onClick={() => setViewMode('table')}
					className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'table'
						? 'bg-industrial-accent text-white'
						: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
				>
					📊 Таблица
				</button>
			</div>
			{totalPages > 1 && (
				<div className="text-sm text-gray-600">
					Страница {currentPage} из {totalPages}
				</div>
			)}
		</div>
	</div>
		</div >
				</div >

	{/* Products Display */ }
{
	filteredProducts.length === 0 ? (
		<div className="bg-white shadow rounded-lg">
			<div className="text-center py-12">
				<PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
				<h3 className="mt-2 text-sm font-medium text-gray-900">Товары не найдены</h3>
				<p className="mt-1 text-sm text-gray-500">
					{searchTerm || filterCategory || filterMaterial || filterDateFrom || filterDateTo ? 'Попробуйте изменить параметры фильтрации' : 'Начните с добавления первого товара'}
				</p>
				<div className="mt-6">
					<Link
						to="/admin/products/new"
						className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent"
					>
						<PlusIcon className="h-4 w-4 mr-2" />
						Добавить товар
					</Link>
				</div>
			</div>
		</div>
	) : (
		<>
			{viewMode === 'grid' ? (
				/* Grid View */
				<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
					{currentProducts.map((product) => (
						<div key={product.productId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
							{/* Product Image - кликабельный */}
							<Link to={`/admin/products/${product.productId}`} className="block">
								<div className="aspect-[4/3] bg-gray-100 overflow-hidden p-2 flex items-center justify-center">
									<img
										src={getImageUrl(product.photoDto)}
										alt={product.productName}
										className="max-w-full max-h-full object-contain"
										onError={(e) => {
											console.error('Failed to load product image:', product.photoDto?.photoURL);
											(e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?error=load-failed&id=' + product.productId;
										}}
										onLoad={() => {
											console.log('Product image loaded successfully:', getImageUrl(product.photoDto));
										}}
									/>
								</div>
							</Link>

							{/* Product Info */}
							<div className="p-4 flex flex-col flex-grow">
								<div className="flex items-start justify-between mb-2">
									<h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-grow">
										{product.productName}
									</h3>
									<span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2 flex-shrink-0">
										{product.tag}
									</span>
								</div>

								<div className="text-sm text-gray-600 mb-4 flex-grow">
									<p className="mb-1">
										<span className="font-medium">Категория:</span> {getCategoryName(product.categoryId)}
									</p>
									<p className="mb-1">
										<span className="font-medium">Материал:</span> {product.material || 'Не указан'}
									</p>
									<p className="mb-1">
										<span className="font-medium">Создан:</span> {formatDate(product.createdAt)}
									</p>
									<p>
										<span className="font-medium">Обновлен:</span> {
											!product.updatedAt ||
												new Date(product.updatedAt).getTime() === new Date(product.createdAt).getTime()
												? 'Не изменялось'
												: formatDate(product.updatedAt)
										}
									</p>
								</div>

								{/* Actions */}
								<div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-auto">
									<Link
										to={`/admin/products/${product.productId}`}
										className="inline-flex items-center text-industrial-accent hover:text-industrial-900 text-sm font-medium"
									>
										<PackageIcon className="h-4 w-4" />
										<span className="hidden sm:inline ml-1">Просмотр</span>
									</Link>

									<div className="flex space-x-2">
										<Link
											to={`/admin/products/${product.productId}/edit`}
											className="inline-flex items-center text-blue-600 hover:text-blue-900 text-sm font-medium"
										>
											<EditIcon className="h-4 w-4" />
										</Link>
										{showArchived && (
											<button
												onClick={() => handleActivateProduct(product.productId)}
												className="inline-flex items-center text-green-600 hover:text-green-900 text-sm font-medium"
												title="Активировать товар"
											>
												<CheckIcon className="h-4 w-4" />
											</button>
										)}
										<button
											onClick={() => handleDeleteProduct(product.productId)}
											className="inline-flex items-center text-red-600 hover:text-red-900 text-sm font-medium"
										>
											<TrashIcon className="h-4 w-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				/* Table View */
				<div className="bg-white shadow rounded-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Фото
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Название
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Артикул
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Категория
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Материал
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Создан
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Действия
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{currentProducts.map((product) => (
									<tr key={product.productId} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleProductClick(product)}>
										<td className="px-6 py-4 whitespace-nowrap">
											<img
												src={getImageUrl(product.photoDto)}
												alt={product.productName}
												className="h-12 w-12 object-cover rounded"
												onError={(e) => {
													(e.target as HTMLImageElement).src = 'https://picsum.photos/48/48?error=load-failed&id=' + product.productId;
												}}
											/>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm font-medium text-gray-900 line-clamp-2">
												{product.productName}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
												{product.tag}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{getCategoryName(product.categoryId)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{product.material || 'Не указан'}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{formatDate(product.createdAt)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
											<div className="flex items-center justify-end space-x-2">
												<Link
													to={`/admin/products/${product.productId}`}
													className="text-industrial-accent hover:text-industrial-900"
													title="Просмотр"
												>
													<PackageIcon className="h-4 w-4" />
												</Link>
												<Link
													to={`/admin/products/${product.productId}/edit`}
													className="text-blue-600 hover:text-blue-900"
													title="Редактировать"
												>
													<EditIcon className="h-4 w-4" />
												</Link>
												{showArchived && (
													<button
														onClick={() => handleActivateProduct(product.productId)}
														className="text-green-600 hover:text-green-900"
														title="Активировать товар"
													>
														<CheckIcon className="h-4 w-4" />
													</button>
												)}
												<button
													onClick={() => handleDeleteProduct(product.productId)}
													className="text-red-600 hover:text-red-900"
													title="Удалить"
												>
													<TrashIcon className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="bg-white shadow rounded-lg mt-6 p-4">
					<div className="flex items-center justify-between">
						<div className="text-sm text-gray-700">
							Показано {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} из {filteredProducts.length} товаров
						</div>

						<div className="flex items-center space-x-2">
							{/* Items per page selector */}
							<select
								value={itemsPerPage}
								onChange={(e) => {
									setItemsPerPage(Number(e.target.value));
									setCurrentPage(1);
								}}
								className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-industrial-accent"
							>
								<option value={12}>12</option>
								<option value={24}>24</option>
								<option value={48}>48</option>
								<option value={96}>96</option>
							</select>

							{/* Pagination buttons */}
							<div className="flex items-center space-x-1">
								<button
									onClick={() => setCurrentPage(1)}
									disabled={currentPage === 1}
									className="p-2 text-gray-500 hover:text-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<ChevronLeftIcon className="h-4 w-4" />
									<ChevronLeftIcon className="h-4 w-4 -ml-2" />
								</button>

								<button
									onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
									disabled={currentPage === 1}
									className="p-2 text-gray-500 hover:text-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<ChevronLeftIcon className="h-4 w-4" />
								</button>

								{getPageNumbers().map((page, index) => (
									<span key={index}>
										{page === '...' ? (
											<span className="px-3 py-2 text-gray-500">...</span>
										) : (
											<button
												onClick={() => setCurrentPage(page as number)}
												className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === page
													? 'bg-industrial-accent text-white'
													: 'text-gray-700 hover:bg-gray-100'
													}`}
											>
												{page}
											</button>
										)}
									</span>
								))}

								<button
									onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
									disabled={currentPage === totalPages}
									className="p-2 text-gray-500 hover:text-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<ChevronRightIcon className="h-4 w-4" />
								</button>

								<button
									onClick={() => setCurrentPage(totalPages)}
									disabled={currentPage === totalPages}
									className="p-2 text-gray-500 hover:text-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<ChevronRightIcon className="h-4 w-4" />
									<ChevronRightIcon className="h-4 w-4 -ml-2" />
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
			</div >

	{/* Product Modal */ }
{
	showProductModal && selectedProduct && (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				{/* Modal Header */}
				<div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
					<h2 className="text-xl font-semibold text-gray-900">Подробная информация о товаре</h2>
					<button
						onClick={handleCloseModal}
						className="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Modal Content */}
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Product Image */}
						<div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
							<img
								src={getImageUrl(selectedProduct.photoDto)}
								alt={selectedProduct.productName}
								className="w-full h-full object-contain p-4"
								onError={(e) => {
									(e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?error=load-failed&id=' + selectedProduct.productId;
								}}
							/>
						</div>

						{/* Product Info */}
						<div className="space-y-4">
							<div>
								<h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.productName}</h3>
								<span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded">
									Артикул: {selectedProduct.tag}
								</span>
							</div>

							<div className="space-y-3">
								<div>
									<span className="text-sm font-medium text-gray-700">Категория:</span>
									<p className="text-gray-900">{getCategoryName(selectedProduct.categoryId)}</p>
								</div>

								<div>
									<span className="text-sm font-medium text-gray-700">Материал:</span>
									<p className="text-gray-900">{selectedProduct.material || 'Не указан'}</p>
								</div>

								<div>
									<span className="text-sm font-medium text-gray-700">Дата создания:</span>
									<p className="text-gray-900">{formatDate(selectedProduct.createdAt)}</p>
								</div>

								<div>
									<span className="text-sm font-medium text-gray-700">Дата обновления:</span>
									<p className="text-gray-900">
										{!selectedProduct.updatedAt ||
											new Date(selectedProduct.updatedAt).getTime() === new Date(selectedProduct.createdAt).getTime()
											? 'Не изменялось'
											: formatDate(selectedProduct.updatedAt)
										}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Modal Actions */}
					<div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-6 pt-6 border-t border-gray-200">
						<Link
							to={`/admin/products/${selectedProduct.productId}`}
							onClick={handleCloseModal}
							className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors"
						>
							<PackageIcon className="h-4 w-4 mr-2" />
							Полный просмотр
						</Link>
						{selectedProduct.productId && (
							<Link
								to={`/admin/products/${selectedProduct.productId}/edit`}
								onClick={() => {
									console.log('Edit button clicked, productId:', selectedProduct.productId);
									console.log('Navigating to:', `/admin/products/${selectedProduct.productId}/edit`);
									handleCloseModal();
								}}
								className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
							>
								<EditIcon className="h-4 w-4 mr-2" />
								Редактировать
							</Link>
						)}
						{selectedProduct.productId && showArchived && (
							<button
								onClick={() => {
									console.log('Activate button clicked, productId:', selectedProduct.productId);
									handleActivateProduct(selectedProduct.productId);
									// Закрываем модальное окно с небольшой задержкой после активации
									setTimeout(() => {
										handleCloseModal();
									}, 100);
								}}
								className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
							>
								<CheckIcon className="h-4 w-4 mr-2" />
								Активировать
							</button>
						)}
						{selectedProduct.productId && (
							<button
								onClick={() => {
									console.log('Delete button clicked, productId:', selectedProduct.productId);
									handleDeleteProduct(selectedProduct.productId);
									// Закрываем модальное окно с небольшой задержкой после удаления
									setTimeout(() => {
										handleCloseModal();
									}, 100);
								}}
								className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
							>
								<TrashIcon className="h-4 w-4 mr-2" />
								Удалить
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
		</div >
		</div >
	);
};
