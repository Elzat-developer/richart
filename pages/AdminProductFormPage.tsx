import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminApiService } from '../services/adminApi';
import { CreateProductDto, GetProductDto, BackendCategoryDto } from '../types';

export const AdminProductFormPage: React.FC = () => {
	const { id } = useParams<{ id?: string }>();
	const navigate = useNavigate();
	const { admin } = useAdminAuth();
	const isEditing = Boolean(id);

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [categories, setCategories] = useState<BackendCategoryDto[]>([]);
	const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof CreateProductDto, string>>>({});
	const [loadingCategories, setLoadingCategories] = useState(false);

	// Функция для загрузки категорий по типу
	const loadCategories = async (type: 'industrial' | 'household') => {
		setLoadingCategories(true);
		try {
			const categoriesData = await AdminApiService.getCategories(type, true);
			setCategories(categoriesData);
		} catch (error) {
			console.error('Ошибка при загрузке категорий:', error);
			setCategories([]);
		} finally {
			setLoadingCategories(false);
		}
	};

	const [formData, setFormData] = useState<CreateProductDto & {
		width?: number;
		depth?: number;
		height?: number;
		power?: string;
		voltage?: string;
		country?: string;
		specifications?: Record<string, string>;
		productType: 'industrial' | 'household';
		active: boolean;
		techSpecFile?: File;
	}>({
		productName: '',
		description: '',
		tag: '',
		price: 0,
		material: '',
		dimensions: '',
		weight: 0,
		createdAt: new Date().toISOString(),
		categoryId: 0,
		quantity: 0,
		productType: 'industrial',
		active: true,
		photos: []
	});

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			try {
				// Загружаем категории для текущего типа товара
				await loadCategories(formData.productType);

				// Если редактируем, загружаем данные товара
				if (isEditing && id) {
					setLoading(true);
					const productData = await AdminApiService.getProduct(parseInt(id));
					setFormData({
						productName: productData.productName || '',
						description: productData.description || '',
						tag: productData.tag || '',
						price: productData.price || 0,
						material: productData.material || '',
						dimensions: productData.dimensions || '',
						weight: productData.weight || 0,
						width: productData.width || undefined,
						depth: productData.depth || undefined,
						height: productData.height || undefined,
						power: productData.power || undefined,
						voltage: productData.voltage || undefined,
						country: productData.country || undefined,
						specifications: productData.specifications || {},
						createdAt: productData.createdAt || new Date().toISOString(),
						categoryId: productData.categoryId || 0,
						quantity: productData.quantity || 0,
						productType: productData.productType || 'industrial',
						active: productData.active !== undefined ? productData.active : true,
						photos: [] // При редактировании начинаем с пустого массива фото
					});
				}
			} catch (error) {
				console.error('Error loading data:', error);
				alert('Ошибка при загрузке данных');
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [id, isEditing]);

	// Загружаем категории при изменении типа товара
	useEffect(() => {
		loadCategories(formData.productType);
	}, [formData.productType]);

	const validateForm = (): boolean => {
		const errors: Partial<Record<keyof CreateProductDto, string>> = {};

		if (!formData.productName.trim()) {
			errors.productName = 'Название товара обязательно';
		}

		if (!formData.description.trim()) {
			errors.description = 'Описание обязательно';
		}

		if (!formData.tag.trim()) {
			errors.tag = 'Артикул обязателен';
		}

		if (formData.price <= 0) {
			errors.price = 'Цена должна быть больше 0';
		}

		if (!formData.material.trim()) {
			errors.material = 'Материал обязателен';
		}

		if (!formData.dimensions.trim()) {
			errors.dimensions = 'Габариты обязательны';
		}

		if (formData.weight <= 0) {
			errors.weight = 'Вес должен быть больше 0';
		}

		if (formData.categoryId === 0) {
			errors.categoryId = 'Выберите категорию';
		}

		if (formData.quantity < 0) {
			errors.quantity = 'Количество не может быть отрицательным';
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setSaving(true);
		try {
			if (isEditing && id) {
				await AdminApiService.editProduct({
					productId: parseInt(id),
					productName: formData.productName,
					description: formData.description,
					tag: formData.tag,
					price: formData.price,
					material: formData.material,
					dimensions: formData.dimensions,
					weight: formData.weight,
					width: formData.width,
					depth: formData.depth,
					height: formData.height,
					power: formData.power,
					voltage: formData.voltage,
					country: formData.country,
					specifications: formData.specifications,
					categoryId: formData.categoryId,
					quantity: formData.quantity,
					productType: formData.productType,
					active: formData.active,
					photos: formData.photos, // Новые фото или пустой массив
					techSpecFile: formData.techSpecFile // Файл технических спецификаций
				});
			} else {
				console.log('Creating product with data:', formData);
				await AdminApiService.createProduct(formData);
				console.log('Product created successfully');
			}

			// Показываем сообщение об успехе
			alert(isEditing ? 'Товар успешно обновлен!' : 'Товар успешно создан!');

			// Перенаправляем обратно к списку товаров
			navigate('/admin/products');
		} catch (error) {
			console.error('Error saving product:', error);
			alert('Ошибка при сохранении товара');
		} finally {
			setSaving(false);
		}
	};

	const handleChange = (field: keyof (CreateProductDto & {
		width?: number;
		depth?: number;
		height?: number;
		power?: string;
		voltage?: string;
		country?: string;
		specifications?: Record<string, string>;
		productType: 'industrial' | 'household';
		active: boolean;
	})) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		let value: any = e.target.value;

		// Конвертируем в числа для нужных полей
		if (field === 'price' || field === 'weight' || field === 'categoryId' || field === 'quantity' ||
			field === 'width' || field === 'depth' || field === 'height') {
			value = Number(value);
		}

		// Конвертируем в boolean для active
		if (field === 'active') {
			value = (e.target as HTMLInputElement).checked;
		}

		// Если меняем тип товара, сбрасываем категорию
		if (field === 'productType') {
			setFormData(prev => ({
				...prev,
				[field]: value,
				categoryId: 0  // Сбрасываем категорию при смене типа
			}));

			// Очищаем ошибку категории
			if (validationErrors.categoryId) {
				setValidationErrors(prev => ({ ...prev, categoryId: undefined }));
			}
			return;
		}

		setFormData(prev => ({ ...prev, [field]: value }));

		// Очищаем ошибку при вводе
		if (validationErrors[field]) {
			setValidationErrors(prev => ({ ...prev, [field]: undefined }));
		}
	};

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const newPhotos = Array.from(e.target.files);
			setFormData(prev => ({
				...prev,
				photos: [...prev.photos, ...newPhotos]
			}));
		}
	};

	const handleTechSpecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			// Проверяем что это документ (PDF, DOC, DOCX, XLS, XLSX и т.д.)
			const allowedTypes = [
				'application/pdf',
				'application/msword',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'application/vnd.ms-excel',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'application/vnd.ms-powerpoint',
				'application/vnd.openxmlformats-officedocument.presentationml.presentation',
				'text/plain'
			];

			const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
			const fileName = file.name.toLowerCase();

			const isValidType = allowedTypes.includes(file.type) ||
				allowedExtensions.some(ext => fileName.endsWith(ext));

			if (!isValidType) {
				alert('Пожалуйста, выберите файл поддерживаемого формата: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT');
				return;
			}

			setFormData(prev => ({
				...prev,
				techSpecFile: file
			}));
		}
	};

	const removePhoto = (index: number) => {
		setFormData(prev => ({
			...prev,
			photos: prev.photos.filter((_, i) => i !== index)
		}));
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-industrial-accent mx-auto"></div>
					<p className="mt-4 text-gray-600">Загрузка...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Header */}
			<header className="bg-industrial-accent">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-0 sm:h-16 gap-3">
						<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
							<Link to="/admin/products" className="text-gray-300 hover:text-white flex items-center">
								<span className="sm:hidden">←</span>
								<span className="hidden sm:inline">← Назад к товарам</span>
							</Link>
							<h1 className="text-lg sm:text-xl font-bold text-white">
								{isEditing ? (
									<span className="block sm:inline">Редактирование товара</span>
								) : (
									<span className="block sm:inline">Добавление товара</span>
								)}
							</h1>
						</div>
						<span className="text-xs sm:text-sm text-gray-300 self-start sm:self-auto">
							{admin?.email}
						</span>
					</div>
				</div>
			</header>

			<div className="max-w-3xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
				<div className="bg-white shadow overflow-hidden sm:rounded-lg">
					<form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
						{/* Basic Information */}
						<div>
							<h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Основная информация</h3>
							<div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
								<div>
									<label htmlFor="productName" className="block text-sm font-medium text-gray-700">
										Название товара *
									</label>
									<input
										type="text"
										id="productName"
										value={formData.productName}
										onChange={handleChange('productName')}
										className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.productName ? 'border-red-500' : 'border-gray-300'
											}`}
										placeholder="Промышленный стол"
									/>
									{validationErrors.productName && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.productName}</p>
									)}
								</div>

								<div>
									<label htmlFor="tag" className="block text-sm font-medium text-gray-700">
										Артикул *
									</label>
									<input
										type="text"
										id="tag"
										value={formData.tag}
										onChange={handleChange('tag')}
										className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.tag ? 'border-red-500' : 'border-gray-300'
											}`}
										placeholder="IND-001"
									/>
									{validationErrors.tag && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.tag}</p>
									)}
								</div>
							</div>

							<div className="mt-6">
								<label htmlFor="description" className="block text-sm font-medium text-gray-700">
									Описание *
								</label>
								<textarea
									id="description"
									rows={4}
									value={formData.description}
									onChange={handleChange('description')}
									className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.description ? 'border-red-500' : 'border-gray-300'
										}`}
									placeholder="Подробное описание товара..."
								/>
								{validationErrors.description && (
									<p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
								)}
							</div>
						</div>

						{/* Category */}
						<div>
							<label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
								Категория *
								<span className="ml-2 text-xs text-gray-500">
									({formData.productType === 'industrial' ? 'Промышленные' : 'Бытовые'} товары)
								</span>
							</label>
							<select
								id="categoryId"
								value={formData.categoryId}
								onChange={handleChange('categoryId')}
								disabled={loadingCategories}
								className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.categoryId ? 'border-red-500' : 'border-gray-300'
									} ${loadingCategories ? 'bg-gray-100 cursor-not-allowed' : ''}`}
							>
								<option value={0}>
									{loadingCategories ? 'Загрузка...' : 'Выберите категорию'}
								</option>
								{categories.map(category => (
									<option key={category.categoryId} value={category.categoryId}>
										{category.categoryName}
									</option>
								))}
							</select>
							{validationErrors.categoryId && (
								<p className="mt-1 text-sm text-red-500">{validationErrors.categoryId}</p>
							)}
							{categories.length === 0 && !loadingCategories && (
								<p className="mt-1 text-sm text-gray-500">
									Для типа "{formData.productType === 'industrial' ? 'Промышленный' : 'Бытовой'}" категорий не найдено
								</p>
							)}
						</div>

						{/* Specifications */}
						<div>
							<h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Спецификации</h3>
							<div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
								<div>
									<label htmlFor="price" className="block text-sm font-medium text-gray-700">
										Цена (₸) *
									</label>
									<input
										type="number"
										id="price"
										step="0.01"
										min="0"
										value={formData.price}
										onChange={handleChange('price')}
										className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.price ? 'border-red-500' : 'border-gray-300'
											}`}
										placeholder="150.00"
									/>
									{validationErrors.price && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.price}</p>
									)}
								</div>

								<div>
									<label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
										Количество на складе *
									</label>
									<input
										type="number"
										id="quantity"
										min="0"
										value={formData.quantity}
										onChange={handleChange('quantity')}
										className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.quantity ? 'border-red-500' : 'border-gray-300'
											}`}
										placeholder="10"
									/>
									{validationErrors.quantity && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.quantity}</p>
									)}
								</div>

								<div>
									<label htmlFor="material" className="block text-sm font-medium text-gray-700">
										Материал *
									</label>
									<input
										type="text"
										id="material"
										value={formData.material}
										onChange={handleChange('material')}
										className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.material ? 'border-red-500' : 'border-gray-300'
											}`}
										placeholder="Сталь"
									/>
									{validationErrors.material && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.material}</p>
									)}
								</div>

								<div>
									<label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
										Габариты *
									</label>
									<input
										type="text"
										id="dimensions"
										value={formData.dimensions}
										onChange={handleChange('dimensions')}
										className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.dimensions ? 'border-red-500' : 'border-gray-300'
											}`}
										placeholder="120x60x90 см"
									/>
									{validationErrors.dimensions && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.dimensions}</p>
									)}
								</div>

								<div>
									<label htmlFor="weight" className="block text-sm font-medium text-gray-700">
										Вес (кг) *
									</label>
									<input
										type="number"
										id="weight"
										step="0.1"
										min="0"
										value={formData.weight}
										onChange={handleChange('weight')}
										className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.weight ? 'border-red-500' : 'border-gray-300'
											}`}
										placeholder="45.5"
									/>
									{validationErrors.weight && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.weight}</p>
									)}
								</div>

								{/* Дополнительные размеры */}
								<div>
									<label htmlFor="width" className="block text-sm font-medium text-gray-700">
										Ширина (мм)
									</label>
									<input
										type="number"
										id="width"
										min="0"
										value={formData.width || ''}
										onChange={handleChange('width')}
										className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent border-gray-300"
										placeholder="1100"
									/>
								</div>

								<div>
									<label htmlFor="depth" className="block text-sm font-medium text-gray-700">
										Глубина (мм)
									</label>
									<input
										type="number"
										id="depth"
										min="0"
										value={formData.depth || ''}
										onChange={handleChange('depth')}
										className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent border-gray-300"
										placeholder="900"
									/>
								</div>

								<div>
									<label htmlFor="height" className="block text-sm font-medium text-gray-700">
										Высота (мм)
									</label>
									<input
										type="number"
										id="height"
										min="0"
										value={formData.height || ''}
										onChange={handleChange('height')}
										className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent border-gray-300"
										placeholder="1600"
									/>
								</div>

								{/* Электрические характеристики */}
								<div>
									<label htmlFor="power" className="block text-sm font-medium text-gray-700">
										Мощность
									</label>
									<input
										type="text"
										id="power"
										value={formData.power || ''}
										onChange={handleChange('power')}
										className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent border-gray-300"
										placeholder="90 кВт"
									/>
								</div>

								<div>
									<label htmlFor="voltage" className="block text-sm font-medium text-gray-700">
										Напряжение
									</label>
									<input
										type="text"
										id="voltage"
										value={formData.voltage || ''}
										onChange={handleChange('voltage')}
										className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent border-gray-300"
										placeholder="220В"
									/>
								</div>

								{/* Страна производства */}
								<div>
									<label htmlFor="country" className="block text-sm font-medium text-gray-700">
										Страна
									</label>
									<input
										type="text"
										id="country"
										value={formData.country || ''}
										onChange={handleChange('country')}
										className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent border-gray-300"
										placeholder="Made in China"
									/>
								</div>

								{/* Тип товара */}
								<div>
									<label htmlFor="productType" className="block text-sm font-medium text-gray-700">
										Тип товара
										<span className="ml-2 text-xs text-gray-500">
											(определяет доступные категории)
										</span>
									</label>
									<select
										id="productType"
										value={formData.productType}
										onChange={handleChange('productType')}
										className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent border-gray-300"
									>
										<option value="industrial">🏭 Промышленный</option>
										<option value="household">🏠 Бытовой</option>
									</select>
									<p className="mt-1 text-xs text-gray-500">
										При смене типа товара доступные категории обновятся автоматически
									</p>
								</div>

								{/* Статус активности */}
								<div>
									<label className="flex items-center">
										<input
											type="checkbox"
											id="active"
											checked={formData.active}
											onChange={handleChange('active')}
											className="mr-2 h-4 w-4 text-industrial-accent focus:ring-industrial-accent border-gray-300 rounded"
										/>
										<span className="text-sm font-medium text-gray-700">Активный товар</span>
									</label>
								</div>
							</div>
						</div>

						{/* Динамические спецификации */}
						<div>
							<h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Дополнительные характеристики</h3>
							<div className="space-y-4">
								{formData.specifications && Object.entries(formData.specifications).map(([key, value]) => (
									<div key={key} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Название характеристики
											</label>
											<input
												type="text"
												value={key}
												onChange={(e) => {
													const newSpecs = { ...formData.specifications };
													delete newSpecs[key];
													newSpecs[e.target.value] = value;
													setFormData(prev => ({ ...prev, specifications: newSpecs }));
												}}
												className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent border-gray-300"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Значение
											</label>
											<input
												type="text"
												value={value}
												onChange={(e) => {
													setFormData(prev => ({
														...prev,
														specifications: {
															...prev.specifications,
															[key]: e.target.value
														}
													}));
												}}
												className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent border-gray-300"
											/>
										</div>
										<div className="flex items-end">
											<button
												type="button"
												onClick={() => {
													const newSpecs = { ...formData.specifications };
													delete newSpecs[key];
													setFormData(prev => ({ ...prev, specifications: newSpecs }));
												}}
												className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
											>
												Удалить
											</button>
										</div>
									</div>
								))}

								{/* Кнопка добавления новой характеристики */}
								<button
									type="button"
									onClick={() => {
										const newKey = `характеристика_${Object.keys(formData.specifications || {}).length + 1}`;
										setFormData(prev => ({
											...prev,
											specifications: {
												...prev.specifications,
												[newKey]: ''
											}
										}));
									}}
									className="px-4 py-2 bg-industrial-accent text-white rounded-md hover:bg-orange-700 text-sm"
								>
									+ Добавить характеристику
								</button>
							</div>
						</div>

						{/* Photos */}
						<div>
							<h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Фотографии товара</h3>
							<div className="space-y-4">
								{/* Photo Upload Area */}
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
									<input
										type="file"
										id="photos"
										multiple
										accept="image/*"
										onChange={handlePhotoChange}
										className="hidden"
									/>
									<label htmlFor="photos" className="cursor-pointer">
										<div className="space-y-2">
											<svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
												<path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
											<div className="flex text-sm text-gray-600">
												<span className="font-medium text-industrial-accent hover:text-orange-700">Нажмите для загрузки</span>
												<span className="pl-1">или перетащите файлы</span>
											</div>
											<p className="text-xs text-gray-500">PNG, JPG, GIF до 10MB каждый</p>
										</div>
									</label>
								</div>

								{/* Photo Preview */}
								{formData.photos.length > 0 && (
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
										{formData.photos.map((photo, index) => (
											<div key={index} className="relative group">
												<div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
													<img
														src={URL.createObjectURL(photo)}
														alt={`Фото ${index + 1}`}
														className="w-full h-full object-cover"
													/>
												</div>
												<button
													type="button"
													onClick={() => removePhoto(index)}
													className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
												>
													<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
													</svg>
												</button>
												<div className="mt-1 text-xs text-gray-600 truncate">
													{photo.name}
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Technical Specifications File */}
						<div>
							<h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">📄 Технические спецификации (документ)</h3>
							<div className="space-y-4">
								{/* Tech Spec Upload Area */}
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
									<input
										type="file"
										id="techSpecFile"
										accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
										onChange={handleTechSpecChange}
										className="hidden"
									/>
									<label htmlFor="techSpecFile" className="cursor-pointer">
										<div className="space-y-2">
											<span className="text-4xl">📄</span>
											<div className="flex text-sm text-gray-600">
												<span className="font-medium text-industrial-accent hover:text-orange-700">нажмите для загрузки</span>
												<span className="pl-1">или перетащите файл</span>
											</div>
											<p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT до 10MB</p>
										</div>
									</label>
								</div>

								{/* Tech Spec Preview */}
								{formData.techSpecFile && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<div className="flex items-center">
											<span className="text-3xl mr-3">
												{formData.techSpecFile.name.toLowerCase().includes('.pdf') ? '📄' :
													formData.techSpecFile.name.toLowerCase().includes('.doc') ? '📝' :
														formData.techSpecFile.name.toLowerCase().includes('.xls') ? '📊' :
															formData.techSpecFile.name.toLowerCase().includes('.ppt') ? '📈' : '📄'}
											</span>
											<div className="flex-1">
												<p className="font-medium text-gray-900">{formData.techSpecFile.name}</p>
												<p className="text-sm text-gray-500">
													Файл технических спецификаций ({formData.techSpecFile.type || 'неизвестный формат'})
												</p>
											</div>
											<button
												type="button"
												onClick={() => setFormData(prev => ({ ...prev, techSpecFile: undefined }))}
												className="ml-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
											>
												<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Actions */}
						<div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-3 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
							<Link
								to="/admin/products"
								className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent text-center"
							>
								Отмена
							</Link>
							<button
								type="submit"
								disabled={saving}
								className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-industrial-accent hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{saving ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Создать товар')}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};
