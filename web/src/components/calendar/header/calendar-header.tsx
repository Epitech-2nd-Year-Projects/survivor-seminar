export default function CalendarHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 flex items-center justify-between gap-4 border-b p-4 backdrop-blur">
      {children}
    </div>
  );
}
