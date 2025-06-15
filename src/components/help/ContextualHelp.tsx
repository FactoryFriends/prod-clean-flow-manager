
import { useHelp } from "./HelpProvider";
import { HelpTooltip } from "./HelpTooltip";

interface ContextualHelpProps {
  helpKey: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function ContextualHelp({ helpKey, side = "top", className }: ContextualHelpProps) {
  const { getHelpContent } = useHelp();
  const content = getHelpContent(helpKey);

  if (!content) {
    return null;
  }

  const tooltipContent = content.steps 
    ? `${content.description}\n\nSteps:\n${content.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`
    : content.description;

  return (
    <HelpTooltip
      title={content.title}
      content={tooltipContent}
      side={side}
      className={className}
    />
  );
}
