import { supabase } from "@/integrations/supabase/client";

/** Shape the planner engine uses for a Community Eyes report. */
export interface PlannerReport {
  id: string;
  type: string;
  desc: string;
  x: number;
  y: number;
  sev: number;
  time: number;
  c: number;
  dn: number;
  photo?: string | null;
}

// community_reports is newer than the generated database types, so it is queried untyped.
const db = supabase as any;

const fromRow = (r: any): PlannerReport => ({
  id: r.id,
  type: r.report_type,
  desc: r.description,
  x: Number(r.map_x),
  y: Number(r.map_y),
  sev: r.severity,
  time: new Date(r.created_at).getTime(),
  c: r.confirms,
  dn: r.cleared,
  photo: r.photo,
});

async function requireSignIn() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in to post or vote.");
  return session.user;
}

export const reportsApi = {
  async list(): Promise<PlannerReport[]> {
    const since = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();
    const { data, error } = await db
      .from("community_reports")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data || []).map(fromRow);
  },

  async add(rep: Omit<PlannerReport, "id">): Promise<PlannerReport> {
    const user = await requireSignIn();
    const { data, error } = await db
      .from("community_reports")
      .insert({
        user_id: user.id,
        report_type: rep.type,
        description: rep.desc,
        map_x: rep.x,
        map_y: rep.y,
        severity: rep.sev,
        photo: rep.photo || null,
      })
      .select()
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  async vote(id: string, kind: "confirm" | "cleared"): Promise<void> {
    const user = await requireSignIn();
    const { error } = await db.from("community_report_votes").insert({ report_id: id, user_id: user.id, vote: kind });
    if (error) {
      if (error.code === "23505") throw new Error("You already voted on this report.");
      throw error;
    }
  },
};
