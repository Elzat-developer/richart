import React, { useState, useEffect } from 'react';
import { buildUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { CompanyDto, CreateCompanyDto } from '../types';
import { ApiService } from '../services/api';
import { AdminNavigation } from '../components/AdminNavigation';
const AdminCompanyPage: React.FC = () => {
	const navigate = useNavigate();
	const [company, setCompany] = useState<CompanyDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Функция для получения корректного URL изображения
	const getImageUrl = (url: string): string => {
		return buildUrl(url);
	};

	// Форма для редактирования
	const [formData, setFormData] = useState<CreateCompanyDto>({
		name: '',
		text: '',
		email: '',
		phone: '',
		address: '',
		requisites: '',
		jobStartAndEndDate: '',
	});

	// Превью файла
	const [logoPreview, setLogoPreview] = useState<string>('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	useEffect(() => {
		const fetchCompany = async () => {
			try {
				const companyData = await ApiService.getCompany();
				setCompany(companyData);

				// Заполняем форму данными
				setFormData({
					name: companyData.name,
					text: companyData.text,
					email: companyData.email,
					phone: companyData.phone,
					address: companyData.address,
					requisites: companyData.requisites,
					jobStartAndEndDate: companyData.jobStartAndEndDate,
				});

				// Устанавливаем превью логотипа
				if (companyData.logoUrl) {
					setLogoPreview(getImageUrl(companyData.logoUrl));
				}
			} catch (err) {
				setError('Не удалось загрузить данные компании');
				console.error('Error fetching company:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchCompany();
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setLogoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			const submitData: CreateCompanyDto = {
				name: formData.name,
				text: formData.text,
				email: formData.email,
				phone: formData.phone,
				address: formData.address,
				requisites: formData.requisites,
				jobStartAndEndDate: formData.jobStartAndEndDate,
				logoUrl: selectedFile || undefined
			};

			await ApiService.editCompany(submitData);
			setSuccess('Данные компании успешно обновлены!');

			// Обновляем данные компании после сохранения
			const updatedCompany = await ApiService.getCompany();
			setCompany(updatedCompany);

			// Обновляем превью логотипа
			if (updatedCompany.logoUrl) {
				setLogoPreview(getImageUrl(updatedCompany.logoUrl));
			}
		} catch (err: any) {
			if (err.message === 'Требуется авторизация администратора') {
				setError('Требуется авторизация. Перенаправляем на страницу входа...');
				setTimeout(() => {
					window.location.href = '/admin/login';
				}, 2000);
			} else {
				setError('Ошибка при сохранении данных компании: ' + (err.response?.data?.message || err.message));
			}
			console.error('Error saving company:', err);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Загрузка данных компании...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navigation */}
			<AdminNavigation />
			{/* Header */}

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-4">
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">Редактирование компании</h1>
					<button
						onClick={() => navigate('/admin/dashboard')}
						className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors"
					>
						← Назад к панели управления
					</button>
				</div>
			</div>


			{/* Content */}
			<div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

				{/* Alerts */}
				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-800">{error}</p>
					</div>
				)}

				{success && (
					<div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
						<p className="text-green-800">{success}</p>
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="bg-white shadow rounded-lg p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-6">Основная информация</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label htmlFor="name" className="block text-sm font-medium text-gray-700">
									Название компании
								</label>
								<input
									type="text"
									id="name"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									required
									className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
								/>
							</div>

							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700">
									Email
								</label>
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									required
									className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
								/>
							</div>

							<div>
								<label htmlFor="phone" className="block text-sm font-medium text-gray-700">
									Телефон
								</label>
								<input
									type="tel"
									id="phone"
									name="phone"
									value={formData.phone}
									onChange={handleInputChange}
									required
									className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
								/>
							</div>

							<div>
								<label htmlFor="jobStartAndEndDate" className="block text-sm font-medium text-gray-700">
									Время работы
								</label>
								<input
									type="text"
									id="jobStartAndEndDate"
									name="jobStartAndEndDate"
									value={formData.jobStartAndEndDate}
									onChange={handleInputChange}
									placeholder="Пн-Пт: 9:00-18:00"
									className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
								/>
							</div>
						</div>

						<div className="mt-6">
							<label htmlFor="text" className="block text-sm font-medium text-gray-700">
								Описание компании
							</label>
							<textarea
								id="text"
								name="text"
								value={formData.text}
								onChange={handleInputChange}
								rows={10}
								required
								className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
							/>
						</div>

						<div className="mt-6">
							<label htmlFor="address" className="block text-sm font-medium text-gray-700">
								Адрес
							</label>
							<input
								type="text"
								id="address"
								name="address"
								value={formData.address}
								onChange={handleInputChange}
								required
								className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
							/>
						</div>

						<div className="mt-6">
							<label htmlFor="requisites" className="block text-sm font-medium text-gray-700">
								Реквизиты
							</label>
							<textarea
								id="requisites"
								name="requisites"
								value={formData.requisites}
								onChange={handleInputChange}
								rows={6}
								placeholder="ИП Иванов И.И.&#10;БИН: 123456789012&#10;ИИК: KZ123456789012345678&#10;Банк: АО «Народный банк»&#10;БИК: 191234567"
								className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
							/>
						</div>
					</div>

					{/* Logo Upload */}
					<div className="bg-white shadow rounded-lg p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-6">Логотип компании</h2>

						<div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
							<div className="flex-shrink-0 self-center sm:self-auto">
								{logoPreview ? (
									<img
										src={logoPreview}
										alt="Логотип"
										className="h-32 w-32 sm:h-40 sm:w-40 object-cover rounded-lg border"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.src = 'https://picsum.photos/80/80?error=logo-failed';
										}}
									/>
								) : (
									<div className="h-20 w-20 sm:h-32 sm:w-32 bg-gray-200 rounded-lg flex items-center justify-center">
										<svg className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
										</svg>
									</div>
								)}
							</div>

							<div className="flex-1 text-center sm:text-left">
								<label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
									Загрузить новый логотип
								</label>
								<input
									type="file"
									id="logoUrl"
									name="logoUrl"
									accept="image/*"
									onChange={handleFileChange}
									className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
								/>
								<p className="mt-2 text-sm text-gray-500">
									PNG, JPG, GIF до 10MB
								</p>
								<p className="mt-1 text-xs text-gray-400">
									Рекомендуемый размер: 200x200px
								</p>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:space-x-4 space-y-3 sm:space-y-0">
						<button
							type="button"
							onClick={() => navigate('/admin/dashboard')}
							className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
						>
							Отмена
						</button>
						<button
							type="submit"
							disabled={saving}
							className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
						>
							{saving ? 'Сохранение...' : 'Сохранить изменения'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AdminCompanyPage;
