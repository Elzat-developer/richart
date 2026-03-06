import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api';

interface CompanyDto {
	companyName: string;
	address: string;
	phone: string;
	email: string;
	workingHours: string;
	requisites: string;
	socialMedia: {
		instagram?: string;
		facebook?: string;
		youtube?: string;
	};
}

const ContactsPage: React.FC = () => {
	const [company, setCompany] = useState<CompanyDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCompany = async () => {
			try {
				setLoading(true);
				const companyData = await ApiService.getCompany();
				setCompany(companyData);
				setError(null);
			} catch (err) {
				console.error('Error fetching company info:', err);
				setError('Не удалось загрузить контактную информацию. Попробуйте позже.');
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
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Загрузка контактной информации...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-500 text-6xl mb-4">⚠️</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
					>
						Попробовать снова
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 text-white py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h1 className="text-4xl lg:text-5xl font-bold mb-4">
							Контактная информация
						</h1>
						<p className="text-xl text-blue-100 mb-8">
							Свяжитесь с нами для сотрудничества и консультаций
						</p>
						<div className="w-20 h-1 bg-white mx-auto"></div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						{/* Contact Information */}
						<div>
							<h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
								Контактная информация
							</h2>

							<div className="space-y-6">
								{/* Address */}
								<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
									<div className="flex items-start gap-4">
										<div className="bg-emerald-100 text-emerald-600 p-3 rounded-lg flex-shrink-0">
											<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
											</svg>
										</div>
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-2">Адрес</h3>
											<p className="text-gray-600 leading-relaxed">
												{company?.address || 'Загрузка...'}
											</p>
										</div>
									</div>
								</div>

								{/* Phone */}
								<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
									<div className="flex items-start gap-4">
										<div className="bg-blue-100 text-blue-600 p-3 rounded-lg flex-shrink-0">
											<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
												<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
											</svg>
										</div>
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-2">Телефон</h3>
											<div className="space-y-2">
												<a
													href="tel:+77472164664"
													className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors flex items-center gap-2"
												>
													+7 747 216 4664
												</a>
												<a
													href="https://wa.me/77472164664"
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-2"
												>
													<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
														<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
													</svg>
													WhatsApp
												</a>
											</div>
										</div>
									</div>
								</div>

								{/* Email */}
								<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
									<div className="flex items-start gap-4">
										<div className="bg-purple-100 text-purple-600 p-3 rounded-lg flex-shrink-0">
											<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
												<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
												<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
											</svg>
										</div>
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-2">E-mail</h3>
											<a
												href={`mailto:${company?.email || 'info@example.com'}`}
												className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
											>
												{company?.email || 'info@example.com'}
											</a>
										</div>
									</div>
								</div>

								{/* Working Hours */}
								<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
									<div className="flex items-start gap-4">
										<div className="bg-orange-100 text-orange-600 p-3 rounded-lg flex-shrink-0">
											<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
											</svg>
										</div>
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-2">Режим работы</h3>
											<p className="text-gray-600 leading-relaxed">
												{company?.workingHours || 'Пн-Пт: 9:00 - 18:00'}
											</p>
										</div>
									</div>
								</div>

								{/* Requisites */}
								{company?.requisites && (
									<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
										<div className="flex items-start gap-4">
											<div className="bg-gray-100 text-gray-600 p-3 rounded-lg flex-shrink-0">
												<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
												</svg>
											</div>
											<div>
												<h3 className="text-lg font-semibold text-gray-900 mb-2">Реквизиты</h3>
												<p className="text-gray-600 leading-relaxed whitespace-pre-line">
													{company.requisites}
												</p>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Map */}
						<div>
							<h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
								Наше местоположение
							</h2>

							<div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
								<div className="aspect-square lg:aspect-video">
									<iframe
										src="https://yandex.ru/map-widget/v1/?um=comment%3A%20RESTArt%2F%2F&ll=76.899480%2C43.252110&z=16"
										width="100%"
										height="100%"
										style={{ border: 0 }}
										allowFullScreen
										loading="lazy"
										className="w-full h-full"
									/>
								</div>
								<div className="p-6">
									<div className="flex items-center gap-2 text-emerald-600 font-medium mb-2">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
										</svg>
										{company?.companyName || 'RESTArt'}
									</div>
									<p className="text-gray-600">
										{company?.address || 'Загрузка адреса...'}
									</p>
									<a
										href="https://yandex.ru/maps/?ll=76.899480%2C43.252110&z=16&text=RESTArt"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors mt-3"
									>
										<path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1-2.828-2.828l3-3zm-4.172 8.828a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0-2-2 2 0 010-2.828l3-3z" clipRule="evenodd" />
										Открыть в Яндекс Картах
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Feedback Section */}
			<div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 border border-gray-100 mb-12">
				<div className="text-center mb-8">
					<div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
						</svg>
					</div>
					<h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
						Уважаемые клиенты и партнеры!
					</h2>
					<p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mt-4">
						Мы стремимся к тому, чтобы наш магазин постоянно развивался, и прикладываем к этому все усилия.
						Но мы бы не смогли успешно делать это без вашего непосредственного участия. Поэтому для нас важно
						каждое ваше мнение или идея.
					</p>
					<p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mt-4">
						Если у вас есть какие-либо предложения о сотрудничестве или замечания по поводу работы магазина,
						или вы просто хотели бы оставить обратную связь – напишите нам.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<a
						href="https://wa.me/77472164664?text=Здравствуйте!%20У%20меня%20есть%20вопрос%20по%20сотрудничеству"
						target="_blank"
						rel="noopener noreferrer"
						className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
						</svg>
						Связяться через WhatsApp
					</a>
				</div>
			</div>
		</div>
	);
};

export default ContactsPage;
