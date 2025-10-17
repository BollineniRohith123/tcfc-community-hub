-- Add policy to allow users to create their own payment records
CREATE POLICY "Users can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Add policies for user_memberships table
CREATE POLICY "Users can view own memberships"
  ON public.user_memberships FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own memberships"
  ON public.user_memberships FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all memberships"
  ON public.user_memberships FOR ALL
  USING (has_role(auth.uid(), 'admin'));

