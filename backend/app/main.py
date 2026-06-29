from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base
from app import models

app = FastAPI(
    title="SIPC-Formosa API",
    description="Sistema Integral para la Gestión del IPC - Formosa",
    version="0.1.0",
)

# Permite que el frontend React (corriendo en localhost:5173) pueda hacer
# requests al backend sin que el navegador las bloquee por política de CORS.
# En producción este origen se reemplaza por el dominio real del sistema.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(precios.router)  # Importa y registra el router de precios.

# Al iniciar el servidor, crea automáticamente todas las tablas definidas
# en los modelos si aún no existen en la base de datos.
# En producción esto se reemplaza por migraciones con Alembic.
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Endpoint de salud del sistema. Usado para verificar que el servidor está
# corriendo y responde correctamente. Útil para monitoreo en producción.
@app.get("/health")
async def health_check():
    return {"status": "ok", "sistema": "SIPC-Formosa"}