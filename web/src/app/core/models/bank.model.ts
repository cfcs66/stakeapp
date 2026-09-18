export type MovementType = 'Deposito' | 'Levantamento';

export interface BankMovement {
  id: number;
  type: MovementType;
  amount: number;
  description?: string;
  date: string;
}
