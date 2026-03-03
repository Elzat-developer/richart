import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CompanyDto } from '../types';
import { ApiService } from '../services/api';

// Функция для получения корректного URL изображения
const getImageUrl = (urlPhoto: string): string => {
	if (!urlPhoto) return 'https://picsum.photos/400/225?error=no-url';

	if (urlPhoto.startsWith('http://') || urlPhoto.startsWith('https://')) {
		return urlPhoto;
	}

	if (urlPhoto.match(/^[A-Za-z]:/)) {
		const uploadsMatch = urlPhoto.match(/uploads\/(.+)/);
		if (uploadsMatch) {
			return `http://localhost:8080/uploads/${uploadsMatch[1]}`;
		}
		return `http://localhost:8080/${urlPhoto.replace(/^[A-Za-z]:\\/, '').replace(/\\/g, '/')}`;
	}

	if (urlPhoto.startsWith('/api')) {
		return `http://localhost:8080${urlPhoto}`;
	}

	if (urlPhoto.startsWith('/')) {
		return `http://localhost:8080${urlPhoto}`;
	}

	return `http://localhost:8080/${urlPhoto}`;
};

const AboutPage: React.FC = () => {
	const [company, setCompany] = useState<CompanyDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCompany = async () => {
			try {
				const companyData = await ApiService.getCompany();
				setCompany(companyData);
			} catch (err) {
				setError('Не удалось загрузить информацию о компании');
				console.error('Error fetching company data:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchCompany();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Загрузка информации о компании...</p>
				</div>
			</div>
		);
	}

	if (error || !company) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="bg-red-50 border border-red-200 rounded-lg p-6">
						<h3 className="text-red-800 font-semibold mb-2">Ошибка загрузки</h3>
						<p className="text-red-600">{error}</p>
						<Link
							to="/"
							className="mt-4 inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
						>
							На главную
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section с логотипом */}
			<section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 relative overflow-hidden">
				{/* Декоративные элементы */}
				<div className="absolute inset-0 bg-black opacity-20"></div>
				<div className="absolute top-10 right-10 w-32 h-32 bg-emerald-500 rounded-full opacity-10 blur-xl"></div>
				<div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-500 rounded-full opacity-10 blur-xl"></div>

				<div className="container mx-auto px-4 relative z-10">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Логотип и информация */}
						<div className="text-center lg:text-left">
							{company.logoUrl && (
								<div className="mb-8 inline-block">
									<img
										src={getImageUrl(company.logoUrl)}
										alt={company.name}
										className="w-43 h-36 object-contain rounded-lg"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.src = 'https://picsum.photos/172/144?error=about-logo-failed';
										}}
									/>
								</div>
							)}
							<p className="text-xl text-gray-300 mb-8 leading-relaxed">
								Ваш надежный партнер в мире профессионального кухонного оборудования
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
								<a
									href={`tel:${company.phone.replace(/\s+/g, '')}`}
									className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
								>
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
									</svg>
									{company.phone}
								</a>
								<Link
									to="/catalog"
									className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-3 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 font-semibold shadow-lg"
								>
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
									</svg>
									Каталог продукции
								</Link>
							</div>
						</div>

						{/* Статистика или преимущества */}
						<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
							<h3 className="text-2xl font-bold mb-6">Наши преимущества</h3>
							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
									<div>
										<h4 className="font-semibold">Профессиональная консультация</h4>
										<p className="text-gray-300 text-sm">Команда экспертов по оптимальному выбору оборудования</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
									<div>
										<h4 className="font-semibold">Гарантия качества</h4>
										<p className="text-gray-300 text-sm">Соответствие международным стандартам</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
									<div>
										<h4 className="font-semibold">Быстрая доставка</h4>
										<p className="text-gray-300 text-sm">Доставляем оборудование по всей территории Казахстана</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* О компании */}
			<section className="py-20 bg-white">
				<div className="container mx-auto px-4">
					<div className="max-w-6xl mx-auto">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
							{/* Текст слева */}
							<div className="text-left">
								<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
									О нашей компании
								</h2>
								<div className="w-20 h-1 bg-emerald-600 mb-8"></div>

								<div className="prose prose-lg max-w-none">
									<div
										className="text-gray-700 leading-relaxed text-lg mb-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-3 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-gray-800 [&_h4]:mt-4 [&_h4]:mb-2 [&_ul]:list-none [&_ul]:pl-0 [&_ul]:my-4 [&_li]:relative [&_li]:pl-6 [&_li]:mb-2 [&_li]:leading-relaxed [&_li:before]:content-['•'] [&_li:before]:absolute [&_li:before]:left-0 [&_li:before]:text-emerald-600 [&_li:before]:font-bold [&_strong]:text-emerald-700 [&_strong]:font-semibold [&_p]:mb-4 [&_p]:leading-relaxed"
										dangerouslySetInnerHTML={{ __html: company.text }}
									/>
								</div>

								{/* Дополнительные преимущества */}
								<div className="mt-8 space-y-4">
									<div className="flex items-start gap-3">
										<div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
										<div>
											<h4 className="font-semibold text-gray-900">Качество и надежность</h4>
											<p className="text-gray-600 text-sm">Мы предлагаем только сертифицированное оборудование, которое прослужит вам долгие годы.</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
										<div>
											<h4 className="font-semibold text-gray-900">Широкий ассортимент</h4>
											<p className="text-gray-600 text-sm">У нас есть решения для заведений любого формата и масштаба.</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
										<div>
											<h4 className="font-semibold text-gray-900">Доступные цены</h4>
											<p className="text-gray-600 text-sm">Мы обеспечиваем честную стоимость продукции без лишних наценок.</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
										<div>
											<h4 className="font-semibold text-gray-900">Быстрая доставка</h4>
											<p className="text-gray-600 text-sm">Оперативно доставляем оборудование по всей территории Казахстана, благодаря отлаженной логистике.</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
										<div>
											<h4 className="font-semibold text-gray-900">Профессиональная консультация</h4>
											<p className="text-gray-600 text-sm">Наша команда экспертов поможет вам выбрать оптимальное оборудование, учитывая специфику вашего бизнеса.</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
										<div>
											<h4 className="font-semibold text-gray-900">Гарантия на продукцию</h4>
											<p className="text-gray-600 text-sm">Вся техника сопровождается официальной гарантией.</p>
										</div>
									</div>
								</div>
							</div>

							{/* Изображение или визуальный элемент справа */}
							<div className="relative">
								<div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
									<div className="text-center">
										<div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
											<svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
												<path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
											</svg>
										</div>
										<h3 className="text-2xl font-bold text-gray-900 mb-4">
											Профессиональное кухонное оборудование
										</h3>
										<p className="text-gray-600 mb-6">
											Вся продукция отличается высокой надежностью, долговечностью и удобством в эксплуатации. Мы сотрудничаем с проверенными производителями и гарантируем качество каждого изделия.
										</p>

										<div className="grid grid-cols-2 gap-4 text-center">
											<div className="bg-white rounded-lg p-4">
												<div className="text-2xl font-bold text-emerald-600">Гарантия</div>
												<div className="text-sm text-gray-600">Официальная</div>
											</div>
											<div className="bg-white rounded-lg p-4">
												<div className="text-2xl font-bold text-emerald-600">10+</div>
												<div className="text-sm text-gray-600">Лет опыта</div>
											</div>
											<div className="bg-white rounded-lg p-4">
												<div className="text-2xl font-bold text-emerald-600">KZ</div>
												<div className="text-sm text-gray-600">Вся страна</div>
											</div>
											<div className="bg-white rounded-lg p-4">
												<div className="text-2xl font-bold text-emerald-600">до 2 лет</div>
												<div className="text-sm text-gray-600">Сервисное обслуживание</div>
											</div>
										</div>
									</div>
								</div>

								{/* Декоративный элемент */}
								<div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500 rounded-full opacity-10 blur-xl"></div>
								<div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500 rounded-full opacity-10 blur-xl"></div>
							</div>

						</div>
					</div>
				</div>
			</section>

			{/* Контактная информация и реквизиты */}
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="max-w-7xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
								Контакты и реквизиты
							</h2>
							<div className="w-20 h-1 bg-emerald-600 mx-auto"></div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Контактная информация */}
							<div className="lg:col-span-2 space-y-8">
								{/* Карта */}
								<div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
									<div className="p-6 border-b border-gray-100">
										<h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
											<div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
												<svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
												</svg>
											</div>
											Наше местоположение
										</h3>
									</div>
									<div className="relative h-96">
										<iframe
											src="https://yandex.ru/map-widget/v1/?ll=76.899480%2C43.252110&z=17&pt=76.899480%2C43.252110&mode=whatshere&whatshere%5Bpoint%5D=76.899480%2C43.252110"
											width="100%"
											height="100%"
											frameBorder="0"
											className="w-full h-full"
											allowFullScreen
										></iframe>
									</div>
									<div className="p-6 bg-gray-50">
										<p className="text-gray-700 font-medium">
											📍 г. Алматы, ул. Толе би, д. 187
										</p>
										<p className="text-gray-600 text-sm mt-2">
											Торговый дом «Тумар», 2-й этаж
										</p>
									</div>
								</div>

								{/* Контактные карточки */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Телефон */}
									<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
										<div className="flex items-center gap-4 mb-4">
											<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
												<svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
													<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
												</svg>
											</div>
											<div>
												<h4 className="font-semibold text-gray-900">Телефон</h4>
												<p className="text-gray-600 text-sm">Звоните нам</p>
											</div>
										</div>
										<a
											href={`tel:${company.phone.replace(/\s+/g, '')}`}
											className="text-emerald-600 font-bold text-lg hover:text-emerald-700 transition-colors"
										>
											{company.phone}
										</a>
									</div>

									{/* Email */}
									<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
										<div className="flex items-center gap-4 mb-4">
											<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
												<svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
													<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
													<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
												</svg>
											</div>
											<div>
												<h4 className="font-semibold text-gray-900">Email</h4>
												<p className="text-gray-600 text-sm">Пишите нам</p>
											</div>
										</div>
										<a
											href={`mailto:${company.email}`}
											className="text-emerald-600 font-bold text-lg hover:text-emerald-700 transition-colors"
										>
											{company.email}
										</a>
									</div>

									{/* Время работы */}
									<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
										<div className="flex items-center gap-4 mb-4">
											<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
												<svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
												</svg>
											</div>
											<div>
												<h4 className="font-semibold text-gray-900">Время работы</h4>
												<p className="text-gray-600 text-sm">Мы на связи</p>
											</div>
										</div>
										<p className="text-gray-900 font-medium">Пн-Пт: {company.jobStartAndEndDate}</p>
									</div>

									{/* WhatsApp */}
									<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
										<div className="flex items-center gap-4 mb-4">
											<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
												<svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
													<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" />
												</svg>
											</div>
											<div>
												<h4 className="font-semibold text-gray-900">WhatsApp</h4>
												<p className="text-gray-600 text-sm">Быстрая связь</p>
											</div>
										</div>
										<a
											href="https://wa.me/77777188878"
											target="_blank"
											rel="noopener noreferrer"
											className="text-green-600 font-bold text-lg hover:text-green-700 transition-colors"
										>
											{company.phone}
										</a>
									</div>
								</div>
							</div>

							{/* Реквизиты */}
							<div className="lg:col-span-1">
								<div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-8">
									<h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
										<div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
											<svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
											</svg>
										</div>
										Реквизиты компании
									</h3>

									<div className="bg-gray-50 rounded-xl p-6 mb-6">
										<div className="whitespace-pre-line text-gray-700 font-mono text-sm leading-relaxed">
											{company.requisites}
										</div>
									</div>

									<div className="space-y-4">
										<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
											<p className="text-blue-800 text-sm font-medium">
												📋 Для юридических лиц
											</p>
											<p className="text-blue-700 text-xs mt-1">
												Все документы для бухгалтерии предоставляем при оформлении заказа
											</p>
										</div>



										<div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
											<p className="text-orange-800 text-sm font-medium">
												🚚 Доставка
											</p>
											<p className="text-orange-700 text-xs mt-1">
												По всему Казахстану и странам СНГ
											</p>
										</div>
									</div>

									{/* Кнопка связи */}
									<a
										href="https://wa.me/77777188878?text=Здравствуйте!%20Хочу%20получить%20реквизиты%20для%20оплаты"
										target="_blank"
										rel="noopener noreferrer"
										className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
									>
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" />
										</svg>
										Получить реквизиты
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-3xl lg:text-4xl font-bold mb-6">
							Готовы начать сотрудничество?
						</h2>
						<p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
							Свяжитесь с нами сегодня и получите бесплатную консультацию по подбору кухонного оборудование для вашего бизнеса
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<a
								href={`tel:${company.phone.replace(/\s+/g, '')}`}
								className="inline-flex items-center justify-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 font-bold text-lg shadow-xl"
							>
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
								</svg>
								Позвонить сейчас
							</a>
							<a
								href={`https://wa.me/77777188878?text=Здравствуйте!%20Я%20заинтересован%20в%20сотрудничестве%20с%20вашей%20компанией.%20Прошу%20предоставить%20дополнительную%20информацию%20о%20ваших%20продуктах%20и%20услугах.`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 font-bold text-lg shadow-xl"
							>
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" />
								</svg>
								Написать в WhatsApp
							</a>
						</div>

						<div className="mt-8 text-emerald-100">
							<p className="text-sm">
								Работаем с юридическими лицами и ИП по всему Казахстану и Странами СНГ
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AboutPage;
