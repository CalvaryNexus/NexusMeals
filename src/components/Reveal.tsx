/**
 * Fades content up as it scrolls into view, using a scroll-driven CSS
 * animation. There is deliberately no JavaScript here: where
 * `animation-timeline` isn't supported the content simply renders as normal,
 * so a reader never ends up staring at an invisible page.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  as?: "div" | "li" | "section" | "article";
  className?: string;
}) {
  return <Tag className={`reveal ${className}`}>{children}</Tag>;
}
