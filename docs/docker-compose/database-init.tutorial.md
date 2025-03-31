# Inicialización de la Base de Datos con Docker

Este tutorial te guiará a través del proceso de instalación y configuración de PostgreSQL y PG Admin utilizando Docker Compose.

## Requisitos previos

Antes de iniciar, asegúrese de tener instalado:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

Puedes verificar si Docker está correctamente instalado ejecutando:
```bash
docker --version
```
Y para Docker Compose:
```bash
docker-compose --version
```

## Configuración de la Base de Datos con Docker Compose

El proyecto ya incluye un archivo `docker-compose.yml` que facilita la creación de los contenedores de PostgreSQL y PG Admin. Este archivo define los servicios necesarios para levantar la base de datos y su entorno de administración.

## Instalación y ejecución

1. Clone este repositorio y ubique el archivo `docker-compose.yml` en su entorno local.
2. Abra una terminal en la ubicación del archivo `docker-compose.yml`.
3. Ejecute el siguiente comando para iniciar los contenedores en segundo plano:
   
```sh
docker-compose up -d
```
4. Espere unos segundos a que los contenedores se inicialicen.

5. Verificar que los servicios están corriendo

Puedes comprobar que los contenedores están en ejecución con:

```bash
docker ps
```

Si los servicios no están corriendo, revisa los logs para encontrar posibles errores:

```bash
docker-compose logs -f
```

## Acceso a PgAdmin

1. Abra su navegador y diríjase a: [http://localhost:8080](http://localhost:8080)
2. Ingrese las siguientes credenciales:
   - **Correo electrónico:** `test@example.com`
   - **Contraseña:** `123456`
3. Para agregar la base de datos PostgreSQL en PgAdmin:
   - Vaya a **Servers** > **Add New Server**
   - En la pestaña **General**, ingrese un nombre de su elección.
   - En la pestaña **Connection**:
     - **Host**: `postgre`
     - **Username**: `test`
     - **Password**: `S3cR3T`
   - Haga clic en **Save**.
   - Nota: Si tiene algun problema con el **Host** puede probar con `host.docker.internal`

## Estructura del `docker-compose.yml`

```yaml
version: "3.8"

services:
  postgre:
    image: postgres:latest
    ports:
      - "5432:5432"
    volumes:
      - ./data:/var/lib/cocos-capital/data
      - ./backup:/backup
    environment:
      - POSTGRES_USER=test
      - POSTGRES_PASSWORD=S3cR3T
      - POSTGRES_DB=cocos-capital

  pgadmin:
    image: dpage/pgadmin4:latest
    ports:
      - "8080:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=test@example.com
      - PGADMIN_DEFAULT_PASSWORD=123456
    volumes:
      - ./backup:/backup
    depends_on:
      - postgre
```

## Detener los contenedores

## 4. Detener y Reiniciar los Servicios
Para detener los contenedores sin eliminarlos:
```bash
docker-compose stop
```

Para volver a iniciarlos:
```bash
docker-compose start
```

Si necesitas eliminar los contenedores y sus volúmenes asociados:
```bash
docker-compose down -v
```

⚠️ **Advertencia:** Esto eliminará todos los datos almacenados en la base de datos.

## 5. Documentación Relacionada
📄 Para más detalles sobre cambios en el esquema de la base de datos, consulta [`/docs/database/database-schema-changes.md`](../database/database-schema-changes.md).

Con esto, tendrás tu base de datos PostgreSQL lista para trabajar dentro de un entorno Dockerizado. 🚀

## Notas

- Los datos de PostgreSQL se almacenan en el directorio `./data`.
- Los backups se almacenan en `./backup`.
- Puede modificar el `docker-compose.yml` para cambiar credenciales o configuraciones según sus necesidades.

