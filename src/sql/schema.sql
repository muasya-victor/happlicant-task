CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('super_admin', 'company_admin', 'agent', 'job_seeker')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  location JSONB,
  industry JSONB,
  employee_count INTEGER,
  founded INTEGER,
  ceo JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE company_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

CREATE TABLE agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE job_seekers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resume_url TEXT,
  skills TEXT[],
  experience_years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION create_company_admin_profile(
  user_id UUID,
  user_email TEXT,
  company_name TEXT,
  company_description TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_company_id UUID;
BEGIN
  PERFORM pg_sleep(0.5);
  
  INSERT INTO profiles (id, email, user_type)
  VALUES (user_id, user_email, 'company_admin');
  
  INSERT INTO companies (name, description)
  VALUES (company_name, company_description)
  RETURNING id INTO new_company_id;
  
  INSERT INTO company_admins (user_id, company_id, role)
  VALUES (user_id, new_company_id, 'owner');
END;
$$;

CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('remote', 'on_site', 'hybrid')),
  location JSONB, 
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'freelance', 'internship')),
  salary_range JSONB, 
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
  skills_required TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),
  application_deadline TIMESTAMP WITH TIME ZONE,
  application_url TEXT, 
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id), 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE 
);

CREATE TABLE job_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE job_categories_relation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  category_id UUID REFERENCES job_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, category_id)
);

CREATE TABLE job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT, 
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'reviewed', 'interview', 'rejected', 'accepted')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id), 
  notes TEXT, 
  UNIQUE(job_id, job_seeker_id)
);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location_type ON jobs(location_type);
CREATE INDEX idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_job_seeker_id ON job_applications(job_seeker_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories_relation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins/agents can manage their company jobs" ON jobs
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_admins WHERE user_id = auth.uid()
      UNION
      SELECT company_id FROM agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active jobs" ON jobs
  FOR SELECT USING (status = 'active');

CREATE POLICY "Job seekers can create their own applications" ON job_applications
  FOR INSERT WITH CHECK (
    job_seeker_id IN (SELECT id FROM job_seekers WHERE user_id = auth.uid())
  );

CREATE POLICY "Job seekers can view their own applications" ON job_applications
  FOR SELECT USING (
    job_seeker_id IN (SELECT id FROM job_seekers WHERE user_id = auth.uid())
  );

CREATE POLICY "Company admins/agents can view applications for their jobs" ON job_applications
  FOR ALL USING (
    job_id IN (
      SELECT j.id FROM jobs j
      WHERE j.company_id IN (
        SELECT company_id FROM company_admins WHERE user_id = auth.uid()
        UNION
        SELECT company_id FROM agents WHERE user_id = auth.uid()
      )
    )
  );



CREATE OR REPLACE FUNCTION create_company_transaction(
  p_user_id UUID,
  p_user_email TEXT,
  p_company_name TEXT,
  p_company_description TEXT DEFAULT NULL,
  p_company_website TEXT DEFAULT NULL,
  p_company_logo_url TEXT DEFAULT NULL,
  p_company_founded INTEGER DEFAULT NULL,
  p_company_employee_count INTEGER DEFAULT NULL,
  p_company_ceo JSONB DEFAULT NULL,
  p_company_industry JSONB DEFAULT NULL,
  p_company_location JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_company_id UUID;
  result JSONB;
BEGIN
  INSERT INTO profiles (id, email, user_type, updated_at)
  VALUES (p_user_id, p_user_email, 'company_admin', NOW())
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    user_type = EXCLUDED.user_type,
    updated_at = EXCLUDED.updated_at;
  INSERT INTO companies (
    name, 
    description, 
    website, 
    logo_url, 
    founded, 
    employee_count, 
    ceo, 
    industry, 
    location
  ) VALUES (
    p_company_name,
    p_company_description,
    p_company_website,
    p_company_logo_url,
    p_company_founded,
    p_company_employee_count,
    p_company_ceo,
    p_company_industry,
    p_company_location
  )
  RETURNING id INTO new_company_id;

  INSERT INTO company_admins (user_id, company_id, role)
  VALUES (p_user_id, new_company_id, 'owner');

  SELECT to_jsonb(companies) INTO result
  FROM companies 
  WHERE id = new_company_id;

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in create_company_transaction: %', SQLERRM;
    RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION create_job_transaction(
  p_user_id UUID,
  p_company_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_requirements TEXT DEFAULT NULL,
  p_location_type TEXT DEFAULT 'remote',
  p_location JSONB DEFAULT NULL,
  p_employment_type TEXT DEFAULT 'full_time',
  p_salary_range JSONB DEFAULT NULL,
  p_experience_level TEXT DEFAULT 'mid',
  p_skills_required TEXT[] DEFAULT NULL,
  p_status TEXT DEFAULT 'draft',
  p_application_deadline TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_application_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_job_id UUID;
  result JSONB;
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM company_admins 
    WHERE user_id = p_user_id AND company_id = p_company_id
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'User is not an admin of this company';
  END IF;

  -- Create job
  INSERT INTO jobs (
    company_id,
    created_by,
    title,
    description,
    requirements,
    location_type,
    location,
    employment_type,
    salary_range,
    experience_level,
    skills_required,
    status,
    application_deadline,
    application_url
  ) VALUES (
    p_company_id,
    p_user_id,
    p_title,
    p_description,
    p_requirements,
    p_location_type,
    p_location,
    p_employment_type,
    p_salary_range,
    p_experience_level,
    p_skills_required,
    p_status,
    p_application_deadline,
    p_application_url
  )
  RETURNING id INTO new_job_id;

  SELECT to_jsonb(jobs) INTO result
  FROM jobs 
  WHERE id = new_job_id;

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in create_job_transaction: %', SQLERRM;
    RAISE;
END;
$$;