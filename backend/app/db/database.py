from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os

# Carga las variables definidas en el archivo .env al entorno de Python.
# Esto evita hardcodear credenciales directamente en el código.
load_dotenv()

# Lee la URL de conexión a PostgreSQL desde las variables de entorno.
# Formato: postgresql+asyncpg://usuario:password@host:puerto/base_de_datos
DATABASE_URL = os.getenv("DATABASE_URL")

# Crea el motor de conexión asíncrono.
# echo=True imprime en consola cada query SQL que se ejecuta, útil para debuggear en desarrollo.
engine = create_async_engine(DATABASE_URL, echo=True)

# Fábrica de sesiones de base de datos.
# Cada request HTTP al backend abre una sesión, opera, y la cierra automáticamente.
# expire_on_commit=False evita que los objetos queden inaccesibles después de un commit.
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Clase base de la que heredan todos los modelos del sistema.
# SQLAlchemy la usa para saber qué tablas crear en la base de datos.
class Base(DeclarativeBase):
    pass

# Función generadora que inyecta la sesión de base de datos en cada endpoint.
# FastAPI la llama automáticamente cuando un endpoint declara db: AsyncSession = Depends(get_db).
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session