## Cambio en el Modelo de Base de Datos

### Se realizaron varias modificaciones en el esquema de la base de datos para mejorar la consistencia con los modelos y solucionar problemas relacionados con el uso de mayúsculas y la unicidad de ciertos campos. A continuación, se describen los cambios:

## 1. Tabla `users`:
**Cambio en el campo `accountNumber`:**

- **Antes:** El campo `accountNumber` era un campo regular de tipo `VARCHAR(20)`.
- **Ahora:** Se ha agregado la restricción `UNIQUE` al campo `accountNumber`, lo que garantiza que los valores en este campo sean únicos dentro de la tabla. Además, se ha mantenido la convención de usar minúsculas, ya que las bases de datos pueden crear problemas si se usan mayúsculas en los nombres de las columnas (esto genera diferencias de mayúsculas/minúsculas, especialmente en la interacción con ORMs como TypeORM).

**Resultado Final:** El campo `accountNumber` ahora es único y se utiliza en minúsculas en el esquema de la base de datos.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  "accountNumber" VARCHAR(20) UNIQUE
);
```

## 2. Tabla `orders`:
**Cambio en los campos `instrumentId` y `userId`:**

- **Antes:** Los campos `instrumentId` y `userId` eran definidos sin comillas dobles. Sin embargo, al crear tablas con un script, los nombres de las columnas son tratados de manera diferente (en minúsculas), lo que puede causar problemas al realizar búsquedas o referirse a esos campos, ya que TypeORM creaba las columnas con mayúsculas.
- **Ahora:** Se han agregado comillas dobles alrededor de `instrumentId` y `userId` para asegurar que los nombres de las columnas en la base de datos coincidan exactamente con los definidos en el modelo y evitar problemas con mayúsculas/minúsculas.

**Resultado Final:** Las columnas `instrumentId` y `userId` ahora tienen comillas dobles y se ajustan a los nombres tal como se definieron en los modelos.

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  "instrumentId" INT,
  "userId" INT,
  size INT,
  price NUMERIC(10, 2),
  type VARCHAR(10),
  side VARCHAR(10),
  status VARCHAR(20),
  datetime TIMESTAMP,
  FOREIGN KEY ("instrumentId") REFERENCES instruments(id),
  FOREIGN KEY ("userId") REFERENCES users(id)
);
```

## 3. Tabla `instruments`:
**Cambio en el campo `ticker`:**

- **Antes:** `ticker` era un campo regular sin restricciones de unicidad.
- **Ahora:** Se ha agregado la restricción `UNIQUE` al campo `ticker` para evitar la duplicación de valores en la tabla `instruments`. Esto asegura que cada instrumento tenga un identificador único.

**Resultado Final:** El campo `ticker` ahora es único.

```sql
CREATE TABLE instruments (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) UNIQUE,
  name VARCHAR(255),
  type VARCHAR(10)
);
```

## 4. Tabla `marketData`:
**Cambio en los campos `instrumentId` y `previousClose`:**

- **Antes:** Los nombres de los campos `instrumentId` y `previousClose` no tenían comillas dobles, lo que podía generar problemas con la forma en que se interactúa con la base de datos, especialmente si se usan mayúsculas en los modelos.
- **Ahora:** Se ha corregido el nombre de la tabla a `marketData` para cumplir con la convención de usar PascalCase y se ha agregado el uso de comillas dobles para los campos `instrumentId` y `previousClose`.

**Resultado Final:** Los campos `instrumentId` y `previousClose` ahora tienen comillas dobles, y la tabla ha sido renombrada para que coincida con las convenciones de nomenclatura.

```sql
CREATE TABLE "marketData" (
  id SERIAL PRIMARY KEY,
  "instrumentId" INT,
  high NUMERIC(10, 2),
  low NUMERIC(10, 2),
  open NUMERIC(10, 2),
  close NUMERIC(10, 2),
  "previousClose" NUMERIC(10, 2),
  date DATE,
  FOREIGN KEY ("instrumentId") REFERENCES instruments(id)
);
```

## Resumen de Cambios:
✅ `users.accountNumber`: Se ha agregado la restricción `UNIQUE` para garantizar que el número de cuenta sea único.

✅ `instruments.ticker`: Se ha agregado la restricción `UNIQUE` para evitar valores duplicados en la tabla de instrumentos.

✅ **Nombres de campos en mayúsculas:** Se han añadido comillas dobles (`"`) alrededor de los campos que contienen mayúsculas en su nombre (`instrumentId`, `userId`, `previousClose`) para asegurar que la base de datos respete la convención de nombres de las columnas y evitar problemas con el uso de ORMs como TypeORM.

✅ **Cambio de nombre en la tabla `marketData`**: Se ha renombrado la tabla para seguir las convenciones de nomenclatura adecuadas.

Con estas modificaciones, el esquema de la base de datos es más consistente y se ajusta a las convenciones de los modelos, lo que evita problemas con la búsqueda y las referencias entre tablas.

