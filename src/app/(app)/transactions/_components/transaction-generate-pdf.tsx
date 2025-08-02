import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { formatRupiah } from '@/lib/currency';
import type {
  TransactionDetails,
  TransactionItem,
} from '@/lib/services/transaction/types';

const STORE_LOGO =
  'https://res.cloudinary.com/samunu/image/upload/f_auto,q_auto/v1745953012/icon_z07a9i.png';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 9, // Base font size
    color: '#111827',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 15, // reduced from 25
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 15, // reduced from 20
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 20,
    objectFit: 'contain',
  },
  storeInfoHeader: {
    flex: 1,
  },
  storeName: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#1F2937',
  },
  storeContact: {
    fontSize: 8.5,
    color: '#4B5563',
    lineHeight: 1.5,
  },
  receiptTitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 15,
    fontFamily: 'Helvetica-Bold',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15, // reduced from 30
    fontSize: 9,
  },
  metaColumn: {
    flex: 1,
  },
  metaLabel: {
    color: '#4B5563',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontSize: 8,
  },
  metaValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  table: {
    marginTop: 0,
    marginBottom: 5,
    fontSize: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  zebraRow: {
    backgroundColor: '#FAFAFA',
  },
  colNum: { width: '5%', textAlign: 'center' },
  col1: { width: '40%' },
  col2: { width: '8%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '12%', textAlign: 'right' },
  col5: { width: '20%', textAlign: 'right' },
  productName: {
    marginBottom: 2,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  productMeta: {
    fontSize: 7,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  summary: {
    marginLeft: 'auto',
    width: '50%',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#4B5563',
    fontSize: 9,
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  discountValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#DC2626',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 8.5,
    fontStyle: 'italic',
  },
  badge: {
    fontSize: 7,
    color: '#DC2626',
    marginTop: 1,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  pointsBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  pointsTitle: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    fontSize: 9,
    color: '#047857',
  },
  paymentMethod: {
    marginTop: 15,
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8.5,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#6B7280',
  },
});

interface TransactionPDFProps {
  transaction: TransactionDetails;
  translations?: {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeEmail: string;
    receiptTitle: string;
    dateTime: string;
    cashier: string;
    customer: string;
    guest: string;
    paymentMethod: string;
    tableHeaders: {
      no: string;
      item: string;
      unit: string;
      price: string;
      qty: string;
      total: string;
    };
    discount: string;
    subtotal: string;
    memberDiscount: string;
    globalDiscount: string;
    productDiscounts: string;
    totalAmount: string;
    paymentDetails: string;
    amountPaid: string;
    change: string;
    pointsEarned: string;
    pointsMessage: string;
    totalPoints: string;
    thankYou: string;
    poweredBy: string;
    unknown: string;
  };
}

// Default English translations
const defaultTranslations = {
  storeName: 'Sasuai Store',
  storeAddress: 'Jl. Contoh No. 123, Jakarta',
  storePhone: 'Phone: (021) 1234-5678',
  storeEmail: 'Email: hello@sasuaistore.com',
  receiptTitle: 'Transaction Receipt',
  dateTime: 'Date & Time',
  cashier: 'Cashier',
  customer: 'Customer',
  guest: 'Guest',
  paymentMethod: 'Payment Method',
  tableHeaders: {
    no: 'No',
    item: 'Item',
    unit: 'Unit',
    price: 'Price',
    qty: 'Qty',
    total: 'Total',
  },
  discount: 'Disc',
  subtotal: 'Subtotal',
  memberDiscount: 'Member Discount',
  globalDiscount: 'Global Discount',
  productDiscounts: 'Product Discounts',
  totalAmount: 'Total Amount',
  paymentDetails: 'PAYMENT DETAILS',
  amountPaid: 'Amount Paid',
  change: 'Change',
  pointsEarned: 'Points Earned',
  pointsMessage: 'points have been added to your account.',
  totalPoints: 'Your total points:',
  thankYou: 'Thank you for your purchase at Sasuai Store!',
  poweredBy: 'Powered by Samunu Team',
  unknown: 'Unknown',
};

export const TransactionPDF = ({
  transaction,
  translations = defaultTranslations,
}: TransactionPDFProps) => {
  const t = { ...defaultTranslations, ...translations };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              source={STORE_LOGO}
              style={styles.logo}
              cache={true}
              fixed={false}
            />
            <View style={styles.storeInfoHeader}>
              <Text style={styles.storeName}>{t.storeName}</Text>
              <Text style={styles.storeContact}>{t.storeAddress}</Text>
              <Text style={styles.storeContact}>{t.storePhone}</Text>
              <Text style={styles.storeContact}>{t.storeEmail}</Text>
            </View>
          </View>
          <Text style={styles.receiptTitle}>
            {t.receiptTitle} #{transaction.tranId}
          </Text>
          <View style={styles.metaInfo}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>{t.dateTime}</Text>
              <Text style={styles.metaValue}>
                {new Date(transaction.createdAt).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>{t.cashier}</Text>
              <Text style={styles.metaValue}>
                {transaction.cashier?.name || t.unknown}
              </Text>
            </View>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>{t.customer}</Text>
              <Text style={styles.metaValue}>
                {transaction.member ? transaction.member.name : t.guest}
              </Text>
            </View>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>{t.paymentMethod}</Text>
              <Text style={styles.metaValue}>
                {transaction.payment?.method || 'Cash'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNum}>{t.tableHeaders.no}</Text>
            <Text style={styles.col1}>{t.tableHeaders.item}</Text>
            <Text style={styles.col2}>{t.tableHeaders.unit}</Text>
            <Text style={styles.col3}>{t.tableHeaders.price}</Text>
            <Text style={styles.col4}>{t.tableHeaders.qty}</Text>
            <Text style={styles.col5}>{t.tableHeaders.total}</Text>
          </View>

          {transaction.items?.map((item: TransactionItem, index: number) => (
            <View
              key={index}
              style={
                index % 2 === 0
                  ? [styles.tableRow, styles.zebraRow]
                  : styles.tableRow
              }
            >
              <Text style={styles.colNum}>{index + 1}</Text>
              <View style={styles.col1}>
                <Text style={styles.productName}>
                  {item.product?.name || t.unknown}
                </Text>
                {item.discountApplied && (
                  <Text style={styles.badge}>
                    {t.discount}: {formatRupiah(item.discountApplied.amount)}
                  </Text>
                )}
              </View>
              <Text style={styles.col2}>{item.product?.unit || '-'}</Text>
              <Text style={[styles.col3, styles.summaryValue]}>
                {formatRupiah(item.product?.price || 0)}
              </Text>
              <Text style={[styles.col4, styles.summaryValue]}>
                {item.quantity}
              </Text>
              <Text style={[styles.col5, styles.summaryValue]}>
                {formatRupiah(item.originalAmount || 0)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.subtotal}</Text>
            <Text style={styles.summaryValue}>
              {formatRupiah(transaction.pricing?.originalAmount || 0)}
            </Text>
          </View>

          {transaction.pricing?.discounts?.id && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {transaction.pricing.discounts.isGlobal
                  ? t.globalDiscount
                  : t.memberDiscount}
              </Text>
              <Text style={styles.discountValue}>
                -{formatRupiah(transaction.pricing.discounts.amount || 0)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text>{t.totalAmount}</Text>
            <Text>{formatRupiah(transaction.pricing?.finalAmount || 0)}</Text>
          </View>
        </View>

        <View style={styles.paymentMethod}>
          <Text style={styles.summaryLabel}>{t.paymentDetails}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.amountPaid}</Text>
            <Text style={styles.summaryValue}>
              {formatRupiah(
                transaction.payment?.amount ||
                  transaction.pricing?.finalAmount ||
                  0,
              )}
            </Text>
          </View>
          {(transaction.payment?.amount || 0) >
            (transaction.pricing?.finalAmount || 0) && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t.change}</Text>
              <Text style={styles.summaryValue}>
                {formatRupiah(
                  transaction.payment?.change ||
                    (transaction.payment?.amount || 0) -
                      (transaction.pricing?.finalAmount || 0) ||
                    0,
                )}
              </Text>
            </View>
          )}
        </View>

        {transaction.pointsEarned > 0 && (
          <View style={styles.pointsBox}>
            <Text style={styles.pointsTitle}>{t.pointsEarned}</Text>
            <Text>
              {transaction.pointsEarned} {t.pointsMessage}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>{t.thankYou}</Text>
          <Text>{t.poweredBy}</Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};
