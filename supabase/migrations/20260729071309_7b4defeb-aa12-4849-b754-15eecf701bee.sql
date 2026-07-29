
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  content text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  intent text NOT NULL DEFAULT 'Both',
  emotional_state integer NOT NULL DEFAULT 3 CHECK (emotional_state BETWEEN 1 AND 5),
  community_question text,
  highlight_on_instagram text NOT NULL DEFAULT 'Maybe',
  nickname text,
  alias text NOT NULL DEFAULT ('Gumnam Dost #' || lpad((floor(random()*900)+100)::text, 3, '0')),
  anon_user_id text,
  chat_enabled boolean NOT NULL DEFAULT false,
  chat_ttl text NOT NULL DEFAULT 'never',
  status text NOT NULL DEFAULT 'Pending'
);
GRANT INSERT ON public.submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a story" ON public.submissions
FOR INSERT TO anon, authenticated WITH CHECK (char_length(content) BETWEEN 1 AND 5000);

CREATE POLICY "Admins can read submissions" ON public.submissions
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions" ON public.submissions
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete submissions" ON public.submissions
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  room_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  sender_type text NOT NULL DEFAULT 'user',
  message text NOT NULL,
  expires_at timestamptz
);
CREATE INDEX chat_messages_room_idx ON public.chat_messages (room_id, created_at);
GRANT SELECT, INSERT ON public.chat_messages TO anon, authenticated;
GRANT UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room holders can read unexpired messages" ON public.chat_messages
FOR SELECT TO anon, authenticated USING (expires_at IS NULL OR expires_at > now());

CREATE POLICY "Room holders can send messages" ON public.chat_messages
FOR INSERT TO anon, authenticated WITH CHECK (
  sender_type = 'user'
  AND char_length(message) BETWEEN 1 AND 2000
  AND EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = room_id AND s.chat_enabled)
);

CREATE POLICY "Admins can send messages" ON public.chat_messages
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete messages" ON public.chat_messages
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
