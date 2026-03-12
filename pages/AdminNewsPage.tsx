import React, { useEffect, useState } from 'react';
import { buildUrl } from '../config/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminNavigation } from '../components/AdminNavigation';
import { AdminApiService } from '../services/adminApi';
import { UserApiService } from '../services/userApi';
import { CreateNewsDto, NewsDto, NewsFormErrors, NewsIdDto } from '../types';
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	EditIcon,
	FileTextIcon,
	GridIcon,
	ImageIcon,
	PlusIcon,
	TableIcon,
	TrashIcon,
	UploadIcon,
	XIcon
} from '../components/Icons';

export const AdminNewsPage: React.FC = () => {
	const { admin } = useAdminAuth();

	const [news, setNews] = useState<NewsDto[]>([]);
	const [loading, setLoading] = useState(true);

	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingNews, setEditingNews] = useState<NewsDto | null>(null);

	const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

	const [showDetailModal, setShowDetailModal] = useState(false);
	const [selectedNews, setSelectedNews] = useState<NewsIdDto | null>(null);
	const [loadingDetail, setLoadingDetail] = useState(false);

	const [formData, setFormData] = useState<CreateNewsDto>({
		name: '',
		description: '',
		newsPhotoUrl: new File([], '') // Временное пустое значение
	});
	const [validationErrors, setValidationErrors] = useState<NewsFormErrors>({});

	const [dragActive, setDragActive] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(viewMode === 'table' ? 15 : 6);

	useEffect(() => {
		loadNews();
	}, []);

	useEffect(() => {
		setItemsPerPage(viewMode === 'table' ? 15 : 6);
		setCurrentPage(1);
	}, [viewMode]);

	const loadNews = async () => {
		try {
			const data = await UserApiService.getNews();
			setNews(data || []);
		} catch (error) {
			console.error('Error loading news:', error);
		} finally {
			setLoading(false);
		}
	};

	const getImageUrl = (url: string): string => {
		return buildUrl(url);
	};

	const validateForm = (): boolean => {
		const errors: NewsFormErrors = {};

		if (!formData.name.trim()) {
			errors.name = 'Название новости обязательно';
		}

		if (!formData.description.trim()) {
			errors.description = 'Описание новости обязательно';
		}

		if (!editingNews && (!formData.newsPhotoUrl || formData.newsPhotoUrl.size === 0)) {
			errors.newsPhotoUrl = 'Файл изображения обязателен';
		}

		if (formData.newsPhotoUrl && formData.newsPhotoUrl.size > 0) {
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
			if (!allowedTypes.includes(formData.newsPhotoUrl.type)) {
				errors.newsPhotoUrl = 'Допустимы только изображения (JPEG, PNG, GIF, WebP)';
			}

			if (formData.newsPhotoUrl.size > 10 * 1024 * 1024) {
				errors.newsPhotoUrl = 'Размер файла не должен превышать 10MB';
			}
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const resetForm = () => {
		setFormData({
			name: '',
			description: '',
			newsPhotoUrl: new File([], '')
		});
		setEditingNews(null);
		setValidationErrors({});
		setShowCreateForm(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			if (editingNews) {
				// При редактировании проверяем, есть ли новый файл
				if (formData.newsPhotoUrl.size > 0) {
					await AdminApiService.editNews(editingNews.newsId, formData);
				} else {
					// Если файл не выбран, отправляем только текстовые данные
					await AdminApiService.editNews(editingNews.newsId, {
						name: formData.name,
						description: formData.description,
						newsPhotoUrl: new File([], 'placeholder')
					});
				}
			} else {
				// При создании новости файл обязателен
				if (!formData.newsPhotoUrl || formData.newsPhotoUrl.size === 0) {
					alert('Файл изображения обязателен');
					return;
				}
				await AdminApiService.createNews(formData);
			}

			await loadNews();
			resetForm();
		} catch (error) {
			console.error('Error saving news:', error);
			alert('Ошибка при сохранении новости');
		}
	};

	const handleDeleteNews = async (newsId: number) => {
		if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;

		try {
			await AdminApiService.deleteNews(newsId);
			await loadNews();
		} catch (error) {
			console.error('Error deleting news:', error);
			alert('Ошибка при удалении новости');
		}
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(true);
	};

	const handleLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			setFormData({ ...formData, newsPhotoUrl: e.dataTransfer.files[0] });
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFormData({ ...formData, newsPhotoUrl: e.target.files[0] });
		}
	};

	const totalPages = Math.ceil(news.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentNews = news.slice(startIndex, endIndex);

	const getPageNumbers = () => {
		const pages: Array<number | string> = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
			return pages;
		}

		const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

		if (startPage > 1) pages.push(1, '...');
		for (let i = startPage; i <= endPage; i++) pages.push(i);
		if (endPage < totalPages) pages.push('...', totalPages);

		return pages;
	};

	const handleViewNews = async (newsId: number) => {
		setShowDetailModal(true);
		setLoadingDetail(true);
		setSelectedNews(null);

		try {
			const data = await UserApiService.getNewsById(newsId);
			setSelectedNews(data);
		} catch (error) {
			console.error('Error loading news by id:', error);
			alert('Ошибка при загрузке деталей новости');
			setShowDetailModal(false);
		} finally {
			setLoadingDetail(false);
		}
	};

	const closeDetailModal = () => {
		setShowDetailModal(false);
		setSelectedNews(null);
		setLoadingDetail(false);
	};

	if (!admin) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-sm font-medium text-gray-900">Доступ запрещен</h3>
					<p className="mt-1 text-sm text-gray-500">
						Пожалуйста, войдите в систему для доступа к панели управления
					</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100">
				<AdminNavigation />
				<div className="flex justify-center items-center py-20">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-industrial-accent"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<AdminNavigation />

			<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">Управление новостями</h1>
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
						<button
							onClick={() => setShowCreateForm(true)}
							className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors w-full sm:w-auto"
						>
							<PlusIcon className="h-4 w-4 mr-2" />
							Добавить новость
						</button>
					</div>
				</div>

				{showCreateForm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									{editingNews ? 'Редактировать новость' : 'Новая новость'}
								</h3>
								<button onClick={resetForm} className="text-gray-400 hover:text-gray-500">
									<XIcon className="h-6 w-6" />
								</button>
							</div>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Название новости</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-industrial-accent"
										placeholder="Введите название новости"
									/>
									{validationErrors.name && (
										<p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Описание новости</label>
									<textarea
										value={formData.description}
										onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-industrial-accent"
										rows={4}
										placeholder="Введите описание новости"
									/>
									{validationErrors.description && (
										<p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Изображение новости {editingNews && <span className="text-gray-500 font-normal">(необязательно)</span>}
									</label>
									<div
										className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-industrial-accent bg-industrial-50' : 'border-gray-300 hover:border-gray-400'
											}`}
										onDragEnter={handleDrag}
										onDragLeave={handleLeave}
										onDragOver={handleDrag}
										onDrop={handleDrop}
									>
										<input
											type="file"
											accept="image/*"
											onChange={handleFileChange}
											className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
										/>

										{formData.newsPhotoUrl.size > 0 ? (
											<div className="space-y-2">
												<ImageIcon className="mx-auto h-12 w-12 text-green-500" />
												<p className="text-sm font-medium text-gray-900">{formData.newsPhotoUrl.name}</p>
												<p className="text-xs text-gray-500">{formatFileSize(formData.newsPhotoUrl.size)}</p>
											</div>
										) : (
											<div className="space-y-2">
												<UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
												<p className="text-sm font-medium text-gray-900">
													{editingNews ? 'Изменить изображение (необязательно)' : 'Перетащите изображение сюда или нажмите для выбора'}
												</p>
												<p className="text-xs text-gray-500">PNG, JPG, GIF, WebP до 10MB</p>
											</div>
										)}
									</div>
									{validationErrors.newsPhotoUrl && (
										<p className="text-red-500 text-sm mt-1">{validationErrors.newsPhotoUrl}</p>
									)}
								</div>

								<div className="flex justify-end space-x-3 pt-4">
									<button
										type="button"
										onClick={resetForm}
										className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
									>
										Отмена
									</button>
									<button
										type="submit"
										className="px-4 py-2 border border-transparent rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors"
									>
										{editingNews ? 'Сохранить' : 'Создать'}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{news.length === 0 ? (
					<div className="bg-white shadow rounded-lg">
						<div className="text-center py-12">
							<FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">Новости не найдены</h3>
							<p className="mt-1 text-sm text-gray-500">Начните с добавления первой новости</p>
						</div>
					</div>
				) : (
					<div className="space-y-6">
						<div className="bg-white shadow rounded-lg p-4">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<div className="text-sm text-gray-600">
									Всего новостей: <span className="font-medium text-gray-900">{news.length}</span>
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
													<option value={15}>15</option>
													<option value={20}>20</option>
													<option value={50}>50</option>
												</>
											) : (
												<>
													<option value={4}>4</option>
													<option value={6}>6</option>
													<option value={8}>8</option>
													<option value={12}>12</option>
												</>
											)}
										</select>
									</div>
								)}
							</div>
						</div>

						{viewMode === 'grid' ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
								{currentNews.map((newsItem) => (
									<div
										key={newsItem.newsId}
										className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
										onClick={() => handleViewNews(newsItem.newsId)}
									>
										<div className="aspect-[4/3] bg-gray-100 overflow-hidden">
											<img
												src={getImageUrl(newsItem.newsPhotoUrl)}
												alt={newsItem.name}
												className="w-full h-full object-contain"
											/>
										</div>

										<div className="p-4">
											<h3 className="text-lg font-bold text-gray-900 mb-2">{newsItem.name}</h3>
											<p className="text-gray-600 text-sm mb-4 line-clamp-2">{newsItem.description}</p>

											<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
												<button
													onClick={(e) => {
														e.stopPropagation();
														setEditingNews(newsItem);
														setFormData({
															name: newsItem.name,
															description: newsItem.description,
															newsPhotoUrl: new File([], '')
														});
														setShowCreateForm(true);
													}}
													className="inline-flex items-center justify-center px-4 py-2 text-industrial-accent hover:text-industrial-900 hover:bg-industrial-50 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto"
												>
													<EditIcon className="h-4 w-4 mr-2" />
													Редактировать
												</button>

												<button
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteNews(newsItem.newsId);
													}}
													className="inline-flex items-center justify-center px-4 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto"
												>
													<TrashIcon className="h-4 w-4 mr-2" />
													Удалить
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="bg-white shadow-lg overflow-hidden rounded-lg">
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Фото</th>
												<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Название</th>
												<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Описание</th>
												<th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Действия</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{currentNews.map((newsItem) => (
												<tr
													key={newsItem.newsId}
													className="hover:bg-gray-50 transition-colors cursor-pointer"
													onClick={() => handleViewNews(newsItem.newsId)}
												>
													<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
														<div className="h-12 w-16 sm:h-16 sm:w-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
															<img
																src={getImageUrl(newsItem.newsPhotoUrl)}
																alt={newsItem.name}
																className="max-h-full max-w-full object-contain"
															/>
														</div>
													</td>
													<td className="px-4 sm:px-6 py-4">
														<div className="text-sm font-medium text-gray-900 max-w-xs sm:max-w-none truncate">{newsItem.name}</div>
													</td>
													<td className="px-4 sm:px-6 py-4">
														<div className="text-sm text-gray-900 max-w-xs sm:max-w-sm truncate">{newsItem.description}</div>
													</td>
													<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
														<div className="flex items-center justify-end space-x-2">
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	setEditingNews(newsItem);
																	setFormData({
																		name: newsItem.name,
																		description: newsItem.description,
																		newsPhotoUrl: new File([], '')
																	});
																	setShowCreateForm(true);
																}}
																className="text-industrial-accent hover:text-industrial-900 p-1"
																title="Редактировать"
															>
																<EditIcon className="h-4 w-4" />
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	handleDeleteNews(newsItem.newsId);
																}}
																className="text-red-600 hover:text-red-900 p-1"
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

						{totalPages > 1 && (
							<div className="bg-white shadow rounded-lg p-4">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div className="text-sm text-gray-700 text-center sm:text-left">
										Показано {startIndex + 1}-{Math.min(endIndex, news.length)} из {news.length} новостей
									</div>

									<div className="flex items-center justify-center sm:justify-end space-x-1 overflow-x-auto">
										<button
											onClick={() => setCurrentPage(1)}
											disabled={currentPage === 1}
											className="p-2 text-gray-500 hover:text-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
										>
											<ChevronLeftIcon className="h-4 w-4" />
											<ChevronLeftIcon className="h-4 w-4 -mr-2" />
										</button>

										{getPageNumbers().map((page, index) => (
											<span key={index}>
												{typeof page === 'string' ? (
													<span className="px-3 py-2 text-gray-500 flex-shrink-0">...</span>
												) : (
													<button
														onClick={() => setCurrentPage(page as number)}
														className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex-shrink-0 ${currentPage === page
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
											className="p-2 text-gray-500 hover:text-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
										>
											<ChevronRightIcon className="h-4 w-4" />
										</button>

										<button
											onClick={() => setCurrentPage(totalPages)}
											disabled={currentPage === totalPages}
											className="p-2 text-gray-500 hover:text-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
										>
											<ChevronRightIcon className="h-4 w-4" />
											<ChevronRightIcon className="h-4 w-4 -ml-2" />
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{showDetailModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
							<div className="flex justify-between items-center p-6 border-b border-gray-200">
								<h3 className="text-xl font-bold text-gray-900">Детали новости</h3>
								<button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-500 transition-colors">
									<XIcon className="h-6 w-6" />
								</button>
							</div>

							<div className="p-6">
								{loadingDetail ? (
									<div className="flex items-center justify-center py-12">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-industrial-accent"></div>
										<span className="ml-3 text-gray-600">Загрузка...</span>
									</div>
								) : selectedNews ? (
									<div className="space-y-6">
										<div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
											<img
												src={getImageUrl(selectedNews.newsPhotoUrl)}
												alt={selectedNews.name}
												className="w-full h-full object-contain"
											/>
										</div>

										<div className="space-y-4">
											<div>
												<h4 className="text-lg font-bold text-gray-900 mb-2">Название</h4>
												<p className="text-gray-700">{selectedNews.name}</p>
											</div>

											<div>
												<h4 className="text-lg font-bold text-gray-900 mb-2">Описание</h4>
												<p className="text-gray-700 whitespace-pre-wrap">{selectedNews.description}</p>
											</div>

											{selectedNews.dateTime && (
												<div>
													<h4 className="text-lg font-bold text-gray-900 mb-2">Дата публикации</h4>
													<p className="text-gray-700">
														{new Date(selectedNews.dateTime).toLocaleString('ru-RU', {
															year: 'numeric',
															month: 'long',
															day: 'numeric',
															hour: '2-digit',
															minute: '2-digit'
														})}
													</p>
												</div>
											)}
										</div>

										<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
											<button
												onClick={() => {
													setEditingNews({
														newsId: selectedNews.newsId,
														name: selectedNews.name,
														description: selectedNews.description,
														newsPhotoUrl: selectedNews.newsPhotoUrl,
														dateTime: selectedNews.dateTime
													});
													setFormData({
														name: selectedNews.name,
														description: selectedNews.description,
														newsPhotoUrl: new File([], '')
													});
													setShowCreateForm(true);
													closeDetailModal();
												}}
												className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors"
											>
												<EditIcon className="h-4 w-4 mr-2" />
												Редактировать новость
											</button>
										</div>
									</div>
								) : (
									<div className="text-center py-12">
										<p className="text-gray-600">Нет данных</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
