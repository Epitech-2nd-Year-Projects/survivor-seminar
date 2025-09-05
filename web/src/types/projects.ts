import type { Founder } from "./founders";

export interface Project {
  id: number;
  name: string;
  legal_status?: string;
  address?: string;
  email: string;
  phone?: string;
  created_at?: string;
  description?: string;
  website_url?: string;
  social_media_url?: string;
  project_status?: string;
  needs?: string;
  sector?: string;
  maturity?: string;
  founders: Founder[];
}
