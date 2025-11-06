export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string;
  location_type: "remote" | "on_site" | "hybrid";
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  employment_type:
    | "full_time"
    | "part_time"
    | "contract"
    | "freelance"
    | "internship";
  salary_range?: {
    min: number;
    max: number;
    currency: string;
    period: "yearly" | "monthly" | "hourly";
  };
  experience_level?: "entry" | "mid" | "senior" | "executive";
  skills_required: string[];
  status: "draft" | "active" | "paused" | "closed" | "archived";
  application_deadline?: string;
  application_url?: string;
  views_count: number;
  applications_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}
