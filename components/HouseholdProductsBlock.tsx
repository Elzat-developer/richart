import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './Skeletons';
import { ApiService } from '../services/api';
import { GetProductsUserDto } from '../types';

export const HouseholdProductsBlock: React.FC = () => {
	const [products, setProducts] = useState<GetProductsUserDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadProducts = async () => {
			try {
				setLoading(true);
				setError(null);
				console.log('🔄 Loading household products from ApiService...');
				const productsData = await ApiService.getProducts('household');
				console.log('📦 Household products loaded:', productsData);
				setProducts(productsData);
			} catch (err) {
				console.error('❌ Error loading household products:', err);
				setError('Не удалось загрузить товары');
			} finally {
				setLoading(false);
			}
		};

		loadProducts();
	}, []);

	if (loading) {
		return (
			<section className="py-16 bg-white">
				<div className="container mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Бытовые товары</h2>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Откройте для себя нашу коллекцию качественных товаров для вашего бизнеса
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{[...Array(8)].map((_, index) => (
							<ProductCardSkeleton key={index} />
						))}
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="py-16 bg-white">
				<div className="container mx-auto px-4">
					<div className="text-center py-12">
						<p className="text-red-600 mb-4">{error}</p>
						<button
							onClick={() => window.location.reload()}
							className="bg-industrial-accent text-white px-6 py-2 rounded-lg hover:bg-industrial-accent/90 transition-colors"
						>
							Попробовать снова
						</button>
					</div>
				</div>
			</section>
		);
	}

	if (products.length === 0) {
		return null; // Не показываем блок если нет товаров
	}

	// Берем первые 8 товаров как избранные (бэкенд уже отфильтровал по активности)
	const featuredProducts = products.slice(0, 8);

	return (
		<section className="py-16 bg-white">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl lg:text-4xl 2xl:text-5xl font-bold text-gray-900 mb-4">Бытовые товары</h2>
					<p className="text-gray-600 max-w-2xl mx-auto text-lg lg:text-xl">
						Откройте для себя нашу коллекцию качественных товаров для вашего бизнеса
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{featuredProducts.map((product) => (
						<ProductCard key={product.productId} product={product} />
					))}
				</div>

				<div className="text-center mt-12">
					<Link
						to="/catalog?productType=household"
						className="inline-flex items-center bg-industrial-900 text-white px-8 py-3 rounded-lg hover:bg-industrial-800 transition-colors font-medium"
					>
						Все бытовые товары →
					</Link>
				</div>
			</div>
		</section>
	);
};
