import React, { useState, useEffect } from 'react';
import { buildUrl } from '../config/api';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { CartProvider, useCart } from '../context/CartContext';
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext';
import { ApiService } from '../services/api';
import { CompanyDto } from '../types';
import { SearchIcon, PackageIcon, ShoppingCartIcon, MenuIcon, UserIcon } from './Icons';

const currentYear = new Date().getFullYear();

// Функция для получения корректного URL изображения
const getImageUrl = (url: string): string => {
		return buildUrl(url);
	};

const HeaderContent: React.FC<{ company: CompanyDto | null }> = ({ company }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			const isNearBottom = scrollY + windowHeight >= documentHeight - 100;// 100px от низа 
			// // Мгновенное переключение состояний 
			if (isNearBottom || scrollY <= 1) {
				setIsScrolled(false);
			}
			else if (scrollY > 50) {
				setIsScrolled(true);
			}
		}; window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);
	const { cart } = useCart();

	const cartCount = cart?.items?.length || 0;

	return (
		<>
			<header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border-b border-slate-700 backdrop-blur-sm">
				{/* Top Info Bar */}
				<div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2">
					<div className="container mx-auto px-4">
						<div className="flex flex-col sm:flex-row justify-between items-center text-sm">
							<div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
								<span className="flex items-center gap-2">
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
									</svg>
									+7 747 216 4664
								</span>
								<span className="flex items-center gap-2">
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-8.486 8.486L10 18.485l4.243-4.242a6 6 0 000-8.486zM10 2a4 4 0 00-4 4c0 .465.08.91.227 1.324a1 1 0 11-1.89.648A5.999 5.999 0 0110 0a6 6 0 015.663 8.352 1 1 0 01-1.89-.648c.147-.414.227-.859.227-1.324a4 4 0 00-4-4z" clipRule="evenodd" />
									</svg>
									Казахстан
								</span>
							</div>
							<div className="flex items-center gap-4 mt-2 sm:mt-0">
								<a href="https://wa.me/77472164664" target="_blank" rel="noopener noreferrer" className="hover:bg-white/20 px-3 py-1 rounded transition-colors">
									WhatsApp
								</a>
								<a href="tel:+77472164664" className="hover:bg-white/20 px-3 py-1 rounded transition-colors">
									Позвонить
								</a>
							</div>
						</div>
					</div>
				</div>

				<div className="container mx-auto px-4">
					{/* Main Header */}
					<div className={`transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'} flex items-center justify-between`}>
						{/* Logo */}
						<Link to="/" className={`transition-all duration-300 ${isScrolled ? 'flex flex-col items-center gap-1' : 'flex flex-col items-center gap-2'}`}>
							<div className={`flex items-center gap-3 transition-all duration-300 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
								{company?.logoUrl ? (
									<img
										src={getImageUrl(company.logoUrl)}
										alt={company.name || 'Rest Art'}
										className={`transition-all duration-300 rounded-lg object-contain ${isScrolled ? 'w-8 h-8' : 'w-43 h-36'}`}
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.src = 'https://picsum.photos/64/64?error=logo-failed';
										}}
									/>
								) : (
									<div className={`bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center font-bold text-white font-display shadow-lg transition-all duration-300 ${isScrolled ? 'w-8 h-8 text-xs' : 'w-26 h-16'}`}>
										I
									</div>
								)}
							</div>
							{!isScrolled && (
								<p className="text-xs text-gray-400">Промышленное оборудование с 2015 года</p>
							)}
						</Link>
						{/* Search Bar - Desktop */}
						<div className={`hidden lg:flex transition-all duration-300 ${isScrolled ? 'flex-1 max-w-xl mx-4' : 'flex-1 max-w-2xl mx-8'}`}>
							<div className="relative w-full">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === 'Enter' && searchQuery) {
											window.location.href = `#/catalog?search=${searchQuery}`;
										}
									}}
									placeholder="Поиск по каталогу..."
									className={`w-full transition-all duration-300 ${isScrolled ? 'px-3 py-2 pl-10 text-sm rounded-lg' : 'px-4 py-3 pl-12 bg-slate-800/50 border border-slate-600 rounded-xl'} bg-slate-800/50 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-slate-700/50 backdrop-blur-sm`}
								/>
								<SearchIcon className={`absolute transition-all duration-300 ${isScrolled ? 'left-3 top-2.5 h-4 w-4' : 'left-4 top-3.5 h-5 w-5'} text-gray-400`} />
							</div>
						</div>

						{/* Right Actions */}
						<div className="flex items-center gap-3">
							{/* B2B Button - скрыть при прокрутке */}
							{!isScrolled && (
								<a
									href="https://wa.me/77472164664?text=Здравствуйте!%20Хочу%20сделать%20оптовые%20заказы%20промышленного%20оборудования"
									target="_blank"
									rel="noopener noreferrer"
									className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
								>
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
									</svg>
									B2B
								</a>
							)}

							{/* Mobile Search Toggle */}
							<button
								className={`lg:hidden transition-all duration-300 ${isScrolled ? 'text-gray-300 p-1.5' : 'text-gray-300 p-2'}`}
								onClick={() => setIsSearchOpen(!isSearchOpen)}
							>
								<SearchIcon className={`transition-all duration-300 ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
							</button>

							{/* Orders */}
							<Link to="/orders" className={`relative cursor-pointer group flex items-center gap-2 transition-all duration-300 ${isScrolled ? 'px-2 py-1.5' : 'px-3 py-2'} rounded-lg hover:bg-slate-800/50`}>
								<PackageIcon className={`transition-all duration-300 ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'} text-gray-300 group-hover:text-emerald-400`} />
								<span className={`hidden transition-all duration-300 ${isScrolled ? 'md:block text-xs' : 'md:block text-sm'} text-gray-300 group-hover:text-white`}>Мои заказы</span>
							</Link>

							{/* Cart */}
							<Link to="/cart" className={`relative cursor-pointer group transition-all duration-300 ${isScrolled ? 'p-1.5' : 'p-2'} rounded-lg hover:bg-slate-800/50`}>
								<ShoppingCartIcon className={`transition-all duration-300 ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'} text-gray-300 group-hover:text-emerald-400`} />
								{cartCount > 0 && (
									<span className={`absolute transition-all duration-300 ${isScrolled ? '-top-0.5 -right-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-[8px] font-bold h-4 w-4' : '-top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-[10px] font-bold h-5 w-5'} flex items-center justify-center rounded-full animate-bounce shadow-lg`}>
										{cartCount}
									</span>
								)}
							</Link>

							{/* Mobile Menu */}
							<button
								className={`md:hidden transition-all duration-300 ${isScrolled ? 'text-gray-300 p-1.5' : 'text-gray-300 p-2'}`}
								onClick={() => setIsMenuOpen(!isMenuOpen)}
							>
								<MenuIcon className={`transition-all duration-300 ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
							</button>
						</div>
					</div>

					{/* Mobile Search */}
					{isSearchOpen && (
						<div className="lg:hidden py-4 border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm relative z-20">
							<div className="relative">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === 'Enter' && searchQuery) {
											window.location.href = `#/catalog?search=${searchQuery}`;
										}
									}}
									placeholder="Поиск по каталогу..."
									className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 backdrop-blur-sm transition-all"
									autoFocus
								/>
								<SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
							</div>
						</div>
					)}

					{/* Navigation */}
					<nav className="border-t border-slate-700 bg-slate-800/30 backdrop-blur-sm">
						<div className="flex items-center justify-between py-4">
							<div className="hidden md:flex items-center gap-8">
								<Link to="/" className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium">Главная</Link>
								<Link to="/categories" className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium">Промышленное оборудование</Link>
								<Link to="/about" className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium">О компании</Link>
								<Link to="/household-categories" className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium">Бытовое оборудование</Link>
								<Link to="/news" className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium">Новости</Link>
								<Link to="/design" className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium">Проектирование</Link>
								<Link to="/contacts" className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium">Контакты</Link>
							</div>

							{/* Quick Actions */}
							<div className="hidden lg:flex items-center gap-4">
								<a href={`tel:+77472164664`} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium">
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
									</svg>
									+7 747 216 4664
								</a>
								<a href={`mailto:${company?.email || 'info@industrial-furniture.kz'}`} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
									{company?.email || 'info@industrial-furniture.kz'}
								</a>
							</div>
						</div>
					</nav>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-t border-slate-700 fixed inset-0 z-50">
						<div className="flex flex-col h-full overflow-y-auto">
							{/* Close Button */}
							<div className="flex justify-end p-4">
								<button
									onClick={() => setIsMenuOpen(false)}
									className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>

							{/* B2B Button Mobile */}
							<a
								href="https://wa.me/77472164664?text=Здравствуйте!%20Хочу%20сделать%20оптовые%20заказы%20промышленного%20оборудования"
								target="_blank"
								rel="noopener noreferrer"
								className="mx-4 mt-4 mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg font-semibold text-center"
							>
								B2B заказы
							</a>

							<Link to="/" className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Главная</Link>
							<Link to="/categories" className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Промышленное оборудование</Link>
							<Link to="/about" className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">О компании</Link>
							<Link to="/household-categories" className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Бытовое оборудование</Link>
							<Link to="/news" className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Новости</Link>
							<Link to="/design" className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Проектирование</Link>
							<Link to="/contacts" className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Контакты</Link>
							<Link to="/orders" className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Мои заказы</Link>
							<Link to="/cart" className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Корзина ({cartCount})</Link>

							{/* Contact Info Mobile */}
							<div className="px-4 py-3 border-t border-slate-700 text-gray-300 text-sm">
								<div className="mb-3 flex items-center gap-2">
									<svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
									</svg>
									<a href="tel:+77472164664" className="text-white font-medium">
										+7 747 216 4664
									</a>
								</div>
								<div className="mb-3 flex items-center gap-2">
									<svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
									<a href={`mailto:${company?.email || 'info@industrial-furniture.kz'}`} className="text-white font-medium">
										{company?.email || 'info@industrial-furniture.kz'}
									</a>
								</div>
								<div className="flex items-center gap-2">
									<svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
									</svg>
									Пн-Пт: 9:00-18:00
								</div>
							</div>
						</div>
					</div>
				)}
			</header>
		</>
	);
};

