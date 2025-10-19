type TemplateType =
  | 'TRANSACTION_SUCCESS'
  | 'NEW_MEMBER'
  | 'DISCOUNT_INFO'
  | 'FOLLOWUP_CUSTOMER'
  | 'BIRTHDAY_GREETING'
  | 'POINT_REMINDER';

interface TemplateData {
  name?: string;
  total?: number;
  points?: number;
  discount?: string;
  lastPurchaseDate?: string;
  storeName?: 'Sasuai Store';
  earnedPoint?: string;
  currentPoint?: string;
  cardId?: string;
  link?: string | 'https://sasuai.blastify.tech/';
}

export function generateMessage(
  type: TemplateType,
  data: TemplateData
): string {
  switch (type) {
    case 'TRANSACTION_SUCCESS':
      return `Hai ${data.name}, Terima kasih sudah berbelanja di *Sasuai Store*. 

Transaksi kamu telah *berhasil* 
 * Total belanja: *Rp${data.total?.toLocaleString()}*  
 * Total poin kamu sekarang: *${data.currentPoint} poin*

Terus kumpulkan poin dari setiap transaksi dan tukarkan dengan diskon atau hadiah menarik di *Sasuai Store*
https://sasuai.blastify.tech/`;
    case 'NEW_MEMBER':
      return `Halo,${data.name}!
Selamat datang di *Sasuai Store*! 🎉  
Kamu resmi terdaftar sebagai *member kami* dan akan mendapatkan berbagai keuntungan menarik setiap bulannya.

Kartu member kamu sudah aktif dan bisa digunakan untuk mengumpulkan poin dari setiap transaksi.  
Semakin sering kamu belanja, semakin banyak poin yang bisa kamu tukarkan dengan hadiah atau diskon spesial!
Terima kasih sudah bergabung, dan selamat menikmati semua keuntungannya!
https://sasuai.blastify.tech/
`;

    case 'DISCOUNT_INFO':
      return `🔥 Promo Spesial untuk Kamu!\n\nNikmati diskon *${data.discount}%* hanya di *Sasuai Store*.\nJangan sampai ketinggalan ya, promo terbatas!`;

    case 'FOLLOWUP_CUSTOMER':
      return `👋 Hai ${data.name}!\nKami perhatikan kamu terakhir berbelanja pada *${data.lastPurchaseDate}*.\nKami kangen loh! 🥺\n\nDatang lagi ke *Sasuai Store* dan nikmati promo menarik hanya untuk pelanggan setia!`;

    case 'BIRTHDAY_GREETING':
      return `🎂 Selamat Ulang Tahun, ${data.name}! 🎉\n\nSebagai ucapan spesial dari *Sasuai Store*, kamu dapat *voucher diskon 20%*.\nNikmati harimu dengan belanja seru bareng kami! 🛍️`;

    case 'POINT_REMINDER':
      return `💎 Hai ${data.name}!\nKamu punya *${data.points} poin* yang bisa ditukar dengan diskon menarik di *Sasuai Store*.\nYuk manfaatkan sebelum hangus!`;

    default:
      return 'Template not found.';
  }
}
