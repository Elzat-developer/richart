import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterSidebar } from '../components/FilterSidebar';
import { FilterIcon } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { ApiService } from '../services/api';
import { GetProductsUserDto } from '../types';

export const CatalogPage: React.FC = () => {
	const [products, setProducts] = useState<GetProductsUserDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [showMobileFilter, setShowMobileFilter] = useState(false);
	const [searchParams] = useSearchParams();

	useEffect(() => {
		if (!showMobileFilter) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	}, [showMobileFilter]);

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
					productType: 'industrial' as const, // Всегда фильтруем по промышленным товарам
					active: true // Всегда фильтруем только активные товары
				};

				// 2. Делаем запрос сразу с фильтрами к бэкенду
				// Используем метод, который мы создали в ApiService
				const data = await ApiService.getFilteredProducts(params);

				// 3. Просто сохраняем результат. Бэкенд уже всё отфильтровал за нас!
				setProducts(data);

				console.log('✅ Catalog loaded from backend with filters:', params);
			} catch (error) {
				console.error("Failed to load catalog", error);
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

				{/* Sidebar (Desktop) */}
				<div className="hidden md:block md:w-64">
					<FilterSidebar className="md:h-auto" />
				</div>

				{/* Sidebar (Mobile Overlay) */}
				{showMobileFilter && (
					<div className="fixed inset-0 z-[9999] md:hidden">
						<div
							className="absolute inset-0 bg-black/50"
							onClick={() => setShowMobileFilter(false)}
						></div>
						<div className="absolute inset-0 bg-white">
							<FilterSidebar
								className="h-full overflow-y-auto"
								onCloseMobile={() => setShowMobileFilter(false)}
							/>
						</div>
					</div>
				)}

				{/* Product Grid */}
				<div className="flex-1">
					<div className="mb-6 flex items-center justify-between">
						<h1 className="text-2xl font-bold font-display uppercase text-industrial-900">
							Каталог <span className="text-gray-400 text-lg font-normal ml-2">({products.length} товаров)</span>
						</h1>
					</div>

					{loading ? (
						<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="bg-gray-200 h-96 w-full"></div>
							))}
						</div>
					) : products.length > 0 ? (
						<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
							{products.map(product => (
								<ProductCard key={product.productId} product={product} />
							))}
						</div>
					) : (
						<div className="text-center py-20 bg-white border border-industrial-100">
							<p className="text-gray-500 text-lg">Товары не найдены по выбранным фильтрам.</p>
							<button
								onClick={() => window.location.href = '/catalog#/catalog'}
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