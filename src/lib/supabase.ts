import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export type Property = {
  id: string;
  slug: string;
  project_name: string;
  developer_id: string | null;
  developer_name: string;
  location: string;
  property_type: string;
  configurations: string[];
  starting_price: number;
  currency: string;
  down_payment_percent: number;
  handover_date: string;
  status: string;
  overview: string;
  hero_images: string[];
  gallery_images: string[];
  floor_plan_images: string[];
  brochure_url: string;
  amenities: string[];
  key_highlights: string[];
  payment_plan: Array<{ milestone: string; percent: number }>;
  meta_title: string;
  meta_description: string;
  featured: boolean;
  active: boolean;
  created_at: string;
};

export type Developer = {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  established: string;
  active: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatar_url: string;
  quote: string;
  rating: number;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  category: string;
  read_time: string;
  created_at: string;
};

export type Lead = {
  id: string;
  property_id: string | null;
  property_name: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  budget: string;
  purpose: string;
  status: string;
  notes: string;
  created_at: string;
};
