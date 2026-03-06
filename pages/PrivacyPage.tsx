import React from 'react';
import { Layout } from '../components/Layout';

const PrivacyPage: React.FC = () => {
	return (
		<Layout>
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="bg-white rounded-xl shadow-lg p-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-8">Политика конфиденциальности</h1>
						
						<div className="prose prose-gray max-w-none">
							<section className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">1. Общие положения</h2>
								<p className="text-gray-600 leading-relaxed">
									Настоящая политика конфиденциальности определяет, как RichART собирает, использует, хранит и защищает информацию пользователей сайта richart.kz.
									Используя наш сайт, вы соглашаетесь с условиями данной политики.
								</p>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">2. Собираемая информация</h2>
								<div className="space-y-3 text-gray-600">
									<p>• Имя и контактные данные при регистрации</p>
									<p>• Информация о заказах и покупках</p>
									<p>• Техническая информация (IP-адрес, браузер, ОС)</p>
									<p>• Данные файлов cookie и аналитика</p>
								</div>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">3. Использование информации</h2>
								<div className="space-y-3 text-gray-600">
									<p>• Для обработки заказов и доставки</p>
									<p>• Для улучшения качества обслуживания</p>
									<p>• Для маркетинговых исследований</p>
									<p>• Для связи с клиентами</p>
								</div>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">4. Защита данных</h2>
								<p className="text-gray-600 leading-relaxed">
									Мы применяем современные методы защиты персональных данных и не передаем информацию третьим лицам,
									за исключением случаев, предусмотренных законодательством РК.
								</p>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">5. Контакты</h2>
								<p className="text-gray-600">
									По вопросам конфиденциальности обращайтесь:<br />
									Email: info@richart.kz<br />
									Телефон: +7 747 216 4664
								</p>
							</section>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default PrivacyPage;
