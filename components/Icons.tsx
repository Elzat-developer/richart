import React from 'react';

export interface IconProps {
	className?: string;
	size?: number;
}

export const ShoppingCartIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
		<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
	</svg>
);

export const MenuIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
	</svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
	</svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="m15 18-6-6 6-6" />
	</svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<polyline points="9 18 15 12 9 6"></polyline>
	</svg>
);

export const FilterIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
	</svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<polyline points="3 6 5 6 21 6"></polyline>
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
	</svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<line x1="12" y1="5" x2="12" y2="19"></line>
		<line x1="5" y1="12" x2="19" y2="12"></line>
	</svg>
);

export const MinusIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<line x1="5" y1="12" x2="19" y2="12"></line>
	</svg>
);

export const WhatsAppIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.704-.501-.173 0-.372-.025-.571-.025-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 3.156 5.456c4.017 3.509 5.456 2.479 6.447 2.381.99-.099 2.082-.846 2.378-1.637.297-.79.297-1.48.223-1.637-.074-.149-.346-.247-.644-.446z" />
		<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
	</svg>
);

export const FileExcelIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
		<polyline points="14,2 14,8 20,8" />
		<path d="M12 18v-6" />
		<path d="M9 15h6" />
		<path d="M9 11h6" />
	</svg>
);

export const FilePdfIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
		<polyline points="14,2 14,8 20,8" />
		<path d="M8 13h0" />
		<path d="M16 13h0" />
		<path d="M8 17h0" />
		<path d="M16 17h0" />
	</svg>
);

export const XIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<line x1="18" y1="6" x2="6" y2="18"></line>
		<line x1="6" y1="6" x2="18" y2="18"></line>
	</svg>
);

// Admin Icons
export const PackageIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
		<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
		<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
		<line x1="12" y1="22.08" x2="12" y2="12" />
	</svg>
);

export const CategoryIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<rect x="3" y="3" width="7" height="7" />
		<rect x="14" y="3" width="7" height="7" />
		<rect x="14" y="14" width="7" height="7" />
		<rect x="3" y="14" width="7" height="7" />
	</svg>
);

export const FileSpreadsheetIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
		<polyline points="14,2 14,8 20,8" />
		<line x1="8" y1="13" x2="16" y2="13" />
		<line x1="8" y1="17" x2="16" y2="17" />
		<polyline points="8 9 9 9 16 9" />
	</svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<circle cx="12" cy="12" r="3" />
		<path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 8.96l4.24 4.24M20.46 8.96l-4.24 4.24M8.96 20.46l4.24-4.24" />
	</svg>
);

export const EditIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
		<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
	</svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
		<polyline points="17 8 12 3 7 8" />
		<line x1="12" y1="3" x2="12" y2="15"></line>
	</svg>
);

export const GridIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<rect x="3" y="3" width="7" height="7" />
		<rect x="14" y="3" width="7" height="7" />
		<rect x="14" y="14" width="7" height="7" />
		<rect x="3" y="14" width="7" height="7" />
	</svg>
);

export const TableIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
		<line x1="3" y1="9" x2="21" y2="9" />
		<line x1="9" y1="3" x2="9" y2="21" />
	</svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
		<polyline points="22 4 12 14.01 9 11.01"></polyline>
	</svg>
);

export const XCircleIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<circle cx="12" cy="12" r="10"></circle>
		<line x1="15" y1="9" x2="9" y2="15"></line>
		<line x1="9" y1="9" x2="15" y2="15"></line>
	</svg>
);

export const ExclamationTriangleIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
		<line x1="12" y1="9" x2="12" y2="13"></line>
		<line x1="12" y1="17" x2="12.01" y2="17"></line>
	</svg>
);

export const HomeIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
		<polyline points="9 22 9 12 15 12 15 22"></polyline>
	</svg>
);

export const BuildingOfficeIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M3 21h18"></path>
		<path d="M5 21V7l8-4v18"></path>
		<path d="M19 21V11l-6-6"></path>
		<path d="M9 9h.01"></path>
		<path d="M9 13h.01"></path>
		<path d="M9 17h.01"></path>
		<path d="M15 13h.01"></path>
		<path d="M15 17h.01"></path>
	</svg>
);

export const LogOutIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
		<polyline points="16 17 21 12 16 7"></polyline>
		<line x1="21" y1="12" x2="9" y2="12"></line>
	</svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<polyline points="20 6 9 17 4 12"></polyline>
	</svg>
);

export const ShoppingBagIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
		<line x1="3" y1="6" x2="21" y2="6"></line>
		<path d="M16 10a4 4 0 0 1-8 0"></path>
	</svg>
);

export const CurrencyDollarIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<line x1="12" y1="1" x2="12" y2="23"></line>
		<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
	</svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
	</svg>
);

export const UserIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
		<circle cx="12" cy="7" r="4"></circle>
	</svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<circle cx="12" cy="12" r="10"></circle>
		<polyline points="12 6 12 12 16 14"></polyline>
	</svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<line x1="19" y1="12" x2="5" y2="12"></line>
		<polyline points="12 19 5 12 12 5"></polyline>
	</svg>
);

export const DollarSignIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<line x1="12" y1="1" x2="12" y2="23"></line>
		<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
	</svg>
);

export const BoxIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
		<polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
		<line x1="12" y1="22.08" x2="12" y2="12"></line>
	</svg>
);

export const WeightIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<circle cx="12" cy="12" r="10"></circle>
		<path d="M12 6v6l4 2"></path>
	</svg>
);

export const RulerIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
		<path d="M22 12A10 10 0 0 0 12 2v10z"></path>
	</svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
		<line x1="16" y1="2" x2="16" y2="6"></line>
		<line x1="8" y1="2" x2="8" y2="6"></line>
		<line x1="3" y1="10" x2="21" y2="10"></line>
	</svg>
);

export const PercentIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<line x1="19" y1="5" x2="5" y2="19"></line>
		<circle cx="6.5" cy="6.5" r="2.5"></circle>
		<circle cx="17.5" cy="17.5" r="2.5"></circle>
	</svg>
);

export const ImageIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
		<circle cx="8.5" cy="8.5" r="1.5"></circle>
		<polyline points="21 15 16 10 5 21"></polyline>
	</svg>
);

export const FileTextIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
		<polyline points="14 2 14 8 20 8"></polyline>
		<line x1="16" y1="13" x2="8" y2="13"></line>
		<line x1="16" y1="17" x2="8" y2="17"></line>
		<polyline points="10 9 9 9 8 9"></polyline>
	</svg>
);

export const TagIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
		<line x1="7" y1="7" x2="7.01" y2="7"></line>
	</svg>
);