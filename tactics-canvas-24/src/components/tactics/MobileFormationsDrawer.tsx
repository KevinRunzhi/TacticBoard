import { useEffect, useMemo, useState } from 'react';
import { Search, Shirt, X } from 'lucide-react';
import { getFormationsByFormat } from '@/data/mockData';
import type { FieldFormat } from '@/types/tactics';

interface MobileFormationsDrawerProps {
  open: boolean;
  fieldFormat: FieldFormat;
  onClose: () => void;
  onApplyFormation: (formationId: string) => void;
}

export function MobileFormationsDrawer({
  open,
  fieldFormat,
  onClose,
  onApplyFormation,
}: MobileFormationsDrawerProps) {
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (!open) {
      setSearchValue('');
    }
  }, [open]);

  const formations = useMemo(
    () => getFormationsByFormat(fieldFormat).filter((formation) => (
      formation.name.toLowerCase().includes(searchValue.toLowerCase())
    )),
    [fieldFormat, searchValue],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[60vh] flex-col rounded-t-2xl border-t border-border panel-bg">
        <div className="flex items-center justify-center px-4 pb-1 pt-2">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Shirt className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">选择阵型 · {fieldFormat}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭阵型抽屉"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="搜索阵型..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-9 w-full rounded-md bg-secondary pl-8 pr-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2">
            {formations.map((formation) => (
              <button
                key={formation.id}
                onClick={() => {
                  onApplyFormation(formation.id);
                  onClose();
                }}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-3 text-left transition-colors hover:border-primary/40 hover:bg-secondary"
              >
                <span className="text-sm font-medium text-foreground">{formation.name}</span>
                <Shirt className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
            {formations.length === 0 && (
              <div className="col-span-2 rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                没有匹配的阵型
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
