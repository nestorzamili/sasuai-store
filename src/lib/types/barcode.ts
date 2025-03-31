export interface BarcodeCreateInput {
  code: string;
  isPrimary?: boolean;
  batch: { connect: { id: string } };
}
