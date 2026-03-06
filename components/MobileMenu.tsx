import React from 'react';
import { Link } from 'react-router-dom';
import { CompanyDto } from '../types';

interface MobileMenuProps {
	isOpen: boolean;
	onClose: () => void;
	company: CompanyDto | null;
	cartCount: number;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, company, cartCount }) => {
	if (!isOpen) return null;

	return (
		<div className="md:hidden bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-t border-slate-700 fixed inset-0 z-[60]">
			<div className="flex flex-col h-full overflow-y-auto">
				{/* Close Button */}
				<div className="flex justify-end p-4">
					<button
						onClick={onClose}
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

				<Link to="/" onClick={onClose} className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Главная</Link>
				<Link to="/categories" onClick={onClose} className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Промышленное оборудование</Link>
				<Link to="/about" onClick={onClose} className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">О компании</Link>
				<Link to="/household-categories" onClick={onClose} className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Бытовое оборудование</Link>
				<Link to="/news" onClick={onClose} className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Новости</Link>
				<Link to="/design" onClick={onClose} className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Проектирование</Link>
				<Link to="/contacts" onClick={onClose} className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Контакты</Link>
				<Link to="/orders" onClick={onClose} className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Мои заказы</Link>
				<Link to="/cart" onClick={onClose} className="px-4 py-3 border-b border-slate-700 text-gray-300 hover:bg-slate-700/50 transition-colors">Корзина ({cartCount})</Link>

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
	);
};

export default MobileMenu;
