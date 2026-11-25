import type { PlannerReport } from "./reportsApi";

export interface PlannerPlace {
  name: string;
  lat: number;
  lng: number;
}

export interface PlannerOptions {
  reports?: {
    list: () => Promise<PlannerReport[]>;
    add: (r: Omit<PlannerReport, "id">) => Promise<PlannerReport>;
    vote: (id: string, kind: "confirm" | "cleared") => Promise<void>;
  };
  onBook?: (from: PlannerPlace, to: PlannerPlace) => void;
  onNeedSignIn?: () => void;
}

export function mountPlanner(root: HTMLElement, opts?: PlannerOptions): () => void;
