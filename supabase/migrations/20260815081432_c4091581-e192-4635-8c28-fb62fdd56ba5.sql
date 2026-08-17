CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  age INT,
  age_group TEXT,
  skin_type TEXT,
  skin_concerns TEXT[] NOT NULL DEFAULT '{}',
  allergies TEXT[] NOT NULL DEFAULT '{}',
  sensitivities TEXT[] NOT NULL DEFAULT '{}',
  current_products TEXT[] NOT NULL DEFAULT '{}',
  lifestyle TEXT,
  sleep_quality INT,
  water_intake_litres NUMERIC,
  sun_exposure TEXT,
  environment TEXT,
  goals TEXT[] NOT NULL DEFAULT '{}',
  budget TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  image_path TEXT,
  gradcam_path TEXT,
  gradcam_url TEXT,
  condition TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  model_version TEXT,
  skin_health_score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assessments" ON public.assessments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.assessments (user_id, created_at DESC);

CREATE TABLE public.assessment_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  condition TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  rank INT NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_predictions TO authenticated;
GRANT ALL ON public.assessment_predictions TO service_role;
ALTER TABLE public.assessment_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own predictions" ON public.assessment_predictions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments ON DELETE SET NULL,
  week_number INT NOT NULL DEFAULT 1,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rationale TEXT,
  generated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.routines TO authenticated;
GRANT ALL ON public.routines TO service_role;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own routines" ON public.routines FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.routine_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  day_number INT NOT NULL,
  title TEXT NOT NULL,
  focus TEXT,
  morning_steps TEXT[] NOT NULL DEFAULT '{}',
  evening_steps TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.routine_days TO authenticated;
GRANT ALL ON public.routine_days TO service_role;
ALTER TABLE public.routine_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own routine days" ON public.routine_days FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.routine_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_day_id UUID NOT NULL REFERENCES public.routine_days ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.routine_tasks TO authenticated;
GRANT ALL ON public.routine_tasks TO service_role;
ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own routine tasks" ON public.routine_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.daily_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  routine_day_id UUID REFERENCES public.routine_days ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_feedback TO authenticated;
GRANT ALL ON public.daily_feedback TO service_role;
ALTER TABLE public.daily_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own feedback" ON public.daily_feedback FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  skin_health_score INT,
  routine_adherence NUMERIC,
  hydration NUMERIC,
  sleep NUMERIC,
  confidence NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entry_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress TO authenticated;
