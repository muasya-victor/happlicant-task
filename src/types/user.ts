export type UserType = "super_admin" | "company_admin" | "agent" | "job_seeker";

export interface Profile {
  id: string;
  email: string;
  user_type: UserType;
  created_at: string;
  updated_at: string;
}

export interface CompanyAdmin {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  created_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  company_id: string;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface JobSeeker {
  id: string;
  user_id: string;
  resume_url?: string;
  skills: string[];
  experience_years?: number;
  created_at: string;
}

export interface AppError {
  message: string;
  code?: string;
  timestamp: number;
}
