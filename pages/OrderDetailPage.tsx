import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import { OrderDetailsDto, OrderItemDto } from '../types';
import { ArrowLeftIcon, WhatsAppIcon, CheckCircleIcon, ClockIcon, XCircleIcon, ShoppingBagIcon } from '../components/Icons';

export const OrderDetailPage: React.FC = () => {
	const { orderId } = useParams<{ orderId: string }>();
	const [order, setOrder] = useState<OrderDetailsDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchOrderDetails = async () => {
			if (!orderId) return;

			try {
				setLoading(true);
				const orderData = await ApiService.getOrderDetails(parseInt(orderId));
				setOrder(orderData);
			} catch (err) {
				console.error('Error fetching order details:', err);
				setError('Не удалось загрузить детали заказа');
			} finally {
				setLoading(false);
			}
		};

		fetchOrderDetails();
	}, [orderId]);

	// Функция для обработки URL изображений как в новостях
	const getImageUrl = (photoUrl: string): string => {
		if (!photoUrl) return `https://picsum.photos/100/100?random=${Math.random()}`;

		if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
			return photoUrl;
		}

		if (photoUrl.match(/^[A-Za-z]:/)) {
			const uploadsMatch = photoUrl.match(/uploads\/(.+)/);
			if (uploadsMatch) {
				return `http://localhost:8080/uploads/${uploadsMatch[1]}`;
			}
			return `http://localhost:8080/${photoUrl.replace(/^[A-Za-z]:\\/, '').replace(/\\/g, '/')}`;
		}

		if (photoUrl.startsWith('/api')) {
			return `http://localhost:8080${photoUrl}`;
		}

		if (photoUrl.startsWith('/')) {
			return `http://localhost:8080${photoUrl}`;
		}

		return `http://localhost:8080/${photoUrl}`;
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'PAID':
				return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
			case 'NOTPAY':
				return <ClockIcon className="w-5 h-5 text-yellow-600" />;
			case 'CANCELLED':
				return <XCircleIcon className="w-5 h-5 text-red-600" />;
			default:
				return <ClockIcon className="w-5 h-5 text-gray-600" />;
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'PAID':
				return 'Оплачен';
			case 'NOTPAY':
				return 'Не оплачен';
			case 'CANCELLED':
				return 'Отменен';
			default:
				return status;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'PAID':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'NOTPAY':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'CANCELLED':
				return 'bg-red-100 text-red-800 border-red-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="flex items-center justify-center min-h-96">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
				</div>
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="text-center">
					<div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
						<XCircleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
						<h2 className="text-xl font-bold text-red-800 mb-2">Ошибка</h2>
						<p className="text-red-600 mb-6">{error || 'Заказ не найден'}</p>
						<Link
							to="/orders"
							className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
						>
							<ArrowLeftIcon className="w-4 h-4" />
							Вернуться к заказам
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex items-center gap-4 mb-8">
				<Link
					to="/orders"
					className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
				>
					<ArrowLeftIcon className="w-5 h-5" />
					Вернуться к заказам
				</Link>
				<div className="h-6 w-px bg-gray-300"></div>
				<h1 className="text-3xl font-bold text-gray-900">Детали заказа</h1>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Основная информация */}
				<div className="lg:col-span-2 space-y-6">
					{/* Информация о заказе */}
					<div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
						<div className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white p-6">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-2xl font-bold mb-2">Заказ №{order.orderNumber}</h2>

								</div>
								<div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(order.paidStatus)}`}>
									{getStatusIcon(order.paidStatus)}
									<span className="font-medium">{getStatusText(order.paidStatus)}</span>
								</div>
							</div>
						</div>

						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Дата заказа</h3>
									<p className="text-lg font-medium text-gray-900">
										{new Date(order.createOrder).toLocaleDateString('ru-RU', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</p>
								</div>
								<div>
									<h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Общая сумма</h3>
									<p className="text-2xl font-bold text-emerald-600">
										{order.totalPrice.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₸
									</p>
								</div>
							</div>

							<div className="mt-6 pt-6 border-t border-gray-200">
								<a
									href={order.whatsappLink}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
								>
									<WhatsAppIcon className="w-5 h-5" />
									Сделать повторный заказ WhatsApp
								</a>
							</div>
						</div>
					</div>

					{/* Товары в заказе */}
					<div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
						<div className="p-6 border-b border-gray-200">
							<h3 className="text-xl font-bold text-gray-900">Товары в заказе</h3>
						</div>

						<div className="divide-y divide-gray-100">
							{order.itemDto.map((item, index) => (
								<div key={index} className="p-6 hover:bg-gray-50 transition-colors">
									<div className="flex items-center gap-4">
										<div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
											<img
												src={getImageUrl(item.productInfo.photo.photoURL)}
												alt={item.productInfo.productName}
												className="w-full h-full object-cover"
												onError={(e) => {
													(e.target as HTMLImageElement).src = `https://picsum.photos/100/100?random=${item.productInfo.productId}`;
												}}
											/>
										</div>
										<div className="flex-1 min-w-0">
											<h4 className="font-semibold text-gray-900 text-base mb-1">
												{item.productInfo.productName}
											</h4>
											<div className="flex items-center gap-4 text-sm text-gray-600">
												<span>Артикул: #{item.productInfo.productId}</span>
												<span>Количество: {item.quantity} шт.</span>
											</div>
										</div>
										<div className="text-right">
											<p className="text-lg font-bold text-gray-900">
												{(item.productInfo.productPrice * item.quantity).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₸
											</p>
											<p className="text-sm text-gray-500">
												{item.productInfo.productPrice.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₸ за шт.
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Боковая панель */}
				<div className="space-y-6">
					{/* Краткая информация */}
					<div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
						<h3 className="text-lg font-bold text-gray-900 mb-4">Информация о заказе</h3>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Статус</span>
								<div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${getStatusColor(order.paidStatus)}`}>
									{getStatusIcon(order.paidStatus)}
									<span className="font-medium">{getStatusText(order.paidStatus)}</span>
								</div>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Товаров</span>
								<span className="font-semibold">{order.itemDto.length} шт.</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Общая сумма</span>
								<span className="font-bold text-emerald-600">
									{order.totalPrice.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₸
								</span>
							</div>
						</div>
					</div>

					{/* Действия */}
					<div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
						<h3 className="text-lg font-bold text-gray-900 mb-4">Действия</h3>
						<div className="space-y-3">
							<a
								href={order.whatsappLink}
								target="_blank"
								rel="noopener noreferrer"
								className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors"
							>
								<WhatsAppIcon className="w-4 h-4" />
								Написать в WhatsApp
							</a>
							<Link
								to="/catalog"
								className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg transition-colors"
							>
								Сделать новый заказ
							</Link>
						</div>
					</div>

					{/* Поддержка */}
					<div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl border border-emerald-200 p-6">
						<h3 className="text-lg font-bold text-gray-900 mb-3">Нужна помощь?</h3>
						<p className="text-gray-600 text-sm mb-4">
							Наши менеджеры готовы ответить на все ваши вопросы по заказу
						</p>
						<a
							href={`https://wa.me/77472164664?text=Хотел задать вопрос по заказу №${order.orderNumber}`}
							target="_blank"
							rel="noopener noreferrer"
							className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-emerald-700 border border-emerald-300 px-4 py-2 rounded-lg transition-colors"
						>
							Связаться с поддержкой
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};
