export const STATUS_CHECK_PRICE = 'Уточните цену';
export const STATUS_OUT_OF_STOCK = 'Нет в наличии';
export const STATUS_ON_ORDER = 'Под заказ';

export const ALL_STATUSES = [STATUS_CHECK_PRICE, STATUS_OUT_OF_STOCK, STATUS_ON_ORDER] as const;

/**
 * Safely extracts string value from primitive or object ({ value: '...' }).
 */
export const unwrapPriceValue = (value?: any): string => {
	if (value === null || value === undefined) return '';
	if (typeof value === 'object' && value !== null) {
		if ('value' in value) {
			return String(value.value || '').trim();
		}
		if ('priceProductStatus' in value) {
			return unwrapPriceValue(value.priceProductStatus);
		}
	}
	return String(value).trim();
};

/**
 * Returns true if the value represents a valid numeric price (greater than 0, not text status).
 */
export const isNumericPrice = (value?: any): boolean => {
	const str = unwrapPriceValue(value);
	if (!str || str === '[object Object]') return false;
	if (str === STATUS_CHECK_PRICE || str === STATUS_OUT_OF_STOCK || str === STATUS_ON_ORDER) {
		return false;
	}
	const clean = str
		.replace(/\s+/g, '')
		.replace(/\u00A0/g, '')
		.replace(/[₸тТkztKZTруб\.р]/gi, '');
	if (!clean) return false;
	const num = Number(clean);
	return !isNaN(num) && num > 0;
};

/**
 * Parses numeric price from string/number/object. Returns number > 0 or null.
 */
export const parsePriceNumber = (value?: any): number | null => {
	if (!isNumericPrice(value)) return null;
	const str = unwrapPriceValue(value);
	const clean = str
		.replace(/\s+/g, '')
		.replace(/\u00A0/g, '')
		.replace(/[₸тТkztKZTруб\.р]/gi, '');
	const num = Number(clean);
	return isNaN(num) || num <= 0 ? null : num;
};

/**
 * Formats a number as a currency string with thousands separators and ₸ (e.g. "150 000 ₸").
 */
export const formatPriceNumber = (amount: number): string => {
	return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₸';
};

/**
 * Formats either a numeric price or a status string.
 * If numeric (> 0) -> "150 000 ₸"
 * If 0, null, or status -> "Нет в наличии" / "Под заказ" / "Уточните цену"
 */
export const formatPrice = (value?: any): string => {
	const str = unwrapPriceValue(value);
	if (!str || str === '0') return STATUS_CHECK_PRICE;
	const num = parsePriceNumber(str);
	if (num !== null && num > 0) {
		return formatPriceNumber(num);
	}
	return str;
};

/**
 * Helper to get status information, badge classes, and stock state.
 */
export const getPriceBadgeInfo = (value?: any) => {
	const num = parsePriceNumber(value);
	const str = unwrapPriceValue(value) || STATUS_CHECK_PRICE;

	if (num !== null && num > 0) {
		return {
			isNumeric: true,
			text: formatPriceNumber(num),
			badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
			isOutOfStock: false,
		};
	}

	if (str === STATUS_OUT_OF_STOCK) {
		return {
			isNumeric: false,
			text: STATUS_OUT_OF_STOCK,
			badgeClass: 'bg-red-100 text-red-800 border border-red-200 font-semibold',
			isOutOfStock: true,
		};
	}

	if (str === STATUS_ON_ORDER) {
		return {
			isNumeric: false,
			text: STATUS_ON_ORDER,
			badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200 font-semibold',
			isOutOfStock: false,
		};
	}

	return {
		isNumeric: false,
		text: STATUS_CHECK_PRICE,
		badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200 font-semibold',
		isOutOfStock: false,
	};
};
