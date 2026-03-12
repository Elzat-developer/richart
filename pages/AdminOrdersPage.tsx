import React, { useState, useEffect } from 'react';
import { buildUrl } from '../config/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminApiService } from '../services/adminApi';
import { UserApiService } from '../services/userApi';
import { GetOrdersDto, OrderDetailsDto, OrderHistoryUserDto } from '../types';
import { AdminNavigation } from '../components/AdminNavigation';
import {
	CheckIcon,
	XIcon,
	TrashIcon,
	ShoppingBagIcon,
	CurrencyDollarIcon,
	UserIcon,
	PhoneIcon,
	CalendarIcon,
	TagIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	EditIcon
} from '../components/Icons';

export const AdminOrdersPage: React.FC = () => {
	const { admin } = useAdminAuth();
	const [orders, setOrders] = useState<GetOrdersDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(15);

	const [showDetailModal, setShowDetailModal] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<OrderDetailsDto | null>(null);
	const [loadingDetail, setLoadingDetail] = useState(false);

	// Состояния для модального окна истории заказов клиента
	const [showCustomerOrdersModal, setShowCustomerOrdersModal] = useState(false);
	const [customerOrders, setCustomerOrders] = useState<OrderHistoryUserDto[]>([]);
	const [loadingCustomerOrders, setLoadingCustomerOrders] = useState(false);
	const [selectedCustomerInfo, setSelectedCustomerInfo] = useState<{ name: string, phone: string } | null>(null);

	// Состояния для поиска по телефону клиента
	const [searchMode, setSearchMode] = useState<'all' | 'customer'>('all');
	const [customerPhone, setCustomerPhone] = useState('');
	const [customerOrdersSearch, setCustomerOrdersSearch] = useState<OrderHistoryUserDto[]>([]);
	const [loadingCustomerSearch, setLoadingCustomerSearch] = useState(false);

	useEffect(() => {
		loadOrders();
	}, []);

	const loadOrders = async () => {
		try {
			setLoading(true);
			const data = await AdminApiService.getOrders();
			setOrders(data || []);
		} catch (error) {
			console.error('Error loading orders:', error);
		} finally {
			setLoading(false);
		}
	};

	const handlePaidStatusChange = async (orderId: number, newStatus: 'PAID' | 'NOTPAY') => {
		setUpdatingOrderId(orderId);
		try {
			await AdminApiService.editPaidStatusOrder(orderId, newStatus);
			await loadOrders(); // Ждем обновления списка
		} catch (error) {
			console.error('Error updating paid status:', error);
			alert('Ошибка при обновлении статуса оплаты');
		} finally {
			setUpdatingOrderId(null);
		}
	};

	const handleDeleteOrder = async (orderId: number) => {
		if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return;
		try {
			await AdminApiService.deleteOrder(orderId);
			loadOrders();
		} catch (error) {
			console.error('Error deleting order:', error);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'KZT',
			minimumFractionDigits: 0
		}).format(price);
	};

	const getImageUrl = (url: string): string => {
		return buildUrl(url);
	};

	const handleViewOrder = async (orderId: number) => {
		setShowDetailModal(true);
		setLoadingDetail(true);
		setSelectedOrder(null);

		try {
			const orderData = await UserApiService.getOrderDetails(orderId);
			setSelectedOrder(orderData);
		} catch (error) {
			console.error('Error loading order details:', error);
			alert('Ошибка при загрузке деталей заказа');
			setShowDetailModal(false);
		} finally {
			setLoadingDetail(false);
		}
	};

	const closeDetailModal = () => {
		setShowDetailModal(false);
		setSelectedOrder(null);
	};

	const loadCustomerOrders = async (customerName: string, customerPhone: string) => {
		try {
			setLoadingCustomerOrders(true);
			// Используем API для получения истории заказов клиента
			const response = await fetch(buildUrl(`/api/v1/user/get_user_phone_orders_history/${encodeURIComponent(customerPhone)}`));
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setCustomerOrders(data || []);
			setSelectedCustomerInfo({ name: customerName, phone: customerPhone });
			setShowCustomerOrdersModal(true);
		} catch (error) {
			console.error('Error loading customer orders:', error);
			alert('Ошибка при загрузке заказов клиента');
		} finally {
			setLoadingCustomerOrders(false);
		}
	};

	const closeCustomerOrdersModal = () => {
		setShowCustomerOrdersModal(false);
		setCustomerOrders([]);
		setSelectedCustomerInfo(null);
	};

	const searchCustomerOrders = async () => {
		if (!customerPhone.trim()) {
			alert('Пожалуйста, введите номер телефона клиента');
			return;
		}

		try {
			setLoadingCustomerSearch(true);
			// Используем API для получения истории заказов клиента
			const response = await fetch(buildUrl(`/api/v1/user/get_user_phone_orders_history/${encodeURIComponent(customerPhone.trim())}`));
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setCustomerOrdersSearch(data || []);
		} catch (error) {
			console.error('Error searching customer orders:', error);
			alert('Ошибка при поиске заказов клиента');
			setCustomerOrdersSearch([]);
		} finally {
			setLoadingCustomerSearch(false);
		}
	};

	const handleRepeatOrder = () => {
		if (!selectedOrder) return;

		// Создаем сообщение для WhatsApp с товарами из заказа
		const orderItems = selectedOrder.itemDto.map(item =>
			`${item.quantity}x ${item.productInfo.productName} - ${formatPrice(item.productInfo.productPrice)}`
		).join('\n');

		const message = `Здравствуйте, ${selectedOrder.customerName}!\n\nВы ранее делали заказ №${selectedOrder.orderNumber}. Хотите оплатить заказ?\n\n${orderItems}\n\nИтого: ${formatPrice(selectedOrder.totalPrice)}\n\nДля подтверждения заказа ответьте "Да" или позвоните нам.`;

		// Формируем ссылку на WhatsApp
		const whatsappUrl = `https://wa.me/${selectedOrder.customerPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;

		// Открываем WhatsApp в новой вкладке
		window.open(whatsappUrl, '_blank');
	};

	// Пагинация
	const totalPages = Math.ceil(orders.length / itemsPerPage);
	const currentOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	const getPageNumbers = () => {
		const pages: Array<number | string> = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			let start = Math.max(1, currentPage - 2);
			let end = Math.min(totalPages, start + maxVisible - 1);

			if (end === totalPages) start = Math.max(1, end - maxVisible + 1);

			if (start > 1) pages.push(1, '...');
			for (let i = start; i <= end; i++) pages.push(i);
			if (end < totalPages) pages.push('...', totalPages);
		}
		return pages;
	};

	if (!admin) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-sm font-medium text-gray-900">Доступ запрещен</h3>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100">
				<AdminNavigation />
				<div className="flex justify-center items-center py-20">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<AdminNavigation />

			<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">Управление заказами</h1>
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
						<span className="text-sm text-gray-600 self-center sm:self-auto">Всего: {orders.length}</span>
						<select
							value={itemsPerPage}
							onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
							className="text-sm border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto"
						>
							{[10, 15, 20, 50].map(val => <option key={val} value={val}>{val}</option>)}
						</select>
					</div>
				</div>

				{/* Переключатель режима поиска */}
				<div className="bg-white shadow rounded-lg p-4 mb-6">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div className="flex flex-col sm:flex-row sm:items-center gap-4">
							<h2 className="text-lg font-semibold text-gray-900">Режим просмотра:</h2>
							<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
								<button
									onClick={() => setSearchMode('all')}
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors w-full sm:w-auto ${searchMode === 'all'
										? 'bg-blue-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
								>
									Все заказы
								</button>
								<button
									onClick={() => setSearchMode('customer')}
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors w-full sm:w-auto ${searchMode === 'customer'
										? 'bg-blue-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
								>
									Заказы клиента
								</button>
							</div>
						</div>

						{searchMode === 'customer' && (
							<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
								<input
									type="tel"
									value={customerPhone}
									onChange={(e) => setCustomerPhone(e.target.value)}
									placeholder="Введите номер телефона клиента"
									className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
									onKeyPress={(e) => e.key === 'Enter' && searchCustomerOrders()}
								/>
								<button
									onClick={searchCustomerOrders}
									disabled={loadingCustomerSearch}
									className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
								>
									{loadingCustomerSearch ? (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									) : (
										'Найти'
									)}
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Отображение заказов в зависимости от режима */}
				{searchMode === 'all' ? (
					orders.length === 0 ? (
						<div className="bg-white shadow rounded-lg p-12 text-center">
							<ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
							<p className="mt-2 text-gray-500">Заказы не найдены</p>
						</div>
					) : (
						<>
							{/* Карточки для мобильных, таблица для десктопа */}
							<div className="hidden lg:block">
								<div className="bg-white shadow-lg overflow-hidden rounded-lg">
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">№ Заказа</th>
													<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Клиент</th>
													<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Дата</th>
													<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Сумма</th>
													<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Статус</th>
													<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Действия</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{currentOrders.map((order) => (
													<tr key={order.orderId} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewOrder(order.orderId)}>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">#{order.orderNumber}</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{order.customerName}</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{formatDate(order.orderStartDate)}</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold">{formatPrice(order.totalPrice)}</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
															<span className={`px-2 py-1 rounded-full text-xs ${order.paidStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
																{order.paidStatus === 'PAID' ? 'Оплачено' : 'Не оплачено'}
															</span>
														</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
															<div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
																<button
																	onClick={() => loadCustomerOrders(order.customerName, order.customerPhone)}
																	className="text-purple-600 hover:text-purple-900 p-1"
																	title="Все заказы клиента"
																>
																	<ShoppingBagIcon className="h-4 w-4" />
																</button>
																<button
																	onClick={() => handlePaidStatusChange(order.orderId, order.paidStatus === 'PAID' ? 'NOTPAY' : 'PAID')}
																	className="text-blue-600 hover:text-blue-900 p-1"
																	title="Изменить статус"
																>
																	{updatingOrderId === order.orderId ? '...' : 'Статус'}
																</button>
																<button
																	onClick={() => handleDeleteOrder(order.orderId)}
																	className="text-red-600 hover:text-red-900 p-1"
																	title="Удалить заказ"
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
							</div>

							{/* Карточный вид для мобильных */}
							<div className="lg:hidden space-y-4">
								{currentOrders.map((order) => (
									<div key={order.orderId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
										<div className="p-4">
											{/* Заголовок карточки */}
											<div className="flex justify-between items-start mb-3">
												<div>
													<h3 className="text-lg font-semibold text-gray-900">#{order.orderNumber}</h3>
													<p className="text-sm text-gray-600">{order.customerName}</p>
												</div>
												<span className={`px-2 py-1 rounded-full text-xs ${order.paidStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
													{order.paidStatus === 'PAID' ? 'Оплачено' : 'Не оплачено'}
												</span>
											</div>

											{/* Информация о заказе */}
											<div className="space-y-2 mb-4">
												<div className="flex items-center text-sm text-gray-600">
													<CalendarIcon className="h-4 w-4 mr-2" />
													{formatDate(order.orderStartDate)}
												</div>
												<div className="flex items-center text-lg font-bold text-gray-900">
													<CurrencyDollarIcon className="h-5 w-5 mr-2" />
													{formatPrice(order.totalPrice)}
												</div>
											</div>

											{/* Кнопки действий */}
											<div className="flex flex-col gap-2">
												<button
													onClick={() => handleViewOrder(order.orderId)}
													className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
												>
													<EditIcon className="h-4 w-4 mr-2" />
													Детали заказа
												</button>
												<div className="flex gap-2">
													<button
														onClick={() => loadCustomerOrders(order.customerName, order.customerPhone)}
														className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
														title="Все заказы клиента"
													>
														<ShoppingBagIcon className="h-4 w-4" />
													</button>
													<button
														onClick={() => handlePaidStatusChange(order.orderId, order.paidStatus === 'PAID' ? 'NOTPAY' : 'PAID')}
														className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
														title="Изменить статус"
													>
														{updatingOrderId === order.orderId ? '...' : 'Статус'}
													</button>
													<button
														onClick={() => handleDeleteOrder(order.orderId)}
														className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
														title="Удалить заказ"
													>
														<TrashIcon className="h-4 w-4" />
													</button>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Пагинация */}
							{totalPages > 1 && (
								<div className="mt-4 bg-white p-4 rounded-lg shadow">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
										<span className="text-sm text-gray-700 text-center sm:text-left">Страница {currentPage} из {totalPages}</span>
										<div className="flex items-center justify-center sm:justify-end space-x-1 overflow-x-auto">
											{getPageNumbers().map((p, i) => (
												<button
													key={i}
													onClick={() => typeof p === 'number' && setCurrentPage(p)}
													className={`px-3 py-1 rounded flex-shrink-0 ${currentPage === p ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
													disabled={p === '...'}
												>
													{p}
												</button>
											))}
										</div>
									</div>
								</div>
							)}
						</>
					)
				) : (
					// Режим поиска заказов клиента
					loadingCustomerSearch ? (
						<div className="flex justify-center items-center py-20">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
							<span className="ml-3 text-gray-600">Поиск заказов...</span>
						</div>
					) : customerOrdersSearch.length === 0 ? (
						<div className="bg-white shadow rounded-lg p-12 text-center">
							<ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
							<p className="mt-2 text-gray-500">Заказы клиента не найдены</p>
							<p className="text-sm text-gray-400 mt-1">Проверьте номер телефона и попробуйте снова</p>
						</div>
					) : (
						<>
							{/* Таблица для десктопа */}
							<div className="hidden lg:block">
								<div className="bg-white shadow-lg overflow-hidden rounded-lg">
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">№ Заказа</th>
													<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Дата</th>
													<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Сумма</th>
													<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Статус</th>
													<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Действия</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{customerOrdersSearch.map((order) => (
													<tr key={order.orderId} className="hover:bg-gray-50">
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">#{order.orderNumber}</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
															{new Date(order.createOrder).toLocaleDateString('ru-RU', {
																day: 'numeric',
																month: 'long',
																year: 'numeric',
																hour: '2-digit',
																minute: '2-digit'
															})}
														</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold">{formatPrice(order.totalPrice)}</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
															<span className={`px-2 py-1 rounded-full text-xs ${order.paidStatus === 'PAID'
																? 'bg-green-100 text-green-800'
																: 'bg-yellow-100 text-yellow-800'
																}`}>
																{order.paidStatus === 'PAID' ? 'Оплачен' : 'Не оплачен'}
															</span>
														</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
															<div className="flex space-x-2">
																{order.whatsappLink && (
																	<a
																		href={order.whatsappLink}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-green-600 hover:text-green-900 p-1"
																		title="WhatsApp"
																	>
																		<PhoneIcon className="h-4 w-4" />
																	</a>
																)}
																<button
																	onClick={() => handleViewOrder(order.orderId)}
																	className="text-blue-600 hover:text-blue-900 p-1"
																	title="Детали заказа"
																>
																	<EditIcon className="h-4 w-4" />
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</div>

							{/* Карточный вид для мобильных */}
							<div className="lg:hidden space-y-4">
								{customerOrdersSearch.map((order) => (
									<div key={order.orderId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
										<div className="p-4">
											{/* Заголовок карточки */}
											<div className="flex justify-between items-start mb-3">
												<div>
													<h3 className="text-lg font-semibold text-gray-900">#{order.orderNumber}</h3>
													<span className={`px-2 py-1 rounded-full text-xs ${order.paidStatus === 'PAID'
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'
														}`}>
														{order.paidStatus === 'PAID' ? 'Оплачен' : 'Не оплачен'}
													</span>
												</div>
											</div>

											{/* Информация о заказе */}
											<div className="space-y-2 mb-4">
												<div className="flex items-center text-sm text-gray-600">
													<CalendarIcon className="h-4 w-4 mr-2" />
													{new Date(order.createOrder).toLocaleDateString('ru-RU', {
														day: 'numeric',
														month: 'long',
														year: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													})}
												</div>
												<div className="flex items-center text-lg font-bold text-gray-900">
													<CurrencyDollarIcon className="h-5 w-5 mr-2" />
													{formatPrice(order.totalPrice)}
												</div>
											</div>

											{/* Кнопки действий */}
											<div className="flex gap-2">
												{order.whatsappLink && (
													<a
														href={order.whatsappLink}
														target="_blank"
														rel="noopener noreferrer"
														className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
													>
														<PhoneIcon className="h-4 w-4 mr-2" />
														WhatsApp
													</a>
												)}
												<button
													onClick={() => handleViewOrder(order.orderId)}
													className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
												>
													<EditIcon className="h-4 w-4 mr-2" />
													Детали
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						</>
					)
				)}

				{/* Modal - Полные детали заказа */}
				{showDetailModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
							<div className="flex justify-between items-center p-6 border-b border-gray-200">
								<h3 className="text-xl font-bold text-gray-900">Детали заказа</h3>
								<button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-500">
									<XIcon className="h-6 w-6" />
								</button>
							</div>

							<div className="p-6">
								{loadingDetail ? (
									<div className="flex items-center justify-center py-12">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
										<span className="ml-3 text-gray-600">Загрузка...</span>
									</div>
								) : selectedOrder ? (
									<div className="space-y-6">
										{/* Информация о клиенте */}
										{selectedOrder && (
											<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
												<h4 className="text-sm font-medium text-blue-900 mb-2">Информация о клиенте</h4>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<p className="text-sm text-blue-700">Имя: <span className="font-medium">{selectedOrder.customerName}</span></p>
													</div>
													<div>
														<p className="text-sm text-blue-700">Телефон: <span className="font-medium">{selectedOrder.customerPhone}</span></p>
													</div>
												</div>
											</div>
										)}

										{/* Основная информация о заказе */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div className="space-y-4">
												<div>
													<h4 className="text-sm font-medium text-gray-500">Номер заказа</h4>
													<p className="text-lg font-semibold text-gray-900">#{selectedOrder.orderNumber}</p>
												</div>
												<div>
													<h4 className="text-sm font-medium text-gray-500">Дата заказа</h4>
													<p className="text-gray-900">
														{new Date(selectedOrder.createOrder).toLocaleString('ru-RU', {
															year: 'numeric',
															month: 'long',
															day: 'numeric',
															hour: '2-digit',
															minute: '2-digit'
														})}
													</p>
												</div>
											</div>
											<div className="space-y-4">
												<div>
													<h4 className="text-sm font-medium text-gray-500">Сумма заказа</h4>
													<p className="text-lg font-semibold text-gray-900">{formatPrice(selectedOrder.totalPrice)}</p>
												</div>
												<div>
													<h4 className="text-sm font-medium text-gray-500">Статус оплаты</h4>
													{selectedOrder.paidStatus === 'PAID' ? (
														<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
															<CheckIcon className="h-3 w-3 mr-1" />
															Оплачено
														</span>
													) : (
														<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
															<XIcon className="h-3 w-3 mr-1" />
															Не оплачено
														</span>
													)}
												</div>
											</div>
										</div>

										{/* Товары в заказе */}
										<div>
											<h4 className="text-lg font-bold text-gray-900 mb-4">Товары в заказе</h4>
											<div className="space-y-4">
												{selectedOrder.itemDto.map((item, index) => (
													<div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
														<div className="flex-shrink-0">
															{item.productInfo.photo ? (
																<img
																	src={getImageUrl(item.productInfo.photo.photoURL)}
																	alt={item.productInfo.productName}
																	className="h-16 w-16 object-contain rounded-lg bg-white"
																/>
															) : (
																<div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
																	<ShoppingBagIcon className="h-8 w-8 text-gray-400" />
																</div>
															)}
														</div>
														<div className="flex-1">
															<h5 className="font-medium text-gray-900">{item.productInfo.productName}</h5>
															<p className="text-sm text-gray-500">ID: {item.productInfo.productId}</p>
															{!item.productInfo.active && (
																<span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
																	Неактивен
																</span>
															)}
														</div>
														<div className="text-right">
															<p className="text-sm text-gray-500">Количество: {item.quantity}</p>
															<p className="font-medium text-gray-900">{formatPrice(item.productInfo.productPrice)}</p>
															<p className="text-sm text-gray-500 font-medium">
																{formatPrice(item.productInfo.productPrice * item.quantity)}
															</p>
														</div>
													</div>
												))}
											</div>
										</div>

										{/* Кнопки действий */}
										<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
											{selectedOrder && (
												<button
													onClick={() => loadCustomerOrders(selectedOrder.customerName, selectedOrder.customerPhone)}
													className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
												>
													<ShoppingBagIcon className="h-4 w-4 mr-2" />
													Все заказы клиента
												</button>
											)}

											{selectedOrder && (
												<button
													onClick={handleRepeatOrder}
													className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
												>
													<PhoneIcon className="h-4 w-4 mr-2" />
													Предложить оплатить заказ
												</button>
											)}

											{selectedOrder.paidStatus === 'NOTPAY' && (
												<button
													onClick={() => {
														handlePaidStatusChange(selectedOrder.orderId, 'PAID');
														closeDetailModal();
													}}
													disabled={updatingOrderId === selectedOrder.orderId}
													className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
												>
													<CheckIcon className="h-4 w-4 mr-2" />
													Отметить оплаченным
												</button>
											)}

											{selectedOrder.paidStatus === 'PAID' && (
												<button
													onClick={() => {
														handlePaidStatusChange(selectedOrder.orderId, 'NOTPAY');
														closeDetailModal();
													}}
													disabled={updatingOrderId === selectedOrder.orderId}
													className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
												>
													<XIcon className="h-4 w-4 mr-2" />
													Отметить не оплаченным
												</button>
											)}

											<button
												onClick={() => {
													handleDeleteOrder(selectedOrder.orderId);
													closeDetailModal();
												}}
												className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
											>
												<TrashIcon className="h-4 w-4 mr-2" />
												Удалить заказ
											</button>
										</div>
									</div>
								) : (
									<div className="text-center py-12">
										<p className="text-red-600">Не удалось загрузить детали заказа</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Модальное окно истории заказов клиента */}
				{showCustomerOrdersModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
						<div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white">
							{/* Заголовок модального окна */}
							<div className="flex items-center justify-between mb-6">
								<div>
									<h2 className="text-2xl font-bold text-gray-900">История заказов клиента</h2>
									{selectedCustomerInfo && (
										<div className="mt-2">
											<p className="text-sm text-gray-600">
												<span className="font-medium">Имя:</span> {selectedCustomerInfo.name}
											</p>
											<p className="text-sm text-gray-600">
												<span className="font-medium">Телефон:</span> {selectedCustomerInfo.phone}
											</p>
										</div>
									)}
								</div>
								<button
									onClick={closeCustomerOrdersModal}
									className="text-gray-400 hover:text-gray-600 transition-colors"
								>
									<XIcon className="h-6 w-6" />
								</button>
							</div>

							{/* Содержимое модального окна */}
							{loadingCustomerOrders ? (
								<div className="flex justify-center items-center py-20">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
									<span className="ml-3 text-gray-600">Загрузка заказов...</span>
								</div>
							) : customerOrders.length === 0 ? (
								<div className="text-center py-20">
									<ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">Заказы не найдены</h3>
									<p className="text-gray-500">У этого клиента пока нет заказов</p>
								</div>
							) : (
								<div className="space-y-4 max-h-96 overflow-y-auto">
									{customerOrders.map((order) => (
										<div key={order.orderId} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<h3 className="font-semibold text-gray-900">Заказ #{order.orderNumber}</h3>
														<span className={`px-2 py-1 rounded-full text-xs font-medium ${order.paidStatus === 'PAID'
															? 'bg-green-100 text-green-800'
															: 'bg-yellow-100 text-yellow-800'
															}`}>
															{order.paidStatus === 'PAID' ? 'Оплачен' : 'Не оплачен'}
														</span>
													</div>
													<p className="text-sm text-gray-600 mb-2">
														{new Date(order.createOrder).toLocaleDateString('ru-RU', {
															day: 'numeric',
															month: 'long',
															year: 'numeric',
															hour: '2-digit',
															minute: '2-digit'
														})}
													</p>
													<p className="text-lg font-bold text-emerald-600">
														{order.totalPrice.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₸
													</p>
												</div>
												<div className="flex items-center gap-2">
													{order.whatsappLink && (
														<a
															href={order.whatsappLink}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
														>
															<PhoneIcon className="h-4 w-4" />
															WhatsApp
														</a>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Футер модального окна */}
							<div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
								<button
									onClick={closeCustomerOrdersModal}
									className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								>
									Закрыть
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>);
};