import { ReactNode } from "react";

interface Props {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}

export const SectionHeading = ({ eyebrow, title, description, action }: Props) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
    <div className="max-w-2xl">
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-accent mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="font-semibold text-2xl md:text-3xl lg:text-4xl tracking-[-0.03em] leading-[1.1] text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-muted-foreground text-base md:text-[1.05rem] leading-relaxed max-w-xl">
          {description}
        </p>
      )}
    </div>
    {action && <div className="shrink-0 flex justify-end sm:block">{action}</div>}
  </div>
);
