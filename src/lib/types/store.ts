export interface StoreFormType {
  store_name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  phone_number: string;
  email: string;
  currency: string;
  timezone: string;
  owner_name: string;
  type: string;
  status: string;
  logo_url: string;
}
export interface NotificationType extends StoreFormType {
  notification_status: string;
  notification_blastify_api: string;
}
