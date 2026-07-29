DROP POLICY IF EXISTS "Admins can delete submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can read submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can delete messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Room holders can read unexpired messages" ON public.chat_messages;

CREATE POLICY "Admins can read submissions" ON public.submissions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "Admins can update submissions" ON public.submissions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "Admins can delete submissions" ON public.submissions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "Admins can read messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "Admins can send messages" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "Admins can delete messages" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

REVOKE SELECT ON public.chat_messages FROM anon;

CREATE OR REPLACE FUNCTION public.get_room_messages(_room_id uuid)
RETURNS TABLE (id uuid, sender_type text, message text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS 'SELECT m.id, m.sender_type, m.message, m.created_at FROM public.chat_messages m JOIN public.submissions s ON s.id = m.room_id WHERE m.room_id = _room_id AND s.chat_enabled AND (m.expires_at IS NULL OR m.expires_at > now()) ORDER BY m.created_at ASC LIMIT 500';

REVOKE EXECUTE ON FUNCTION public.get_room_messages(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_room_messages(uuid) TO anon, authenticated;
-- done
