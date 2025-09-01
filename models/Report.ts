import mongoose, { Schema, Document, models } from 'mongoose';

export interface IDoneItem {
  description: string;
  startTime: string;
  endTime: string;
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
  documentationUrl?: string;
  createdAt: Date;
}

const DoneItemSchema: Schema = new Schema({
  description: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const TodoItemSchema: Schema = new Schema({
  description: { type: String, required: true },
});

const ReportSchema: Schema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['Complete', 'Incomplete'], required: true },
  doneItems: [DoneItemSchema],
  todoItems: [TodoItemSchema],
  documentationUrl: { type: String, default: '' },
}, { timestamps: true });

const Report = models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;