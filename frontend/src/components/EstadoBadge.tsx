import type { EstadoPrecio } from '../types/precio'
import { theme } from '../constants/theme'

type Props = { estado: EstadoPrecio }

const config: Record<EstadoPrecio, { label: string; color: string; glow: string }> = {
  pendiente:   { label: 'Pendiente',   color: theme.colors.warning,  glow: theme.colors.warningGlow },
  aprobado:    { label: 'Aprobado',    color: theme.colors.success,  glow: theme.colors.successGlow },
  rechazado:   { label: 'Rechazado',   color: theme.colors.danger,   glow: theme.colors.dangerGlow },
  en_revision: { label: 'En revisión', color: theme.colors.info,     glow: theme.colors.infoGlow },
}

export function EstadoBadge({ estado }: Props) {
  const { label, color, glow } = config[estado]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color,
      backgroundColor: glow,
      border: `1px solid ${color}40`,
    }}>
      {/* Dot indicador pulsante */}
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 6px ${color}`,
        animation: estado === 'pendiente' ? 'pulse 2s ease-in-out infinite' : 'none',
      }} />
      {label}
    </span>
  )
}