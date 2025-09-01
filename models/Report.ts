import mongoose, { Schema, Document, models } from 'mongoose';

export interface IDoneItem {
  description: string;
  startTime: string;
  endTime: string;
  documentationUrl?: string; // NEW: link dokumentasi per item
}

export interface ITodoItem {
  description: string;
}

export interface IReport extends Document {
  userId: string;
  name: string;
  status: 'Complete' | 'Incomplete';
  doneItems: IDoneItem[];
  todoItems: ITodoItem[];
  // Tetap sediakan dokumentasi level report bila diperlukan di masa depan
  documentationUrl?: string;
  createdAt: Date;
}

const DoneItemSchema: Schema<IDoneItem> = new Schema(
  {
    description: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    documentationUrl: { type: String, default: '' }, // NEW
  },
  { _id: false }
);

const TodoItemSchema: Schema<ITodoItem> = new Schema(
  {
    description: { type: String, required: true },
  },
  { _id: false }
);

const ReportSchema: Schema<IReport> = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['Complete', 'Incomplete'], required: true },
    doneItems: { type: [DoneItemSchema], default: [] },
    todoItems: { type: [TodoItemSchema], default: [] },
    documentationUrl: { type: String, default: '' }, // level report (opsional)
  },
  { timestamps: true }
);

const Report = models.Report || mongoose.model<IReport>('Report', ReportSchema);
export default Report;
