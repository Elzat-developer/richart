import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HouseholdFilterSidebar } from '../components/HouseholdFilterSidebar';
import { FilterIcon } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { ApiService } from '../services/api';
import { GetProductsUserDto } from '../types';

export const HouseholdCatalogPage: React.FC = () => {
	const [products, setProducts] = useState<GetProductsUserDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [showMobileFilter, setShowMobileFilter] = useState(false);
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const fetchCatalog = async () => {
			setLoading(true);
			try {
				// 1. Собираем параметры из URL
				const params = {
					categoryId: searchParams.get('categoryId'),
					minPrice: searchParams.get('minPrice'),
					maxPrice: searchParams.get('maxPrice'),
					material: searchParams.get('material'),
					productType: 'household' as const, // Всегда фильтруем по бытовым товарам
					active: true // Всегда фильтруем только активные товары
				};

				// 2. Делаем запрос с фильтрами к бэкенду
				const data = await ApiService.getFilteredProducts(params);

				// 3. Сохраняем результат
				setProducts(data);

				console.log('✅ Household catalog loaded from backend with filters:', params);
			} catch (error) {
				console.error("Failed to load household catalog", error);
			} finally {
				setLoading(false);
			}
		};

		fetchCatalog();
	}, [searchParams]);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col md:flex-row gap-8">

				{/* Mobile Filter Toggle */}
				<button
					className="md:hidden flex items-center justify-center gap-2 w-full bg-white border border-industrial-300 py-3 font-bold uppercase text-sm"
					onClick={() => setShowMobileFilter(true)}
				>
					<FilterIcon size={16} /> Фильтры
				</button>

				{/* Sidebar */}
				<div className={`
          fixed top-0 left-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:w-64 md:block
          ${showMobileFilter ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
					<HouseholdFilterSidebar
						className="h-full md:h-auto overflow-y-auto"
						onCloseMobile={() => setShowMobileFilter(false)}
						categoryType="household"
					/>
				</div>

				{/* No overlay needed - content shifts instead of being covered */}

				{/* Product Grid */}
				<div className={`flex-1 ${showMobileFilter ? 'ml-64' : ''}`}>
					<div className="mb-6 flex items-center justify-between">
						<h1 className="text-2xl font-bold font-display uppercase text-industrial-900">
							Бытовые товары <span className="text-gray-400 text-lg font-normal ml-2">({products.length} товаров)</span>
						</h1>
					</div>

					{loading ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="bg-gray-200 h-96 w-full"></div>
							))}
						</div>
					) : products.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{products.map(product => (
								<ProductCard key={product.productId} product={product} />
							))}
						</div>
					) : (
						<div className="text-center py-20 bg-white border border-industrial-100">
							<p className="text-gray-500 text-lg">Бытовые товары не найдены по выбранным фильтрам.</p>
							<button
								onClick={() => window.location.href = '/household-catalog#/household-catalog'}
								className="mt-4 text-industrial-accent font-bold hover:underline"
							>
								Сбросить все фильтры
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
