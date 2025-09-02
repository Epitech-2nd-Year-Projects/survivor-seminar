import type { Founder } from "./founders";

export interface Project {
  id: number;
  name: string;
  legalStatus: string | null;
  address: string | null;
  email: string;
  phone: string | null;
  createdAt: string | null;
  description: string | null;
  websiteUrl: string | null;
  socialMediaUrl: string | null;
  projectStatus: string | null;
  needs: string | null;
  sector: string | null;
  maturity: string | null;
  founders: Founder[];
}
