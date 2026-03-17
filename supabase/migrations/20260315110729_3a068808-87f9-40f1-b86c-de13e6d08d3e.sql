
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  experience TEXT NOT NULL,
  bullrush_username TEXT NOT NULL,
  telegram_username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow anonymous inserts (public registration form)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.registrations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select count" ON public.registrations
  FOR SELECT TO anon USING (true);
