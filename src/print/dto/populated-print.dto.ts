export class PopulatedPrintDto {
  _id: string;
  project_id?: string;
  type: string;
  size: string;
  number_of_prints: number;
  remarks?: string;
  submitted_by: string;
  date: Date;
  cost?: number;
  amount?: number;
  expense_head?: string;
  expense_type?: string;
  submitted_by_name: string;
  project_name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
