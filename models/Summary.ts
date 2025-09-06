import mongoose, { Schema, Document, models } from 'mongoose';

export interface ISummary extends Document {
  userId: string;
  month: number;
  year: number;
  activitySummary: string;
  resultSummary: string;
  createdAt: Date;
}

const SummarySchema: Schema<ISummary> = new Schema(
  {
    userId: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    activitySummary: { type: String, required: true },
    resultSummary: { type: String, required: true },
  },
  { timestamps: true }
);

// Mencegah duplikasi ringkasan untuk pengguna, bulan, dan tahun yang sama
SummarySchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

const Summary = models.Summary || mongoose.model<ISummary>('Summary', SummarySchema);
export default Summary;