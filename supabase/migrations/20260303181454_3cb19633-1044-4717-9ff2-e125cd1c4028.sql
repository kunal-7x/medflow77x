
-- Fix alerts manage policy - restrict to authenticated staff with specific roles
DROP POLICY "Staff can manage alerts" ON public.alerts;
CREATE POLICY "Staff can insert alerts" ON public.alerts
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );
CREATE POLICY "Admin can update alerts" ON public.alerts
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse'));
CREATE POLICY "Admin can delete alerts" ON public.alerts
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix audit_log insert policy
DROP POLICY "System can insert audit logs" ON public.audit_log;
CREATE POLICY "Authenticated can insert audit logs" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
