from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.database import Base


# Define los estados posibles de un precio dentro del workflow de validación.
# Un precio nace como PENDIENTE y el supervisor lo mueve según su revisión.
class EstadoPrecio(str, enum.Enum):
    PENDIENTE = "pendiente"
    APROBADO = "aprobado"
    RECHAZADO = "rechazado"
    EN_REVISION = "en_revision"


# Códigos estadísticos definidos por la metodología INDEC.
# Cada código tiene impacto diferente en el cálculo del índice de Laspeyres.
# No se pueden modificar arbitrariamente sin consultar con la Dirección de Estadística.
class CodigoSituacion(str, enum.Enum):
    NORMAL = "normal"
    FALTANTE = "faltante"
    OFERTA = "oferta"
    DISCONTINUADO = "discontinuado"
    TRATAMIENTO_ESPECIAL = "tratamiento_especial"  # Usado para servicios como electricidad


# Modelo central del sistema. Representa un precio relevado por un encuestador en campo.
# Cada registro tiene trazabilidad completa: quién lo cargó, cuándo, dónde y qué pasó con él.
class Precio(Base):
    __tablename__ = "precios"

    id = Column(Integer, primary_key=True, index=True)
    
    # Identificación del producto y comercio donde se relevó el precio.
    # producto_codigo es el código de la canasta definido por INDEC.
    producto_codigo = Column(String, nullable=False, index=True)
    producto_nombre = Column(String, nullable=False)
    comercio_id = Column(Integer, nullable=False, index=True)
    comercio_nombre = Column(String, nullable=False)
    
    # El dato relevado en campo.
    valor = Column(Float, nullable=False)
    
    # Situación del producto al momento del relevamiento.
    # Determina cómo se trata este precio en el motor de cálculo estadístico.
    codigo_situacion = Column(
        Enum(CodigoSituacion),
        default=CodigoSituacion.NORMAL,
        nullable=False
    )
    
    # Trazabilidad completa del dato: quién lo cargó y cuándo.
    # fecha_relevamiento es cuándo el encuestador estuvo en el comercio.
    # fecha_carga es cuándo el dato llegó al sistema (puede diferir por el modo offline).
    encuestador_id = Column(Integer, nullable=False)
    encuestador_nombre = Column(String, nullable=False)
    fecha_relevamiento = Column(DateTime, nullable=False)
    fecha_carga = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Estado del dato dentro del workflow del supervisor.
    # Indexado porque el supervisor filtra constantemente por este campo.
    estado = Column(
        Enum(EstadoPrecio),
        default=EstadoPrecio.PENDIENTE,
        nullable=False,
        index=True
    )
    
    # Observaciones de ambas partes del workflow.
    # El encuestador puede dejar notas desde el campo.
    # El supervisor registra el motivo de rechazo o revisión.
    observacion_encuestador = Column(String, nullable=True)
    observacion_supervisor = Column(String, nullable=True)
    supervisor_id = Column(Integer, nullable=True)
    fecha_validacion = Column(DateTime, nullable=True)
    
    # Path a la foto del precio tomada en campo.
    # Nullable porque no todos los relevamientos requieren evidencia fotográfica.
    # Se almacena desde el día uno para garantizar trazabilidad futura.
    foto_url = Column(String, nullable=True)