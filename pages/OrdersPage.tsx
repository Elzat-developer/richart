import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import { OrderHistoryUserDto } from '../types';

const OrdersPage: React.FC = () => {
	const [orders, setOrders] = useState<OrderHistoryUserDto[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [phone, setPhone] = useState('');
	const [customerName, setCustomerName] = useState<string>('');
	const [customerPhone, setCustomerPhone] = useState<string>('');

	const fetchOrders = async () => {
		if (!phone.trim()) {
			setError('Пожалуйста, введите номер телефона');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const orderHistory = await ApiService.getOrderHistory(phone.trim());
			if (orderHistory && orderHistory.length > 0) {
				setOrders(orderHistory);
				// Берем данные клиента из первого заказа
				setCustomerName(orderHistory[0].customerName);
				setCustomerPhone(orderHistory[0].customerPhone);
			} else {
				setOrders([]);
				setCustomerName('');
				setCustomerPhone('');
				setError('Заказы не найдены для указанного номера телефона');
			}
		} catch (err) {
			console.error('Error fetching orders:', err);
			setError('Произошла ошибка при загрузке заказов');
			setOrders([]);
			setCustomerName('');
			setCustomerPhone('');
		} finally {
			setLoading(false);
		}
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		// Форматирование номера телефона
		const formattedPhone = value.replace(/[^\d+\s]/g, '');
		setPhone(formattedPhone);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'PAID':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'NOTPAY':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'PAID':
				return 'Оплачен';
			case 'NOTPAY':
				return 'Не оплачен';
			default:
				return status;
		}
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('ru-RU', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return dateString;
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'KZT',
			minimumFractionDigits: 0
		}).format(price);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 text-white py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h1 className="text-4xl lg:text-5xl font-bold mb-4">
							Мои заказы
						</h1>
						<p className="text-xl text-blue-100 mb-8">
							Просмотр истории ваших заказов
						</p>
						<div className="w-20 h-1 bg-white mx-auto"></div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-4xl mx-auto">
					{/* Phone Input Section */}
					<div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
						<div className="text-center mb-6">
							<div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
									<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
								</svg>
							</div>
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								Введите номер телефона
							</h2>
							<p className="text-gray-600">
								Укажите номер телефона, который вы использовали при оформлении заказа
							</p>
						</div>

						<div className="max-w-md mx-auto">
							<div className="flex gap-3">
								<div className="flex-1">
									<input
										type="tel"
										value={phone}
										onChange={handlePhoneChange}
										placeholder="+7 777 123 45 67"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
										onKeyPress={(e) => e.key === 'Enter' && fetchOrders()}
									/>
								</div>
								<button
									onClick={fetchOrders}
									disabled={loading}
									className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
								>
									{loading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											Загрузка...
										</>
									) : (
										<>
											<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
											</svg>
											Найти
										</>
									)}
								</button>
							</div>
							{error && (
								<div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
									{error}
								</div>
							)}
						</div>
					</div>

					{/* Orders List */}
					{orders.length > 0 && (
						<div className="space-y-6">
							{/* Customer Info */}
							{customerName && (
								<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
									<div className="flex items-center gap-4">
										<div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-full flex items-center justify-center">
											<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
											</svg>
										</div>
										<div>
											<h3 className="text-lg font-semibold text-gray-900">{customerName}</h3>
											<p className="text-gray-600">{customerPhone}</p>
										</div>
									</div>
								</div>
							)}

							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-gray-900">
									История заказов
								</h2>
								<span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
									{orders.length} заказов
								</span>
							</div>

							{orders.map((order) => (
								<div
									key={order.orderId}
									className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
								>
									<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
										{/* Order Info */}
										<div className="flex-1">
											<div className="flex items-start gap-4">
												<div className="bg-blue-100 text-blue-600 p-3 rounded-lg flex-shrink-0">
													<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
													</svg>
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<h3 className="text-lg font-semibold text-gray-900">
															Заказ #{order.orderNumber}
														</h3>
														<span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.paidStatus)}`}>
															{getStatusText(order.paidStatus)}
														</span>
													</div>
													<p className="text-gray-600 mb-1">
														от {formatDate(order.createOrder)}
													</p>
													<p className="text-2xl font-bold text-emerald-600">
														{formatPrice(order.totalPrice)}
													</p>
												</div>
											</div>
										</div>

										{/* Actions */}
										<div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
											<Link
												to={`/orders/${order.orderId}`}
												className="bg-industrial-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
											>
												Детали
											</Link>
											{order.whatsappLink && (
												<a
													href={order.whatsappLink}
													target="_blank"
													rel="noopener noreferrer"
													className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
												>
													WhatsApp
												</a>
											)}
											<button
												onClick={() => window.location.href = `/catalog`}
												className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
											>
												Каталог
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Empty State */}
					{!loading && orders.length === 0 && phone && !error && (
						<div className="text-center py-12">
							<div className="text-gray-400 text-6xl mb-4">📦</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								Заказы не найдены
							</h3>
							<p className="text-gray-600 mb-6">
								Для указанного номера телефона заказов не найдено
							</p>
							<button
								onClick={() => window.location.href = '/catalog'}
								className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
							>
								Перейти в каталог
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default OrdersPage;
