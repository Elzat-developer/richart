import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ApiService } from '../services/api';
import { TrashIcon, PlusIcon, MinusIcon, FilePdfIcon, WhatsAppIcon, XIcon } from '../components/Icons';
import { Link } from 'react-router-dom';
import { GetPhotoDto } from '../types';
import { buildUrl } from '../config/api';

// Функция для получения URL изображения
const getImageUrl = (photoDto: GetPhotoDto): string => {
	if (!photoDto || !photoDto.photoURL) return `https://picsum.photos/80/80?random=${Math.random()}`;

	return buildUrl(photoDto.photoURL);
};

export const CartPage: React.FC = () => {
	const { cart, loading, updateItemQuantity, removeFromCart } = useCart();
	const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

	// Checkout Form State
	const [formData, setFormData] = useState({ name: '', phone: '' });
	const [checkoutLoading, setCheckoutLoading] = useState(false);

	const handleDownloadCP = async () => {
		if (!cart?.items.length) return;
		try {
			const blob = await ApiService.generateCP(cart.items);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'Commercial_Proposal.pdf';
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error("Download error:", error);
			alert("Не удалось скачать коммерческое предложение");
		}
	};

	const handleCheckoutSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setCheckoutLoading(true);
		try {
			const response = await ApiService.checkout(formData);
			// Перенаправляем на WhatsApp с полученной ссылкой
			window.open(response.whatsappLink || `https://wa.me/77472164664?text=${encodeURIComponent(`New order from ${formData.name}. Phone: ${formData.phone}`)}`, '_blank');
			setIsCheckoutModalOpen(false);
		} catch (error) {
			alert("Оформление заказа не удалось. Попробуйте еще раз.");
		} finally {
			setCheckoutLoading(false);
		}
	};

	if (!cart || cart.items.length === 0) {
		return (
			<div className="container mx-auto px-4 py-20 text-center">
				<h2 className="text-3xl font-display font-bold uppercase mb-4 text-industrial-900">Ваша корзина пуста</h2>
				<p className="text-gray-600 mb-8">Похоже, вы еще не добавили промышленное оборудование.</p>
				<Link to="/catalog" className="inline-block bg-industrial-accent text-white px-8 py-3 uppercase font-bold tracking-wide hover:bg-orange-700 transition-colors">
					Перейти в каталог
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-12">
			<h1 className="text-3xl font-bold font-display uppercase mb-8 text-gray-900 border-l-4 border-emerald-500 pl-4">
				Корзина
			</h1>

			<div className="flex flex-col xl:flex-row gap-8">
				{/* Cart Items List */}
				<div className="flex-grow bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
					<div className="hidden md:grid grid-cols-12 gap-4 bg-gradient-to-r from-blue-50 to-emerald-50 p-4 border-b border-gray-200 font-bold uppercase text-xs text-gray-700">
						<div className="col-span-6 pl-7">Товар</div>
						<div className="col-span-2 text-center md:text-left ml-7">Цена</div>
						<div className="col-span-2 text-center">Количество</div>
						<div className="col-span-2 text-center md:text-left ml-12">Сумма</div>
					</div>

					<div className="divide-y divide-gray-100">
						{cart.items.map(item => (
							<div key={item.cart_item_id} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center hover:bg-gray-50 transition-colors">
								<div className="col-span-6 flex items-start gap-4">
									{/* Фото товара */}
									{item.photoDto && (
										<div className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
											<img
												src={getImageUrl(item.photoDto)}
												alt={item.productName}
												className="w-full h-full object-contain"
												onError={(e) => {
													(e.target as HTMLImageElement).src = `https://picsum.photos/80/80?error=${item.productId}`;
												}}
											/>
										</div>
									)}
									<div className="flex-1 min-w-0">
										<h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
											<Link to={`/product/${item.productId}`} className="hover:text-emerald-600 transition-colors">
												{item.productName}
											</Link>
										</h3>
										<div className="flex items-center gap-2 mb-2">
											<span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">{item.tag}</span>
											{item.productActive === false && (
												<span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">Неактивен</span>
											)}
										</div>

										{/* Характеристики */}
										{item.characteristics && (
											<div className="text-xs text-gray-600 mb-2 line-clamp-2">
												{item.characteristics}
											</div>
										)}

										{/* Условия доставки */}
										{item.deliveryTerms && (
											<div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block">
												📦 {item.deliveryTerms}
											</div>
										)}
									</div>
								</div>

								<div className="col-span-2 text-center md:text-left">
									<span className="md:hidden text-xs text-gray-500 uppercase font-medium mb-1 block">Цена:</span>
									<div className="inline-flex items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
										<span className="text-base font-semibold text-gray-900 tabular-nums">
											{item.productPrice.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₸
										</span>
									</div>
								</div>

								<div className="col-span-2 flex justify-center">
									<span className="md:hidden text-xs text-gray-500 uppercase font-medium mb-2 block text-center">Количество:</span>
									<div className="flex items-center bg-white border-2 border-gray-200 rounded-lg h-10 shadow-sm">
										<button
											onClick={() => updateItemQuantity(item.cart_item_id, Math.max(1, item.quantity - 1))}
											className="w-10 h-full flex items-center justify-center hover:bg-red-50 text-red-500 rounded-l-lg transition-colors"
										>
											<MinusIcon size={14} />
										</button>
										<input
											type="text"
											value={item.quantity}
											readOnly
											className="w-12 h-full text-center border-x border-gray-200 text-base font-bold focus:outline-none bg-gray-50"
										/>
										<button
											onClick={() => updateItemQuantity(item.cart_item_id, item.quantity + 1)}
											className="w-10 h-full flex items-center justify-center hover:bg-emerald-50 text-emerald-600 rounded-r-lg transition-colors"
										>
											<PlusIcon size={14} />
										</button>
									</div>
								</div>

								<div className="col-span-2 flex items-center justify-between md:justify-end gap-4">
									<span className="md:hidden text-xs text-gray-500 uppercase font-medium mb-1 block">Сумма:</span>
									<div className="flex items-center gap-3">
										<div className="text-right">
											<div className="text-lg font-bold text-gray-900 tabular-nums">
												{(item.productPrice * item.quantity).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₸
											</div>
										</div>
										<button
											onClick={() => removeFromCart(item.cart_item_id)}
											className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
											title="Удалить товар"
										>
											<TrashIcon size={18} />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Summary Sidebar */}
				<div className="xl:w-96 lg:w-80 flex-shrink-0 space-y-6">
					<div className="bg-gradient-to-br from-emerald-600 to-blue-700 text-white p-8 rounded-2xl shadow-xl">
						<div className="flex items-center gap-3 mb-6">
							<div className="bg-white/20 p-3 rounded-lg">
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" clipRule="evenodd" />
								</svg>
							</div>
							<h3 className="text-xl font-bold">Итог заказа</h3>
						</div>

						<div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6">
							<div className="flex justify-between items-center mb-4">
								<span className="text-white/80 font-medium">Товаров ({cart.items.length})</span>
								<span className="font-semibold">{cart.items.length} шт.</span>
							</div>
							<div className="border-t border-white/20 pt-4">
								<div className="flex justify-between items-center">
									<span className="text-lg font-medium">Общая сумма</span>
									<div className="text-right">
										<div className="text-3xl font-bold tabular-nums">
											{cart.totalPrice.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₸
										</div>
									</div>
								</div>
							</div>
						</div>

						<button
							onClick={() => setIsCheckoutModalOpen(true)}
							className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-bold py-4 rounded-xl uppercase tracking-wide transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 mb-3"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" clipRule="evenodd" />
							</svg>
							Оформить заказ
						</button>

						<button
							onClick={handleDownloadCP}
							className="w-full bg-white/20 backdrop-blur hover:bg-white/30 text-white font-bold py-3 rounded-xl uppercase tracking-wide transition-all flex items-center justify-center gap-2 border border-white/30"
						>
							<FilePdfIcon size={18} />
							Скачать КП
						</button>
					</div>
				</div>
			</div>

			{/* Checkout Modal */}
			{isCheckoutModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
					<div className="bg-white w-full max-w-lg p-8 relative shadow-2xl animate-in fade-in zoom-in duration-300 rounded-2xl">
						<button
							onClick={() => setIsCheckoutModalOpen(false)}
							className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
						>
							<XIcon />
						</button>

						<div className="text-center mb-8">
							<div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" clipRule="evenodd" />
								</svg>
							</div>
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								Оформление заказа
							</h2>
							<p className="text-gray-600">
								Заполните данные для оформления заказа
							</p>
						</div>

						<form onSubmit={handleCheckoutSubmit} className="space-y-6">
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">Полное имя</label>
								<input
									type="text"
									required
									value={formData.name}
									onChange={e => setFormData({ ...formData, name: e.target.value })}
									className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 transition-colors"
									placeholder="Иван Иванов"
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">Номер телефона</label>
								<input
									type="tel"
									required
									value={formData.phone}
									onChange={e => setFormData({ ...formData, phone: e.target.value })}
									className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 transition-colors"
									placeholder="+7 777 123 45 67"
								/>
							</div>

							<div className="pt-4">
								<button
									type="submit"
									disabled={checkoutLoading}
									className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl uppercase tracking-wide transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
								>
									{checkoutLoading ? (
										<>
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
											Обработка...
										</>
									) : (
										<>
											<WhatsAppIcon size={20} />
											Отправить в WhatsApp
										</>
									)}
								</button>
								<p className="text-xs text-center text-gray-500 mt-4">
									Вы будете перенаправлены в WhatsApp для уточнения деталей с нашим менеджером.
								</p>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};