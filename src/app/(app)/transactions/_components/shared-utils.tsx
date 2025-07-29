import {
  IconCash,
  IconCreditCard,
  IconWallet,
  IconQrcode,
  IconBuildingBank,
  IconDots,
} from '@tabler/icons-react';

/**
 * Get payment method icon component
 * @param method - Payment method string
 * @param size - Icon size (default: 16)
 * @param className - Additional CSS classes
 */
export const getPaymentMethodIcon = (
  method: string,
  size = 16,
  className = '',
) => {
  const iconProps = { size, className };

  switch (method?.toLowerCase()) {
    case 'cash':
      return <IconCash {...iconProps} />;
    case 'debit':
      return <IconCreditCard {...iconProps} />;
    case 'e_wallet':
      return <IconWallet {...iconProps} />;
    case 'qris':
      return <IconQrcode {...iconProps} />;
    case 'transfer':
      return <IconBuildingBank {...iconProps} />;
    case 'other':
      return <IconDots {...iconProps} />;
    default:
      return <IconCash {...iconProps} />;
  }
};

/**
 * Get payment method text with fallback
 * @param method - Payment method string
 * @param t - Translation function
 */
export const getPaymentMethodText = (
  method: string,
  t: (key: string) => string,
) => {
  try {
    return t(`paymentMethods.${method.toLowerCase()}`);
  } catch {
    return method.replace(/[_-]/g, ' ').toLowerCase();
  }
};
