export interface Opportunity {
  id: number;
  title: string;
  type: string;
  organism: string;
  description?: string;
  criteria?: string;
  external_link?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}
