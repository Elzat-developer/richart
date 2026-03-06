import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton, LoadingSpinner } from '../components/Skeletons';
import { ApiService } from '../services/api';
import { GetProductsUserDto, CompanyDto } from '../types';
import { PromotionsBlock } from '../components/PromotionsBlock';
import { CategoriesBlock } from '../components/CategoriesBlock';
import { HouseholdCategoriesBlock } from '../components/HouseholdCategoriesBlock';
import { HouseholdProductsBlock } from '../components/HouseholdProductsBlock';

export const HomePage: React.FC = () => {
	const [featuredProducts, setFeaturedProducts] = useState<GetProductsUserDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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

	useEffect(() => {
		const loadProducts = async () => {
			try {
				setLoading(true);
				setError(null);
				console.log('🔄 Loading featured products from ApiService...');
				const products = await ApiService.getProducts('industrial');
				console.log('📦 Raw products data:', products);
				console.log('📊 Data type:', typeof products);
				console.log('📏 Data length:', products?.length);

				// Показываем структуру первого элемента
				if (products && products.length > 0) {
					console.log('🔍 First product structure:', products[0]);
					console.log('🏷️ First product name:', products[0].productName);
					console.log('💰 First product price:', products[0].productPrice);
					console.log('📸 First product photo:', products[0].photoDtoList);
					console.log('📸 Photo URL:', products[0].photoDtoList?.photoURL);
				}

				// Берем первые 8 продуктов как избранные (бэкенд уже отфильтровал по активности)
				const featuredProducts = products.slice(0, 8);
				console.log('✅ Featured products selected:', featuredProducts);
				setFeaturedProducts(featuredProducts);
			} catch (err) {
				console.error('❌ Error loading featured products:', err);
				setError('Не удалось загрузить избранные товары');
			} finally {
				setLoading(false);
			}
		};

		loadProducts();
	}, []);

	return (
		<div>
			{/* PromotionsBlock - только на главной странице */}
			<PromotionsBlock />

			{/* CategoriesBlock - блок с категориями */}
			<CategoriesBlock />

			{/* Featured Products Section */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Рекомендуемые товары
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Откройте для себя нашу коллекцию оборудование высочайшего качества
						</p>
					</div>

					{loading ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{[...Array(8)].map((_, index) => (
								<ProductCardSkeleton key={index} />
							))}
						</div>
					) : error ? (
						<div className="text-center py-12">
							<p className="text-red-600 mb-4">{error}</p>
							<button
								onClick={() => window.location.reload()}
								className="bg-industrial-accent text-white px-6 py-2 rounded-lg hover:bg-industrial-accent/90 transition-colors"
							>
								Попробовать снова
							</button>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
								{featuredProducts.map((product) => (
									<ProductCard key={product.productId} product={product} />
								))}
							</div>

							<div className="text-center mt-12">
								<Link
									to="/catalog"
									className="inline-flex items-center bg-industrial-900 text-white px-8 py-3 rounded-lg hover:bg-industrial-800 transition-colors font-medium"
								>
									Все промышленные товары →
								</Link>
							</div>
						</>
					)}
				</div>
			</section>

			{/* Household Categories Block */}
			<HouseholdCategoriesBlock />

			{/* Household Products Block */}
			<HouseholdProductsBlock />

			{/* Features Section */}
			<section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Оптовые заказы?
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Мы предлагаем специальные условия для корпоративных клиентов и оптовых покупателей
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
							<div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-industrial-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
								<svg className="w-10 h-10 text-industrial-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
								</svg>
							</div>
							<h3 className="text-center text-2xl font-bold text-gray-900 mb-4">Собственное производство</h3>
							<p className="text-center text-gray-600 leading-relaxed">
								Полный контроль качества на каждом этапе производства. Современное оборудование и сертифицированные технологии
							</p>
						</div>

						<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
							<div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
								<svg className="w-10 h-10 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
								</svg>
							</div>
							<h3 className="text-center text-2xl font-bold text-gray-900 mb-4">Надёжная логистика</h3>
							<p className="text-center text-gray-600 leading-relaxed">
								Доставка по всему Казахстану и странам СНГ. Собственный транспорт и партнёрские сети для своевременной поставки
							</p>
						</div>

						<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
							<div className="w-20 h-20 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
								<svg className="w-10 h-10 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
							</div>
							<h3 className="text-center text-2xl font-bold text-gray-900 mb-4">Полная поддержка</h3>
							<p className="text-center text-gray-600 leading-relaxed">
								Комплексное обслуживание от консультации до после продажного сервиса. Техническая поддержка и гарантийные обязательства
							</p>
						</div>
					</div>

					<div className="text-center mt-16">
						<a
							href="https://wa.me/77472164664?text=Здравствуйте!%20Хочу%20сделать%20оптовые%20заказы%20промышленного%20оборудования"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-10 py-4 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
						>
							<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 9.89-5.335 9.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
							</svg>
							Связаться с менеджером
						</a>
						<p className="text-gray-500 mt-4">
							или позвоните: <a href="tel:+77472164664" className="text-industrial-700 font-semibold hover:text-industrial-800">+7 747 216 4664</a>
						</p>
					</div>
				</div>
			</section>

			{/* Map Section */}
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Как нас найти
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Мы предлагаем самый актуальный ассортимент на сегодня и предоставляем клиентам все возможности быть уверенными в покупке.
							Приглашаем посетить наш офис и лично оценить качество изделий,
							проверить характеристики и проконсультироваться с нашими специалистами!
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Contact Info */}
						<div className="space-y-6">
							<div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
								<h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
									<svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
									</svg>
									Адрес
								</h3>
								<address className="text-gray-700 not-italic space-y-2">
									<p className="font-semibold">{company?.address || 'г. Алматы, ул. Толе би, д. 187, Торговый дом «Тумар», 2-й этаж.'}</p>
								</address>
							</div>

							<div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
								<h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
									<svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 3a1 1 0 00-1 1v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
									</svg>
									Контакты
								</h3>
								<div className="space-y-3">
									<p>
										<span className="text-gray-600">Телефон:</span>{' '}
										<a href="tel:+77472164664" className="text-emerald-600 font-semibold hover:text-emerald-700">
											+7 747 216 4664
										</a>
									</p>
									<p>
										<span className="text-gray-600">Email:</span>{' '}
										<a href={`mailto:${company?.email || 'info@industrial-furniture.kz'}`} className="text-emerald-600 font-semibold hover:text-emerald-700">
											{company?.email || 'info@industrial-furniture.kz'}
										</a>
									</p>
									<p>
										<span className="text-gray-600">Время работы:</span>{' '}
										<span className="font-semibold">Пн-Пт: {company?.jobStartAndEndDate || 'Пн-Пт: 9:00-18:00'}</span>
									</p>
								</div>
							</div>

							<div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
								<h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
									<svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
										<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
									</svg>
									Как добраться
								</h3>
								<div className="space-y-3 text-gray-700">
									<p>• <strong>Метро:</strong> Абай (5 минут пешком)</p>
									<p>• <strong>Автобус:</strong> №12, 29, 63 (остановка "Толе би")</p>
									<p>• <strong>Парковка:</strong> Бесплатная для клиентов</p>
								</div>
							</div>
						</div>

						{/* Map */}
						<div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
							<div className="p-4 bg-emerald-600 text-white">
								<h3 className="font-bold text-lg">Интерактивная карта</h3>
							</div>
							<div className="relative">
								<iframe
									src="https://yandex.ru/map-widget/v1/?ll=76.9129%2C43.2569&z=17&pt=76.9129%2C43.2569&mode=search&text=Алматы%2C%20ул.%20Толе%20би%2C%20187"
									width="100%"
									height="450"
									frameBorder="0"
									className="w-full"
									title="Карта проезда к Rest Art"
								></iframe>
								<div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
									<a
										href="https://yandex.ru/maps/?whatshere[point]=76.9129,43.2569&text=Алматы,%20ул.%20Толе%20би,%20187"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 text-sm"
									>
										<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM12 14a1 1 0 00-.707.293l-.707.707a1 1 0 101.414 1.414l.707-.707A1 1 0 0012 14zM5.757 14.243a1 1 0 00-1.414 0l-.707.707a1 1 0 101.414 1.414l.707-.707a1 1 0 000-1.414z" />
										</svg>
										Открыть в Яндекс.Картах
									</a>
								</div>
							</div>
						</div>
					</div>

					{/* Additional Info */}
					<div className="mt-12 text-center">
						<div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-xl border border-emerald-100">
							<h3 className="text-xl font-bold text-gray-900 mb-4">Запишитесь на консультацию</h3>
							<p className="text-gray-700 mb-6 max-w-2xl mx-auto">
								Посетите наш выставочный зал, чтобы увидеть промышленную мебель вживую и получить профессиональную консультацию
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<a
									href="tel:+77472164664"
									className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
								>
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
									</svg>
									Позвонить сейчас
								</a>
								<a
									href="https://wa.me/77472164664?text=Здравствуйте!%20Хочу%20записаться%20на%20консультацию%20в%20выставочный%20зал"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
								>
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
										<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 9.89-5.335 9.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
									</svg>
									Написать в WhatsApp
								</a>
							</div>
						</div>
					</div>
				</div>
			</section >
		</div >
	);
};
