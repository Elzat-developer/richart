import React, { useState, useEffect } from 'react';
import { buildUrl } from '../config/api';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminApiService } from '../services/adminApi';
import { CreateTechSpec } from '../types';
import { AdminNavigation } from '../components/AdminNavigation';
import {
	EditIcon,
	TrashIcon,
	PlusIcon,
	FileSpreadsheetIcon,
	XIcon,
	UploadIcon,
	ChevronLeftIcon,
	ChevronRightIcon
} from '../components/Icons';

interface TechSpec {
	techSpecId: number;
	fileName: string;
	product_id: number | null;
	fileUrl: string;
}

export const AdminTechSpecsPage: React.FC = () => {
	const { admin } = useAdminAuth();
	const [techSpecs, setTechSpecs] = useState<TechSpec[]>([]);
	const [products, setProducts] = useState<any[]>([]);
	const [industrialProducts, setIndustrialProducts] = useState<any[]>([]);
	const [householdProducts, setHouseholdProducts] = useState<any[]>([]);
	const [loadingIndustrial, setLoadingIndustrial] = useState(false);
	const [loadingHousehold, setLoadingHousehold] = useState(false);
	const [loading, setLoading] = useState(true);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingTechSpec, setEditingTechSpec] = useState<TechSpec | null>(null);
	const [formData, setFormData] = useState<Omit<CreateTechSpec, 'fileTechSpec'>>({
		fileName: '',
		product_id: null as number | null
	});
	const [file, setFile] = useState<File | null>(null);
	const [validationErrors, setValidationErrors] = useState<any>({});
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10); // По 10 тех спецификаций на странице

	// Состояния для выбора товара
	const [productSearchTerm, setProductSearchTerm] = useState('');
	const [selectedProductType, setSelectedProductType] = useState<'industrial' | 'household'>('industrial');
	const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
	const [productPage, setProductPage] = useState(1);
	const [productsPerPage, setProductsPerPage] = useState(15); // По 15 товаров на странице в таблице

	// Состояния для поиска и фильтрации тех. спецификаций
	const [techSpecSearchTerm, setTechSpecSearchTerm] = useState('');
	const [filteredTechSpecs, setFilteredTechSpecs] = useState<TechSpec[]>([]);

	useEffect(() => {
		loadData();
	}, []);

	// Фильтрация товаров при изменении поиска или типа
	useEffect(() => {
		const currentProducts = selectedProductType === 'industrial' ? industrialProducts : householdProducts;

		if (currentProducts.length > 0) {
			const filtered = currentProducts.filter(product => {
				const matchesSearch = product.productName.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
					product.tag.toLowerCase().includes(productSearchTerm.toLowerCase());
				return matchesSearch;
			});
			setFilteredProducts(filtered);
			setProductPage(1); // Сбрасываем страницу при изменении фильтра
		} else {
			setFilteredProducts([]);
		}
	}, [industrialProducts, householdProducts, productSearchTerm, selectedProductType]);

	// Сброс поиска при открытии формы
	useEffect(() => {
		if (showCreateForm) {
			setProductSearchTerm('');
			setSelectedProductType('industrial');
			setProductPage(1);
			setProductsPerPage(15);
		}
	}, [showCreateForm]);

	// Фильтрация тех. спецификаций при поиске
	useEffect(() => {
		if (techSpecs.length > 0) {
			const filtered = techSpecs.filter(spec => {
				const matchesSearch = !techSpecSearchTerm ||
					spec.fileName.toLowerCase().includes(techSpecSearchTerm.toLowerCase()) ||
					getProductName(spec.product_id).toLowerCase().includes(techSpecSearchTerm.toLowerCase());
				return matchesSearch;
			});
			setFilteredTechSpecs(filtered);
			setCurrentPage(1); // Сбрасываем страницу при поиске
		} else {
			setFilteredTechSpecs([]);
		}
	}, [techSpecs, techSpecSearchTerm, products]);

	// Пагинация для товаров
	const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage);
	const productStartIndex = (productPage - 1) * productsPerPage;
	const productEndIndex = productStartIndex + productsPerPage;
	const currentProducts = filteredProducts.slice(productStartIndex, productEndIndex);

	// Пагинация для тех. спецификаций
	const techSpecTotalPages = Math.ceil(filteredTechSpecs.length / itemsPerPage);
	const techSpecStartIndex = (currentPage - 1) * itemsPerPage;
	const techSpecEndIndex = techSpecStartIndex + itemsPerPage;
	const currentTechSpecsList = filteredTechSpecs.slice(techSpecStartIndex, techSpecEndIndex);

	// Функции для пагинации товаров
	const getProductPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 5;

		if (totalProductPages <= maxVisiblePages) {
			for (let i = 1; i <= totalProductPages; i++) {
				pages.push(i);
			}
		} else {
			const startPage = Math.max(1, productPage - Math.floor(maxVisiblePages / 2));
			const endPage = Math.min(totalProductPages, startPage + maxVisiblePages - 1);

			if (startPage > 1) pages.push(1, '...');
			for (let i = startPage; i <= endPage; i++) {
				pages.push(i);
			}
			if (endPage < totalProductPages) pages.push('...', totalProductPages);
		}

		return pages;
	};

	const getFileUrl = (url: string): string => {
		return buildUrl(url);
	};

	const handleDownloadFile = async (fileUrl: string, fileName: string) => {
		try {
			console.log('Downloading file:', fileUrl);

			// Используем ту же логику что и у акций
			const downloadUrl = getFileUrl(fileUrl);
			console.log('Download URL:', downloadUrl);

			// Скачиваем файл через fetch
			const response = await fetch(downloadUrl);
			if (!response.ok) {
				throw new Error('Failed to download file');
			}

			// Создаем blob из ответа
			const blob = await response.blob();

			// Создаем временную ссылку для скачивания
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

	const getProductName = (productId: number | null): string => {
		if (!productId) return 'Без привязки к товару';
		const product = products.find(p => p.productId === productId);
		return product ? `${product.productName} (${product.tag})` : `Продукт ID: ${productId}`;
	};

	const loadData = async () => {
		try {
			console.log('Loading tech specs and products...');
			setLoadingIndustrial(true);
			setLoadingHousehold(true);

			const [techSpecsData, industrialData, householdData] = await Promise.all([
				AdminApiService.getTechSpecs(),
				AdminApiService.getProducts('industrial', true),
				AdminApiService.getProducts('household', true)
			]);

			console.log('Tech specs loaded:', techSpecsData);
			console.log('Industrial products loaded:', industrialData);
			console.log('Household products loaded:', householdData);

			// Логируем детали каждой тех. спецификации для отладки
			techSpecsData?.forEach((spec: any) => {
				console.log(`TechSpec ID: ${spec.techSpecId}, fileName: ${spec.fileName}, product_id: ${spec.product_id}, fileUrl: ${spec.fileUrl}`);
			});

			setTechSpecs(techSpecsData || []);
			setIndustrialProducts(industrialData || []);
			setHouseholdProducts(householdData || []);
			setProducts([...(industrialData || []), ...(householdData || [])]); // Для отображения в списке тех. спецификаций
		} catch (error) {
			console.error('Error loading data:', error);
			alert('Ошибка при загрузке данных: ' + (error as Error).message);
		} finally {
			setLoading(false);
			setLoadingIndustrial(false);
			setLoadingHousehold(false);
		}
	};

	const validateForm = (): boolean => {
		const errors: any = {};

		console.log('Validation - editingTechSpec:', editingTechSpec);
		console.log('Validation - file:', file);

		// При создании - все поля обязательны
		if (!editingTechSpec) {
			if (!formData.fileName.trim()) {
				errors.fileName = 'Название файла обязательно';
			}
			if (!formData.product_id) {
				errors.product_id = 'Выберите товар';
			}
			if (!file) {
				errors.file = 'Выберите файл';
			}
		} else {
			// При редактировании - достаточно что-то одно изменилось
			const hasChanges =
				formData.fileName.trim() !== editingTechSpec.fileName ||
				(formData.product_id !== null && formData.product_id !== editingTechSpec.product_id) ||
				file;

			if (!hasChanges) {
				errors.general = 'Нет изменений для сохранения';
			}
		}

		console.log('Validation errors:', errors);

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		try {
			if (editingTechSpec) {
				// При редактировании - отправляем только измененные поля
				const updateData: any = {};

				// Проверяем каждое поле отдельно
				if (formData.fileName.trim() !== editingTechSpec.fileName) {
					updateData.fileName = formData.fileName;
				}

				// Проверяем товар (если выбран новый)
				if (formData.product_id !== null && formData.product_id !== editingTechSpec.product_id) {
					updateData.product_id = formData.product_id;
				}

				// Проверяем файл (если загружен новый)
				if (file) {
					updateData.fileTechSpec = file;
				}

				console.log('Original data:', editingTechSpec);
				console.log('Form data:', formData);
				console.log('Update data:', updateData);

				await AdminApiService.editTechSpec(editingTechSpec.techSpecId, updateData);
			} else {
				// При создании - файл обязателен
				const submitData: CreateTechSpec = {
					...formData,
					fileTechSpec: file!
				};
				await AdminApiService.createTechSpec(submitData);
			}

			await loadData();
			resetForm();
		} catch (error) {
			console.error('Error saving tech spec:', error);
			alert('Ошибка при сохранении технической спецификации');
		}
	};

	const handleDelete = async (techSpecId: number) => {
		if (!confirm('Вы уверены, что хотите удалить эту техническую спецификацию?')) return;

		try {
			await AdminApiService.deleteTechSpec(techSpecId);
			await loadData();
		} catch (error) {
			console.error('Error deleting tech spec:', error);
			alert('Ошибка при удалении технической спецификации');
		}
	};

	const handleEdit = (techSpec: TechSpec) => {
		console.log('handleEdit called with:', techSpec);
		setEditingTechSpec(techSpec);
		setFormData({
			fileName: techSpec.fileName,
			product_id: techSpec.product_id || null
		});
		setFile(null); // Сбрасываем файл при редактировании
		setValidationErrors({}); // Очищаем ошибки валидации
		setShowCreateForm(true);
	};

	const resetForm = () => {
		setFormData({ fileName: '', product_id: null });
		setFile(null);
		setEditingTechSpec(null);
		setShowCreateForm(false);
		setValidationErrors({});
		setProductSearchTerm('');
		setSelectedProductType('industrial');
		setProductPage(1);
		setProductsPerPage(15);
	};

	const handleChange = (field: keyof Omit<CreateTechSpec, 'fileTechSpec'>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const value = field === 'product_id' ? (Number(e.target.value) || null) : e.target.value;
		setFormData(prev => ({ ...prev, [field]: value }));
		if (validationErrors[field]) {
			setValidationErrors(prev => ({ ...prev, [field]: undefined }));
		}
	};

	// Пагинация
	// Пагинация для тех. спецификаций (старый код для совместимости)
	const oldTotalPages = Math.ceil(techSpecs.length / itemsPerPage);
	const oldStartIndex = (currentPage - 1) * itemsPerPage;
	const oldEndIndex = oldStartIndex + itemsPerPage;
	const oldCurrentTechSpecs = techSpecs.slice(oldStartIndex, oldEndIndex);

	// Функция для генерации номеров страниц
	const getPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 5;

		if (techSpecTotalPages <= maxVisiblePages) {
			for (let i = 1; i <= techSpecTotalPages; i++) {
				pages.push(i);
			}
		} else {
			const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
			const endPage = Math.min(techSpecTotalPages, startPage + maxVisiblePages - 1);

			if (startPage > 1) pages.push(1, '...');
			for (let i = startPage; i <= endPage; i++) {
				pages.push(i);
			}
			if (endPage < techSpecTotalPages) pages.push('...', techSpecTotalPages);
		}

		return pages;
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
			if (validationErrors.file) {
				setValidationErrors(prev => ({ ...prev, file: undefined }));
			}
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-industrial-accent mx-auto"></div>
					<p className="mt-4 text-gray-600">Загрузка технических спецификаций...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Navigation */}
			<AdminNavigation />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{/* Page Header with Actions */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">Технические спецификации</h1>
					<button
						onClick={() => {
							resetForm();
							setShowCreateForm(true);
						}}
						className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors"
					>
						<PlusIcon className="h-4 w-4 mr-2" />
						Добавить спецификацию
					</button>
				</div>
				{/* Create/Edit Form Modal */}
				{showCreateForm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto p-4 sm:p-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-base sm:text-lg font-medium text-gray-900">
									{editingTechSpec ? 'Редактировать спецификацию' : 'Новая спецификация'}
								</h3>
								<button
									onClick={resetForm}
									className="text-gray-400 hover:text-gray-500 p-1"
								>
									<XIcon className="h-5 w-5" />
								</button>
							</div>

							<form onSubmit={handleSubmit} className="space-y-4">
								{validationErrors.general && (
									<div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
										<p className="text-sm text-yellow-800">{validationErrors.general}</p>
									</div>
								)}

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Название файла {editingTechSpec ? '(опционально)' : '*'}
									</label>
									<input
										type="text"
										value={formData.fileName}
										onChange={handleChange('fileName')}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.fileName ? 'border-red-500' : 'border-gray-300'
											}`}
										placeholder="Например: Техническая спецификация стола.pdf"
									/>
									{validationErrors.fileName && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.fileName}</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Товар *
									</label>

									{/* Выбор типа товара */}
									<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
										<button
											type="button"
											onClick={() => setSelectedProductType('industrial')}
											disabled={loadingIndustrial}
											className={`w-full sm:w-auto px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedProductType === 'industrial'
												? 'bg-blue-600 text-white'
												: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
												} disabled:opacity-50 disabled:cursor-not-allowed`}
										>
											{loadingIndustrial ? (
												<div className="flex items-center justify-center">
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
													Загрузка...
												</div>
											) : (
												'Промышленное оборудование'
											)}
										</button>
										<button
											type="button"
											onClick={() => setSelectedProductType('household')}
											disabled={loadingHousehold}
											className={`w-full sm:w-auto px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedProductType === 'household'
												? 'bg-blue-600 text-white'
												: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
												} disabled:opacity-50 disabled:cursor-not-allowed`}
										>
											{loadingHousehold ? (
												<div className="flex items-center justify-center">
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
													Загрузка...
												</div>
											) : (
												'Бытовое оборудование'
											)}
										</button>
									</div>

									{/* Поиск товара */}
									<div className="mb-3">
										<input
											type="text"
											value={productSearchTerm}
											onChange={(e) => setProductSearchTerm(e.target.value)}
											placeholder="Поиск по названию или артикулу..."
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent"
										/>
									</div>

									{/* Список товаров */}
									<div className="border border-gray-300 rounded-md">
										{/* Информация о количестве товаров */}
										<div className="border-b border-gray-200 p-3 bg-gray-50">
											<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
												<div className="text-sm text-gray-600">
													Найдено товаров: {filteredProducts.length}
													{totalProductPages > 1 && (
														<span className="ml-2">
															Страница {productPage} из {totalProductPages}
														</span>
													)}
												</div>
												<div className="flex items-center space-x-2">
													<span className="text-sm text-gray-600">На странице:</span>
													<select
														value={productsPerPage}
														onChange={(e) => {
															const newPerPage = Number(e.target.value);
															setProductsPerPage(newPerPage);
															setProductPage(1);
														}}
														className="text-sm border border-gray-300 rounded px-2 py-1"
													>
														<option value={10}>10</option>
														<option value={15}>15</option>
														<option value={20}>20</option>
														<option value={50}>50</option>
														<option value={100}>100</option>
													</select>
												</div>
											</div>
										</div>

										{/* Таблица товаров для десктопа */}
										<div className="hidden sm:block overflow-x-auto">
											<table className="min-w-full divide-y divide-gray-200">
												<thead className="bg-gray-50">
													<tr>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Артикул</th>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
														<th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Действие</th>
													</tr>
												</thead>
												<tbody className="bg-white divide-y divide-gray-200">
													{currentProducts.length === 0 ? (
														<tr>
															<td colSpan={6} className="px-4 py-8 text-center text-gray-500">
																{productSearchTerm ? 'Товары не найдены' : 'Нет товаров для этого типа'}
															</td>
														</tr>
													) : (
														currentProducts.map(product => (
															<tr
																key={product.productId}
																className={`hover:bg-gray-50 cursor-pointer transition-colors ${formData.product_id === product.productId ? 'bg-blue-50' : ''
																	}`}
																onClick={() => setFormData(prev => ({ ...prev, product_id: product.productId }))}
															>
																<td className="px-4 py-2 text-sm text-gray-900">{product.productId}</td>
																<td className="px-4 py-2 text-sm font-medium text-gray-900">
																	<div className="max-w-xs truncate" title={product.productName}>
																		{product.productName}
																	</div>
																</td>
																<td className="px-4 py-2 text-sm text-gray-600">{product.tag}</td>
																<td className="px-4 py-2 text-sm">
																	<span className={`px-2 py-1 text-xs rounded-full ${product.productType === 'industrial'
																		? 'bg-blue-100 text-blue-800'
																		: 'bg-green-100 text-green-800'
																		}`}>
																		{product.productType === 'industrial' ? 'Промышленное' : 'Бытовое'}
																	</span>
																</td>
																<td className="px-4 py-2 text-sm font-medium text-gray-900">
																	{product.price ? `${product.price.toLocaleString('ru-RU')} ₸` : '—'}
																</td>
																<td className="px-4 py-2 text-center">
																	{formData.product_id === product.productId ? (
																		<div className="flex items-center justify-center">
																			<svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
																				<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
																			</svg>
																			<span className="ml-1 text-xs text-blue-600 font-medium">Выбрано</span>
																		</div>
																	) : (
																		<button
																			onClick={(e) => {
																				e.stopPropagation();
																				setFormData(prev => ({ ...prev, product_id: product.productId }));
																			}}
																			className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
																		>
																			Выбрать
																		</button>
																	)}
																</td>
															</tr>
														))
													)}
												</tbody>
											</table>
										</div>

										{/* Карточный вид товаров для мобильных */}
										<div className="sm:hidden space-y-2 p-2">
											{currentProducts.length === 0 ? (
												<div className="text-center py-8">
													<p className="text-sm text-gray-500">
														{productSearchTerm ? 'Товары не найдены' : 'Нет товаров для этого типа'}
													</p>
												</div>
											) : (
												currentProducts.map(product => (
													<div
														key={product.productId}
														className={`bg-white border rounded-lg p-3 cursor-pointer transition-colors ${formData.product_id === product.productId ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
															}`}
														onClick={() => setFormData(prev => ({ ...prev, product_id: product.productId }))}
													>
														<div className="flex justify-between items-start mb-2">
															<div className="flex-1">
																<h4 className="text-sm font-medium text-gray-900 mb-1">{product.productName}</h4>
																<p className="text-xs text-gray-500">ID: {product.productId} | Артикул: {product.tag}</p>
															</div>
															{formData.product_id === product.productId && (
																<svg className="h-5 w-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
																	<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
																</svg>
															)}
														</div>
														<div className="flex items-center justify-between">
															<span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${product.productType === 'industrial'
																? 'bg-blue-100 text-blue-800'
																: 'bg-green-100 text-green-800'
																}`}>
																{product.productType === 'industrial' ? 'Промышленное' : 'Бытовое'}
															</span>
															{product.price && (
																<span className="text-sm font-medium text-gray-900">
																	{product.price.toLocaleString('ru-RU')} ₸
																</span>
															)}
														</div>
														{formData.product_id !== product.productId && (
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	setFormData(prev => ({ ...prev, product_id: product.productId }));
																}}
																className="w-full mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
															>
																Выбрать товар
															</button>
														)}
														{formData.product_id === product.productId && (
															<div className="w-full mt-2 px-3 py-1 text-xs bg-green-100 text-green-800 rounded text-center font-medium">
																Выбрано
															</div>
														)}
													</div>
												))
											)}
										</div>

										{/* Пагинация товаров */}
										{totalProductPages > 1 && (
											<div className="border-t border-gray-200 p-3 bg-gray-50">
												<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
													<div className="text-sm text-gray-600 text-center sm:text-left">
														Показано {productStartIndex + 1}-{Math.min(productEndIndex, filteredProducts.length)} из {filteredProducts.length}
													</div>
													<div className="flex items-center justify-center sm:justify-end space-x-1 overflow-x-auto">
														<button
															type="button"
															onClick={() => setProductPage(1)}
															disabled={productPage === 1}
															className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
															title="Первая страница"
														>
															««
														</button>
														<button
															type="button"
															onClick={() => setProductPage(prev => Math.max(1, prev - 1))}
															disabled={productPage === 1}
															className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
															title="Предыдущая страница"
														>
															«
														</button>

														{getProductPageNumbers().map((pageNum, index) => (
															<span key={index}>
																{pageNum === '...' ? (
																	<span className="px-3 py-2 text-gray-500 flex-shrink-0">...</span>
																) : (
																	<button
																		type="button"
																		onClick={() => setProductPage(pageNum as number)}
																		className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex-shrink-0 ${productPage === pageNum
																			? 'bg-blue-600 text-white'
																			: 'text-gray-700 hover:bg-gray-100'
																			}`}
																	>
																		{pageNum}
																	</button>
																)}
															</span>
														))}

														<button
															type="button"
															onClick={() => setProductPage(prev => Math.min(totalProductPages, prev + 1))}
															disabled={productPage === totalProductPages}
															className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
															title="Следующая страница"
														>
															»
														</button>
														<button
															type="button"
															onClick={() => setProductPage(totalProductPages)}
															disabled={productPage === totalProductPages}
															className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
															title="Последняя страница"
														>
															»»
														</button>
													</div>
												</div>
											</div>
										)}
									</div>

									{/* Показ выбранного товара */}
									{formData.product_id && (
										<div className="mt-2 p-2 bg-blue-50 rounded-md">
											<div className="text-sm text-blue-800">
												Выбран: {getProductName(formData.product_id)}
											</div>
										</div>
									)}

									{validationErrors.product_id && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.product_id}</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Файл спецификации {editingTechSpec ? '(новый файл - опционально)' : '*'}
									</label>
									<div className="relative">
										<input
											type="file"
											onChange={handleFileChange}
											className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.file ? 'border-red-500' : 'border-gray-300'
												}`}
											accept=".pdf,.doc,.docx,.txt"
										/>
										{file && (
											<div className="mt-2 text-sm text-gray-600">
												Выбран: {file.name}
											</div>
										)}
										{editingTechSpec && !file && (
											<div className="mt-2 text-sm text-gray-500">
												Текущий файл: {editingTechSpec.fileName}
											</div>
										)}
									</div>
									{validationErrors.file && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.file}</p>
									)}
								</div>

								<div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
									<button
										type="button"
										onClick={resetForm}
										className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
									>
										Отмена
									</button>
									<button
										type="submit"
										className="w-full sm:w-auto px-4 py-2 bg-industrial-accent text-white rounded-md hover:bg-orange-700"
									>
										{editingTechSpec ? 'Сохранить' : 'Создать'}
									</button>
								</div>
							</form>
						</div>
					</div>
				)
				}

				{/* Tech Specs Table */}
				<div className="space-y-6">

					{techSpecs.length === 0 ? (
						<div className="text-center py-12">
							<FileSpreadsheetIcon className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">Технические спецификации не найдены</h3>
							<p className="mt-1 text-sm text-gray-500">
								Начните с добавления первой технической спецификации
							</p>
							<div className="mt-6">
								<button
									onClick={() => setShowCreateForm(true)}
									className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent"
								>
									<PlusIcon className="h-4 w-4 mr-2" />
									Добавить спецификацию
								</button>
							</div>
						</div>
					) : (
						<>
							{/* Tech Specs Table */}
							<div className="bg-white shadow-lg overflow-hidden rounded-lg">
								{/* Заголовок таблицы с поиском */}
								<div className="border-b border-gray-200 p-4 bg-gray-50">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
										<div className="text-sm text-gray-700">
											Всего тех. спецификаций: {filteredTechSpecs.length}
											{techSpecTotalPages > 1 && (
												<span className="ml-4">
													Страница {currentPage} из {techSpecTotalPages}
												</span>
											)}
										</div>
										<div className="flex items-center space-x-2">
											<span className="text-sm text-gray-600">На странице:</span>
											<select
												value={itemsPerPage}
												onChange={(e) => {
													setItemsPerPage(Number(e.target.value));
													setCurrentPage(1);
												}}
												className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-industrial-accent"
											>
												<option value={10}>10</option>
												<option value={15}>15</option>
												<option value={20}>20</option>
												<option value={50}>50</option>
												<option value={100}>100</option>
											</select>
										</div>
									</div>
									{/* Поиск */}
									<div className="mt-3">
										<input
											type="text"
											value={techSpecSearchTerm}
											onChange={(e) => setTechSpecSearchTerm(e.target.value)}
											placeholder="Поиск по названию файла или товару..."
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent"
										/>
									</div>
								</div>

								{/* Таблица тех. спецификаций для десктопа */}
								<div className="hidden lg:block overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название файла</th>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Файл</th>
												<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Действия</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{currentTechSpecsList.length === 0 ? (
												<tr>
													<td colSpan={5} className="px-4 py-8 text-center text-gray-500">
														{techSpecSearchTerm ? 'Технические спецификации не найдены' : 'Нет технических спецификаций'}
													</td>
												</tr>
											) : (
												currentTechSpecsList.map((techSpec) => (
													<tr key={techSpec.techSpecId} className="hover:bg-gray-50">
														<td className="px-4 py-3 text-sm text-gray-900">{techSpec.techSpecId}</td>
														<td className="px-4 py-3 text-sm font-medium text-gray-900">
															<div className="max-w-xs truncate" title={techSpec.fileName}>
																{techSpec.fileName}
															</div>
														</td>
														<td className="px-4 py-3 text-sm">
															<div className="max-w-xs truncate" title={getProductName(techSpec.product_id)}>
																{getProductName(techSpec.product_id)}
															</div>
														</td>
														<td className="px-4 py-3 text-sm">
															{techSpec.fileUrl ? (
																<button
																	onClick={() => handleDownloadFile(techSpec.fileUrl, techSpec.fileName)}
																	className="text-blue-600 hover:text-blue-900 underline inline-flex items-center"
																	title="Скачать файл"
																>
																	📄 Скачать
																</button>
															) : (
																<span className="text-gray-400">Нет файла</span>
															)}
														</td>
														<td className="px-4 py-3 text-center">
															<div className="flex items-center justify-center space-x-2">
																<button
																	onClick={() => handleEdit(techSpec)}
																	className="text-blue-600 hover:text-blue-900 text-sm font-medium"
																	title="Редактировать"
																>
																	<EditIcon className="h-4 w-4" />
																</button>
																<button
																	onClick={() => handleDelete(techSpec.techSpecId)}
																	className="text-red-600 hover:text-red-900 text-sm font-medium"
																	title="Удалить"
																>
																	<TrashIcon className="h-4 w-4" />
																</button>
															</div>
														</td>
													</tr>
												))
											)}
										</tbody>
									</table>
								</div>

								{/* Карточный вид для мобильных */}
								<div className="lg:hidden space-y-4 p-4">
									{currentTechSpecsList.length === 0 ? (
										<div className="text-center py-8">
											<FileSpreadsheetIcon className="mx-auto h-12 w-12 text-gray-400" />
											<p className="mt-2 text-sm text-gray-500">
												{techSpecSearchTerm ? 'Технические спецификации не найдены' : 'Нет технических спецификаций'}
											</p>
										</div>
									) : (
										currentTechSpecsList.map((techSpec) => (
											<div key={techSpec.techSpecId} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
												<div className="p-4">
													{/* Заголовок карточки */}
													<div className="flex justify-between items-start mb-3">
														<div className="flex-1">
															<h3 className="text-base font-semibold text-gray-900 mb-1">{techSpec.fileName}</h3>
															<p className="text-xs text-gray-500">ID: {techSpec.techSpecId}</p>
														</div>
														<div className="flex space-x-1">
															<button
																onClick={() => handleEdit(techSpec)}
																className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
																title="Редактировать"
															>
																<EditIcon className="h-4 w-4" />
															</button>
															<button
																onClick={() => handleDelete(techSpec.techSpecId)}
																className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
																title="Удалить"
															>
																<TrashIcon className="h-4 w-4" />
															</button>
														</div>
													</div>

													{/* Информация о товаре */}
													<div className="mb-3">
														<div className="text-sm text-gray-600 mb-1">
															<span className="font-medium">Товар:</span>
														</div>
														<div className="text-sm text-gray-900 bg-gray-50 rounded p-2">
															{getProductName(techSpec.product_id)}
														</div>
													</div>

													{/* Файл */}
													<div className="flex items-center justify-between">
														<div className="flex-1">
															{techSpec.fileUrl ? (
																<button
																	onClick={() => handleDownloadFile(techSpec.fileUrl, techSpec.fileName)}
																	className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
																>
																	📄 Скачать файл
																</button>
															) : (
																<div className="w-full text-center py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
																	Нет файла
																</div>
															)}
														</div>
													</div>
												</div>
											</div>
										))
									)}
								</div>

								{/* Пагинация */}
								{techSpecTotalPages > 1 && (
									<div className="border-t border-gray-200 p-4 bg-gray-50">
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
											<div className="text-sm text-gray-600 text-center sm:text-left">
												Показано {techSpecStartIndex + 1}-{Math.min(techSpecEndIndex, filteredTechSpecs.length)} из {filteredTechSpecs.length}
											</div>
											<div className="flex items-center justify-center sm:justify-end space-x-1 overflow-x-auto">
												<button
													onClick={() => setCurrentPage(1)}
													disabled={currentPage === 1}
													className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
													title="Первая страница"
												>
													««
												</button>
												<button
													onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
													disabled={currentPage === 1}
													className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
													title="Предыдущая страница"
												>
													«
												</button>

												{getPageNumbers().map((pageNum, index) => (
													<span key={index}>
														{pageNum === '...' ? (
															<span className="px-3 py-2 text-gray-500 flex-shrink-0">...</span>
														) : (
															<button
																onClick={() => setCurrentPage(pageNum as number)}
																className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex-shrink-0 ${currentPage === pageNum
																	? 'bg-blue-600 text-white'
																	: 'text-gray-700 hover:bg-gray-100'
																	}`}
															>
																{pageNum}
															</button>
														)}
													</span>
												))}

												<button
													onClick={() => setCurrentPage(prev => Math.min(techSpecTotalPages, prev + 1))}
													disabled={currentPage === techSpecTotalPages}
													className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
													title="Следующая страница"
												>
													»
												</button>
												<button
													onClick={() => setCurrentPage(techSpecTotalPages)}
													disabled={currentPage === techSpecTotalPages}
													className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
													title="Последняя страница"
												>
													»»
												</button>
											</div>
										</div>
									</div>
								)}

							</div>

						</>
					)}

				</div>
			</div>
		</div>
	);
};
