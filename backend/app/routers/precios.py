from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.models.precio import Precio, EstadoPrecio
from app.schemas.precio import PrecioCreate, PrecioResponse, PrecioValidar

# Agrupa todos los endpoints relacionados a precios bajo el prefijo /precios.
router = APIRouter(prefix="/precios", tags=["Precios"])


# Devuelve todos los precios con estado PENDIENTE.
# Es la vista principal del supervisor: la cola de validación.
@router.get("/pendientes", response_model=List[PrecioResponse])
async def listar_pendientes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Precio).where(Precio.estado == EstadoPrecio.PENDIENTE)
    )
    return result.scalars().all()


# Devuelve todos los precios independientemente del estado.
# Útil para el historial completo del supervisor.
@router.get("/", response_model=List[PrecioResponse])
async def listar_precios(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Precio))
    return result.scalars().all()


# Crea un nuevo precio. Lo usará el módulo del encuestador en el futuro.
# Por ahora lo exponemos para poder cargar datos de prueba.
@router.post("/", response_model=PrecioResponse)
async def crear_precio(precio: PrecioCreate, db: AsyncSession = Depends(get_db)):
    nuevo_precio = Precio(**precio.model_dump())
    db.add(nuevo_precio)
    await db.commit()
    await db.refresh(nuevo_precio)
    return nuevo_precio


# Endpoint central del módulo supervisor.
# Permite aprobar, rechazar o marcar en revisión un precio puntual.
@router.patch("/{precio_id}/validar", response_model=PrecioResponse)
async def validar_precio(
    precio_id: int,
    datos: PrecioValidar,
    db: AsyncSession = Depends(get_db)
):
    # Busca el precio por ID
    result = await db.execute(select(Precio).where(Precio.id == precio_id))
    precio = result.scalar_one_or_none()

    # Si no existe, devuelve 404
    if not precio:
        raise HTTPException(status_code=404, detail="Precio no encontrado")

    # Aplica los cambios de validación
    precio.estado = datos.estado
    precio.supervisor_id = datos.supervisor_id
    precio.observacion_supervisor = datos.observacion_supervisor

    from datetime import datetime
    precio.fecha_validacion = datetime.utcnow()

    await db.commit()
    await db.refresh(precio)
    return precio