import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminApiService } from '../services/adminApi';
import { BackendCategoryDto } from '../types';
import { AdminNavigation } from '../components/AdminNavigation';
import { buildUrl } from '../config/api';
import {
	ArrowLeftIcon,
	PlusIcon,
	CheckIcon
} from '../components/Icons';

export const AdminCategoryFormPage: React.FC = () => {
	const { admin } = useAdminAuth();
	const navigate = useNavigate();
	const { id } = useParams<{ id?: string }>();
	const isEditing = !!id;

	const [formData, setFormData] = useState({
		categoryName: '',
		description: '',
		categoryType: 'industrial' as 'industrial' | 'household',
		photoUrl: ''
	});

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [preview, setPreview] = useState<string>('');
	const [file, setFile] = useState<File | null>(null);

	useEffect(() => {
		if (isEditing && id) {
			loadCategory();
		}
	}, [id, isEditing]);

	const loadCategory = async () => {
		try {
			setLoading(true);
			const categories = await AdminApiService.getCategories();
			const category = categories.find(c => c.categoryId === parseInt(id!));
			if (category) {
				setFormData({
					categoryName: category.categoryName,
					description: category.description,
					categoryType: category.categoryType,
					photoUrl: category.photoUrl || ''
				});
				setPreview(getCategoryPhotoUrl(category.photoUrl || ''));
			}
		} catch (error) {
			console.error('Error loading category:', error);
			alert('Ошибка при загрузке категории');
		} finally {
			setLoading(false);
		}
	};

	const getCategoryPhotoUrl = (url: string): string => {
		if (!url) return '';
		return buildUrl(url);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
			const reader = new FileReader();
			reader.onload = (e) => {
				setPreview(e.target?.result as string);
			};
			reader.readAsDataURL(selectedFile);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.categoryName.trim()) {
			alert('Пожалуйста, введите название категории');
			return;
		}

		if (!formData.description.trim()) {
			alert('Пожалуйста, введите описание категории');
			return;
		}

		try {
			setSaving(true);

			const categoryData = {
				categoryName: formData.categoryName.trim(),
				description: formData.description.trim(),
				categoryType: formData.categoryType
			};

			if (isEditing && id) {
				await AdminApiService.editCategory({
					categoryId: parseInt(id),
					...categoryData,
					active: true,
					photoUrl: file || undefined
				});
				alert('Категория успешно обновлена');
			} else {
				await AdminApiService.createCategory({
					...categoryData,
					photoUrl: file || undefined
				});
				alert('Категория успешно создана');
			}

			navigate('/admin/categories');
		} catch (error) {
			console.error('Error saving category:', error);
			alert('Ошибка при сохранении категории');
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		navigate('/admin/categories');
	};

	if (!admin) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="text-6xl mb-4">🚫</div>
					<h3 className="text-lg font-medium text-gray-900">Доступ запрещен</h3>
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

			<div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
					<div className="flex items-center gap-3">
						<button
							onClick={handleCancel}
							className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
						>
							<ArrowLeftIcon className="h-4 w-4 mr-2" />
							Назад
						</button>
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
							{isEditing ? '✏️ Редактирование категории' : '➕ Создание категории'}
						</h1>
					</div>
				</div>

				{/* Form */}
				<div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Photo Upload */}
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-3">
								📷 Фото категории
							</label>
							<div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
								<div className="flex-shrink-0 self-center sm:self-auto">
									{preview ? (
										<img
											src={preview}
											alt="Предпросмотр"
											className="h-32 w-32 sm:h-40 sm:w-40 object-cover rounded-lg border"
										/>
									) : (
										<div className="h-32 w-32 sm:h-40 sm:w-40 bg-gray-200 rounded-lg flex items-center justify-center">
											<div className="text-center">
												<div className="text-3xl mb-2">📷</div>
												<p className="text-sm text-gray-500">Нет фото</p>
											</div>
										</div>
									)}
								</div>

								<div className="flex-1 text-center sm:text-left">
									<input
										type="file"
										id="photoUrl"
										name="photoUrl"
										accept="image/*"
										onChange={handleFileChange}
										className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-industrial-50 file:text-industrial-700 hover:file:bg-industrial-100"
									/>
									<p className="mt-2 text-sm text-gray-500">
										PNG, JPG, GIF до 10MB
									</p>
									<p className="mt-1 text-xs text-gray-400">
										Рекомендуемый размер: 400x400px
									</p>
								</div>
							</div>
						</div>

						{/* Category Type */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">
								🏭 Тип категории
							</label>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => setFormData(prev => ({ ...prev, categoryType: 'industrial' }))}
									className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${formData.categoryType === 'industrial'
										? 'bg-industrial-accent text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
								>
									🏭 Промышленная
								</button>
								<button
									type="button"
									onClick={() => setFormData(prev => ({ ...prev, categoryType: 'household' }))}
									className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${formData.categoryType === 'household'
										? 'bg-blue-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
								>
									🏠 Бытовая
								</button>
							</div>
						</div>

						{/* Category Name */}
						<div>
							<label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-3">
								📝 Название категории
							</label>
							<input
								type="text"
								id="categoryName"
								name="categoryName"
								value={formData.categoryName}
								onChange={handleInputChange}
								placeholder="Введите название категории"
								className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-industrial-accent focus:border-industrial-accent"
								required
							/>
						</div>

						{/* Description */}
						<div>
							<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-3">
								📄 Описание категории
							</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								placeholder="Введите описание категории"
								rows={4}
								className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-industrial-accent focus:border-industrial-accent resize-none"
								required
							/>
						</div>

						{/* Actions */}
						<div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
							<button
								type="button"
								onClick={handleCancel}
								className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
							>
								❌ Отмена
							</button>
							<button
								type="submit"
								disabled={saving}
								className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-industrial-accent hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{saving ? (
									<>
										<div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
										Сохранение...
									</>
								) : (
									<>
										✅ {isEditing ? 'Сохранить изменения' : 'Создать категорию'}
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};