GRANT ALL ON public.progress TO service_role;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress" ON public.progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  routine_id UUID REFERENCES public.routines ON DELETE SET NULL,
  week_number INT NOT NULL DEFAULT 1,
  starting_score INT,
  ending_score INT,
  routine_adherence NUMERIC,
  hydration NUMERIC,
  sleep NUMERIC,
  completed_tasks INT,
  missed_tasks INT,
  summary TEXT,
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reviews TO authenticated;
GRANT ALL ON public.weekly_reviews TO service_role;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reviews" ON public.weekly_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_sessions TO service_role;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions" ON public.chat_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER chat_sessions_updated BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.chat_sessions ON DELETE CASCADE,
  role TEXT NOT NULL,
  message TEXT NOT NULL,
  skin_condition_at_time TEXT,
  confidence_at_time NUMERIC,
  routine_day INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages" ON public.chat_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.chat_messages (user_id, session_id, created_at);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  kind TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  time_of_day TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL,
  suitable_concerns TEXT[] NOT NULL DEFAULT '{}',
  irritation_risk TEXT NOT NULL,
  compatibility TEXT,
  usage_guidance TEXT,
  warnings TEXT
);
GRANT SELECT ON public.ingredients TO anon, authenticated;
GRANT ALL ON public.ingredients TO service_role;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ingredients readable" ON public.ingredients FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  description TEXT,
  price_band TEXT NOT NULL,
  price_estimate NUMERIC,
  suitable_skin_types TEXT[] NOT NULL DEFAULT '{}',
  targets_concerns TEXT[] NOT NULL DEFAULT '{}',
  key_ingredients TEXT[] NOT NULL DEFAULT '{}'
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products readable" ON public.products FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.ingredients (name, slug, purpose, suitable_concerns, irritation_risk, compatibility, usage_guidance, warnings) VALUES
('Retinoids','retinoids','Encourages skin cell turnover and supports the look of fine lines and uneven texture.','{"Wrinkles","Fine Lines","Acne","Uneven Skin Tone"}','High','Avoid layering with AHAs, BHAs or benzoyl peroxide in the same routine.','Start 2 nights per week at night only, always follow with moisturiser and daily sunscreen.','Not suitable during pregnancy. Can cause dryness, peeling and sun sensitivity.'),
('Niacinamide','niacinamide','Supports the skin barrier and helps with visible redness, oiliness and uneven tone.','{"Acne","Redness","Uneven Skin Tone","Dark Spots"}','Low','Works well with most actives including hyaluronic acid and ceramides.','Use 4-5% morning or evening before moisturiser.','Very high concentrations may cause flushing in sensitive skin.'),
('Vitamin C','vitamin-c','Antioxidant that supports brightness and a more even looking tone.','{"Dark Spots","Hyperpigmentation","Uneven Skin Tone"}','Medium','Pair with sunscreen in the morning; avoid using at the same time as strong exfoliants.','Apply in the morning on clean skin, then moisturiser and sunscreen.','Can sting on compromised or very sensitive skin.'),
('Hyaluronic Acid','hyaluronic-acid','A humectant that draws water into the upper layers of the skin.','{"Dryness","Fine Lines","Redness"}','Very Low','Compatible with essentially every other ingredient.','Apply to damp skin and seal with a moisturiser.','On its own in very dry air it can feel dehydrating without an occlusive on top.'),
('Salicylic Acid','salicylic-acid','Oil-soluble exfoliant that helps clear congested pores.','{"Acne","Uneven Skin Tone"}','Medium','Do not combine with retinoids in the same application.','Use 1-3 times per week, building up slowly.','Avoid on broken or eczema-prone skin. Increases sun sensitivity.'),
('Ceramides','ceramides','Barrier lipids that help skin retain moisture.','{"Dryness","Redness","Fine Lines"}','Very Low','Compatible with all actives and especially helpful alongside retinoids.','Use morning and evening in a moisturiser.','No common warnings.'),
('Peptides','peptides','Support the skin''s smoothness and firmness over time.','{"Fine Lines","Wrinkles"}','Low','Generally compatible; avoid pairing with very low pH acids at the same time.','Use daily in a serum or moisturiser.','Results are gradual and subtle.'),
('AHAs','ahas','Water-soluble exfoliants such as glycolic and lactic acid for surface texture and tone.','{"Dark Spots","Hyperpigmentation","Uneven Skin Tone","Fine Lines"}','High','Do not layer with retinoids or BHAs on the same night.','Use once or twice weekly at night, always with sunscreen the next day.','Avoid with rosacea, eczema or an impaired barrier. Increases sun sensitivity.'),
('BHAs','bhas','Oil-soluble exfoliants that work inside the pore lining.','{"Acne","Uneven Skin Tone"}','Medium','Avoid same-night use with retinoids or AHAs.','Use 1-3 nights weekly, starting low.','Avoid if you have a salicylate sensitivity or very dry, cracked skin.');

