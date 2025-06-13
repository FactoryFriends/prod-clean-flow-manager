
interface TaskHeaderProps {
  title: string;
  scheduledDate: string;
  dueTime: string | null;
  severelyOverdue: boolean;
  isOverdue: boolean;
}

export function TaskHeader({ title, scheduledDate, dueTime, severelyOverdue, isOverdue }: TaskHeaderProps) {
  return (
    <div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">
        {scheduledDate} {dueTime && `at ${dueTime}`}
      </p>
      {severelyOverdue && (
        <p className="text-sm text-red-700 font-bold">CRITICAL OVERDUE - Immediate Action Required!</p>
      )}
      {isOverdue && !severelyOverdue && (
        <p className="text-sm text-red-600 font-medium">OVERDUE - Action Required!</p>
      )}
    </div>
  );
}
