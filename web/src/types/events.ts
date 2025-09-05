export interface Event {
  id: number;
  name: string;
  description?: string;
  event_type?: string;
  location?: string;
  target_audience?: string;
  start_date?: string;
  end_date?: string;
  capacity?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}
