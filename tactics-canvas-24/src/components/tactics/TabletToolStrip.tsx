import {
  Settings2,
  Shirt,
  TrendingUp,
  Users,
} from 'lucide-react';

interface TabletToolStripProps {
  onOpenTools: () => void;
  onOpenFormations: () => void;
  onOpenProperties: () => void;
}

const entries = [
  { key: 'tools', icon: Users, label: '对象', action: 'tools' },
  { key: 'lines', icon: TrendingUp, label: '线路', action: 'tools' },
  { key: 'formations', icon: Shirt, label: '阵型', action: 'formations' },
  { key: 'props', icon: Settings2, label: '属性', action: 'properties' },
] as const;

export function TabletToolStrip({
  onOpenTools,
  onOpenFormations,
  onOpenProperties,
}: TabletToolStripProps) {
  const handleClick = (action: string) => {
    switch (action) {
      case 'tools':
        onOpenTools();
        break;
      case 'formations':
        onOpenFormations();
        break;
      case 'properties':
        onOpenProperties();
        break;
      default:
        break;
    }
  };

  return (
    <div className="absolute left-2 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-border p-1 shadow-lg panel-bg">
      {entries.map((entry) => (
        <button
          key={entry.key}
          onClick={() => handleClick(entry.action)}
          title={entry.label}
          className="flex h-9 w-9 flex-col items-center justify-center gap-0.5 rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <entry.icon className="h-4 w-4" />
          <span className="text-[8px] leading-none">{entry.label}</span>
        </button>
      ))}
    </div>
  );
}
