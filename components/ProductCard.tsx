import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GetProductsUserDto, GetProductsDto } from '../types';
import { ShoppingCartIcon } from './Icons';
import { ApiService } from '../services/api';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../config/api';

interface ProductCardProps {
	product: GetProductsUserDto | GetProductsDto;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
	const [isAdding, setIsAdding] = useState(false);
	const { refreshCart } = useCart();

	// Форматируем дату
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	};

	// Функция добавления в корзину
	const handleAddToCart = async () => {
		setIsAdding(true);
		try {
			await ApiService.addToCart(product.productId, 1);
			await refreshCart();
			alert(`Товар "${product.productName}" добавлен в корзину!`);
		} catch (error) {
			console.error('Error adding to cart:', error);
			alert('Ошибка при добавлении в корзину');
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<div className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group flex flex-col h-full rounded-lg">
			{/* Фото с профессиональным оформлением */}
			<div className="relative overflow-hidden aspect-[4/3] rounded-t-lg flex items-center justify-center">
				<Link to={`/product/${product.productId}`} className="block w-full h-full flex items-center justify-center">
					<img
						src={getImageUrl((product as any).photoDtoList || (product as any).photoDto)}
						alt={product.productName}
						className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
						onError={(e) => {
							(e.target as HTMLImageElement).src = `https://picsum.photos/400/300?error=${product.productId}`;
						}}
					/>
					{/* Профессиональный бейдж */}
					<div className="absolute top-3 left-3">
						<span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-md font-semibold">
							АРТИКУЛ: {product.productId}
						</span>
					</div>
				</Link>
			</div>

			{/* Контент с B2B стилем */}
			<div className="p-6 flex flex-col flex-grow">
				{/* Название товара */}
				<Link to={`/product/${product.productId}`} className="block mb-4 flex-grow">
					<h3 className="text-lg font-semibold text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors mb-2">
						{product.productName}
					</h3>
					<div className="text-sm text-slate-500">
						{product.material}
					</div>
				</Link>

				{/* B2B информация о цене */}
				<div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
					<div className="flex-1">
						<div className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
							Цена за единицу
						</div>
						<div className="text-xl font-bold text-slate-900">
							{(product as any).productPrice || (product as any).price ?
								`${new Intl.NumberFormat('ru-KZ').format((product as any).productPrice || (product as any).price)} ₸` :
								'По запросу'
							}
						</div>
					</div>

					{/* B2B кнопка действий */}
					<div className="flex flex-col gap-2 ml-4">
						<button
							onClick={handleAddToCart}
							disabled={isAdding}
							className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed px-4 py-2 rounded-md transition-colors flex items-center justify-center text-sm font-medium"
							title="Добавить в корзину"
						>
							{isAdding ? (
								<>
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
									<span>Добавление...</span>
								</>
							) : (
								<>
									<ShoppingCartIcon size={16} />
									<span className="ml-2">В корзину</span>
								</>
							)}
						</button>
						<Link
							to={`/product/${product.productId}`}
							className="text-center text-xs text-emerald-600 hover:text-emerald-700 font-medium"
						>
							Подробнее
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};