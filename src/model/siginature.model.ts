import mongoose, { Document, Schema } from 'mongoose';

enum SignatureType {
  MD5 = 'MD5',
  SHA1 = 'SHA-1',
  SHA256 = 'SHA-256',
  Unknown="Unknown"
}

interface SignatureDocument extends Document {
  hash: string;
  type: SignatureType;
  checked: boolean;
  source: string;
  family: string;
  lines:[string];
  dateOfCreation: Date;
  fileCount: number;
  isRead:Boolean
}

const signatureSchema = new Schema<SignatureDocument>({
  hash: { type: String, required: true, unique: true, index: true, maxlength: Infinity },
  type: { type: String, enum: Object.values(SignatureType) },
  checked: { type: Boolean, default: false },
  isRead:{ type: Boolean, default: false },
  source: String,
  family: String,
  lines:[String],
  dateOfCreation: { type: Date, default: Date.now },
  fileCount: { type: Number, default: 0 },
});

const Signature = mongoose.model<SignatureDocument>('Signature', signatureSchema);

export { Signature, SignatureType };
