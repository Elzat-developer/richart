import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import DesignPage from './pages/DesignPage';
import ContactsPage from './pages/ContactsPage';
import OrdersPage from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import AboutPage from './pages/AboutPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminProductFormPage } from './pages/AdminProductFormPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AdminTechSpecsPage } from './pages/AdminTechSpecsPage';
import { AdminProductDetailPage } from './pages/AdminProductDetailPage';
import { AdminPromotionsPage } from './pages/AdminPromotionsPage';
import { AdminNewsPage } from './pages/AdminNewsPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminImportPage } from './pages/AdminImportPage';
import AdminCompanyPage from './pages/AdminCompanyPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { HouseholdCategoriesPage } from './pages/HouseholdCategoriesPage';
import { HouseholdCatalogPage } from './pages/HouseholdCatalogPage';

function App() {
	return (
		<HashRouter>
			<CartProvider>
				<AdminAuthProvider>
					<Routes>
						{/* Public routes */}
						<Route path="/" element={<Layout />}>
							<Route index element={<HomePage />} />
							<Route path="categories" element={<CategoriesPage />} />
							<Route path="household-categories" element={<HouseholdCategoriesPage />} />
							<Route path="catalog" element={<CatalogPage />} />
							<Route path="household-catalog" element={<HouseholdCatalogPage />} />
							<Route path="product/:id" element={<ProductDetailPage />} />
							<Route path="cart" element={<CartPage />} />
							<Route path="news" element={<NewsPage />} />
							<Route path="news/:id" element={<NewsDetailPage />} />
							<Route path="about" element={<AboutPage />} />
							<Route path="design" element={<DesignPage />} />
							<Route path="contacts" element={<ContactsPage />} />
							<Route path="orders" element={<OrdersPage />} />
							<Route path="orders/:orderId" element={<OrderDetailPage />} />
						</Route>

						{/* Admin routes */}
						<Route path="/admin/login" element={<AdminLoginPage />} />
						<Route path="/admin" element={
							<AdminProtectedRoute>
								<AdminDashboardPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/dashboard" element={
							<AdminProtectedRoute>
								<AdminDashboardPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/products" element={
							<AdminProtectedRoute>
								<AdminProductsPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/products/new" element={
							<AdminProtectedRoute>
								<AdminProductFormPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/products/:id/edit" element={
							<AdminProtectedRoute>
								<AdminProductFormPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/products/:id" element={
							<AdminProtectedRoute>
								<AdminProductDetailPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/promotions" element={
							<AdminProtectedRoute>
								<AdminPromotionsPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/news" element={
							<AdminProtectedRoute>
								<AdminNewsPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/orders" element={
							<AdminProtectedRoute>
								<AdminOrdersPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/import" element={
							<AdminProtectedRoute>
								<AdminImportPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/categories" element={
							<AdminProtectedRoute>
								<AdminCategoriesPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/tech-specs" element={
							<AdminProtectedRoute>
								<AdminTechSpecsPage />
							</AdminProtectedRoute>
						} />
						<Route path="/admin/company" element={
							<AdminProtectedRoute>
								<AdminCompanyPage />
							</AdminProtectedRoute>
						} />

						{/* Redirect */}
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</AdminAuthProvider>
			</CartProvider>
		</HashRouter>
	);
}

export default App;