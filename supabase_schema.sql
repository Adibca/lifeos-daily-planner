-- ==============================================================
-- LifeOS Daily Planner - Supabase Database Schema & RLS Policies
-- ==============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  telegram_chat_id TEXT,
  push_subscription JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger to auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Deep Work',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  time TEXT,
  slot TEXT,
  completed BOOLEAN DEFAULT FALSE,
  is_overdue BOOLEAN DEFAULT FALSE,
  date TEXT DEFAULT 'Today',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" 
ON public.tasks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" 
ON public.tasks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" 
ON public.tasks FOR DELETE 
USING (auth.uid() = user_id);


-- 3. HABITS TABLE
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Health',
  streak INT DEFAULT 0,
  target TEXT DEFAULT '30 min',
  time_of_day TEXT DEFAULT 'Morning',
  history BOOLEAN[] DEFAULT '{false,false,false,false,false,false,false}',
  completed_today BOOLEAN DEFAULT FALSE,
  last_completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits" 
ON public.habits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" 
ON public.habits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" 
ON public.habits FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" 
ON public.habits FOR DELETE 
USING (auth.uid() = user_id);


-- 4. SCHEDULE SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.schedule_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  time TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT DEFAULT 'task' CHECK (type IN ('task', 'routine', 'break')),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'active')),
  task_id TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for schedule slots
ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedule slots" 
ON public.schedule_slots FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedule slots" 
ON public.schedule_slots FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedule slots" 
ON public.schedule_slots FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedule slots" 
ON public.schedule_slots FOR DELETE 
USING (auth.uid() = user_id);


-- 5. REALTIME REPLICATION (For multi-device auto-sync)
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_slots;

