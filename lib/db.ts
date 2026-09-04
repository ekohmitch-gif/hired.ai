import { sql } from '@vercel/postgres';

export { sql };

export interface ResumeRow {
  id: string;
  user_id: string;
  title: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface ApplicationRow {
  id: string;
  user_id: string;
  resume_id: string | null;
  company: string | null;
  job_link: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}