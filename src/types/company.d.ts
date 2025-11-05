export type Location =
  | string
  | {
      address?: string;
      city?: string;
      zip_code?: string;
      country?: string;
    };

export type Industry =
  | string
  | {
      primary: string;
      sectors?: string[];
    };

export type CEO =
  | string
  | {
      name: string;
      since?: number;
      bio?: string;
    };

export type Company = {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  location?: Location;
  industry?: Industry;
  employee_count?: number;
  founded?: number;
  ceo?: CEO;
  created_at?: string;
  updated_at?: string;
};
