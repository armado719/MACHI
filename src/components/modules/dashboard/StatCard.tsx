import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  accent?: 'amber' | 'red' | 'green'
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-content-muted uppercase tracking-wide">{label}</p>
        <Icon
          className={cn(
            'w-4 h-4',
            accent === 'amber' && 'text-amber',
            accent === 'red' && 'text-red',
            accent === 'green' && 'text-green',
            !accent && 'text-steel'
          )}
        />
      </div>
      <p className="font-display text-3xl font-semibold text-content mt-2">{value}</p>
    </Card>
  )
}
