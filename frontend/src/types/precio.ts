// Espejo exacto de los enums definidos en el backend.
// Mantener sincronizados con app/models/precio.py
export type EstadoPrecio =
  | 'pendiente'
  | 'aprobado'
  | 'rechazado'
  | 'en_revision'

export type CodigoSituacion =
  | 'normal'
  | 'faltante'
  | 'oferta'
  | 'discontinuado'
  | 'tratamiento_especial'

// Representa un precio tal como lo devuelve la API.
export type Precio = {
  id: number
  producto_codigo: string
  producto_nombre: string
  comercio_id: number
  comercio_nombre: string
  valor: number
  codigo_situacion: CodigoSituacion
  encuestador_id: number
  encuestador_nombre: string
  fecha_relevamiento: string
  fecha_carga: string
  estado: EstadoPrecio
  observacion_encuestador: string | null
  observacion_supervisor: string | null
  supervisor_id: number | null
  fecha_validacion: string | null
  foto_url: string | null
}

// Payload que se envía al endpoint PATCH /precios/{id}/validar
export type PrecioValidar = {
  estado: EstadoPrecio
  observacion_supervisor?: string
  supervisor_id: number
}