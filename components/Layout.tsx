import React, { useState, useEffect } from 'react';
import { buildUrl } from '../config/api';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { CartProvider, useCart } from '../context/CartContext';
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext';
import { ApiService } from '../services/api';
import { CompanyDto } from '../types';
import { SearchIcon, PackageIcon, ShoppingCartIcon, MenuIcon, UserIcon } from './Icons';
import Footer from './Layout_Footer.tsx';

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
									{company?.phone || '+7 747 216 4664'}
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
									{company?.phone || '+7 747 216 4664'}
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
										{company?.phone || '+7 747 216 4664'}
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
									Пн-Пт: {company?.jobStartAndEndDate || '9:00-18:00'}
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

				<Footer company={company} getImageUrl={getImageUrl} />
			</div>
		</CartProvider>
	);
};