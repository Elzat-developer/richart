import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiService } from '../services/api';
import { Category, GetCategoriesUserDto, GetProductsUserDto } from '../types';

interface FilterSidebarProps {
	className?: string;
	onCloseMobile?: () => void;
}

const MATERIALS = ['Сталь', 'Алюминий', 'Дерево', 'Пластик'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ className, onCloseMobile }) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [categories, setCategories] = useState<GetCategoriesUserDto[]>([]);
	const [materials] = useState<string[]>(MATERIALS);

	// Local state for inputs to allow typing without immediate URL jumps
	const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
	const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

	useEffect(() => {
		// Загружаем только категории
		ApiService.getCategories().then(setCategories);
	}, []);


	const updateParam = (key: string, value: string | null) => {
		setSearchParams(prev => {
			const newParams = new URLSearchParams(prev);
			if (value) {
				newParams.set(key, value);
			} else {
				newParams.delete(key);
			}
			return newParams;
		});
	};

	const handlePriceApply = () => {
		setSearchParams(prev => {
			const newParams = new URLSearchParams(prev);
			if (minPrice) newParams.set('minPrice', minPrice);
			else newParams.delete('minPrice');

			if (maxPrice) newParams.set('maxPrice', maxPrice);
			else newParams.delete('maxPrice');

			return newParams;
		});
	};

	const currentCategory = searchParams.get('categoryId');
	const currentMaterial = searchParams.get('material');
	const resetFilters = () => {
		setSearchParams({}); // Полностью очищает URL
		setMinPrice('');
		setMaxPrice('');
	};
	return (
		<aside className={`bg-white border border-industrial-200 p-6 flex flex-col h-full ${className}`}>
			<div className="sticky top-0 z-20 bg-white -mx-6 px-6 pt-4 pb-4 border-b border-industrial-100">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-bold font-display uppercase tracking-wide">Фильтры</h2>
					<div className="flex items-center gap-3">
						<button
							onClick={resetFilters}
							className="text-xs text-industrial-accent underline uppercase"
						>
							Сбросить
						</button>
						{onCloseMobile && (
							<button
								onClick={onCloseMobile}
								className="md:hidden text-industrial-900 text-2xl leading-none"
								aria-label="Закрыть фильтры"
							>
								×
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto pt-6 pb-28">
				{/* Category Filter */}
				<div className="mb-8">
					<h3 className="text-sm font-bold uppercase mb-4 text-industrial-500">Категории</h3>
					<div className="space-y-2">
						<label className="flex items-center gap-3 cursor-pointer group">
							<input
								type="radio"
								name="category"
								checked={!currentCategory}
								onChange={() => updateParam('categoryId', null)}
								className="w-4 h-4 text-industrial-accent border-gray-300 focus:ring-industrial-accent"
							/>
							<span className={`text-sm ${!currentCategory ? 'text-industrial-900 font-medium' : 'text-gray-600 group-hover:text-industrial-900'}`}>
								Все категории
							</span>
						</label>
						{categories.map((cat) => (
							<label key={cat.categoryId} className="flex items-center gap-3 cursor-pointer group">
								<input
									type="radio"
									name="category"
									checked={currentCategory === cat.categoryId?.toString()}
									onChange={() => updateParam('categoryId', cat.categoryId?.toString() || '')}
									className="w-4 h-4 text-industrial-accent border-gray-300 focus:ring-industrial-accent"
								/>
								<span
									className={`text-sm ${currentCategory === cat.categoryId?.toString() ? 'text-industrial-900 font-medium' : 'text-gray-600 group-hover:text-industrial-900'}`}
								>
									{cat.categoryName}
								</span>
							</label>
						))}
					</div>
				</div>

				{/* Price Range Filter */}
				<div className="mb-8">
					<h3 className="text-sm font-bold uppercase mb-4 text-industrial-500">Ценовой диапазон (₸)</h3>
					<div className="flex items-center gap-2 mb-3">
						<input
							type="number"
							placeholder="Мин"
							value={minPrice}
							onChange={(e) => setMinPrice(e.target.value)}
							className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-industrial-accent focus:outline-none"
						/>
						<span className="text-gray-400">-</span>
						<input
							type="number"
							placeholder="Макс"
							value={maxPrice}
							onChange={(e) => setMaxPrice(e.target.value)}
							className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-industrial-accent focus:outline-none"
						/>
					</div>
					<button
						onClick={handlePriceApply}
						className="w-full bg-industrial-900 text-white text-xs font-bold uppercase py-2 hover:bg-industrial-700 transition-colors"
					>
						Применить цену
					</button>
				</div>

				{/* Material Filter */}
				<div>
					<h3 className="text-sm font-bold uppercase mb-4 text-industrial-500">Материал</h3>
					<div className="space-y-2">
						<label className="flex items-center gap-3 cursor-pointer">
							<input
								type="radio"
								name="material"
								checked={!currentMaterial}
								onChange={() => updateParam('material', null)}
								className="w-4 h-4 text-industrial-accent focus:ring-industrial-accent"
							/>
							<span className="text-sm text-gray-600">Любой</span>
						</label>
						{materials.map(mat => (
							<label key={mat} className="flex items-center gap-3 cursor-pointer">
								<input
									type="radio"
									name="material"
									checked={currentMaterial === mat}
									onChange={() => updateParam('material', mat)}
									className="w-4 h-4 text-industrial-accent focus:ring-industrial-accent"
								/>
								<span className="text-sm text-gray-600">{mat}</span>
							</label>
						))}
					</div>
				</div>
			</div>

			{onCloseMobile && (
				<div className="md:hidden sticky bottom-0 z-20 bg-white -mx-6 px-6 py-4 border-t border-industrial-100 mt-6">
					<div className="flex items-center justify-between gap-3">
						<button
							onClick={resetFilters}
							className="flex-1 border border-industrial-300 py-3 font-bold uppercase text-xs"
						>
							Сбросить
						</button>
						<button
							onClick={onCloseMobile}
							className="flex-1 bg-industrial-900 text-white py-3 font-bold uppercase text-xs"
						>
							Закрыть
						</button>
					</div>
				</div>
			)}
		</aside>
	);
};