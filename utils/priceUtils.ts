export const STATUS_CHECK_PRICE = 'Уточните цену';
export const STATUS_OUT_OF_STOCK = 'Нет в наличии';
export const STATUS_ON_ORDER = 'Под заказ';

export const ALL_STATUSES = [STATUS_CHECK_PRICE, STATUS_OUT_OF_STOCK, STATUS_ON_ORDER] as const;

/**
 * Returns true if the value represents a valid numeric price (not undefined, null, or a text status).
 */
export const isNumericPrice = (value?: string | number | null): boolean => {
	if (value === null || value === undefined) return false;
	const str = String(value).trim();
	if (!str) return false;
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
 * Parses numeric price from string/number. Returns number or null.
 */
export const parsePriceNumber = (value?: string | number | null): number | null => {
	if (!isNumericPrice(value)) return null;
	const clean = String(value)
		.trim()
		.replace(/\s+/g, '')
		.replace(/\u00A0/g, '')
		.replace(/[₸тТkztKZTруб\.р]/gi, '');
	const num = Number(clean);
	return isNaN(num) ? null : num;
};

/**
 * Formats a number as a currency string with thousands separators and ₸ (e.g. "150 000 ₸").
 */
export const formatPriceNumber = (amount: number): string => {
	return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₸';
};

/**
 * Formats either a numeric price or a status string.
 * If numeric -> "150 000 ₸"
 * If status ("Нет в наличии", "Под заказ", "Уточните цену") -> "Нет в наличии" / "Под заказ" / "Уточните цену"
 */
export const formatPrice = (value?: string | number | null): string => {
	if (value === null || value === undefined) return STATUS_CHECK_PRICE;
	const num = parsePriceNumber(value);
	if (num !== null) {
		return formatPriceNumber(num);
	}
	const str = String(value).trim();
	if (!str) return STATUS_CHECK_PRICE;
	return str;
};

/**
 * Helper to get status information, badge classes, and stock state.
 */
export const getPriceBadgeInfo = (value?: string | number | null) => {
	const num = parsePriceNumber(value);
	const str = String(value || STATUS_CHECK_PRICE).trim();

	if (num !== null) {
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
