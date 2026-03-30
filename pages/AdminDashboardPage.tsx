import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminApiService } from '../services/adminApi';
import { UserApiService } from '../services/userApi';
import { GetProductsDto, BackendCategoryDto } from '../types';
import { AdminNavigation } from '../components/AdminNavigation';
import {
	PackageIcon,
	CategoryIcon,
	FileSpreadsheetIcon,
	UploadIcon,
	ChevronRightIcon,
	TagIcon,
	FileTextIcon,
	ShoppingBagIcon,
	UserIcon
} from '../components/Icons';

export const AdminDashboardPage: React.FC = () => {
	const { admin, logout } = useAdminAuth();
	const [products, setProducts] = useState<GetProductsDto[]>([]);
	const [categories, setCategories] = useState<BackendCategoryDto[]>([]);
	const [techSpecs, setTechSpecs] = useState<any[]>([]);
	const [promotions, setPromotions] = useState<any[]>([]);
	const [news, setNews] = useState<any[]>([]);
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		totalProducts: 0,
		totalCategories: 0,
		totalTechSpecs: 0,
		totalPromotions: 0,
		totalNews: 0,
		totalOrders: 0,
		paidOrders: 0,
		unpaidOrders: 0,
		recentOrders: 0,
		activePromotions: 0
	});

	useEffect(() => {
		const loadData = async () => {
			try {
				console.log('Loading dashboard data...');

				// Загружаем данные по отдельности с обработкой ошибок
				let productsData = [];
				let categoriesData = [];
				let techSpecsData = [];
				let promotionsData = [];
				let newsData = [];
				let ordersData = [];

				try {
					productsData = await AdminApiService.getProducts();
					console.log('✅ Products loaded:', productsData.length);
				} catch (error) {
					console.error('❌ Error loading products:', error);
				}

				try {
					categoriesData = await AdminApiService.getCategories();
					console.log('✅ Categories loaded:', categoriesData.length);
				} catch (error) {
					console.error('❌ Error loading categories:', error);
				}

				try {
					techSpecsData = await AdminApiService.getTechSpecs();
					console.log('✅ Tech specs loaded:', techSpecsData.length);
				} catch (error) {
					console.error('❌ Error loading tech specs:', error);
				}

				try {
					promotionsData = await UserApiService.getPromotions();
					console.log('✅ Promotions loaded:', promotionsData.length);
				} catch (error) {
					console.error('❌ Error loading promotions:', error);
				}

				try {
					newsData = await UserApiService.getNews();
					console.log('✅ News loaded:', newsData.length);
				} catch (error) {
					console.error('❌ Error loading news:', error);
				}

				try {
					ordersData = await AdminApiService.getOrders();
					console.log('✅ Orders loaded:', ordersData.length);
				} catch (error) {
					console.error('❌ Error loading orders:', error);
				}

				console.log('📊 Dashboard data summary:', {
					products: productsData.length,
					categories: categoriesData.length,
					techSpecs: techSpecsData.length,
					promotions: promotionsData.length,
					news: newsData.length,
					orders: ordersData.length
				});

				setProducts(productsData);
				setCategories(categoriesData);
				setTechSpecs(techSpecsData);
				setPromotions(promotionsData);
				setNews(newsData);
				setOrders(ordersData);

				// Расчет дополнительной статистики
				const paidOrders = ordersData.filter(order => order.paidStatus === 'PAID').length;
				const unpaidOrders = ordersData.filter(order => order.paidStatus === 'NOTPAY').length;
				const recentOrders = ordersData.filter(order => {
					const orderDate = new Date(order.orderDate);
					const weekAgo = new Date();
					weekAgo.setDate(weekAgo.getDate() - 7);
					return orderDate >= weekAgo;
				}).length;

				setStats({
					totalProducts: productsData.length,
					totalCategories: categoriesData.length,
					totalTechSpecs: techSpecsData.length,
					totalPromotions: promotionsData.length,
					totalNews: newsData.length,
					totalOrders: ordersData.length,
					paidOrders,
					unpaidOrders,
					recentOrders,
					activePromotions: promotionsData.length
				});
			} catch (error) {
				console.error('❌ Error loading admin dashboard:', error);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

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
			{/* Navigation */}
			<AdminNavigation />

			<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Добро пожаловать в CRM систему</h1>
								<p className="text-gray-600 mt-1">Управление вашим бизнесом эффективно и удобно</p>
							</div>
							<div className="text-right">
								<p className="text-sm text-gray-500">Текущая дата</p>
								<p className="text-lg font-semibold text-gray-900">
									{new Date().toLocaleDateString('ru-RU', {
										day: 'numeric',
										month: 'long',
										year: 'numeric'
									})}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="bg-white shadow rounded-lg mb-8">
					<div className="px-4 py-5 sm:p-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<Link
								to="/admin/products/new"
								className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors"
							>
								<PackageIcon className="h-4 w-4 mr-2" />
								Добавить товар
							</Link>

							<Link
								to="/admin/categories?create=true"
								className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 transition-colors"
							>
								<CategoryIcon className="h-4 w-4 mr-2" />
								Добавить категорию
							</Link>

							<Link
								to="/admin/import"
								className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
							>
								<UploadIcon className="h-4 w-4 mr-2" />
								Импорт ZIP
							</Link>

							<Link
								to="/admin/orders"
								className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
							>
								<ShoppingBagIcon className="h-4 w-4 mr-2" />
								Все заказы
							</Link>
						</div>
					</div>
				</div>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{/* Total Products */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-3 bg-blue-100 rounded-lg">
								<PackageIcon className="h-6 w-6 text-blue-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Всего товаров</p>
								<p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
							</div>
						</div>
					</div>

					{/* Total Orders */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-3 bg-green-100 rounded-lg">
								<ShoppingBagIcon className="h-6 w-6 text-green-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Всего заказов</p>
								<p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
								<p className="text-xs text-gray-500">
									{stats.recentOrders} за неделю
								</p>
							</div>
						</div>
					</div>

					{/* Paid Orders */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-3 bg-emerald-100 rounded-lg">
								<TagIcon className="h-6 w-6 text-emerald-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Оплаченные</p>
								<p className="text-2xl font-bold text-emerald-600">{stats.paidOrders}</p>
								<p className="text-xs text-gray-500">
									{stats.totalOrders > 0 ? Math.round((stats.paidOrders / stats.totalOrders) * 100) : 0}% от всех
								</p>
							</div>
						</div>
					</div>

					{/* Unpaid Orders */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-3 bg-red-100 rounded-lg">
								<FileTextIcon className="h-6 w-6 text-red-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Неоплаченные</p>
								<p className="text-2xl font-bold text-red-600">{stats.unpaidOrders}</p>
								<p className="text-xs text-gray-500">
									{stats.totalOrders > 0 ? Math.round((stats.unpaidOrders / stats.totalOrders) * 100) : 0}% от всех
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Content Management Cards */}
				<div className="mb-8">
					<h2 className="text-xl font-bold text-gray-900 mb-4">Управление контентом</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{/* Products Card */}
						<Link
							to="/admin/products"
							className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden h-full flex flex-col"
						>
							<div className="p-6 flex-1 flex flex-col">
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-industrial-100 rounded-lg group-hover:bg-industrial-200 transition-colors">
										<PackageIcon className="h-8 w-8 text-industrial-accent" />
									</div>
									<ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-industrial-accent transition-colors" />
								</div>

								<h3 className="text-xl font-bold text-gray-900 mb-2">Товары</h3>
								<p className="text-gray-600 text-sm mb-4 flex-1">
									Управление фильтрация товаров, импорт Zip
								</p>

								<div className="flex items-center justify-between">
									<span className="text-2xl font-bold text-industrial-accent">
										{stats.totalProducts}
									</span>
									<span className="text-sm text-gray-500">
										Всего товаров
									</span>
								</div>
							</div>
						</Link>

						{/* Categories Card */}
						<Link
							to="/admin/categories"
							className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden h-full flex flex-col"
						>
							<div className="p-6 flex-1 flex flex-col">
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-industrial-100 rounded-lg group-hover:bg-industrial-200 transition-colors">
										<CategoryIcon className="h-8 w-8 text-industrial-accent" />
									</div>
									<ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-industrial-accent transition-colors" />
								</div>

								<h3 className="text-xl font-bold text-gray-900 mb-2">Категории</h3>
								<p className="text-gray-600 text-sm mb-4 flex-1">
									Создание и управление категориями
								</p>

								<div className="flex items-center justify-between">
									<span className="text-2xl font-bold text-industrial-accent">
										{stats.totalCategories}
									</span>
									<span className="text-sm text-gray-500">
										Всего категорий
									</span>
								</div>
							</div>
						</Link>

						{/* Promotions Card */}
						<Link
							to="/admin/promotions"
							className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden h-full flex flex-col"
						>
							<div className="p-6 flex-1 flex flex-col">
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-industrial-100 rounded-lg group-hover:bg-industrial-200 transition-colors">
										<TagIcon className="h-8 w-8 text-industrial-accent" />
									</div>
									<ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-industrial-accent transition-colors" />
								</div>

								<h3 className="text-xl font-bold text-gray-900 mb-2">Акции</h3>
								<p className="text-gray-600 text-sm mb-4 flex-1">
									Управление промо акциями и скидками
								</p>

								<div className="flex items-center justify-between">
									<span className="text-2xl font-bold text-industrial-accent">
										{stats.totalPromotions}
									</span>
									<span className="text-sm text-gray-500">
										Всего акций
									</span>
								</div>
							</div>
						</Link>

						{/* News Card */}
						<Link
							to="/admin/news"
							className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden h-full flex flex-col"
						>
							<div className="p-6 flex-1 flex flex-col">
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-industrial-100 rounded-lg group-hover:bg-industrial-200 transition-colors">
										<FileTextIcon className="h-8 w-8 text-industrial-accent" />
									</div>
									<ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-industrial-accent transition-colors" />
								</div>

								<h3 className="text-xl font-bold text-gray-900 mb-2">Новости</h3>
								<p className="text-gray-600 text-sm mb-4 flex-1">
									Управление новостями и статьями
								</p>

								<div className="flex items-center justify-between">
									<span className="text-2xl font-bold text-industrial-accent">
										{stats.totalNews}
									</span>
									<span className="text-sm text-gray-500">
										Всего новостей
									</span>
								</div>
							</div>
						</Link>
					</div>
				</div>

				{/* Technical and Orders Management */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					{/* Tech Specs */}
					<Link
						to="/admin/tech-specs"
						className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden"
					>
						<div className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="p-3 bg-industrial-100 rounded-lg group-hover:bg-industrial-200 transition-colors">
									<FileSpreadsheetIcon className="h-8 w-8 text-industrial-accent" />
								</div>
								<ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-industrial-accent transition-colors" />
							</div>

							<h3 className="text-xl font-bold text-gray-900 mb-2">Технические спецификации</h3>
							<p className="text-gray-600 text-sm mb-4">
								Загрузка и управление технической документацией
							</p>

							<div className="flex items-center justify-between">
								<span className="text-2xl font-bold text-industrial-accent">
									{stats.totalTechSpecs}
								</span>
								<span className="text-sm text-gray-500">
									Всего спецификаций
								</span>
							</div>
						</div>
					</Link>

					{/* Orders */}
					<Link
						to="/admin/orders"
						className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden"
					>
						<div className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
									<ShoppingBagIcon className="h-8 w-8 text-purple-600" />
								</div>
								<ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
							</div>

							<h3 className="text-xl font-bold text-gray-900 mb-2">Заказы</h3>
							<p className="text-gray-600 text-sm mb-4">
								Управление заказами и статусами оплаты
							</p>

							<div className="flex items-center justify-between">
								<span className="text-2xl font-bold text-purple-600">
									{stats.totalOrders}
								</span>
								<span className="text-sm text-gray-500">
									Всего заказов
								</span>
							</div>
						</div>
					</Link>
				</div>

				{/* Footer Section */}
				<div className="mt-12 mb-8">
					<div className="bg-gradient-to-r from-industrial-900 to-industrial-accent rounded-lg shadow-lg p-8 text-center">
						<h2 className="text-2xl font-bold text-white mb-2">Admin Panel</h2>
						<p className="text-lg text-gray-200">управление над User Panel</p>
						<div className="mt-4 flex justify-center space-x-4">
							<div className="flex items-center text-white">
								<UserIcon className="h-5 w-5 mr-2" />
								<span>Полный контроль</span>
							</div>
							<div className="flex items-center text-white">
								<PackageIcon className="h-5 w-5 mr-2" />
								<span>Управление контентом</span>
							</div>
							<div className="flex items-center text-white">
								<ShoppingBagIcon className="h-5 w-5 mr-2" />
								<span>Контроль заказов</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
