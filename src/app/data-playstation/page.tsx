import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { DBPlaystationUnit, PlaystationUnit } from '@/types';
import DataPlaystationClient from '@/components/DataPlaystationClient';

export const dynamic = 'force-dynamic';

export default async function DataPlaystationPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: raw } = await supabase
    .from('playstation_units')
    .select('*')
    .order('id');

  const units: PlaystationUnit[] = (raw as DBPlaystationUnit[] ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    type: u.type,
    status: u.status,
  }));

  return <DataPlaystationClient units={units} />;
}
