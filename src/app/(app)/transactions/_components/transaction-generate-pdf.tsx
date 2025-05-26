import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { formatRupiah } from '@/lib/currency';
import { PDFTransaction, PDFTransactionItem } from '@/lib/types/transaction';

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

export const TransactionPDF = ({
  transaction,
}: {
  transaction: PDFTransaction;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image
            source={STORE_LOGO}
            style={styles.logo}
            cache={true}
            fixed={false}
          />
          <View style={styles.storeInfoHeader}>
            <Text style={styles.storeName}>Sasuai Store</Text>
            <Text style={styles.storeContact}>Jl. Contoh No. 123, Jakarta</Text>
            <Text style={styles.storeContact}>Phone: (021) 1234-5678</Text>
            <Text style={styles.storeContact}>
              Email: hello@sasuaistore.com
            </Text>
          </View>
        </View>
        <Text style={styles.receiptTitle}>
          Transaction Receipt #{transaction.tranId}
        </Text>
        <View style={styles.metaInfo}>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Date & Time</Text>
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
            <Text style={styles.metaLabel}>Cashier</Text>
            <Text style={styles.metaValue}>
              {transaction.cashier?.name || 'Unknown'}
            </Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Customer</Text>
            <Text style={styles.metaValue}>
              {transaction.member ? transaction.member.name : 'Guest'}
            </Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Payment Method</Text>
            <Text style={styles.metaValue}>
              {transaction.payment?.method ||
                transaction.paymentMethod ||
                'Cash'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colNum}>No</Text>
          <Text style={styles.col1}>Item</Text>
          <Text style={styles.col2}>Unit</Text>
          <Text style={styles.col3}>Price</Text>
          <Text style={styles.col4}>Qty</Text>
          <Text style={styles.col5}>Total</Text>
        </View>

        {transaction.items?.map((item: PDFTransactionItem, index: number) => (
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
                {item.product?.name || 'Unknown Product'}
              </Text>
              {item.discountApplied && (
                <Text style={styles.badge}>
                  Disc: {formatRupiah(item.discountApplied.amount)}
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
              {formatRupiah(item.originalAmount || item.subtotal || 0)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>
            {formatRupiah(transaction.pricing?.originalAmount || 0)}
          </Text>
        </View>

        {transaction.pricing?.discounts?.member && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Member Discount</Text>
            <Text style={styles.discountValue}>
              -{formatRupiah(transaction.pricing.discounts.member.amount)}
            </Text>
          </View>
        )}

        {transaction.pricing?.discounts?.products > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Product Discounts</Text>
            <Text style={styles.discountValue}>
              -{formatRupiah(transaction.pricing.discounts.products)}
            </Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text>Total Amount</Text>
          <Text>{formatRupiah(transaction.pricing?.finalAmount || 0)}</Text>
        </View>
      </View>

      <View style={styles.paymentMethod}>
        <Text style={styles.summaryLabel}>PAYMENT DETAILS</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount Paid</Text>
          <Text style={styles.summaryValue}>
            {formatRupiah(
              transaction.payment?.amount ||
                transaction.amountPaid ||
                transaction.pricing?.finalAmount ||
                0,
            )}
          </Text>
        </View>
        {(transaction.payment?.amount || transaction.amountPaid || 0) >
          (transaction.pricing?.finalAmount || 0) && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Change</Text>
            <Text style={styles.summaryValue}>
              {formatRupiah(
                transaction.payment?.change ||
                  (transaction.payment?.amount || transaction.amountPaid || 0) -
                    (transaction.pricing?.finalAmount || 0) ||
                  0,
              )}
            </Text>
          </View>
        )}
      </View>

      {transaction.pointsEarned > 0 && (
        <View style={styles.pointsBox}>
          <Text style={styles.pointsTitle}>Points Earned</Text>
          <Text>
            {transaction.pointsEarned} points have been added to your account.
            {transaction.member?.points && (
              <Text> Your total points: {transaction.member.points}</Text>
            )}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text>Thank you for your purchase at Sasuai Store!</Text>
        <Text>Powered by Samunu Team</Text>
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
