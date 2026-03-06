import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DesignPage: React.FC = () => {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const openImageModal = (imageSrc: string) => {
		setSelectedImage(imageSrc);
		document.body.style.overflow = 'hidden';
	};

	const closeImageModal = () => {
		setSelectedImage(null);
		document.body.style.overflow = 'unset';
	};

	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closeImageModal();
			}
		};

		if (selectedImage) {
			window.addEventListener('keydown', handleEsc);
		}

		return () => {
			window.removeEventListener('keydown', handleEsc);
		};
	}, [selectedImage]);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Image Modal */}
			{selectedImage && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
					onClick={closeImageModal}
				>
					<div className="relative max-w-7xl max-h-full">
						<button
							onClick={closeImageModal}
							className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all z-10"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
						<img
							src={selectedImage}
							alt="Увеличенный чертеж"
							className="max-w-full max-h-full object-contain rounded-lg"
							onClick={(e) => e.stopPropagation()}
						/>
						<div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 rounded-lg px-3 py-2 text-sm">
							Нажмите ESC или кликните вне изображения для закрытия
						</div>
					</div>
				</div>
			)}
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 text-white py-20">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
							Проектирование и расстановка кухни
						</h1>
						<p className="text-xl text-blue-100 mb-8 leading-relaxed">
							Мы предоставляем полный комплекс услуг по проектированию кухни кафе, банкетного зала, ресторана любой сложности. Подробнее внизу
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								to="/catalog"
								className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
							>
								Смотреть каталог
							</Link>
							<a
								href="https://wa.me/77472164664?text=Здравствуйте!%20Хочу%20заказать%20проектирование%20кухни%20под%20ключ"
								target="_blank"
								rel="noopener noreferrer"
								className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
							>
								Консультация эксперта
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					{/* Full Service Section */}
					<div className="mb-20">
						<div className="text-center mb-12">
							<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
								Полный комплекс услуг
							</h2>
							<div className="w-24 h-1 bg-emerald-600 mx-auto"></div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<div className="bg-emerald-100 text-emerald-600 p-3 rounded-lg flex-shrink-0">
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
											<path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
											<path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
										</svg>
									</div>
									<div>
										<h3 className="text-xl font-semibold text-gray-900 mb-2">Выезд на объект и замеры</h3>
										<p className="text-gray-600 leading-relaxed">
											Осуществляем подробные замеры помещения, включая окна, проёмы, колонны, и коммуникации:
											электрическую сеть, водоснабжение, водоотведение и вентиляцию
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="bg-blue-100 text-blue-600 p-3 rounded-lg flex-shrink-0">
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 8a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
										</svg>
									</div>
									<div>
										<h3 className="text-xl font-semibold text-gray-900 mb-2">Обмерочный план и схемы</h3>
										<p className="text-gray-600 leading-relaxed">
											Готовим обмерочный план, подробный план расстановки кухни, схему расположения электроприборов,
											водоснабжения с канализацией — всё с учётом особенностей конкретного объекта и по согласованию с заказчиком
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="bg-purple-100 text-purple-600 p-3 rounded-lg flex-shrink-0">
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
											<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
											<path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
										</svg>
									</div>
									<div>
										<h3 className="text-xl font-semibold text-gray-900 mb-2">3D визуализация</h3>
										<p className="text-gray-600 leading-relaxed">
											Выполняем 3D визуализацию кухни для удобства восприятия готового проекта, качественного монтажа
											и подготовки к пусконаладочным работам
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="bg-orange-100 text-orange-600 p-3 rounded-lg flex-shrink-0">
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
										</svg>
									</div>
									<div>
										<h3 className="text-xl font-semibold text-gray-900 mb-2">Поставка и пусконаладка</h3>
										<p className="text-gray-600 leading-relaxed">
											Поставляем оборудование, производим пусконаладочные работы, проводим подробный инструктаж
											и обучение персонала
										</p>
									</div>
								</div>
							</div>

							<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
								<div className="text-center">
									<div className="bg-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
										<svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
									</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-4">
										Расстановка и проектирование оборудования
									</h3>
									<p className="text-gray-600 leading-relaxed mb-6">
										Наши специалисты тщательно анализируют планировку помещения, подбирают оптимальный комплект
										оборудования и разрабатывают детальную схему расстановки. Мы учитываем все технологические процессы,
										удобство работы персонала, соблюдение норм и требований безопасности.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Technical Drawings Images */}
					<div className="mb-20">
						<div className="text-center mb-12">
							<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
								Примеры наших чертежей
							</h2>
							<div className="w-24 h-1 bg-emerald-600 mx-auto"></div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
								<div className="aspect-video bg-gray-100 relative overflow-hidden cursor-pointer group" onClick={() => openImageModal('/images/plan3 (1).jpg')}>
									<img
										src="/images/plan3 (1).jpg"
										alt="Технический чертеж 1 - План расстановки оборудования"
										className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
										onError={(e) => {
											(e.target as HTMLImageElement).src = 'https://picsum.photos/600/400?error=drawing-1';
										}}
									/>
									<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
										<div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
											<svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
											</svg>
										</div>
									</div>
								</div>
								<div className="p-6">
									<div className="flex items-center gap-2 mb-3">
										<div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
											<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
											</svg>
										</div>
										<h3 className="text-xl font-semibold text-gray-900">План расстановки оборудования</h3>
									</div>
									<p className="text-gray-600 leading-relaxed">
										Детальная схема расположения кухонного оборудования с учетом технологических процессов и эргономики рабочего пространства
									</p>
									<div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-medium">
										<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
										Профессиональная разработка
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
								<div className="aspect-video bg-gray-100 relative overflow-hidden cursor-pointer group" onClick={() => openImageModal('/images/plan2 (1).jpg')}>
									<img
										src="/images/plan2 (1).jpg"
										alt="Технический чертеж 2 - Привязка к инженерным сетям"
										className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
										onError={(e) => {
											(e.target as HTMLImageElement).src = 'https://picsum.photos/600/400?error=drawing-2';
										}}
									/>
									<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
										<div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
											<svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
											</svg>
										</div>
									</div>
								</div>
								<div className="p-6">
									<div className="flex items-center gap-2 mb-3">
										<div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
											<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
											</svg>
										</div>
										<h3 className="text-xl font-semibold text-gray-900">Привязка к инженерным сетям</h3>
									</div>
									<p className="text-gray-600 leading-relaxed">
										Схема подключения оборудования к электрическим, водопроводным и вентиляционным системам с точными привязками
									</p>
									<div className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-medium">
										<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
										Техническая точность
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Technical Drawings Section */}
					<div className="mb-20">
						<div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 border border-gray-100">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
								<div>
									<h2 className="text-3xl font-bold text-gray-900 mb-6">
										Чертежи и привязка к инженерным сетям
									</h2>
									<p className="text-gray-600 leading-relaxed mb-8">
										Для удобства монтажа и эксплуатации мы выполняем точные 2D-чертежи с привязкой оборудования
										к инженерным коммуникациям:
									</p>

									<div className="space-y-4">
										<div className="flex items-center gap-3">
											<div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
												<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
												</svg>
											</div>
											<span className="text-gray-700 font-medium">Электроснабжение</span>
										</div>
										<div className="flex items-center gap-3">
											<div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
												<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
												</svg>
											</div>
											<span className="text-gray-700 font-medium">Водоснабжение и канализация</span>
										</div>
										<div className="flex items-center gap-3">
											<div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
												<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
													<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 8a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
												</svg>
											</div>
											<span className="text-gray-700 font-medium">Вентиляция и газоснабжение</span>
										</div>
										<div className="flex items-center gap-3">
											<div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
												<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
												</svg>
											</div>
											<span className="text-gray-700 font-medium">Дренажные и другие технологические системы</span>
										</div>
									</div>
								</div>

								<div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-8">
									<div className="text-center">
										<div className="bg-purple-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
											<svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
												<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
												<path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
											</svg>
										</div>
										<h3 className="text-2xl font-bold text-gray-900 mb-4">
											3D-визуализация проекта
										</h3>
										<p className="text-gray-600 leading-relaxed">
											Чтобы еще на этапе проектирования увидеть, как будет выглядеть ваш объект, мы создаем 3D-визуализацию.
											Это позволяет заранее оценить удобство расположения оборудования, внести коррективы и добиться идеального результата.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* CTA Section */}
					<div className="text-center bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-12 text-white">
						<h2 className="text-3xl font-bold mb-4">
							Проекты для предприятий любого масштаба
						</h2>
						<p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
							Мы разрабатываем проекты, обеспечивая точность, надежность и соответствие всем нормативным требованиям
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<a
								href="https://wa.me/77472164664?text=Здравствуйте!%20Хочу%20заказать%20проектирование%20кухни"
								target="_blank"
								rel="noopener noreferrer"
								className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
								</svg>
								Заказать консультацию
							</a>
							<Link
								to="/catalog"
								className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
							>
								Смотреть оборудование
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DesignPage;
