import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gsap } from 'gsap'
import { getPreciosPendientes, validarPrecio } from '../services/precios'
import { EstadoBadge } from '../components/EstadoBadge'
import { theme } from '../constants/theme'
import type { Precio } from '../types/precio'

const SUPERVISOR_ID_TEMP = 1

// Formatea fecha ISO a formato legible en español.
function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Tarjeta individual de precio con animación de salida al validar.
function PrecioCard({
  precio,
  onValidar,
}: {
  precio: Precio
  onValidar: (id: number, estado: 'aprobado' | 'rechazado' | 'en_revision', obs?: string) => void
}) {
  const [observacion, setObservacion] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  // Animación de salida antes de ejecutar la validación.
  function handleValidar(estado: 'aprobado' | 'rechazado' | 'en_revision') {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      opacity: 0,
      y: -16,
      scale: 0.97,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => onValidar(precio.id, estado, observacion),
    })
  }

  const codigoColors: Record<string, string> = {
    normal: theme.colors.textSecondary,
    faltante: theme.colors.danger,
    oferta: theme.colors.success,
    discontinuado: theme.colors.textMuted,
    tratamiento_especial: theme.colors.accent,
  }

  return (
    <div
      ref={cardRef}
      style={{
        position: 'relative',
        backgroundColor: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        backdropFilter: 'blur(12px)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        zIndex: 1,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = theme.colors.borderAccent
        el.style.boxShadow = `0 0 24px ${theme.colors.primaryGlow}`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = theme.colors.border
        el.style.boxShadow = 'none'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '11px', color: theme.colors.textMuted, fontFamily: theme.fonts.mono, marginBottom: '4px', letterSpacing: '0.08em' }}>
            {precio.producto_codigo}
          </p>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.textPrimary }}>
            {precio.producto_nombre}
          </h3>
        </div>
        <EstadoBadge estado={precio.estado} />
      </div>

      {/* Metadata */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Comercio', value: precio.comercio_nombre },
          { label: 'Encuestador', value: precio.encuestador_nombre },
          { label: 'Relevado', value: formatFecha(precio.fecha_relevamiento) },
          { label: 'Cargado', value: formatFecha(precio.fecha_carga) },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontSize: '10px', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
              {label}
            </p>
            <p style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Situación + Valor */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{
          fontSize: '11px',
          fontFamily: theme.fonts.mono,
          color: codigoColors[precio.codigo_situacion] ?? theme.colors.textSecondary,
          backgroundColor: `${codigoColors[precio.codigo_situacion]}15`,
          padding: '4px 10px',
          borderRadius: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {precio.codigo_situacion.replace('_', ' ')}
        </span>

        <span style={{
          fontSize: '28px',
          fontWeight: 700,
          fontFamily: theme.fonts.mono,
          color: theme.colors.textPrimary,
          letterSpacing: '-0.02em',
        }}>
          ${precio.valor.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Nota del encuestador */}
      {precio.observacion_encuestador && (
        <div style={{
          backgroundColor: `${theme.colors.warning}10`,
          border: `1px solid ${theme.colors.warning}30`,
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '16px',
          fontSize: '13px',
          color: theme.colors.warning,
        }}>
          <span style={{ fontWeight: 600, marginRight: '6px' }}>Nota:</span>
          {precio.observacion_encuestador}
        </div>
      )}

      {/* Observación del supervisor */}
      <textarea
        placeholder="Observación del supervisor (opcional)..."
        value={observacion}
        onChange={e => setObservacion(e.target.value)}
        rows={2}
        style={{
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '13px',
          color: theme.colors.textPrimary,
          resize: 'vertical',
          outline: 'none',
          marginBottom: '16px',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = theme.colors.borderAccent}
        onBlur={e => e.target.style.borderColor = theme.colors.border}
      />

      {/* Acciones */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { label: 'Aprobar',   estado: 'aprobado'    as const, color: theme.colors.success, glow: theme.colors.successGlow },
          { label: 'Revisar',   estado: 'en_revision' as const, color: theme.colors.info,    glow: theme.colors.infoGlow },
          { label: 'Rechazar',  estado: 'rechazado'   as const, color: theme.colors.danger,  glow: theme.colors.dangerGlow },
        ].map(({ label, estado, color, glow }) => (
          <button
            key={estado}
            onClick={() => handleValidar(estado)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${color}40`,
              backgroundColor: `${color}15`,
              color,
              fontSize: '13px',
              fontWeight: 600,
              transition: 'background-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.backgroundColor = `${color}25`
              el.style.boxShadow = `0 0 16px ${glow}`
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.backgroundColor = `${color}15`
              el.style.boxShadow = 'none'
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Pantalla principal de la cola de validación del supervisor.
export function ColaValidacion() {
  const queryClient = useQueryClient()

  const { data: precios, isLoading, isError } = useQuery({
    queryKey: ['precios', 'pendientes'],
    queryFn: getPreciosPendientes,
  })

  const { mutate: validar } = useMutation({
    mutationFn: ({ id, estado, obs }: { id: number; estado: 'aprobado' | 'rechazado' | 'en_revision'; obs?: string }) =>
      validarPrecio(id, { estado, supervisor_id: SUPERVISOR_ID_TEMP, observacion_supervisor: obs }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precios', 'pendientes'] })
    },
  })

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '11px', color: theme.colors.textMuted, fontFamily: theme.fonts.mono, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Módulo Supervisor — SIPC Formosa
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: theme.colors.textPrimary, letterSpacing: '-0.02em' }}>
          Cola de Validación
        </h1>
        {precios && (
          <p style={{ marginTop: '8px', fontSize: '14px', color: theme.colors.textSecondary }}>
            <span style={{ color: theme.colors.warning, fontWeight: 600 }}>{precios.length}</span> precio(s) esperando revisión
          </p>
        )}
      </div>

      {/* Estados */}
      {isLoading && (
        <p style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>Cargando precios pendientes...</p>
      )}
      {isError && (
        <p style={{ color: theme.colors.danger, fontSize: '14px' }}>Error al conectar con el servidor.</p>
      )}
      {precios?.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: theme.colors.textMuted }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>✓</p>
          <p style={{ fontSize: '15px' }}>No hay precios pendientes para validar.</p>
        </div>
      )}

      {/* Lista de precios */}
      {precios?.map((precio: Precio) => (
        <PrecioCard
          key={precio.id}
          precio={precio}
          onValidar={(id, estado, obs) => validar({ id, estado, obs })}
        />
      ))}
    </div>
  )
}