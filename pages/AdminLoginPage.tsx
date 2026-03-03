import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { SignInRequest } from '../types';

export const AdminLoginPage: React.FC = () => {
	const [credentials, setCredentials] = useState<SignInRequest>({
		email: '',
		password: ''
	});
	const [validationErrors, setValidationErrors] = useState<Partial<SignInRequest>>({});
	const { login, loading, error } = useAdminAuth();
	const navigate = useNavigate();

	const validateForm = (): boolean => {
		const errors: Partial<SignInRequest> = {};

		if (!credentials.email.trim()) {
			errors.email = 'Email обязателен';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
			errors.email = 'Введите корректный email';
		}

		if (!credentials.password.trim()) {
			errors.password = 'Пароль обязателен';
		} else if (credentials.password.length < 4) {
			errors.password = 'Пароль должен содержать минимум 4 символа';
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		try {
			await login(credentials);
			navigate('/admin/dashboard');
		} catch (err) {
			// Ошибка уже обработана в контексте
		}
	};

	const handleChange = (field: keyof SignInRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setCredentials(prev => ({ ...prev, [field]: e.target.value }));
		// Очищаем ошибку при вводе
		if (validationErrors[field]) {
			setValidationErrors(prev => ({ ...prev, [field]: undefined }));
		}
	};

	return (
		<div className="min-h-screen bg-industrial-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<div className="mx-auto h-12 w-12 bg-industrial-accent rounded-lg flex items-center justify-center">
						<svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
					</div>
					<h2 className="mt-6 text-center text-3xl font-display font-bold text-white">
						Панель администратора
					</h2>
					<p className="mt-2 text-center text-sm text-gray-400">
						Войдите для управления товарами
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-300">
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								value={credentials.email}
								onChange={handleChange('email')}
								className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent bg-gray-800 text-white ${validationErrors.email ? 'border-red-500' : 'border-gray-600'
									}`}
								placeholder="admin@example.com"
							/>
							{validationErrors.email && (
								<p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
							)}
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-300">
								Пароль
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								value={credentials.password}
								onChange={handleChange('password')}
								className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-industrial-accent focus:border-industrial-accent bg-gray-800 text-white ${validationErrors.password ? 'border-red-500' : 'border-gray-600'
									}`}
								placeholder="••••••••"
							/>
							{validationErrors.password && (
								<p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
							)}
						</div>
					</div>

					{error && (
						<div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md">
							{error}
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-industrial-accent hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{loading ? (
								<>
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Вход...
								</>
							) : (
								'Войти'
							)}
						</button>
					</div>

					<div className="text-center">
						<a href="/" className="text-sm text-gray-400 hover:text-industrial-accent transition-colors">
							← Вернуться на сайт
						</a>
					</div>
				</form>
			</div>
		</div>
	);
};