export const Layout: React.FC = () => {
	const [company, setCompany] = useState<CompanyDto | null>(null);

	useEffect(() => {
		const fetchCompany = async () => {
			try {
				const companyData = await ApiService.getCompany();
				setCompany(companyData);
			} catch (error) {
				console.error('Error fetching company info:', error);
			}
		};

		fetchCompany();
	}, []);

	return (
		<CartProvider>
			<div className="flex flex-col min-h-screen bg-industrial-50">
				<HeaderContent company={company} />
				<main className="flex-grow relative z-30">
					<Outlet />
				</main>

				{/* Footer */}
				<footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-300 border-t border-slate-700">
					<div className="container mx-auto px-4 py-16">
						{/* Main Footer Content */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
							{/* Company Info */}
							<div className="lg:col-span-1">
								<Link to="/" className="flex items-center gap-3">
									{company?.logoUrl ? (
										<img
											src={getImageUrl(company.logoUrl)}
											className="w-42 h-40 rounded-lg object-contain"
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												target.src = 'https://picsum.photos/80/80?error=logo-failed';
											}}
										/>
									) : (
										<div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-lg font-bold font-display shadow-lg">
											I
										</div>
									)}
								</Link>
								<p className="text-gray-400 leading-relaxed mb-6">
									Ведущий поставщик профессионального кухонного оборудования для ресторанов
									кафе, баров и других заведений общественного питания с 2015 года
								</p>
								<div className="flex gap-3">
									<a href="https://wa.me/77472164664" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white hover:bg-green-600 transition-all shadow-lg">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 011.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
										</svg>
									</a>
									<a href="https://www.instagram.com/restart_market.kz" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all shadow-lg">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
										</svg>
									</a>
									<a href="https://www.youtube.com/@restarthoreca3196" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white hover:bg-red-700 transition-all shadow-lg">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
										</svg>
									</a>
								</div>

								{/* Products */}
								<div>
									<h3 className="text-white font-bold uppercase tracking-wide mb-6 text-sm">Продукция</h3>
									<ul className="space-y-3">
										<li><Link to="/categories" className="text-gray-400 hover:text-emerald-400 transition-colors">Промышленные аппараты</Link></li>
										<li><Link to="/categories" className="text-gray-400 hover:text-emerald-400 transition-colors">Кухонные стеллажи</Link></li>
										<li><Link to="/categories" className="text-gray-400 hover:text-emerald-400 transition-colors">Льдогенераторы</Link></li>
										<li><Link to="/categories" className="text-gray-400 hover:text-emerald-400 transition-colors">Охладители бокалов</Link></li>
										<li><Link to="/categories" className="text-gray-400 hover:text-emerald-400 transition-colors">Инструментальные шкафы</Link></li>
										<li><Link to="/categories" className="text-gray-400 hover:text-emerald-400 transition-colors">Термоблендеры</Link></li>
									</ul>
								</div>

								{/* Services */}
								<div>
									<h3 className="text-white font-bold uppercase tracking-wide mb-6 text-sm">Новости</h3>
									<ul className="space-y-3">
										<li><Link to="/news" className="text-gray-400 hover:text-emerald-400 transition-colors">Последние новости</Link></li>
										<li><Link to="/news" className="text-gray-400 hover:text-emerald-400 transition-colors">Статьи и обзоры</Link></li>
										<li><Link to="/news" className="text-gray-400 hover:text-emerald-400 transition-colors">Пресс-релизы</Link></li>
										<li><Link to="/news" className="text-gray-400 hover:text-emerald-400 transition-colors">Мероприятия</Link></li>
										<li><Link to="/news" className="text-gray-400 hover:text-emerald-400 transition-colors">Архив новостей</Link></li>
										<li><Link to="/news" className="text-gray-400 hover:text-emerald-400 transition-colors">Новые аппараты</Link></li>
									</ul>
								</div>

								{/* Contacts */}
								<div>
									<h3 className="text-white font-bold uppercase tracking-wide mb-6 text-sm">Контакты</h3>
									<div className="space-y-4">
										<div className="flex items-start gap-3">
											<svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
												<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
											</svg>
											<div>
												<p className="text-gray-400">Телефон</p>
												<a href="tel:+77472164664" className="text-white font-medium hover:text-emerald-400 transition-colors">
													+7 747 216 4664</a>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 4H8m8-8H8m12 16H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v16a2 2 0 01-2 2z" />
											</svg>
											<div>
												<p className="text-gray-400">Email</p>
												<a href={`mailto:${company?.email || 'info@industrial-furniture.kz'}`} className="text-white font-medium hover:text-emerald-400 transition-colors">
													{company?.email || 'info@industrial-furniture.kz'}
												</a>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
											</svg>
											<div>
												<p className="text-gray-400">Адрес</p>
												<p className="text-white">{company?.address || 'г. Алматы, ул. Толе би, д. 187, Торговый дом «Тумар», 2-й этаж.'}</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
											</svg>
											<div>
												<p className="text-gray-400">Режим работы</p>
												<p className="text-white">{company?.workingHours || 'Пн-Пт: 9:00-18:00'}</p>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* B2B Section */}
							<div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 mb-12">
								<div className="flex flex-col lg:flex-row items-center justify-between gap-6">
									<div>
										<h3 className="text-2xl font-bold text-white mb-2">Работаем с B2B клиентами</h3>
										<p className="text-emerald-50">Специальные условия для оптовых покупателей и корпоративных заказов</p>
									</div>
									<div className="flex flex-col sm:flex-row gap-3">
										<a
											href="https://wa.me/77472164664?text=Здравствуйте!%20Хочу%20сделать%20оптовые%20заказы%20промышленного%20оборудования"
											target="_blank"
											rel="noopener noreferrer"
											className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
										>
											WhatsApp
										</a>
										<a
											href="tel:+77472164664"
											className="bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-800 transition-colors text-center"
										>
											Позвонить
										</a>
									</div>
								</div>
							</div>

							{/* Bottom Footer */}
							<div className="border-t border-slate-700 pt-8">
								<div className="flex flex-col md:flex-row justify-between items-center gap-4">
									<div className="text-gray-400 text-sm">
										&copy; {currentYear} RichArt. Все права защищены.
									</div>
									<div className="flex flex-wrap gap-6 text-sm">
										<a className="text-gray-400 hover:text-emerald-400 transition-colors">Политика конфиденциальности</a>
										<a href="/contacts#/contacts" className="text-gray-400 hover:text-emerald-400 transition-colors">Реквизиты</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</CartProvider>
	);
};