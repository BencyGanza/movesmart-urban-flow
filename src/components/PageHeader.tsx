import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

/** Blue title band used at the top of inner pages, matching the homepage hero. */
export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <section className="pt-16 text-white" style={{ background: "hsl(197 100% 24%)" }}>
    <div className="container mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-3 text-white/85 leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  </section>
);
