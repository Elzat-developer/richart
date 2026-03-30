import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminApiService } from '../services/adminApi';
import { AdminNavigation } from '../components/AdminNavigation';
import { ImportReportDto, ImportHistoriesDto, ImportHistoryDto, ImportStatus, BackendCategoryDto } from '../types';
import {
	UploadIcon,
	FileSpreadsheetIcon,
	CheckCircleIcon,
	XCircleIcon,
	ExclamationTriangleIcon,
	ArrowLeftIcon,
	ClockIcon,
	PackageIcon,
	XIcon
} from '../components/Icons';

export const AdminImportPage: React.FC = () => {
	const { admin } = useAdminAuth();
	const [file, setFile] = useState<File | null>(null);
	const [importing, setImporting] = useState(false);
	const [importResult, setImportResult] = useState<ImportReportDto | null>(null);
	const [dragActive, setDragActive] = useState(false);

	// История импортов
	const [importHistories, setImportHistories] = useState<ImportHistoriesDto[]>([]);
	const [selectedHistory, setSelectedHistory] = useState<ImportHistoryDto | null>(null);
	const [showHistoryModal, setShowHistoryModal] = useState(false);
	const [loadingHistory, setLoadingHistory] = useState(false);
	const [activeTab, setActiveTab] = useState<'import' | 'history'>('import');

	// Категории для удобной выборки
	const [categories, setCategories] = useState<BackendCategoryDto[]>([]);
	const [selectedCategoryType, setSelectedCategoryType] = useState<'industrial' | 'household'>('industrial');
	const [showCategories, setShowCategories] = useState(false);

	// Загрузка истории импортов
	useEffect(() => {
		if (activeTab === 'history') {
			loadImportHistories();
		}
	}, [activeTab]);

	const loadImportHistories = async () => {
		setLoadingHistory(true);
		try {
			const histories = await AdminApiService.getImportHistories();
			setImportHistories(histories);
		} catch (error) {
			console.error('Error loading import histories:', error);
		} finally {
			setLoadingHistory(false);
		}
	};

	const handleHistoryClick = async (historyId: number) => {
		try {
			const history = await AdminApiService.getImportHistory(historyId);
			setSelectedHistory(history);
			setShowHistoryModal(true);
		} catch (error) {
			console.error('Error loading import history:', error);
		}
	};

	const handleDeleteHistory = async (historyId: number) => {
		if (!window.confirm('Вы уверены, что хотите удалить эту запись истории импорта?')) {
			return;
		}

		try {
			await AdminApiService.deleteImportHistory(historyId);
			// Обновляем список после удаления
			await loadImportHistories();
		} catch (error) {
			console.error('Error deleting import history:', error);
			alert('Ошибка при удалении записи истории');
		}
	};

	// Функции для работы с категориями
	const loadCategories = async (type: 'industrial' | 'household') => {
		try {
			const categoriesData = await AdminApiService.getCategories(type, true);
			setCategories(categoriesData);
		} catch (error) {
			console.error('Error loading categories:', error);
		}
	};

	const toggleCategories = () => {
		setShowCategories(!showCategories);
		if (!showCategories) {
			loadCategories(selectedCategoryType);
		}
	};

	const handleCategoryTypeChange = (type: 'industrial' | 'household') => {
		setSelectedCategoryType(type);
		loadCategories(type);
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
			handleFileSelect(e.dataTransfer.files[0]);
		}
	};

	const handleFileSelect = (selectedFile: File) => {
		// Проверяем формат файла - теперь принимаем только ZIP
		const allowedTypes = [
			'application/zip', // .zip
			'application/x-zip-compressed' // .zip (альтернативный MIME тип)
		];

		// Также проверяем расширение файла
		const fileName = selectedFile.name.toLowerCase();
		if (!fileName.endsWith('.zip')) {
			alert('Неверный формат файла. Ожидается .zip архив с Excel и папкой images');
			return;
		}

		if (!allowedTypes.includes(selectedFile.type) && !fileName.endsWith('.zip')) {
			alert('Неверный формат файла. Ожидается .zip архив с Excel и папкой images');
			return;
		}

		setFile(selectedFile);
		setImportResult(null);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			handleFileSelect(e.target.files[0]);
		}
	};

	const handleImport = async () => {
		if (!file) {
			alert('Архив не выбран или пуст');
			return;
		}

		setImporting(true);
		try {
			const result = await AdminApiService.importProductsFromZip(file);
			setImportResult(result);
			// Обновляем историю импортов после успешного импорта
			await loadImportHistories();
		} catch (error: any) {
			console.error('Import error:', error);
			const errorResult: ImportReportDto = {
				successCount: 0,
				errorCount: 1,
				errorMessages: [error.response?.data?.message || 'Ошибка при импорте ZIP архива']
			};
			setImportResult(errorResult);
		} finally {
			setImporting(false);
		}
	};

	const handleReset = () => {
		setFile(null);
		setImportResult(null);
	};

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Navigation */}
			<AdminNavigation />

			{/* Full-width blue background section */}
			<div className="bg-gradient-to-br from-blue-600 to-blue-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					{/* Page Header */}
					<div className="mb-6">
						<h1 className="text-xl sm:text-2xl font-bold text-white">📦 Управление импортом</h1>
						<p className="mt-2 text-blue-100 text-sm sm:text-base">
							{activeTab === 'import'
								? 'Загрузите ZIP архив, содержащий Excel-файл с данными и папку с фотографиями. Система автоматически создаст товары, сожмет изображения и заполнит все характеристики.'
								: 'Просмотрите историю всех импортов товаров с детальной информацией о результатах.'
							}
						</p>

						{/* Tab Switcher */}
						<div className="mt-6 border-b border-blue-500">
							<nav className="-mb-px flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
								<button
									onClick={() => setActiveTab('import')}
									className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'import'
										? 'border-white text-white'
										: 'border-transparent text-blue-200 hover:text-white hover:border-blue-400'
										}`}
								>
									📤 Импорт товаров
								</button>
								<button
									onClick={() => setActiveTab('history')}
									className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
										? 'border-white text-white'
										: 'border-transparent text-blue-200 hover:text-white hover:border-blue-400'
										}`}
								>
									📋 История импортов
								</button>
							</nav>
						</div>
					</div>
				</div>
			</div>

			{/* Content area with normal background */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

				{/* Import Tab Content */}
				{activeTab === 'import' && (
					<>
						{/* Instructions */}
						<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-6 mb-6 shadow-sm">
							<div className="flex flex-col sm:flex-row">
								<div className="flex-shrink-0 mb-3 sm:mb-0">
									<FileSpreadsheetIcon className="h-5 w-5 text-blue-400" />
								</div>
								<div className="sm:ml-3">
									<h3 className="text-sm font-medium text-blue-800">
										📂 Структура архива
									</h3>
									<div className="mt-2 text-sm text-blue-700">
										<div className="space-y-3">
											<div>
												<h4 className="font-semibold text-blue-900 mb-1">Ваш ZIP-файл должен выглядеть строго так:</h4>
												<div className="bg-blue-100 rounded p-2 font-mono text-xs">
													<div>products.zip</div>
													<div>├── products.xlsx (Файл с данными в корне архива)</div>
													<div>└── 📁 images/ (Папка с фото)</div>
													<div>&nbsp;&nbsp;&nbsp;&nbsp;├── photo1.jpg</div>
													<div>&nbsp;&nbsp;&nbsp;&nbsp;├── photo2.png</div>
													<div>&nbsp;&nbsp;&nbsp;&nbsp;└── ...</div>
												</div>

												{/* Фото-пример */}
												<div className="mt-4">
													<h5 className="font-semibold text-blue-900 mb-3">📸 Пример ZIP архива:</h5>
													<div className="bg-white border border-blue-300 rounded-xl p-6 shadow-sm">
														<div className="flex flex-col items-center space-y-4">
															{/* Визуализация структуры ZIP */}
															<div className="w-full max-w-md bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-6 shadow-inner">
																<div className="text-center font-mono font-bold text-gray-700 mb-4 text-lg">📦 products.zip</div>
																<div className="font-mono text-xs space-y-2">
																	<div className="bg-blue-50 p-3 rounded-lg border border-blue-200">├── 📄 products.xlsx</div>
																	<div className="bg-blue-50 p-3 rounded-lg border border-blue-200">└── 📁 images/</div>
																	<div className="ml-6 bg-green-50 p-3 rounded-lg border border-green-200">├── 🖼️ photo1.jpg</div>
																	<div className="ml-6 bg-green-50 p-3 rounded-lg border border-green-200">├── 🖼️ photo2.png</div>
																	<div className="ml-6 bg-green-50 p-3 rounded-lg border border-green-200">└── 🖼️ photo3.jpg</div>
																</div>
															</div>
															<p className="text-sm text-gray-600 mt-4 text-center font-medium">
																📦 ZIP архив должен содержать Excel файл и папку images с фотографиями
															</p>
															{/* Кнопка скачивания примера */}
															<div className="mt-6 text-center">
																<a
																	href="/zipFile/products.zip"
																	download="products-example.zip"
																	className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
																>
																	<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
																	</svg>
																	📥 Скачать пример ZIP архива
																</a>
																<p className="text-xs text-gray-500 mt-2">
																	Файл: products-example.zip (212 KB)
																</p>
															</div>
															{/* Кнопка скачивания Excel шаблона */}
															<div className="mt-3 text-center">
																<a
																	href="/zipFile/products.xlsx"
																	download="products-template.xlsx"
																	className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
																>
																	<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9 4h-6" />
																	</svg>
																	📊 Скачать Excel шаблон
																</a>
																<p className="text-xs text-gray-500 mt-1">
																	Шаблон с примерами данных (9.7 KB)
																</p>
															</div>
															{/* Инструкция по использованию */}
															<div className="mt-4 bg-green-50 border border-green-200 rounded p-3">
																<h6 className="text-sm font-medium text-green-800 mb-2">📋 Как использовать примеры:</h6>
																<ul className="text-xs text-green-700 space-y-1">
																	<li>1. 📥 Скачайте ZIP пример - готовый архив с товарами и фото</li>
																	<li>2. 📊 Скачайте Excel шаблон - файл с примерами данных</li>
																	<li>3. ✏️ Измените Excel файл под свои товары</li>
																	<li>4. 📁 Добавьте папку images с фотографиями</li>
																	<li>5. 📦 Создайте ZIP архив и загрузите на сайт</li>
																</ul>
															</div>
														</div>
													</div>
												</div>
											</div>

											<div>
												<h4 className="font-semibold text-blue-900 mb-1">📊 Структура Excel файла (Порядок колонок)</h4>
												<p className="text-xs text-blue-600 mb-2">Таблица стала больше. Убедитесь, что данные находятся в правильных столбцах:</p>
												<div className="bg-white border border-blue-200 rounded p-2 text-xs overflow-x-auto">
													<table className="w-full">
														<thead>
															<tr className="bg-blue-50">
																<th className="border border-blue-200 px-1 py-1">Колонка</th>
																<th className="border border-blue-200 px-1 py-1">Заголовок</th>
																<th className="border border-blue-200 px-1 py-1">Описание / Пример</th>
															</tr>
														</thead>
														<tbody>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">A (0)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Наименование</td><td className="border border-blue-200 px-1 py-1">Стул "Лофт"</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">B (1)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Артикул</td><td className="border border-blue-200 px-1 py-1">LF-001</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">C (2)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Цена</td><td className="border border-blue-200 px-1 py-1">15000</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">D (3)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Материал</td><td className="border border-blue-200 px-1 py-1">Дуб, Сталь</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">E (4)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Размеры (текст)</td><td className="border border-blue-200 px-1 py-1">50x50x90 см</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">F (5)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Вес (кг)</td><td className="border border-blue-200 px-1 py-1">7.5</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">G (6)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Количество</td><td className="border border-blue-200 px-1 py-1">20</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">H (7)</td><td className="border border-blue-200 px-1 py-1 font-semibold">ID Категории</td><td className="border border-blue-200 px-1 py-1">5 (число из раздела "Категории")</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">I (8)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Фотографии</td><td className="border border-blue-200 px-1 py-1">image1.jpg, image2.jpg (через запятую)</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">J (9)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Описание</td><td className="border border-blue-200 px-1 py-1">Полное описание товара</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">K (10)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Ширина (мм)</td><td className="border border-blue-200 px-1 py-1">500 (только число)</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">L (11)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Глубина (мм)</td><td className="border border-blue-200 px-1 py-1">500 (только число)</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">M (12)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Высота (мм)</td><td className="border border-blue-200 px-1 py-1">900 (только число)</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">N (13)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Мощность</td><td className="border border-blue-200 px-1 py-1">1.5 кВт / 1500 ккал</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">O (14)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Напряжение</td><td className="border border-blue-200 px-1 py-1">220В / 380В</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">P (15)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Страна</td><td className="border border-blue-200 px-1 py-1">Италия</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">Q (16)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Тип продукта</td><td className="border border-blue-200 px-1 py-1">industrial (пром) или household (бытовой)</td></tr>
															<tr><td className="border border-blue-200 px-1 py-1 font-semibold">R+ (17+)</td><td className="border border-blue-200 px-1 py-1 font-semibold">Спец: [Имя]</td><td className="border border-blue-200 px-1 py-1">См. раздел "Динамические характеристики" ниже</td></tr>
														</tbody>
													</table>
												</div>

												{/* Фото-пример Excel таблицы */}
												<div className="mt-4">
													<h5 className="font-semibold text-blue-900 mb-2">📸 Пример Excel файла:</h5>
													<div className="bg-white border border-blue-300 rounded-lg p-4">
														<div className="flex flex-col items-center space-y-3">
															{/* Визуализация Excel таблицы */}
															<div className="w-full max-w-md">
																<div className="bg-blue-600 text-white p-2 rounded-t text-center font-bold text-sm">products.xlsx</div>
																<div className="border border-gray-300">
																	<div className="grid grid-cols-6 bg-gray-100 text-xs font-bold">
																		<div className="border border-gray-300 p-1 text-center">A</div>
																		<div className="border border-gray-300 p-1 text-center">B</div>
																		<div className="border border-gray-300 p-1 text-center">C</div>
																		<div className="border border-gray-300 p-1 text-center">D</div>
																		<div className="border border-gray-300 p-1 text-center">E</div>
																		<div className="border border-gray-300 p-1 text-center">F</div>
																	</div>
																	<div className="grid grid-cols-6 text-xs">
																		<div className="border border-gray-300 p-1 text-center">Наименование</div>
																		<div className="border border-gray-300 p-1 text-center">Артикул</div>
																		<div className="border border-gray-300 p-1 text-center">Цена</div>
																		<div className="border border-gray-300 p-1 text-center">Материал</div>
																		<div className="border border-gray-300 p-1 text-center">Размеры</div>
																		<div className="border border-gray-300 p-1 text-center">Вес</div>
																	</div>
																	<div className="grid grid-cols-6 text-xs bg-blue-50">
																		<div className="border border-gray-300 p-1">Стул "Лофт"</div>
																		<div className="border border-gray-300 p-1">LF-001</div>
																		<div className="border border-gray-300 p-1">15000</div>
																		<div className="border border-gray-300 p-1">Дуб, Сталь</div>
																		<div className="border border-gray-300 p-1">50x50x90</div>
																		<div className="border border-gray-300 p-1">7.5</div>
																	</div>
																</div>
															</div>
															<p className="text-xs text-gray-600 mt-2 text-center">
																📊 Excel файл должен содержать все колонки в правильном порядке
															</p>
														</div>
													</div>
												</div>
											</div>

											<div>
												<h4 className="font-semibold text-blue-900 mb-1">⚡ Динамические характеристики (Столбцы 17 и далее)</h4>
												<p className="text-xs text-blue-600">Вы можете добавлять любые дополнительные поля, не меняя код системы.</p>
												<p className="text-xs text-blue-600">Заголовок колонки обязательно должен начинаться с префикса Спец: .</p>
												<p className="text-xs text-blue-600">Всё, что идет после двоеточия, станет названием характеристики в карточке товара.</p>
												<div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
													<p className="text-xs"><strong>Пример:</strong> Заголовок: Спец: Температурный режим → Значение: -5...+10°C</p>
													<p className="text-xs"><strong>Пример:</strong> Заголовок: Спец: Объем камеры → Значение: 100 л</p>
												</div>
											</div>

											<div>
												<h4 className="font-semibold text-blue-900 mb-1">⚠️ Важные правила</h4>
												<ul className="list-disc list-inside space-y-1 text-xs">
													<li><strong>Тип продукта (Колонка Q):</strong> Используйте только слова industrial (или промышленный) и household (или бытовой).</li>
													<li><strong>Габариты (K, L, M):</strong> Вводите только целые числа (миллиметры).</li>
													<li><strong>Фотографии:</strong> Имена файлов в колонке I должны в точности совпадать с именами файлов внутри папки images/.</li>
													<li><strong>ID Категории:</strong> Посмотрите ID в разделе "Категории" вашей админки. Если ID указан неверно, строка не будет импортирована.</li>
													<li><strong>Формат чисел:</strong> В колонках Цена, Вес, Кол-во и Габариты не должно быть текста (только цифры).</li>
												</ul>
											</div>

											<div>
												<h4 className="font-semibold text-blue-900 mb-1">🔍 Пример заполнения (Строка 17+)</h4>
												<div className="bg-yellow-50 border border-yellow-200 rounded p-2">
													<table className="text-xs">
														<tr><td className="font-semibold pr-2">Спец: Количество зон</td><td>2</td></tr>
														<tr><td className="font-semibold pr-2">Спец: Тип фреона</td><td>R290</td></tr>
														<tr><td className="font-semibold pr-2">Спец: Цвет</td><td>Черный антрацит</td></tr>
													</table>
												</div>

												{/* Фото-пример папки с фотографиями */}
												<div className="mt-4">
													<h5 className="font-semibold text-blue-900 mb-2">📸 Пример папки с фотографиями:</h5>
													<div className="bg-white border border-blue-300 rounded-lg p-4">
														<div className="flex flex-col items-center space-y-3">
															{/* Визуализация папки с фото */}
															<div className="w-full max-w-md">
																<div className="bg-blue-600 text-white p-2 rounded-t text-center font-bold text-sm">📁 images</div>
																<div className="border border-gray-300 bg-gray-50 p-3">
																	<div className="grid grid-cols-2 gap-2 text-xs">
																		<div className="bg-white p-2 rounded border border-gray-200 text-center">
																			<div className="text-2xl mb-1">🖼️</div>
																			<div>photo1.jpg</div>
																		</div>
																		<div className="bg-white p-2 rounded border border-gray-200 text-center">
																			<div className="text-2xl mb-1">🖼️</div>
																			<div>photo2.png</div>
																		</div>
																		<div className="bg-white p-2 rounded border border-gray-200 text-center">
																			<div className="text-2xl mb-1">🖼️</div>
																			<div>photo3.jpg</div>
																		</div>
																		<div className="bg-white p-2 rounded border border-gray-200 text-center">
																			<div className="text-2xl mb-1">🖼️</div>
																			<div>photo4.png</div>
																		</div>
																	</div>
																	<div className="mt-3 text-center text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
																		📸 4 файла • 📊 Всего 2.5 MB
																	</div>
																</div>
															</div>
															<p className="text-xs text-gray-600 mt-2 text-center">
																📁 Папка images должна содержать все фотографии из колонки I
															</p>
														</div>
													</div>
												</div>
											</div>

											<div>
												<h4 className="font-semibold text-blue-900 mb-1">📍 Где найти ID категорий:</h4>

												{/* Удобная выборка категорий */}
												<div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
													<div className="flex items-center justify-between mb-2">
														<h5 className="text-sm font-medium text-green-800">📋 Быстрая выборка категорий</h5>
														<button
															onClick={toggleCategories}
															className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
														>
															{showCategories ? 'Скрыть' : 'Показать'}
														</button>
													</div>

													{showCategories && (
														<div className="space-y-2">
															{/* Переключатель типа категорий */}
															<div className="flex space-x-2 mb-2">
																<button
																	onClick={() => handleCategoryTypeChange('industrial')}
																	className={`px-3 py-1 text-xs rounded ${selectedCategoryType === 'industrial'
																		? 'bg-blue-600 text-white'
																		: 'bg-gray-200 text-gray-700'
																		}`}
																>
																	🏭 Промышленные
																</button>
																<button
																	onClick={() => handleCategoryTypeChange('household')}
																	className={`px-3 py-1 text-xs rounded ${selectedCategoryType === 'household'
																		? 'bg-blue-600 text-white'
																		: 'bg-gray-200 text-gray-700'
																		}`}
																>
																	🏠 Бытовые
																</button>
															</div>

															{/* Список категорий */}
															<div className="max-h-40 overflow-y-auto bg-white rounded border border-green-300">
																{categories.length > 0 ? (
																	<table className="w-full text-xs">
																		<thead>
																			<tr className="bg-green-100">
																				<th className="border border-green-300 px-2 py-1 text-left">ID</th>
																				<th className="border border-green-300 px-2 py-1 text-left">Название категории</th>
																			</tr>
																		</thead>
																		<tbody>
																			{categories.map((category) => (
																				<tr key={category.categoryId} className="hover:bg-green-50">
																					<td className="border border-green-300 px-2 py-1 font-mono text-green-700 font-bold">
																						{category.categoryId}
																					</td>
																					<td className="border border-green-300 px-2 py-1">
																						{category.categoryName}
																					</td>
																				</tr>
																			))}
																		</tbody>
																	</table>
																) : (
																	<div className="text-center py-4 text-gray-500 text-xs">
																		Загрузка категорий...
																	</div>
																)}
															</div>
														</div>
													)}

													<div className="mt-2 text-xs text-green-700">
														💡 <strong>Используйте ID из таблицы выше</strong> в колонке H вашей Excel таблицы
													</div>
												</div>

												{/* Старая инструкция как резерв */}
												<div className="bg-yellow-50 border border-yellow-200 rounded p-2">
													<p className="text-xs text-yellow-800">
														<strong>Или вручную:</strong> Админка → Категории → найти ID в карточке категории
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Important Warning */}
						<div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-6">
							<div className="flex flex-col sm:flex-row">
								<div className="flex-shrink-0 mb-3 sm:mb-0">
									<XCircleIcon className="h-5 w-5 text-red-400" />
								</div>
								<div className="sm:ml-3">
									<h3 className="text-sm font-medium text-red-800">
										⚠️ Внимание: Строгое соответствие структуре обязательно!
									</h3>
									<div className="mt-2 text-sm text-red-700">
										<p>Несоблюдение порядка колонок или имен файлов приведет к ошибкам импорта. Внимательно изучите инструкцию выше.</p>
									</div>
								</div>
							</div>
						</div>

						{/* Upload Area */}
						<div className="bg-white shadow overflow-hidden sm:rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								{!importResult ? (
									<div>
										<div
											className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center ${dragActive
												? 'border-industrial-accent bg-industrial-accent/5'
												: 'border-gray-300'
												}`}
											onDragEnter={handleDrag}
											onDragLeave={handleDrag}
											onDragOver={handleDrag}
											onDrop={handleDrop}
										>
											<input
												type="file"
												accept=".zip"
												onChange={handleFileChange}
												className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
											/>

											<div className="space-y-3 sm:space-y-4">
												<div className="mx-auto h-12 w-12 text-gray-400">
													<FileSpreadsheetIcon className="h-full w-full" />
												</div>

												<div>
													<p className="text-base sm:text-lg font-medium text-gray-900">
														{file ? file.name : 'Перетащите ZIP архив сюда или нажмите для выбора'}
													</p>
													<p className="text-xs sm:text-sm text-gray-500">
														Поддерживаются ZIP архивы до 50MB
													</p>
												</div>
											</div>
										</div>

										{file && (
											<div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:space-x-4">
												<button
													onClick={handleImport}
													disabled={importing}
													className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed"
												>
													{importing ? (
														<>
															<div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
															Обработка ZIP архива...
														</>
													) : (
														<>
															<UploadIcon className="h-4 w-4 mr-2" />
															Импортировать товары из ZIP
														</>
													)}
												</button>

												<button
													onClick={handleReset}
													className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent"
												>
													Сбросить
												</button>
											</div>
										)}
									</div>
								) : (
									<div>
										{/* Results */}
										<div className="space-y-6">
											<div className="text-center">
												<h3 className="text-lg font-medium text-gray-900 mb-4">Результаты импорта</h3>

												<div className="flex justify-center space-x-8 mb-6">
													<div className="text-center">
														<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
															<CheckCircleIcon className={`h-8 w-8 ${importResult.successCount > 0 ? 'text-green-600' : 'text-gray-400'
																}`} />
														</div>
														<p className="mt-2 text-2xl font-bold text-gray-900">{importResult.successCount}</p>
														<p className="text-sm text-gray-500">Успешно импортировано</p>
													</div>

													{importResult.errorCount > 0 && (
														<div className="text-center">
															<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
																<XCircleIcon className="h-8 w-8 text-red-600" />
															</div>
															<p className="mt-2 text-2xl font-bold text-gray-900">{importResult.errorCount}</p>
															<p className="text-sm text-gray-500">Ошибок</p>
														</div>
													)}
												</div>
											</div>

											{importResult.errorMessages.length > 0 && (
												<div className="bg-red-50 border border-red-200 rounded-lg p-4">
													<h4 className="text-sm font-medium text-red-800 mb-2">Ошибки импорта:</h4>
													<ul className="text-sm text-red-700 space-y-1">
														{importResult.errorMessages.map((error, index) => (
															<li key={index}>• {error}</li>
														))}
													</ul>
												</div>
											)}

											<div className="flex justify-center space-x-4">
												<Link
													to="/admin/products"
													className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent"
												>
													Перейти к товарам
												</Link>

												<button
													onClick={() => setActiveTab('history')}
													className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
												>
													<PackageIcon className="h-4 w-4 mr-2" />
													Перейти в историю импортов
												</button>

												<button
													onClick={handleReset}
													className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent"
												>
													Импортировать еще один архив
												</button>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</>
				)
				}

				{/* History Tab Content */}
				{
					activeTab === 'history' && (
						<div className="bg-white shadow overflow-hidden sm:rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-medium text-gray-900">📋 История импортов</h3>
									<button
										onClick={loadImportHistories}
										disabled={loadingHistory}
										className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
									>
										{loadingHistory ? (
											<div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-industrial-accent rounded-full mr-2"></div>
										) : (
											<PackageIcon className="h-4 w-4 mr-2" />
										)}
										Обновить
									</button>
								</div>

								{loadingHistory && importHistories.length === 0 ? (
									<div className="text-center py-8">
										<div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-industrial-accent rounded-full mx-auto mb-4"></div>
										<p className="text-gray-500">Загрузка истории...</p>
									</div>
								) : importHistories.length === 0 ? (
									<div className="text-center py-8">
										<PackageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
										<p className="text-gray-500">История импортов пуста</p>
									</div>
								) : (
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Файл</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{importHistories.map((history) => (
													<tr key={history.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleHistoryClick(history.id)}>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{history.id}</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{history.fileName}</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${history.importStatus === ImportStatus.SUCCESS
																? 'bg-green-100 text-green-800'
																: history.importStatus === ImportStatus.FAILED
																	? 'bg-red-100 text-red-800'
																	: history.importStatus === ImportStatus.PARTIAL
																		? 'bg-yellow-100 text-yellow-800'
																		: 'bg-blue-100 text-blue-800'
																}`}>
																{history.importStatus === ImportStatus.SUCCESS && <CheckCircleIcon className="h-3 w-3 mr-1" />}
																{history.importStatus === ImportStatus.FAILED && <XCircleIcon className="h-3 w-3 mr-1" />}
																{history.importStatus === ImportStatus.PARTIAL && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
																{history.importStatus === ImportStatus.SUCCESS ? 'Успешно' :
																	history.importStatus === ImportStatus.FAILED ? 'Ошибка' :
																		history.importStatus === ImportStatus.PARTIAL ? 'Частично' : 'В процессе'}
															</span>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{new Date(history.createdAt).toLocaleString('ru-RU')}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	handleHistoryClick(history.id);
																}}
																className="text-industrial-accent hover:text-orange-700"
															>
																Подробнее
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	handleDeleteHistory(history.id);
																}}
																className="text-red-600 hover:text-red-800 inline-flex items-center"
															>
																<XIcon className="h-4 w-4 mr-1" />
																Удалить
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</div>
					)
				}

				{/* History Detail Modal */}
				{
					showHistoryModal && selectedHistory && (
						<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
							<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-medium text-gray-900">Детали импорта #{selectedHistory.id}</h3>
									<button
										onClick={() => setShowHistoryModal(false)}
										className="text-gray-400 hover:text-gray-600"
									>
										<XIcon className="h-6 w-6" />
									</button>
								</div>

								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500">Файл</p>
											<p className="font-medium">{selectedHistory.fileName}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Статус</p>
											<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedHistory.importStatus === ImportStatus.SUCCESS
												? 'bg-green-100 text-green-800'
												: selectedHistory.importStatus === ImportStatus.FAILED
													? 'bg-red-100 text-red-800'
													: selectedHistory.importStatus === ImportStatus.PARTIAL
														? 'bg-yellow-100 text-yellow-800'
														: 'bg-blue-100 text-blue-800'
												}`}>
												{selectedHistory.importStatus === ImportStatus.SUCCESS && <CheckCircleIcon className="h-3 w-3 mr-1" />}
												{selectedHistory.importStatus === ImportStatus.FAILED && <XCircleIcon className="h-3 w-3 mr-1" />}
												{selectedHistory.importStatus === ImportStatus.PARTIAL && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
												{selectedHistory.importStatus === ImportStatus.SUCCESS ? 'Успешно' :
													selectedHistory.importStatus === ImportStatus.FAILED ? 'Ошибка' :
														selectedHistory.importStatus === ImportStatus.PARTIAL ? 'Частично' : 'В процессе'}
											</span>
										</div>
										<div>
											<p className="text-sm text-gray-500">Успешно</p>
											<p className="font-medium text-green-600">{selectedHistory.successCount}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Ошибок</p>
											<p className="font-medium text-red-600">{selectedHistory.errorCount}</p>
										</div>
									</div>

									<div>
										<p className="text-sm text-gray-500 mb-2">Дата импорта</p>
										<p className="font-medium">{new Date(selectedHistory.createdAt).toLocaleString('ru-RU')}</p>
									</div>

									{selectedHistory.errorsLog && (
										<div>
											<p className="text-sm text-gray-500 mb-2">Лог ошибок</p>
											<div className="bg-red-50 border border-red-200 rounded p-3 max-h-40 overflow-y-auto">
												<pre className="text-xs text-red-700 whitespace-pre-wrap">{selectedHistory.errorsLog}</pre>
											</div>
										</div>
									)}
								</div>

								<div className="mt-6 flex justify-end">
									<button
										onClick={() => setShowHistoryModal(false)}
										className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
									>
										Закрыть
									</button>
								</div>
							</div>
						</div>
					)
				}
			</div >
		</div >
	);
};
