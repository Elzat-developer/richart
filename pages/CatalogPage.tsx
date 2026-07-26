import React, { useEffect, useMemo, useState } from 'react';
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
	const [searchParams, setSearchParams] = useSearchParams();
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 4;

	useEffect(() => {
		if (!showMobileFilter) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	}, [showMobileFilter]);

	useEffect(() => {
		window.dispatchEvent(new CustomEvent('mobile-filters', { detail: { open: showMobileFilter } }));
		return () => {
			window.dispatchEvent(new CustomEvent('mobile-filters', { detail: { open: false } }));
		};
	}, [showMobileFilter]);

	useEffect(() => {
		const pageFromUrl = Number(searchParams.get('page') || '1');
		if (!Number.isNaN(pageFromUrl) && pageFromUrl > 0) {
			setCurrentPage(pageFromUrl);
		} else {
			setCurrentPage(1);
		}
	}, [searchParams]);

	useEffect(() => {
		const fetchCatalog = async () => {
			setLoading(true);
			try {
				const params = {
					categoryId: searchParams.get('categoryId'),
					minPrice: searchParams.get('minPrice'),
					maxPrice: searchParams.get('maxPrice'),
					material: searchParams.get('material'),
					productType: 'industrial' as const,
					active: true
				};

				const data = await ApiService.getFilteredProducts(params);
				setProducts(data);
			} catch (error) {
			} finally {
				setLoading(false);
			}
		};

		fetchCatalog();
	}, [searchParams]);

	const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
	const safeCurrentPage = Math.min(currentPage, totalPages);

	const paginatedProducts = useMemo(() => {
		const startIndex = (safeCurrentPage - 1) * itemsPerPage;
		return products.slice(startIndex, startIndex + itemsPerPage);
	}, [products, safeCurrentPage]);

	const pageNumbers = useMemo(() => {
		const pages: number[] = [];
		const maxVisiblePages = 5;
		let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisiblePages / 2));
		let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
		startPage = Math.max(1, endPage - maxVisiblePages + 1);

		for (let page = startPage; page <= endPage; page += 1) {
			pages.push(page);
		}

		return pages;
	}, [safeCurrentPage, totalPages]);

	const handlePageChange = (page: number) => {
		const nextPage = Math.max(1, Math.min(page, totalPages));
		setCurrentPage(nextPage);

		const nextSearchParams = new URLSearchParams(searchParams);
		nextSearchParams.set('page', String(nextPage));
		setSearchParams(nextSearchParams, { replace: true });
	};

	const startItem = products.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(safeCurrentPage * itemsPerPage, products.length);

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
							{[...Array(4)].map((_, i) => (
								<div key={i} className="bg-gray-200 h-96 w-full"></div>
							))}
						</div>
					) : products.length > 0 ? (
						<>
							<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
								{paginatedProducts.map(product => (
									<ProductCard key={product.productId} product={product} />
								))}
							</div>

							{totalPages > 1 && (
								<div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
									<p className="text-sm text-slate-600">
										Показано <span className="font-semibold text-slate-900">{startItem}</span>–<span className="font-semibold text-slate-900">{endItem}</span> из <span className="font-semibold text-slate-900">{products.length}</span>
									</p>

									<div className="flex flex-wrap items-center gap-2">
										<button
											onClick={() => handlePageChange(1)}
											className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
											disabled={safeCurrentPage === 1}
										>
											«
										</button>
										<button
											onClick={() => handlePageChange(safeCurrentPage - 1)}
											className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
											disabled={safeCurrentPage === 1}
										>
											‹
										</button>

										{pageNumbers.map(page => (
											<button
												key={page}
												onClick={() => handlePageChange(page)}
												className={`min-w-10 rounded-lg px-3 py-2 text-sm font-semibold transition ${safeCurrentPage === page
													? 'bg-emerald-600 text-white shadow-sm'
													: 'border border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600'}`}
											>
												{page}
											</button>
										))}

										<button
											onClick={() => handlePageChange(safeCurrentPage + 1)}
											className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
											disabled={safeCurrentPage === totalPages}
										>
											›
										</button>
										<button
											onClick={() => handlePageChange(totalPages)}
											className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
											disabled={safeCurrentPage === totalPages}
										>
											»
										</button>
									</div>
								</div>
							)}
						</>
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