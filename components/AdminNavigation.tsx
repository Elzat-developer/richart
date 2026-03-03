import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
	PackageIcon,
	CategoryIcon,
	FileSpreadsheetIcon,
	UploadIcon,
	HomeIcon,
	LogOutIcon,
	UserIcon,
	TagIcon,
	FileTextIcon,
	ShoppingBagIcon,
	BuildingOfficeIcon
} from './Icons';

interface AdminNavigationProps {
	className?: string;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ className = '' }) => {
	const { admin, logout } = useAdminAuth();
	const location = useLocation();

	const isActive = (path: string) => {
		return location.pathname === path || location.pathname.startsWith(path + '/');
	};

	const navigationItems = [
		{
			name: 'Главная',
			path: '/admin/dashboard',
			icon: HomeIcon,
			description: 'Обзор статистики'
		},
		{
			name: 'Товары',
			path: '/admin/products',
			icon: PackageIcon,
			description: 'Управление товарами'
		},
		{
			name: 'Категории',
			path: '/admin/categories',
			icon: CategoryIcon,
			description: 'Управление категориями'
		},
		{
			name: 'Акции',
			path: '/admin/promotions',
			icon: TagIcon,
			description: 'Промо-акции и скидки'
		},
		{
			name: 'Новости',
			path: '/admin/news',
			icon: FileTextIcon,
			description: 'Новости и объявления'
		},
		{
			name: 'Заказы',
			path: '/admin/orders',
			icon: ShoppingBagIcon,
			description: 'Управление заказами'
		},
		{
			name: 'Тех. спецификации',
			path: '/admin/tech-specs',
			icon: FileSpreadsheetIcon,
			description: 'Технические документы'
		},
		{
			name: 'Компания',
			path: '/admin/company',
			icon: BuildingOfficeIcon,
			description: 'Редактирование данных компании'
		},
		{
			name: 'Импорт',
			path: '/admin/import',
			icon: UploadIcon,
			description: 'Импорт Zip'
		}
	];

	return (
		<nav className={`bg-industrial-900 text-white shadow-lg ${className}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Top bar */}
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center">
						<h1 className="text-xl font-bold">CRM система от Make IT</h1>
					</div>
					<div className="flex items-center space-x-4">
						<div className="flex items-center text-sm">
							<UserIcon className="h-4 w-4 mr-2" />
							<span className="text-gray-300">{admin?.email}</span>
						</div>
						<button
							onClick={logout}
							className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors"
							title="Выйти"
						>
							<LogOutIcon className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* Navigation menu */}
				<div className="border-t border-industrial-800">
					<div className="flex space-x-1 py-2 overflow-x-auto">
						{navigationItems.map((item) => {
							const Icon = item.icon;
							const active = isActive(item.path);

							return (
								<Link
									key={item.path}
									to={item.path}
									className={`
                    flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                    ${active
											? 'bg-industrial-accent text-white'
											: 'text-gray-300 hover:text-white hover:bg-industrial-800'
										}
                  `}
									title={item.description}
								>
									<Icon className="h-4 w-4 mr-2" />
									{item.name}
								</Link>
							);
						})}
					</div>
				</div>
			</div>
		</nav>
	);
};
