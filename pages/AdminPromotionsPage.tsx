import React, { useState, useEffect } from 'react';
import { buildUrl } from '../config/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminApiService } from '../services/adminApi';
import { UserApiService } from '../services/userApi';
import { PromotionDto, PromotionFormErrors } from '../types';
import { AdminNavigation } from '../components/AdminNavigation';
import {
	EditIcon,
	TrashIcon,
	PlusIcon,
	TagIcon,
	XIcon,
	UploadIcon,
	ImageIcon,
	ChevronLeftIcon,
	ChevronRightIcon
} from '../components/Icons';

export const AdminPromotionsPage: React.FC = () => {
	const { admin } = useAdminAuth();
	const [promotions, setPromotions] = useState<PromotionDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingPromotion, setEditingPromotion] = useState<PromotionDto | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [validationErrors, setValidationErrors] = useState<PromotionFormErrors>({});
	const [dragActive, setDragActive] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(8); // По 8 акций на странице

	useEffect(() => {
		loadPromotions();
	}, []);

	const loadPromotions = async () => {
		try {
			console.log('Loading promotions...');
			const data = await UserApiService.getPromotions();
			console.log('Promotions loaded:', data);
			setPromotions(data || []);
		} catch (error) {
			console.error('Error loading promotions:', error);
		} finally {
			setLoading(false);
		}
	};

	const validateForm = (): boolean => {
		const errors: PromotionFormErrors = {};

		if (!selectedFile) {
			errors.urlPhoto = 'Файл изображения обязателен';
		}

		if (selectedFile) {
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
			if (!allowedTypes.includes(selectedFile.type)) {
				errors.urlPhoto = 'Допустимы только изображения (JPEG, PNG, GIF, WebP)';
			}
		}

		if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
			errors.urlPhoto = 'Размер файла не должен превышать 10MB';
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm() || !selectedFile) {
			return;
		}

		try {
			if (editingPromotion) {
				await AdminApiService.editPromotionPhoto(editingPromotion.promotion_id, selectedFile);
			} else {
				await AdminApiService.createPromotion(selectedFile);
			}

			resetForm();
			loadPromotions();
		} catch (error) {
			console.error('Error saving promotion:', error);
		}
	};

	const handleDeletePromotion = async (promotionId: number) => {
		if (!confirm('Вы уверены, что хотите удалить эту акцию?')) return;

		try {
			await AdminApiService.deletePromotion(promotionId);
			loadPromotions();
		} catch (error) {
			console.error('Error deleting promotion:', error);
		}
	};

	const resetForm = () => {
		setSelectedFile(null);
		setValidationErrors({});
		setEditingPromotion(null);
		setShowCreateForm(false);
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			setSelectedFile(e.dataTransfer.files[0]);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setSelectedFile(e.target.files[0]);
		}
	};

	// Пагинация
	const totalPages = Math.ceil(promotions.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentPromotions = promotions.slice(startIndex, endIndex);

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

	const getImageUrl = (url: string): string => {
		return buildUrl(url);
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100">
				<AdminNavigation />
				<div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-industrial-accent mx-auto"></div>
						<p className="mt-4 text-gray-600">Загрузка акций...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<AdminNavigation />

			<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">Управление акциями</h1>
					<button
						onClick={() => setShowCreateForm(true)}
						className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors w-full sm:w-auto"
					>
						<PlusIcon className="h-4 w-4 mr-2" />
						Добавить акцию
					</button>
				</div>

				{showCreateForm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg max-w-md w-full p-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									{editingPromotion ? 'Редактировать акцию' : 'Новая акция'}
								</h3>
								<button
									onClick={resetForm}
									className="text-gray-400 hover:text-gray-500"
								>
									<XIcon className="h-6 w-6" />
								</button>
							</div>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Изображение акции
									</label>
									<div
										className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
											? 'border-industrial-accent bg-industrial-50'
											: 'border-gray-300 hover:border-gray-400'
											}`}
										onDragEnter={handleDrag}
										onDragLeave={handleDrag}
										onDragOver={handleDrag}
										onDrop={handleDrop}
									>
										<input
											type="file"
											accept="image/*"
											onChange={handleFileChange}
											className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
										/>

										{selectedFile ? (
											<div className="space-y-2">
												<ImageIcon className="mx-auto h-12 w-12 text-green-500" />
												<p className="text-sm font-medium text-gray-900">
													{selectedFile.name}
												</p>
												<p className="text-xs text-gray-500">
													{formatFileSize(selectedFile.size)}
												</p>
											</div>
										) : (
											<div className="space-y-2">
												<UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
												<p className="text-sm font-medium text-gray-900">
													Перетащите изображение сюда или нажмите для выбора
												</p>
												<p className="text-xs text-gray-500">
													PNG, JPG, GIF, WebP до 10MB
												</p>
											</div>
										)}
									</div>
									{validationErrors.urlPhoto && (
										<p className="text-red-500 text-sm mt-1">{validationErrors.urlPhoto}</p>
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
										{editingPromotion ? 'Сохранить' : 'Создать'}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{promotions.length === 0 ? (
					<div className="bg-white shadow rounded-lg">
						<div className="text-center py-12">
							<TagIcon className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">Акции не найдены</h3>
							<p className="mt-1 text-sm text-gray-500">
								Начните с добавления первой акции
							</p>
							<div className="mt-6">
								<button
									onClick={() => setShowCreateForm(true)}
									className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent"
								>
									<PlusIcon className="h-4 w-4 mr-2" />
									Добавить акцию
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-6">
						{/* Stats and pagination info */}
						<div className="bg-white shadow rounded-lg p-4">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<div className="text-sm text-gray-700">
									Всего акций: {promotions.length}
									{totalPages > 1 && (
										<span className="block sm:inline sm:ml-4">
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
											<option value={4}>4</option>
											<option value={8}>8</option>
											<option value={12}>12</option>
											<option value={16}>16</option>
										</select>
									</div>
								)}
							</div>
						</div>

						{/* Promotions Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
							{currentPromotions.map((promotion) => (
								<div key={promotion.promotion_id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
									<div className="aspect-[16/9] bg-gray-100 overflow-hidden">
										<img
											src={getImageUrl(promotion.urlPhoto)}
											alt={`Акция ${promotion.promotion_id}`}
											className="w-full h-full object-contain"
											onError={(e) => {
												console.error('Failed to load image:', promotion.urlPhoto);
												(e.target as HTMLImageElement).src = 'https://picsum.photos/800/450?error=load-failed&id=' + promotion.promotion_id;
											}}
										/>
									</div>

									<div className="p-4">
										<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
											<button
												onClick={() => {
													setEditingPromotion(promotion);
													setShowCreateForm(true);
												}}
												className="inline-flex items-center justify-center px-4 py-2 text-industrial-accent hover:text-industrial-900 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto"
											>
												<EditIcon className="h-4 w-4 mr-2" />
												Изменить
											</button>

											<button
												onClick={() => handleDeletePromotion(promotion.promotion_id)}
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

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="bg-white shadow rounded-lg p-4">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div className="text-sm text-gray-700 text-center sm:text-left">
										Показано {startIndex + 1}-{Math.min(endIndex, promotions.length)} из {promotions.length} акций
									</div>

									<div className="flex items-center justify-center sm:justify-end space-x-1 overflow-x-auto">
										<button
											onClick={() => setCurrentPage(1)}
											disabled={currentPage === 1}
											className="p-2 text-gray-500 hover:text-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
										>
											<ChevronLeftIcon className="h-4 w-4" />
											<ChevronLeftIcon className="h-4 w-4 -ml-2" />
										</button>

										<button
											onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
											disabled={currentPage === 1}
											className="p-2 text-gray-500 hover:text-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
										>
											<ChevronLeftIcon className="h-4 w-4" />
										</button>

										{getPageNumbers().map((page, index) => (
											<span key={index}>
												{page === '...' ? (
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
			</div>
		</div>
	);
};