INSERT INTO public.products (name, brand, category, description, price_band, price_estimate, suitable_skin_types, targets_concerns, key_ingredients) VALUES
('Gentle Gel Cleanser','Reference Library','Face Wash','A low-foam gel cleanser for daily use that does not strip the barrier.','Budget',9,'{"Oily","Combination","Normal"}','{"Acne","Uneven Skin Tone"}','{"Glycerin"}'),
('Cream Cleanser','Reference Library','Face Wash','A non-foaming cream cleanser for dry and reactive skin.','Budget',11,'{"Dry","Sensitive","Normal"}','{"Dryness","Redness"}','{"Ceramides"}'),
('Barrier Repair Moisturiser','Reference Library','Moisturizer','A ceramide-rich daily moisturiser suitable for compromised barriers.','Mid',18,'{"Dry","Sensitive","Normal","Combination"}','{"Dryness","Redness"}','{"Ceramides","Hyaluronic Acid"}'),
('Oil-Free Gel Moisturiser','Reference Library','Moisturizer','A lightweight gel hydrator for oily and congested skin.','Budget',13,'{"Oily","Combination"}','{"Acne"}','{"Niacinamide","Hyaluronic Acid"}'),
('Mineral Sunscreen SPF 50','Reference Library','Sunscreen','A zinc-based mineral sunscreen for reactive and redness-prone skin.','Mid',22,'{"Sensitive","Dry","Normal"}','{"Redness","Dark Spots"}','{"Zinc Oxide"}'),
('Fluid Sunscreen SPF 50+','Reference Library','Sunscreen','A weightless chemical filter fluid that layers well under makeup.','Mid',20,'{"Oily","Combination","Normal"}','{"Dark Spots","Hyperpigmentation"}','{"Chemical filters"}'),
('Niacinamide 5% Serum','Reference Library','Serum','A daily barrier and tone serum at a well tolerated strength.','Budget',10,'{"Oily","Combination","Normal","Sensitive"}','{"Acne","Redness","Uneven Skin Tone"}','{"Niacinamide"}'),
('Vitamin C 10% Serum','Reference Library','Serum','A morning antioxidant serum for a brighter looking tone.','Mid',26,'{"Normal","Combination","Oily"}','{"Dark Spots","Hyperpigmentation","Uneven Skin Tone"}','{"Vitamin C"}'),
('Hydrating Hyaluronic Serum','Reference Library','Serum','A layered-weight hyaluronic serum for dehydrated skin.','Budget',12,'{"Dry","Normal","Combination","Sensitive","Oily"}','{"Dryness","Fine Lines"}','{"Hyaluronic Acid"}'),
('Alcohol-Free Hydrating Toner','Reference Library','Toner','A soothing hydrating toner used after cleansing.','Budget',9,'{"Dry","Sensitive","Normal"}','{"Dryness","Redness"}','{"Glycerin","Panthenol"}'),
('BHA 2% Exfoliating Toner','Reference Library','Toner','A leave-on salicylic exfoliant for congested skin.','Mid',24,'{"Oily","Combination"}','{"Acne"}','{"Salicylic Acid"}'),
('Encapsulated Retinal Treatment','Reference Library','Treatment','A gradual-release retinoid treatment for texture and fine lines.','Premium',48,'{"Normal","Combination","Oily"}','{"Wrinkles","Fine Lines","Acne"}','{"Retinoids"}'),
('Azelaic Acid 10% Treatment','Reference Library','Treatment','A gentle treatment often used for redness and uneven tone.','Mid',20,'{"Sensitive","Combination","Oily","Normal"}','{"Redness","Acne","Dark Spots"}','{"Azelaic Acid"}'),
('Oat Soothing Mask','Reference Library','Face Mask','A short-wear calming mask for reactive days.','Budget',14,'{"Sensitive","Dry"}','{"Redness","Dryness"}','{"Colloidal Oat","Ceramides"}'),
('Clay Balancing Mask','Reference Library','Face Mask','A weekly clay mask for visible oil and congestion.','Budget',15,'{"Oily","Combination"}','{"Acne"}','{"Kaolin","Niacinamide"}');

CREATE POLICY "own skin image objects" ON storage.objects FOR ALL TO authenticated
USING (bucket_id IN ('skin-images','gradcam','before-after') AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id IN ('skin-images','gradcam','before-after') AND auth.uid()::text = (storage.foldername(name))[1]);