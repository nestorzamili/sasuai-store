import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';

  // Load all translation files for the selected locale
  const messages = {
    ...(await import(`./en/common.json`)).default,
    ...(await import(`./en/discount.json`)).default,
    ...(await import(`./en/inventory.json`)).default,
    ...(await import(`./en/member.json`)).default,
    ...(await import(`./en/product.json`)).default,
    ...(await import(`./en/brand.json`)).default,
    ...(await import(`./en/category.json`)).default,
    ...(await import(`./en/unit.json`)).default,
    ...(await import(`./en/profile.json`)).default,
    ...(await import(`./en/supplier.json`)).default,
    ...(await import(`./en/transaction.json`)).default,
    ...(await import(`./en/reward.json`)).default,
    ...(await import(`./en/user.json`)).default
  };

  // Override with locale-specific translations if not English
  if (locale !== 'en') {
    try {
      const localeCommon = (await import(`./${locale}/common.json`)).default;
      const localeDiscount = (await import(`./${locale}/discount.json`)).default;
      const localeInventory = (await import(`./${locale}/inventory.json`)).default;
      const localeMember = (await import(`./${locale}/member.json`)).default;
      const localeProduct = (await import(`./${locale}/product.json`)).default;
      const localeBrand = (await import(`./${locale}/brand.json`)).default;
      const localeCategory = (await import(`./${locale}/category.json`)).default;
      const localeUnit = (await import(`./${locale}/unit.json`)).default;
      const localeProfile = (await import(`./${locale}/profile.json`)).default;
      const localeSupplier = (await import(`./${locale}/supplier.json`)).default;
      const localeTransaction = (await import(`./${locale}/transaction.json`)).default;
      const localeReward = (await import(`./${locale}/reward.json`)).default;
      const localeUser = (await import(`./${locale}/user.json`)).default;

      Object.assign(
        messages,
        localeCommon,
        localeDiscount,
        localeInventory,
        localeMember,
        localeProduct,
        localeBrand,
        localeCategory,
        localeUnit,
        localeProfile,
        localeSupplier,
        localeTransaction,
        localeReward,
        localeUser
      );
    } catch (error) {
      console.error(`Error loading translations for locale: ${locale}`, error);
    }
  }

  return {
    locale,
    messages,
  };
});
