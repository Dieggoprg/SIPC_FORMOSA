from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.models.precio import EstadoPrecio, CodigoSituacion


# Schema base con los campos comunes a todas las operaciones.
class PrecioBase(BaseModel):
    producto_codigo: str
    producto_nombre: str
    comercio_id: int
    comercio_nombre: str
    valor: float
    codigo_situacion: CodigoSituacion
    encuestador_id: int
    encuestador_nombre: str
    fecha_relevamiento: datetime
    observacion_encuestador: Optional[str] = None
    foto_url: Optional[str] = None


# Schema usado cuando el encuestador crea un nuevo precio.
# Solo hereda PrecioBase, no incluye campos que asigna el sistema.
class PrecioCreate(PrecioBase):
    pass


# Schema usado cuando el supervisor valida un precio.
# Solo necesita el nuevo estado y una observación opcional.
class PrecioValidar(BaseModel):
    estado: EstadoPrecio
    observacion_supervisor: Optional[str] = None
    supervisor_id: int


# Schema completo que devuelve la API al frontend.
# Incluye todos los campos, incluyendo los generados por el sistema.
class PrecioResponse(PrecioBase):
    id: int
    estado: EstadoPrecio
    fecha_carga: datetime
    observacion_supervisor: Optional[str] = None
    supervisor_id: Optional[int] = None
    fecha_validacion: Optional[datetime] = None

    # Le dice a Pydantic que puede leer los datos desde un objeto SQLAlchemy
    # y no solo desde un diccionario.
    model_config = {"from_attributes": True}