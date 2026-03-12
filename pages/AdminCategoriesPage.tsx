import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminApiService } from '../services/adminApi';
import { BackendCategoryDto, CreateCategoryDto, EditCategoryDto } from '../types';
import { AdminNavigation } from '../components/AdminNavigation';
import { buildUrl } from '../config/api';
import {
	EditIcon,
	TrashIcon,
	PlusIcon,
	CategoryIcon,
	XIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	FilterIcon,
	GridIcon,
	TableIcon,
	CheckIcon
} from '../components/Icons';

export const AdminCategoriesPage: React.FC = () => {
	const { admin } = useAdminAuth();
	const [categories, setCategories] = useState<BackendCategoryDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingCategory, setEditingCategory] = useState<BackendCategoryDto | null>(null);
	const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
	const [categoryType, setCategoryType] = useState<'industrial' | 'household'>('industrial');
	const [showArchived, setShowArchived] = useState(false);
	const [formData, setFormData] = useState<CreateCategoryDto | EditCategoryDto>({
		categoryName: '',
		description: '',
		categoryType: 'industrial'
	});
	const [validationErrors, setValidationErrors] = useState<Partial<CreateCategoryDto>>({});
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(viewMode === 'table' ? 20 : 12); // Больше элементов в таблице

	// Функция для получения URL фото из данных категории
	const getCategoryPhotoFromData = (category: BackendCategoryDto): string => {
		return category.photoUrl || '';
	};

	// Функция для получения URL фото категории
	const getCategoryPhotoUrl = (photoUrl: string): string => {
		return buildUrl(photoUrl);
	};

	useEffect(() => {
		loadCategories();
	}, [categoryType, showArchived]);

	useEffect(() => {
		// Обновляем количество элементов на странице при смене вида
		setItemsPerPage(viewMode === 'table' ? 20 : 12);
		setCurrentPage(1); // Сбрасываем на первую страницу
	}, [viewMode]);

	const loadCategories = async () => {
		try {
			console.log('🔄 Loading admin categories...');
			console.log('📋 Category type:', categoryType);
			console.log('📋 Show archived:', showArchived);

			const data = await AdminApiService.getCategories(categoryType, !showArchived);
			console.log('📦 Admin categories loaded:', data);

			// Показываем структуру первой категории
			if (data && data.length > 0) {
				const firstCategory = data[0] as any;
				console.log('🔍 First category structure:', firstCategory);
				console.log('📋 All fields:', Object.keys(firstCategory));
				console.log('🖼️ Photo URL:', firstCategory.photoUrl);
				console.log('🏷️ Category type:', firstCategory.categoryType);
			}

			setCategories(data || []);
		} catch (error) {
			console.error('❌ Error loading admin categories:', error);
		} finally {
			setLoading(false);
		}
	};

	const validateForm = (): boolean => {
		const errors: Partial<CreateCategoryDto> = {};

		if (!formData.categoryName.trim()) {
			errors.categoryName = 'Название категории обязательно';
		}

		if (!formData.description.trim()) {
			errors.description = 'Описание обязательно';
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		try {
			if (editingCategory) {
				// Редактирование категории с возможностью обновления фото
				const editData: EditCategoryDto = {
					categoryId: editingCategory.categoryId,
					categoryName: formData.categoryName,
					description: formData.description,
					photoUrl: formData.photoUrl,
					categoryType: formData.categoryType,
					active: true
				};
				await AdminApiService.editCategory(editData);
			} else {
				// Создание новой категории
				await AdminApiService.createCategory(formData as CreateCategoryDto);
			}

			await loadCategories();
			resetForm();
		} catch (error) {
			console.error('Error saving category:', error);
			alert('Ошибка при сохранении категории');
		}
	};

	const handleDelete = async (categoryId: number) => {
		if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;

		try {
			await AdminApiService.deleteCategory(categoryId);
			await loadCategories();
		} catch (error) {
			console.error('Error deleting category:', error);
			alert('Ошибка при удалении категории');
		}
	};

	const handleActivateCategory = async (categoryId: number) => {
		console.log('✅ Attempting to activate category:', categoryId);
		if (!confirm('Вы уверены, что хотите активировать эту категорию?')) return;

		try {
			console.log('🔄 Calling editCategoryActive API...');
			await AdminApiService.editCategoryActive(categoryId);
			console.log('✅ Category activated successfully');
			loadCategories();
		} catch (error) {
			console.error('❌ Error activating category:', error);
			alert('Ошибка при активации категории. Проверьте консоль для деталей.');
		}
	};

	const handleEdit = (category: BackendCategoryDto) => {
		setEditingCategory(category);
		setFormData({
			categoryId: category.categoryId,
			categoryName: category.categoryName,
			description: category.description,
			categoryType: category.categoryType
		});
		setShowCreateForm(true);
	};

	const resetForm = () => {
		setFormData({
			categoryName: '',
			description: '',
			categoryType: 'industrial',
			photoUrl: undefined
		});
		setEditingCategory(null);
		setValidationErrors({});
		setShowCreateForm(false);
	};

	const handleChange = (field: keyof CreateCategoryDto | keyof EditCategoryDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData(prev => ({ ...prev, [field]: e.target.value }));
		if (validationErrors[field as keyof CreateCategoryDto]) {
			setValidationErrors(prev => ({ ...prev, [field as keyof CreateCategoryDto]: undefined }));
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			console.log('📸 Selected file:', file.name, file.type, file.size);
			setFormData(prev => ({ ...prev, photoUrl: file }));
		}
	};

	// Пагинация
	const totalPages = Math.ceil(categories.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentCategories = categories.slice(startIndex, endIndex);

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

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-industrial-accent mx-auto"></div>
					<p className="mt-4 text-gray-600">Загрузка категорий...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Navigation */}
			<AdminNavigation />

			<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				{/* Page Header with Actions */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
					<h1 className="text-2xl font-bold text-gray-900">Управление категориями</h1>
					<button
						onClick={() => setShowCreateForm(true)}
						className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors"
					>
						<PlusIcon className="h-4 w-4 mr-2" />
						Добавить категорию
					</button>
				</div>

				{/* Filters and View Controls */}
				<div className="bg-white shadow rounded-lg p-4 mb-6">
					<div className="flex flex-wrap items-center justify-between gap-4">
						{/* Category Type Filter */}
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<FilterIcon className="h-4 w-4 text-gray-500" />
								<span className="text-sm font-medium text-gray-700">Тип:</span>
							</div>
							<div className="flex bg-gray-100 rounded-lg p-1">
								<button
									onClick={() => setCategoryType('industrial')}
									className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${categoryType === 'industrial'
										? 'bg-industrial-accent text-white'
										: 'text-gray-700 hover:text-gray-900'
										}`}
								>
									Промышленные
								</button>
								<button
									onClick={() => setCategoryType('household')}
									className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${categoryType === 'household'
										? 'bg-industrial-accent text-white'
										: 'text-gray-700 hover:text-gray-900'
										}`}
								>
									Бытовые
								</button>
							</div>
						</div>

						{/* Active/Archived Filter */}
						<div className="flex items-center space-x-2">
							<span className="text-sm font-medium text-gray-700">Статус:</span>
							<div className="flex bg-gray-100 rounded-lg p-1">
								<button
									onClick={() => setShowArchived(false)}
									className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${!showArchived
										? 'bg-green-600 text-white'
										: 'text-gray-700 hover:text-gray-900'
										}`}
								>
									Активные
								</button>
								<button
									onClick={() => setShowArchived(true)}
									className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${showArchived
										? 'bg-orange-600 text-white'
										: 'text-gray-700 hover:text-gray-900'
										}`}
								>
									Архивные
								</button>
							</div>
						</div>

						{/* View Mode Toggle */}
						<div className="flex items-center space-x-2">
							<span className="text-sm font-medium text-gray-700">Вид:</span>
							<div className="flex bg-gray-100 rounded-lg p-1">
								<button
									onClick={() => setViewMode('grid')}
									className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid'
										? 'bg-industrial-accent text-white'
										: 'text-gray-700 hover:text-gray-900'
										}`}
									title="Карточки"
								>
									<GridIcon className="h-4 w-4" />
								</button>
								<button
									onClick={() => setViewMode('table')}
									className={`p-1.5 rounded-md transition-colors ${viewMode === 'table'
										? 'bg-industrial-accent text-white'
										: 'text-gray-700 hover:text-gray-900'
										}`}
									title="Таблица"
								>
									<TableIcon className="h-4 w-4" />
								</button>
							</div>
						</div>
					</div>
				</div>
				{/* Create/Edit Form Modal */}
				{showCreateForm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg max-w-md w-full p-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									{editingCategory ? 'Редактировать категорию' : 'Новая категория'}
								</h3>
								<button
									onClick={resetForm}
									className="text-gray-400 hover:text-gray-500"
								>
									<XIcon className="h-5 w-5" />
								</button>
							</div>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Название категории *
									</label>
									<input
										type="text"
										value={formData.categoryName}
										onChange={handleChange('categoryName')}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.categoryName ? 'border-red-500' : 'border-gray-300'
											}`}
										placeholder="Например: Рабочие столы"
									/>
									{validationErrors.categoryName && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.categoryName}</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Описание *
									</label>
									<textarea
										rows={3}
										value={formData.description}
										onChange={handleChange('description')}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent ${validationErrors.description ? 'border-red-500' : 'border-gray-300'
											}`}
										placeholder="Описание категории..."
									/>
									{validationErrors.description && (
										<p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Тип категории *
									</label>
									<select
										value={formData.categoryType}
										onChange={(e) => setFormData(prev => ({ ...prev, categoryType: e.target.value as 'industrial' | 'household' }))}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent"
									>
										<option value="industrial">Промышленная</option>
										<option value="household">Бытовая</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Фото категории
									</label>
									<input
										type="file"
										accept="image/*"
										onChange={handleFileChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-industrial-100 file:text-industrial-accent hover:file:bg-industrial-200"
									/>
									<p className="mt-1 text-sm text-gray-500">
										{editingCategory
											? 'Выберите новое изображение чтобы заменить текущее (необязательно)'
											: 'Выберите изображение для категории (необязательно)'
										}
									</p>
									{editingCategory && !formData.photoUrl && (
										<div className="mt-2 p-2 bg-gray-50 rounded border">
											<p className="text-sm text-gray-600">
												📷 Текущее фото: {getCategoryPhotoFromData(editingCategory) || 'Нет фото'}
											</p>
										</div>
									)}
									{formData.photoUrl && (
										<p className="mt-2 text-sm text-green-600">
											✅ Выбран файл: {formData.photoUrl.name}
										</p>
									)}
								</div>

								<div className="flex justify-end space-x-3 pt-4">
									<button
										type="button"
										onClick={resetForm}
										className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
									>
										Отмена
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-industrial-accent text-white rounded-md hover:bg-orange-700"
									>
										{editingCategory ? 'Сохранить' : 'Создать'}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Categories Grid */}
				<div className="space-y-6">
					{/* Stats and pagination info */}
					<div className="bg-white shadow rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div className="text-sm text-gray-700">
								Всего категорий: {categories.length}
								{totalPages > 1 && (
									<span className="ml-4">
										Страница {currentPage} из {totalPages}
									</span>
								)}
							</div>

							{totalPages > 1 && (
								<div className="flex items-center space-x-2">
									<span className="text-sm text-gray-600">На странице:</span>
									<select
										value={itemsPerPage}
										onChange={(e) => {
											setItemsPerPage(Number(e.target.value));
											setCurrentPage(1);
										}}
										className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-industrial-accent"
									>
										{viewMode === 'table' ? (
											<>
												<option value={10}>10</option>
												<option value={20}>20</option>
												<option value={50}>50</option>
												<option value={100}>100</option>
											</>
										) : (
											<>
												<option value={8}>8</option>
												<option value={12}>12</option>
												<option value={16}>16</option>
												<option value={24}>24</option>
											</>
										)}
									</select>
								</div>
							)}
						</div>
					</div>

					{categories.length === 0 ? (
						<div className="text-center py-12">
							<CategoryIcon className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">Категории не найдены</h3>
							<p className="mt-1 text-sm text-gray-500">
								Начните с создания первой категории
							</p>
							<div className="mt-6">
								<button
									onClick={() => setShowCreateForm(true)}
									className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700"
								>
									<PlusIcon className="h-4 w-4 mr-2" />
									Добавить категорию
								</button>
							</div>
						</div>
					) : (
						<>
							{viewMode === 'grid' ? (
								/* Categories Grid */
								<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
									{currentCategories.map((category) => (
										<div key={category.categoryId} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
											{/* Фото категории */}
											<div className="h-64 overflow-hidden bg-gray-100 flex items-center justify-center">
												<img
													src={getCategoryPhotoUrl(category.photoUrl || '')}
													alt={category.categoryName}
													className="max-w-full max-h-full object-contain"
													onError={(e) => {
														(e.target as HTMLImageElement).src = `https://picsum.photos/400/300?error=${category.categoryId}`;
													}}
												/>
											</div>

											<div className="p-6">
												<div className="flex items-center justify-between mb-4">
													<span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
														ID: {category.categoryId}
													</span>
													<span className="text-xs font-medium text-industrial-accent bg-industrial-100 px-2 py-1 rounded">
														{category.categoryType === 'industrial' ? 'Промышленная' : 'Бытовая'}
													</span>
												</div>

												<h3 className="text-xl font-bold text-gray-900 mb-3">
													{category.categoryName}
												</h3>

												<p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
													{category.description}
												</p>

												<div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 border-t border-gray-200">
													<div className="flex flex-col sm:flex-row gap-2">
														<button
															onClick={() => handleEdit(category)}
															className="inline-flex items-center justify-center px-4 py-2 text-industrial-accent hover:text-industrial-900 hover:bg-industrial-50 text-sm font-medium rounded-lg transition-colors"
														>
															<EditIcon className="h-4 w-4" />
															<span className="ml-2 hidden sm:inline">Редактировать</span>
														</button>
														{showArchived && (
															<button
																onClick={() => handleActivateCategory(category.categoryId)}
																className="inline-flex items-center justify-center px-4 py-2 text-green-600 hover:text-green-900 hover:bg-green-50 text-sm font-medium rounded-lg transition-colors"
																title="Активировать категорию"
															>
																<CheckIcon className="h-4 w-4" />
																<span className="ml-2 hidden sm:inline">Активировать</span>
															</button>
														)}
													</div>

													<button
														onClick={() => handleDelete(category.categoryId)}
														className="inline-flex items-center justify-center px-4 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
													>
														<TrashIcon className="h-4 w-4" />
														<span className="ml-2 hidden sm:inline">Удалить</span>
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								/* Categories Table */
								<div className="bg-white shadow-lg rounded-lg">
									<div className="overflow-x-auto">
										<table className="min-w-max w-max divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Фото
													</th>
													<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														ID
													</th>
													<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Название
													</th>
													<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Тип
													</th>
													<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Описание
													</th>
													<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
														Действия
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{currentCategories.map((category) => (
													<tr key={category.categoryId} className="hover:bg-gray-50 transition-colors">
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
																<img
																	src={getCategoryPhotoUrl(category.photoUrl || '')}
																	alt={category.categoryName}
																	className="max-w-full max-h-full object-contain"
																	onError={(e) => {
																		(e.target as HTMLImageElement).src = `https://picsum.photos/48/48?error=${category.categoryId}`;
																	}}
																/>
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="text-sm font-mono text-gray-900">
																{category.categoryId}
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="text-sm font-medium text-gray-900">
																{category.categoryName}
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.categoryType === 'industrial'
																? 'bg-industrial-100 text-industrial-accent'
																: 'bg-blue-100 text-blue-800'
																}`}>
																{category.categoryType === 'industrial' ? 'Промышленная' : 'Бытовая'}
															</span>
														</td>
														<td className="px-6 py-4">
															<div className="text-sm text-gray-900 max-w-xs truncate">
																{category.description}
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
															<div className="flex items-center justify-end space-x-2">
																<button
																	onClick={() => handleEdit(category)}
																	className="text-industrial-accent hover:text-industrial-900"
																	title="Редактировать"
																>
																	<EditIcon className="h-4 w-4" />
																</button>
																{showArchived && (
																	<button
																		onClick={() => handleActivateCategory(category.categoryId)}
																		className="text-green-600 hover:text-green-900"
																		title="Активировать категорию"
																	>
																		<CheckIcon className="h-4 w-4" />
																	</button>
																)}
																<button
																	onClick={() => handleDelete(category.categoryId)}
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
								<div className="bg-white shadow rounded-lg p-4">
									<div className="flex items-center justify-between">
										<div className="text-sm text-gray-700">
											Показано {startIndex + 1}-{Math.min(endIndex, categories.length)} из {categories.length} категорий
										</div>

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
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};
