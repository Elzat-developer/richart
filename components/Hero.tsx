import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import '../styles/swiper-custom.css';

const SLIDES = [
	{
		id: 1,
		title: "Прочные верстаки",
		subtitle: "Созданы для самых суровых условий. Скидка 20% на оптовые заказы.",
		image: "https://picsum.photos/1920/800?random=1",
		cta: "Перейти к верстакам",
		link: "/catalog?categoryId=0"
	},
	{
		id: 2,
		title: "Модульные системы хранения",
		subtitle: "Организуйте склад с нашими премиальными металлическими шкафами.",
		image: "https://picsum.photos/1920/800?random=2",
		cta: "Смотреть каталог",
		link: "/catalog"
	},
	{
		id: 3,
		title: "Эргономичные промышленные кресла",
		subtitle: "Защитите ваших сотрудников с креслами, соответствующими стандартам ESD.",
		image: "https://picsum.photos/1920/800?random=3",
		cta: "Изучить кресла",
		link: "/catalog?categoryId=2"
	}
];

export const Hero: React.FC = () => {
	return (
		<div className="relative h-[500px] md:h-[600px] bg-industrial-900 overflow-hidden">
			<Swiper
				modules={[Autoplay, Navigation, Pagination, EffectFade]}
				effect="fade"
				spaceBetween={0}
				slidesPerView={1}
				loop={true}
				autoplay={{
					delay: 5000,
					disableOnInteraction: false,
				}}
				navigation={{
					nextEl: '.swiper-button-next',
					prevEl: '.swiper-button-prev',
				}}
				pagination={{
					el: '.swiper-pagination',
					clickable: true,
					renderBullet: (index, className) => {
						return `<span class="${className}"></span>`;
					},
				}}
				className="h-full w-full"
			>
				{SLIDES.map((slide) => (
					<SwiperSlide key={slide.id}>
						<div className="relative h-full">
							{/* Background Image with Overlay */}
							<div className="absolute inset-0">
								<img
									src={slide.image}
									alt={slide.title}
									className="w-full h-full object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-r from-industrial-900/90 to-transparent"></div>
							</div>

							{/* Content */}
							<div className="absolute inset-0 container mx-auto px-4 flex items-center">
								<div className="max-w-2xl text-white">
									<span className="inline-block py-1 px-3 border border-industrial-accent text-industrial-accent text-xs font-bold uppercase tracking-widest mb-4">
										Специальное предложение
									</span>
									<h1 className="text-4xl md:text-6xl font-display font-bold uppercase leading-tight mb-4">
										{slide.title}
									</h1>
									<p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg">
										{slide.subtitle}
									</p>
									<Link
										to={slide.link}
										className="inline-block bg-industrial-accent hover:bg-orange-700 text-white font-bold py-4 px-8 uppercase tracking-wide transition-colors"
									>
										{slide.cta}
									</Link>
								</div>
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>

			{/* Custom Navigation Controls */}
			<button className="swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-industrial-900/50 hover:bg-industrial-accent text-white p-3 backdrop-blur-sm transition-colors">
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			<button className="swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-industrial-900/50 hover:bg-industrial-accent text-white p-3 backdrop-blur-sm transition-colors">
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
				</svg>
			</button>

			{/* Custom Pagination */}
			<div className="swiper-pagination absolute bottom-8 left-1/2 -translate-x-1/2 z-20"></div>
		</div>
	);
};