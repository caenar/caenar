export type ConfirmData = {
  type: string;
  action: (() => Promise<unknown>) | null;
  loading?: boolean;
};
