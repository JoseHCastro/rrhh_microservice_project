# 5.2. Especificación Detallada de Casos de Uso (Modularizada)

Este documento contiene el desglose y la especificación técnica de los 32 casos de uso para el *Sistema de Gestión de RRHH y Asistencia*, estructurados bajo tablas estandarizadas de fácil lectura para agentes de desarrollo e Inteligencia Artificial.

---

### CU-01
| Caso de Uso | CU-01: Autenticar acceso local mediante sensor biométrico (Huella/FaceID) |
| :--- | :--- |
| **Propósito** | [cite_start]Validar la identidad física del portador del dispositivo de manera local para prevenir la suplantación física inicial[cite: 1314, 1731]. |
| **Descripción** | [cite_start]El sistema solicita acceso al hardware de autenticación del dispositivo móvil del empleado para desbloquear la interfaz de marcación[cite: 1315, 1732]. |
| **Actores** | [cite_start]Empleado[cite: 1316, 1733]. |
| **Actor iniciador** | [cite_start]Empleado[cite: 1316, 1733]. |
| **Precondición** | [cite_start]El empleado debe haber iniciado sesión previamente en la app móvil (React Native) y configurado la biometría nativa[cite: 1317, 1734]. |
| **Proceso** | 1. [cite_start]El empleado ingresa a la sección de marcación de asistencia[cite: 1318, 1735].<br>2. [cite_start]La app congela el acceso a la cámara y manda una instrucción a las APIs nativas del sistema operativo (iOS/Android)[cite: 1319, 1736].<br>3. [cite_start]El sistema operativo despliega su interfaz clásica de lectura biométrica[cite: 1320, 1737].<br>4. [cite_start]El empleado coloca su huella o escanea su rostro[cite: 1320, 1737].<br>5. [cite_start]El enclave seguro del teléfono procesa la muestra, la valida internamente y retorna un valor afirmativo (`true`)[cite: 1321, 1738].<br>6. [cite_start]La aplicación descongela el botón de captura de la selfie y la lectura de GPS[cite: 1322, 1739]. |
| **Post Condición** | [cite_start]Interfaz de marcación desbloqueada localmente[cite: 1323, 1740]. |
| **Excepciones** | **EX-01:** El sensor no reconoce la huella/FaceID tras los intentos permitidos por el sistema operativo. [cite_start]La app permanece bloqueada[cite: 1323, 1324, 1740, 1741].<br>**EX-02:** El hardware biométrico del teléfono está ausente o dañado. [cite_start]El caso de uso aborta indicando error de hardware[cite: 1324, 1325, 1741, 1742]. |

---

### CU-02
| Caso de Uso | CU-02: Validar ubicación por geocerca GPS |
| :--- | :--- |
| **Propósito** | [cite_start]Restringir el registro de asistencia únicamente a las zonas geográficas designadas como centros de trabajo[cite: 1328, 1744]. |
| **Descripción** | [cite_start]La aplicación móvil lee las coordenadas GPS del dispositivo y verifica mediante operaciones matemáticas si se encuentran dentro de la geocerca permitida[cite: 1329, 1745]. |
| **Actores** | [cite_start]Empleado, Bot de Automatización (Sistema / n8n)[cite: 1330, 1746]. |
| **Actor iniciador** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1331, 1747]. |
| **Precondición** | [cite_start]El CU-01 debe haber concluido de manera exitosa y los permisos de ubicación en el celular deben estar concedidos[cite: 1332, 1748]. |
| **Proceso** | 1. [cite_start]El sistema solicita la ubicación actual al hardware GPS del celular[cite: 1333, 1749].<br>2. [cite_start]La aplicación React Native captura las coordenadas de latitud y longitud[cite: 1334, 1750].<br>3. [cite_start]La app calcula el radio de distancia respecto a la coordenada del centro laboral guardada en la caché/memoria local[cite: 1335, 1751].<br>4. [cite_start]Si la distancia actual es menor o igual al radio de la geocerca configurada, se marca la ubicación como "Válida"[cite: 1336, 1752]. |
| **Post Condición** | [cite_start]Coordenadas GPS validadas y aprobadas para la marcación[cite: 1337, 1753]. |
| **Excepciones** | **EX-01:** El empleado tiene el GPS apagado o ha revocado los permisos. [cite_start]La app solicita activar el GPS[cite: 1338, 1754].<br>**EX-02:** Las coordenadas obtenidas están fuera del perímetro de la geocerca. [cite_start]Se bloquea el envío de la marcación y se despliega un mensaje de aviso[cite: 1339, 1340, 1755, 1756]. |

---

### CU-03
| Caso de Uso | CU-03: Validar prueba de vida (Liveness Anti-Spoofing en backend) |
| :--- | :--- |
| **Propósito** | [cite_start]Garantizar que la imagen capturada por la cámara corresponde a una persona real presente y no a una fotografía o pantalla[cite: 1343, 1758]. |
| **Descripción** | [cite_start]El microservicio de IA procesa la selfie usando una Red Neuronal Convolucional (CNN) entrenada para diferenciar imágenes biológicas de reproducciones artificiales[cite: 1344, 1759]. |
| **Actores** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1345, 1760]. |
| **Actor iniciador** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1346, 1761]. |
| **Precondición** | [cite_start]La captura de la selfie debe haber sido enviada exitosamente desde el frontend en React Native hacia el microservicio en FastAPI[cite: 1347, 1762]. |
| **Proceso** | 1. [cite_start]El backend en FastAPI recibe el archivo de imagen adjunto a la petición GraphQL/REST[cite: 1348, 1763].<br>2. [cite_start]Se invoca el modelo customizado CNN desarrollado en PyTorch/TensorFlow[cite: 1349, 1764].<br>3. [cite_start]El modelo analiza patrones de textura, profundidad y reflejos en la imagen[cite: 1349, 1764].<br>4. [cite_start]El algoritmo calcula el score de probabilidad de "Persona Viva"[cite: 1350, 1765].<br>5. [cite_start]Si el score supera el umbral de confianza mínimo, se valida positivamente la prueba de vida[cite: 1351, 1766]. |
| **Post Condición** | [cite_start]Score de Liveness aprobado, habilitando el siguiente filtro de reconocimiento de identidad[cite: 1352, 1767]. |
| **Excepciones** | **EX-01:** El score de confianza cae por debajo del umbral mínimo (Detección de foto impresa/pantalla). [cite_start]Se rechaza la solicitud de marcación inmediatamente por posible fraude[cite: 1353, 1354, 1768, 1769]. |

---

### CU-04
| Caso de Uso | CU-04: Verificar identidad mediante reconocimiento facial (Face Embeddings) |
| :--- | :--- |
| **Propósito** | [cite_start]Validar que el rostro de la persona que realiza la marcación pertenece auténticamente al empleado que ha iniciado sesión[cite: 1357, 1771]. |
| **Descripción** | [cite_start]Se extraen las características biométricas faciales de la foto del día y se contrastan vectorialmente contra el patrón de referencia del empleado registrado en PostgreSQL[cite: 1358, 1772]. |
| **Actores** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1359, 1773]. |
| **Actor iniciador** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1359, 1774]. |
| **Precondición** | [cite_start]La prueba de vida (CU-03) debió ser superada exitosamente[cite: 1360, 1774]. |
| **Proceso** | 1. [cite_start]El backend de FastAPI extrae los vectores matemáticos de la cara del empleado (Face Embeddings) mediante un modelo pre-entrenado[cite: 1361, 1775].<br>2. [cite_start]Se consulta en la base de datos PostgreSQL el Face Embedding base guardado al dar de alta al empleado[cite: 1362, 1776].<br>3. [cite_start]El microservicio calcula la distancia euclidiana o de coseno entre ambos vectores[cite: 1363, 1777].<br>4. [cite_start]Si la distancia es menor al límite de tolerancia de la distancia vectorial establecido, se confirma la correspondencia de identidades[cite: 1364, 1778]. |
| **Post Condición** | [cite_start]Identidad del empleado confirmada a nivel biométrico en el servidor[cite: 1365, 1779]. |
| **Excepciones** | **EX-01:** El rostro de la selfie no coincide con el registro base guardado en PostgreSQL. [cite_start]Se cancela la transacción de asistencia y se genera una alerta[cite: 1366, 1367, 1780, 1781]. |

---

### CU-05
| Caso de Uso | CU-05: Registrar marcación de asistencia (Entrada / Salida) |
| :--- | :--- |
| **Propósito** | [cite_start]Consolidar los datos de presencia física de los empleados para fines de cálculo de nómina y auditoría[cite: 1370, 1783]. |
| **Descripción** | [cite_start]Guarda de forma definitiva el registro completo de la marcación laboral (fecha, hora, coordenadas e indicadores de validaciones) en la base de datos NoSQL[cite: 1371, 1784]. |
| **Actores** | [cite_start]Empleado, Bot de Automatización (Sistema / n8n)[cite: 1372, 1785]. |
| **Actor iniciador** | [cite_start]Empleado[cite: 1372, 1785]. |
| **Precondición** | [cite_start]Se debieron completar con éxito las validaciones previas correspondientes a la biometría local (CU-01), GPS (CU-02), prueba de vida (CU-03) e identidad facial (CU-04)[cite: 1373, 1786]. |
| **Proceso** | 1. [cite_start]Tras recibir las confirmaciones de validez de los módulos anteriores, el backend de FastAPI estructura el documento de marcación[cite: 1374, 1787].<br>2. [cite_start]Se inserta un nuevo registro de alta velocidad en la tabla `Registro_Marcaciones` de Amazon DynamoDB/MongoDB[cite: 1375, 1788].<br>3. [cite_start]El registro incluye: ID del empleado, Timestamp preciso, coordenadas GPS verificadas, bandera de estado de la IA y el tipo de evento (Entrada o Salida)[cite: 1376, 1789].<br>4. [cite_start]Se envía una confirmación al dispositivo móvil del empleado[cite: 1377, 1790]. |
| **Post Condición** | [cite_start]Marcación persistida de manera permanente en el almacenamiento de Big Data[cite: 1378, 1791]. |
| **Excepciones** | **EX-01:** Error de conexión o indisponibilidad con la instancia de Amazon DynamoDB. [cite_start]La petición se encola localmente en un sistema de reintentos asíncronos[cite: 1379, 1380, 1792, 1793]. |

---

### CU-06
| Caso de Uso | CU-06: Detectar anomalías en patrones de asistencia con algoritmo K-Means |
| :--- | :--- |
| **Propósito** | [cite_start]Identificar de manera automatizada comportamientos inusuales, fraudes coordinados o desfases sistemáticos de horarios[cite: 1383, 1795]. |
| **Descripción** | [cite_start]Ejecuta un análisis no supervisado sobre el volumen histórico de marcaciones de DynamoDB para agrupar las rutinas usuales y aislar valores atípicos[cite: 1384, 1796]. |
| **Actores** | [cite_start]Bot de Automatización (Sistema / n8n), Director de RRHH[cite: 1385, 1797]. |
| **Actor iniciador** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1386, 1798]. |
| **Precondición** | [cite_start]Existencia de un volumen masivo y representativo de datos tabulados dentro de DynamoDB[cite: 1387, 1799]. |
| **Proceso** | 1. [cite_start]El microservicio de Python (FastAPI) extrae de forma periódica o programada el dataset inmenso de marcaciones[cite: 1388, 1800].<br>2. [cite_start]Se procesa la información en un DataFrame y se entrena/ejecuta el algoritmo de agrupamiento K-Means[cite: 1389, 1801].<br>3. [cite_start]El algoritmo clasifica las asistencias normales dentro de clústeres densos de comportamiento estándar[cite: 1390, 1802].<br>4. [cite_start]Aquellos registros puntuales con coordenadas o desfases horarios severos que no encajan en ningún grupo se marcan como "anomalías"[cite: 1391, 1803].<br>5. [cite_start]El sistema escribe la alerta detectada en la tabla de `Eventos_Sistema`[cite: 1392, 1804]. |
| **Post Condición** | [cite_start]Alertas de anomalías registradas y preparadas para su visualización en el frontend[cite: 1393, 1805]. |
| **Excepciones** | **EX-01:** Datos insuficientes en la base NoSQL para generar clústeres representativos. [cite_start]El algoritmo omite el procesamiento emitiendo una advertencia en los logs técnicos[cite: 1394, 1395, 1806, 1807]. |

---

### CU-07
| Caso de Uso | CU-07: Predecir probabilidad de ausentismo con algoritmo Random Forest |
| :--- | :--- |
| **Propósito** | [cite_start]Evaluar preventivamente el riesgo de que un colaborador no asista de manera injustificada a sus jornadas laborales del periodo en curso[cite: 1398, 1809]. |
| **Descripción** | [cite_start]Utiliza un modelo de clasificación supervisado para evaluar las métricas del empleado contra tendencias históricas y emitir un porcentaje predictivo[cite: 1399, 1810]. |
| **Actores** | [cite_start]Bot de Automatización (Sistema / n8n), Director de RRHH[cite: 1400, 1811]. |
| **Actor iniciador** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1401, 1812]. |
| **Precondición** | [cite_start]Disponibilidad de datos históricos del personal organizados de forma estructurada en PostgreSQL[cite: 1402, 1813]. |
| **Proceso** | 1. [cite_start]El módulo de IA consulta en PostgreSQL variables como distancia a la oficina, salarios, edad, historial de retrasos y evaluaciones de desempeño[cite: 1403, 1814].<br>2. [cite_start]Los datos son evaluados a través del modelo predictivo Random Forest cargado en FastAPI[cite: 1404, 1815].<br>3. [cite_start]El algoritmo genera como salida el porcentaje estimado de probabilidad de falta inminente en el mes[cite: 1405, 1816].<br>4. [cite_start]El valor resultante se actualiza en las tablas analíticas del Core de base de datos[cite: 1406, 1817]. |
| **Post Condición** | [cite_start]Probabilidad de ausentismo calculada y disponible para alertas preventivas en el dashboard administrativo[cite: 1407, 1818]. |
| **Excepciones** | **EX-01:** El expediente de un empleado carece de campos obligatorios históricos (por ejemplo, dirección de vivienda para calcular la distancia). [cite_start]Se interrumpe el cálculo individual de ese empleado[cite: 1408, 1409, 1819, 1820]. |

---

### CU-08
| Caso de Uso | CU-08: Predecir riesgo de rotación de personal con algoritmo Random Forest |
| :--- | :--- |
| **Propósito** | [cite_start]Alertar sobre la probabilidad latente de renuncia o abandono laboral de los empleados clave[cite: 1412, 1822]. |
| **Descripción** | [cite_start]Aplica inteligencia predictiva sobre los indicadores sociodemográficos y laborales consolidados para anticipar bajas de capital humano[cite: 1413, 1823]. |
| **Actores** | [cite_start]Bot de Automatización (Sistema / n8n), Director de RRHH[cite: 1414, 1824]. |
| **Actor iniciador** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1415, 1825]. |
| **Precondición** | [cite_start]Modelos supervisados de Random Forest entrenados previamente con datos históricos agregados[cite: 1416, 1826]. |
| **Proceso** | 1. [cite_start]El sistema extrae de forma automatizada las métricas salariales, de tiempo de servicio, volumen de horas extra acumuladas y retardos registrados de los colaboradores[cite: 1417, 1827].<br>2. [cite_start]Se ejecuta la inferencia en el modelo analítico de Machine Learning supervisado en FastAPI[cite: 1418, 1828].<br>3. [cite_start]El sistema identifica puntuaciones de riesgo críticas basadas en la combinación de descontento implícito (retrasos masivos, sobrecarga laboral o estancamiento de sueldo)[cite: 1419, 1829].<br>4. [cite_start]Los registros de riesgo severo se almacenan en la tabla `Eventos_Sistema`[cite: 1420, 1830]. |
| **Post Condición** | [cite_start]Índices de riesgo de deserción calculados de manera exitosa[cite: 1421, 1831]. |
| **Excepciones** | **EX-01:** Fallas imprevistas de memoria en el servidor al cargar matrices de datos extensas. [cite_start]El microservicio reinicia el contenedor de manera aislada[cite: 1422, 1832, 1833]. |

---

### CU-09
| Caso de Uso | CU-09: Registrar nuevo empleado |
| :--- | :--- |
| **Propósito** | [cite_start]Incorporar un nuevo colaborador al sistema, configurando sus credenciales de identificación iniciales y sus muestras faciales de referencia[cite: 1425, 1835]. |
| **Descripción** | [cite_start]El personal de RRHH captura la información personal del empleado y efectúa la toma controlada de la fotografía que servirá de Face Embedding base[cite: 1426, 1836]. |
| **Actores** | [cite_start]Director de RRHH, Bot de Automatización (Sistema / n8n)[cite: 1427, 1837]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1428, 1838]. |
| **Precondición** | [cite_start]El Director de RRHH debe estar autenticado en el Frontend Administrativo de Angular con los permisos adecuados[cite: 1428, 1838]. |
| **Proceso** | 1. [cite_start]Desde la interfaz de Angular, se completan los campos obligatorios del empleado (nombre, documento, departamento, cargo, sueldo inicial)[cite: 1429, 1839].<br>2. [cite_start]Se activa el dispositivo de cámara conectado para capturar una selfie base de alta resolución y con iluminación de frente[cite: 1430, 1840].<br>3. [cite_start]La imagen se remite de inmediato al microservicio FastAPI de Python[cite: 1431, 1841].<br>4. [cite_start]FastAPI procesa la toma mediante Deep Learning y extrae las métricas matemáticas estables (Face Embedding inicial)[cite: 1432, 1842].<br>5. [cite_start]Los metadatos personales y el vector numérico resultante se almacenan en PostgreSQL dentro de la tabla `Empleado`[cite: 1433, 1843]. |
| **Post Condición** | [cite_start]Empleado dado de alta correctamente y habilitado para transacciones de asistencia en campo[cite: 1434, 1844]. |
| **Excepciones** | **EX-01:** La fotografía capturada no cumple con los requisitos de visibilidad o el backend de IA no logra detectar un rostro claro. [cite_start]Se solicita repetir la toma[cite: 1435, 1436, 1845, 1846]. |

---

### CU-10
| Caso de Uso | CU-10: Modificar datos del empleado |
| :--- | :--- |
| **Propósito** | [cite_start]Mantener actualizada la información general y los datos de contacto o ubicación del trabajador en la base relacional[cite: 1438, 1848]. |
| **Descripción** | [cite_start]Modifica los registros existentes de un colaborador en PostgreSQL, permitiendo además actualizar su Face Embedding si se requiere[cite: 1439, 1849]. |
| **Actores** | [cite_start]Director de RRHH, Bot de Automatización (Sistema / n8n)[cite: 1440, 1850]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1441, 1851]. |
| **Precondición** | [cite_start]El empleado objetivo debe existir previamente registrado en la base de datos PostgreSQL[cite: 1441, 1851]. |
| **Proceso** | 1. [cite_start]El Director de RRHH busca al empleado por su identificador en el portal administrativo de Angular[cite: 1442, 1852].<br>2. [cite_start]Se cargan los valores editables en pantalla[cite: 1443, 1853].<br>3. [cite_start]Se modifican los campos deseados (dirección de casa, teléfono, etc.)[cite: 1443, 1853].<br>4. [cite_start]Al guardar, el backend transaccional de Spring Boot ejecuta una instrucción `UPDATE` aplicando las restricciones de integridad correspondientes[cite: 1444, 1854].<br>5. [cite_start]Si se modificó la fotografía oficial, se repite la llamada a FastAPI para actualizar el Face Embedding asociado[cite: 1445, 1855]. |
| **Post Condición** | [cite_start]Cambios del empleado aplicados con éxito en la persistencia relacional[cite: 1446, 1856]. |
| **Excepciones** | **EX-01:** Intento de duplicar un identificador único (documento de identidad) ya asignado a otra persona. [cite_start]El sistema rechaza los cambios arrojando un error de llave duplicada[cite: 1447, 1448, 1857, 1858]. |

---

### CU-11
| Caso de Uso | CU-11: Dar de baja a un empleado (Inactivación) |
| :--- | :--- |
| **Propósito** | [cite_start]Revocar de manera inmediata el acceso de un colaborador al sistema de marcación y portales empresariales preservando su histórico de datos[cite: 1451, 1860]. |
| **Descripción** | [cite_start]Realiza una baja lógica del empleado cambiando su estado a inactivo para cumplir con las reglas de integridad referencial[cite: 1452, 1861]. |
| **Actores** | [cite_start]Director de RRHH, Bot de Automatización (Sistema / n8n)[cite: 1453, 1862]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1454, 1863]. |
| **Precondición** | [cite_start]El empleado debe estar activo y no poseer planillas en estado "abierto" pendientes de cálculo inmediato[cite: 1454, 1863]. |
| **Proceso** | 1. [cite_start]El administrador de RRHH selecciona el perfil del empleado y ejecuta la opción de cese laboral[cite: 1455, 1864].<br>2. [cite_start]El sistema pide confirmar el motivo y la fecha efectiva de finalización[cite: 1456, 1865].<br>3. [cite_start]Spring Boot cambia el campo booleano `activo` a `false` en la tabla `Empleado`[cite: 1457, 1866].<br>4. [cite_start]Se deshabilitan de forma automática todas las credenciales de la app móvil y accesos a APIs GraphQL relacionados con ese ID de usuario[cite: 1458, 1867]. |
| **Post Condición** | [cite_start]Empleado marcado como inactivo, inhabilitado para marcar asistencias[cite: 1459, 1868]. |
| **Excepciones** | **EX-01:** Intento de eliminación física directa. [cite_start]El motor Postgres bloquea la acción debido a la existencia de registros históricos vinculados en contratos y marcaciones antiguas[cite: 1460, 1869]. |

---

### CU-12
| Caso de Uso | CU-12: Consultar expediente del empleado |
| :--- | :--- |
| **Propósito** | [cite_start]Visualizar toda la información consolidada, historial contractual, marcaciones y justificaciones médicas de un colaborador[cite: 1472, 1872]. |
| **Descripción** | [cite_start]Realiza consultas integradas a Postgres y DynamoDB para armar el perfil consolidado del empleado en la interfaz web[cite: 1464, 1873]. |
| **Actores** | [cite_start]Director de RRHH, Jefe de Área[cite: 1465, 1874]. |
| **Actor iniciador** | [cite_start]Director de RRHH o Jefe de Área[cite: 1465, 1874]. |
| **Precondición** | [cite_start]El actor debe poseer un rol con privilegios de lectura asignados sobre el departamento al que pertenece el empleado[cite: 1466, 1875]. |
| **Proceso** | 1. [cite_start]El usuario introduce el criterio de búsqueda en Angular[cite: 1467, 1876].<br>2. [cite_start]Se ejecuta una query combinada de GraphQL al backend[cite: 1468, 1877].<br>3. [cite_start]Spring Boot recupera la información relacional básica y contractual desde PostgreSQL[cite: 1468, 1877].<br>4. [cite_start]NestJS extrae los logs de accesos a archivos y FastAPI recupera el resumen de asistencias de DynamoDB[cite: 1469, 1878].<br>5. [cite_start]Angular unifica y despliega el expediente completo en pantalla de forma organizada[cite: 1470, 1879]. |
| **Post Condición** | [cite_start]Datos de expediente visualizados correctamente[cite: 1471, 1880]. |
| **Excepciones** | **EX-01:** El usuario intenta ingresar al ID de un empleado que pertenece a un departamento sobre el cual no posee privilegios de visualización. [cite_start]Se bloquea el acceso y se muestra una pantalla de denegación[cite: 1471, 1472, 1880, 1881]. |

---

### CU-13
| Caso de Uso | CU-13: Registrar contrato laboral |
| :--- | :--- |
| **Propósito** | [cite_start]Formalizar la vinculación jurídica y económica de un trabajador con la institución, asignando el salario base y vigencias laborales[cite: 1474, 1883]. |
| **Descripción** | [cite_start]Crea un nuevo registro de condiciones laborales en PostgreSQL y asocia el documento PDF firmado digitalmente[cite: 1475, 1884]. |
| **Actores** | [cite_start]Director de RRHH, Bot de Automatización (Sistema / n8n)[cite: 1476, 1885]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1476, 1885]. |
| **Precondición** | [cite_start]El empleado al que se le asignará el contrato debe encontrarse ya registrado en la base de datos[cite: 1477, 1886]. |
| **Proceso** | 1. [cite_start]Se completan los parámetros contractuales (Fecha inicio, Fecha fin, Salario, Tipo de Jornada) en la UI de Angular[cite: 1478, 1887].<br>2. [cite_start]Se adjunta el archivo original digitalizado del contrato firmado (formato PDF)[cite: 1479, 1888].<br>3. [cite_start]El archivo se envía a NestJS para su almacenamiento físico en Amazon S3[cite: 1480, 1889].<br>4. [cite_start]NestJS retorna el URL seguro y metadatos de almacenamiento[cite: 1481, 1890].<br>5. [cite_start]Spring Boot almacena en PostgreSQL el nuevo registro en la tabla `Contrato` incluyendo el URL referencial provisto[cite: 1481, 1890]. |
| **Post Condición** | [cite_start]Contrato laboral registrado e integrado con el repositorio seguro de archivos[cite: 1482, 1891]. |
| **Excepciones** | **EX-01:** El archivo adjunto supera el tamaño máximo permitido o el formato no es un PDF válido. [cite_start]Se interrumpe el registro[cite: 1483, 1892, 1893]. |

---

### CU-14
| Caso de Uso | CU-14: Modificar o renovar contrato laboral |
| :--- | :--- |
| **Propósito** | [cite_start]Actualizar adendas, incrementos salariales o extensiones de vigencia en los términos de empleo de un trabajador activo[cite: 1486, 1895]. |
| **Descripción** | [cite_start]Permite editar las condiciones de un contrato existente o registrar una nueva adenda contractual en la base de datos y en S3[cite: 1487, 1896]. |
| **Actores** | [cite_start]Director de RRHH, Bot de Automatización (Sistema / n8n)[cite: 1488, 1897]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1489, 1898]. |
| **Precondición** | [cite_start]Debe existir un contrato previo registrado para el empleado en cuestión[cite: 1489, 1898]. |
| **Proceso** | 1. [cite_start]El usuario de RRHH accede a la sección de contratos del empleado[cite: 1490, 1899].<br>2. [cite_start]Selecciona la opción de adenda o prórroga[cite: 1490, 1900].<br>3. [cite_start]Actualiza el salario mensual o la fecha de vencimiento[cite: 1491, 1900].<br>4. [cite_start]Se carga la adenda firmada en PDF, la cual se sube a Amazon S3 reemplazando o complementando el metadato del archivo anterior[cite: 1491, 1901].<br>5. [cite_start]Se actualiza el estado de la fila correspondiente en la tabla `Contrato` de PostgreSQL[cite: 1492, 1902]. |
| **Post Condición** | [cite_start]Condiciones contractuales renovadas y actualizada en la base relacional[cite: 1493, 1903]. |
| **Excepciones** | **EX-01:** La nueva fecha de finalización ingresada es menor que la fecha de inicio original. [cite_start]El sistema impide el guardado por inconsistencia cronológica[cite: 1494, 1495, 1904, 1905]. |

---

### CU-15
| Caso de Uso | CU-15: Gestionar estructura organizacional (CRUD Cargos y Departamentos) |
| :--- | :--- |
| **Propósito** | [cite_start]Administrar las dependencias internas, organigramas y plazas jerárquicas operacionales de la corporación[cite: 1498, 1907]. |
| **Descripción** | [cite_start]Permite dar de alta, modificar o listar los diferentes cargos laborales y los departamentos organizacionales que ordenan a la plantilla[cite: 1499, 1908]. |
| **Actores** | [cite_start]Director de RRHH[cite: 1500, 1909]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1500, 1909]. |
| **Precondición** | [cite_start]Autenticación administrativa del usuario con privilegios de gestión de estructura[cite: 1501, 1910]. |
| **Proceso** | 1. [cite_start]El Director de RRHH accede al catálogo de departamentos/cargos desde el menú de Angular[cite: 1502, 1911].<br>2. [cite_start]Puede pulsar "Crear", "Editar" o "Inactivar" un elemento[cite: 1503, 1912].<br>3. [cite_start]Se completan campos como Nombre del Departamento, Código contable o Salario máximo sugerido para el Cargo[cite: 1503, 1912].<br>4. [cite_start]Spring Boot efectúa las consultas GraphQL e impacta de inmediato las tablas `Cargo` y `Departamento` de PostgreSQL[cite: 1504, 1913]. |
| **Post Condición** | [cite_start]Estructura organizativa modificada y disponible en tiempo real para las asignaciones de personal[cite: 1505, 1914]. |
| **Excepciones** | **EX-01:** Intento de eliminar un departamento que aún posee empleados activos vinculados. [cite_start]PostgreSQL rechaza la eliminación debido a la restricción de clave foránea (Foreign Key)[cite: 1506, 1507, 1915, 1916]. |

---

### CU-16
| Caso de Uso | CU-16: Procesar y calcular horas trabajadas, retrasos y horas extra |
| :--- | :--- |
| **Propósito** | [cite_start]Cuantificar la jornada exacta acumulada por cada trabajador para alimentar el motor de cálculo financiero de sueldos[cite: 1510, 1918]. |
| **Descripción** | [cite_start]Aplica el motor de reglas lógicas del negocio sobre los registros de asistencia almacenados para consolidar los totales mensuales[cite: 1511, 1919]. |
| **Actores** | [cite_start]Bot de Automatización (Sistema / n8n), Director de RRHH[cite: 1512, 1920]. |
| **Actor iniciador** | [cite_start]Director de RRHH o proceso por lote automático de fondo[cite: 1513, 1921]. |
| **Precondición** | [cite_start]Deben existir marcaciones de asistencia (Entradas y Salidas) en DynamoDB para el rango de fechas analizado[cite: 1514, 1922]. |
| **Proceso** | 1. [cite_start]Spring Boot invoca un query GraphQL/REST para jalar las marcaciones del periodo desde la base NoSQL[cite: 1515, 1923].<br>2. [cite_start]El Motor de Reglas contrasta los timestamps de entrada/salida contra la jornada oficial definida en el contrato del empleado[cite: 1516, 1924].<br>3. [cite_start]Se calculan los minutos de retraso acumulados[cite: 1517, 1925].<br>4. [cite_start]Se determinan las horas extras válidas (aquellas posteriores al horario laboral que cuenten con aprobación)[cite: 1517, 1925].<br>5. [cite_start]Se consolida el neto de horas laboradas y se guarda en las tablas de pre-planilla de PostgreSQL[cite: 1518, 1926].|
| **Post Condición** | [cite_start]Totales de tiempo procesados y consolidados matemáticamente en la base de datos relacional[cite: 1519, 1927]. |
| **Excepciones** | [cite_start]**EX-01:** Se detecta una marcación de entrada sin su respectiva marcación de salida en el mismo día (Marcación huérfana)[cite: 1520, 1928]. [cite_start]El sistema marca el registro con estado de "Inconsistencia" y notifica a RRHH para corrección manual[cite: 1521, 1929]. |

---

### CU-17
| Caso de Uso | CU-17: Generar y cerrar planilla de sueldos mensual |
| :--- | :--- |
| **Propósito** | [cite_start]Efectuar el cierre contable oficial de haberes económicos de toda la empresa y consolidar los montos finales de nómina líquida a pagar[cite: 1524, 1931]. |
| **Descripción** | [cite_start]Consolida los sueldos base, bonos de horas extras y descuentos por retrasos del mes para asentar la planilla definitiva en PostgreSQL[cite: 1525, 1932]. |
| **Actores** | [cite_start]Director de RRHH, Bot de Automatización (Sistema / n8n)[cite: 1526, 1933]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1527, 1934]. |
| **Precondición** | [cite_start]El cálculo de horas extras y retrasos (CU-16) debió completarse sin inconsistencias para todo el personal[cite: 1527, 1934]. |
| **Proceso** | 1. [cite_start]El Director de RRHH revisa el preliminar financiero en Angular[cite: 1528, 1935].<br>2. [cite_start]Presiona el botón "Cerrar Planilla Mensual"[cite: 1528, 1936].<br>3. [cite_start]Spring Boot ejecuta el procedimiento almacenado que multiplica las horas extras por sus factores de recargo, descuenta las ausencias injustificadas y suma el sueldo contractual base[cite: 1529, 1936].<br>4. [cite_start]Se genera la tabla relacional final de pagos en `Planilla_Sueldo` de PostgreSQL[cite: 1530, 1937].<br>5. [cite_start]El estado del periodo cambia a "CERRADO" impidiendo modificaciones retroactivas ordinarias[cite: 1531, 1938]. |
| **Post Condición** | [cite_start]Nómina consolidada de forma oficial y bloqueada para cambios casuales[cite: 1532, 1939]. |
| **Excepciones** | [cite_start]**EX-01:** Modificaciones de última hora detectadas en el contrato de un empleado en pleno procesamiento[cite: 1533, 1940]. [cite_start]El sistema cancela el cierre de lote y solicita recalcular el perfil modificado[cite: 1534, 1941].|

---

### CU-18
| Caso de Uso | CU-18: Registrar sello criptográfico (Hash) de contratos en Blockchain |
| :--- | :--- |
| **Propósito** | [cite_start]Asegurar la inmutabilidad jurídica de los contratos de trabajo y dotar de transparencia al sistema frente a entes reguladores o auditorías[cite: 1537, 1943]. |
| **Descripción** | [cite_start]Genera un resumen matemático (SHA-256) del documento contractual en PDF y lo envía a un contrato inteligente en la red Blockchain[cite: 1538, 1944]. |
| **Actores** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1539, 1945]. |
| **Actor iniciador** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1539, 1946]. |
| **Precondición** | [cite_start]El contrato laboral en PDF debe encontrarse subido de manera íntegra en Amazon S3[cite: 1540, 1947]. |
| **Proceso** | 1. [cite_start]El backend de Spring Boot accede al archivo PDF del contrato almacenado en S3[cite: 1541, 1948].<br>2. [cite_start]Se calcula el Hash criptográfico único de los bytes del documento[cite: 1542, 1949].<br>3. [cite_start]Spring Boot abre una conexión con el nodo de la red Blockchain seleccionada (ej. Polygon/Hyperledger)[cite: 1543, 1950].<br>4. [cite_start]Se ejecuta el método de registro del Smart Contract enviando el ID del contrato y el Hash calculado[cite: 1544, 1951].<br>5. [cite_start]La transacción es minada e integrada en la Blockchain, guardando el hash de transacción en PostgreSQL[cite: 1545, 1952]. |
| **Post Condición** | [cite_start]Firma y sello digital del contrato persistidos de manera inalterable en Blockchain[cite: 1546, 1953]. |
| **Excepciones** | [cite_start]**EX-01:** Interrupción de conectividad con la red Blockchain o saldo insuficiente para cubrir el gas de la red pública[cite: 1547, 1954]. [cite_start]El sistema encola la solicitud y activa un mecanismo de reintento asíncrono[cite: 1548, 1955]. |

---

### CU-19
| Caso de Uso | CU-19: Registrar sello criptográfico (Hash) de planillas en Blockchain |
| :--- | :--- |
| **Propósito** | [cite_start]Evitar la manipulación histórica de montos financieros pagados a los empleados resguardando el reporte contable[cite: 1551, 1957]. |
| **Descripción** | [cite_start]Calcula el identificador digital único de la planilla final cerrada del mes y lo estampa en la Blockchain[cite: 1552, 1958]. |
| **Actores** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1553, 1959]. |
| **Actor iniciador** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1553, 1960]. |
| **Precondición** | [cite_start]La planilla mensual debió transicionar al estado "CERRADO" bajo la ejecución de CU-17[cite: 1554, 1961]. |
| **Proceso** | 1. [cite_start]El sistema exporta la información estructurada de la planilla cerrada en un formato inalterable (PDF/JSON estructurado)[cite: 1555, 1962].<br>2. [cite_start]El microservicio calcula el Hash criptográfico de dicho archivo completo[cite: 1556, 1963].<br>3. [cite_start]Se envía el Hash mediante Web3 al Smart Contract de auditoría implementado en el bloque descentralizado[cite: 1557, 1964].<br>4. [cite_start]Se confirma el sellado de tiempo de la transacción contable[cite: 1558, 1965]. |
| **Post Condición** | [cite_start]Hash criptográfico de la nómina almacenado de forma permanente fuera de los servidores internos de la empresa[cite: 1559, 1966]. |
| **Excepciones** | [cite_start]**EX-01:** El nodo Blockchain responde con un timeout de transacción[cite: 1560, 1967]. [cite_start]Se registra el error en los logs del sistema y se reintenta de forma automática en horario nocturno[cite: 1561, 1968]. |

---

### CU-20
| Caso de Uso | CU-20: Verificar integridad de documentos contra Blockchain |
| :--- | :--- |
| **Propósito** | [cite_start]Demostrar de forma matemática fehaciente que las planillas o contratos no han sufrido alteraciones maliciosas posteriores en PostgreSQL[cite: 1564, 1970]. |
| **Descripción** | [cite_start]Descarga el archivo de S3, recalcula su Hash actual y lo compara con el Hash inmutable almacenado en la red Blockchain[cite: 1565, 1971]. |
| **Actores** | [cite_start]Auditor Externo, Director de RRHH[cite: 1566, 1972]. |
| **Actor iniciador** | [cite_start]Auditor Externo o Director de RRHH[cite: 1566, 1973]. |
| **Precondición** | [cite_start]El documento a evaluar debe contar con un registro de Hash previo insertado en la Blockchain (CU-18/CU-19)[cite: 1567, 1974]. |
| **Proceso** | 1. [cite_start]El Auditor Externo accede a la pantalla de verificación desde el portal de auditoría en Angular[cite: 1568, 1975].<br>2. [cite_start]Selecciona un contrato o planilla específica[cite: 1569, 1976].<br>3. [cite_start]El sistema jala el documento desde Amazon S3 y genera su Hash actual en tiempo de ejecución[cite: 1569, 1976].<br>4. [cite_start]Se consulta al Smart Contract de la Blockchain el Hash original indexado a ese ID de documento[cite: 1570, 1977].<br>5. [cite_start]Si los hashes coinciden al 100%, la interfaz muestra un check verde de "Documento Íntegro"[cite: 1571, 1978]. |
| **Post Condición** | [cite_start]Estado de integridad validado y verificado científicamente[cite: 1572, 1979]. |
| **Excepciones** | [cite_start]**EX-01:** Los hashes no coinciden (Alguien editó montos o textos directamente en la BD de Postgres de forma posterior)[cite: 1573, 1980]. [cite_start]El sistema arroja una alerta roja de "DOCUMENTO ALTERADO / ADULTERADO"[cite: 1574, 1981]. |

---

### CU-21
| Caso de Uso | CU-21: Registrar grupos de usuarios y asignación de roles |
| :--- | :--- |
| **Propósito** | [cite_start]Segmentar y organizar a los usuarios administrativos del sistema de acuerdo con sus atribuciones y responsabilidades departamentales[cite: 1577, 1983]. |
| **Descripción** | [cite_start]Permite dar de alta grupos de usuarios (ej. "Jefes de Operaciones", "Analistas de RRHH") y asignar empleados a dichos roles jerárquicos[cite: 1578, 1984]. |
| **Actores** | [cite_start]Director de RRHH[cite: 1579, 1985]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1579, 1985]. |
| **Precondición** | [cite_start]Acceso concedido al módulo de seguridad del backend desarrollado en NestJS[cite: 1580, 1986]. |
| **Proceso** | 1. [cite_start]Desde el panel de administración, el usuario selecciona "Gestionar Roles"[cite: 1581, 1987].<br>2. [cite_start]Ingresa la denominación del nuevo grupo de seguridad[cite: 1581, 1987].<br>3. [cite_start]Busca empleados activos mediante la interfaz y los añade al listado del grupo[cite: 1582, 1988].<br>4. [cite_start]NestJS recibe los arrays correspondientes y efectúa el guardado asociativo en las tablas relacionales de control de la base de datos relacional[cite: 1583, 1989]. |
| **Post Condición** | [cite_start]Estructura de grupos de usuarios guardada de forma persistente[cite: 1584, 1990]. |
| **Excepciones** | **EX-01:** Intento de asignar un empleado inexistente a un rol de usuario. [cite_start]Se aborta la transacción relacional de inmediato[cite: 1585, 1991]. |

---

### CU-22
| Caso de Uso | CU-22: Configurar privilegios de acceso por rol |
| :--- | :--- |
| **Propósito** | [cite_start]Delimitar exactamente qué acciones GraphQL (queries/mutations) o pantallas específicas puede manipular cada grupo operativo[cite: 1588, 1993]. |
| **Descripción** | [cite_start]Vincula permisos granulares de lectura, escritura o descargas de S3 a los roles o grupos creados en el sistema[cite: 1589, 1994]. |
| **Actores** | [cite_start]Director de RRHH[cite: 1590, 1995]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1590, 1995]. |
| **Precondición** | [cite_start]Los grupos de usuarios deben estar previamente definidos en la tabla relacional (CU-21)[cite: 1591, 1996]. |
| **Proceso** | 1. [cite_start]El Director abre la matriz de permisos por rol en Angular[cite: 1592, 1997].<br>2. [cite_start]Selecciona un rol (ej: "Jefe de Área")[cite: 1592, 1997].<br>3. [cite_start]Marca o desmarca casillas de verificación de accesos (ej: "Aprobar Bajas Médicas: Sí", "Editar Salarios: No")[cite: 1593, 1998].<br>4. [cite_start]NestJS actualiza la tabla asociativa de control de privilegios en PostgreSQL de manera síncrona[cite: 1594, 1999]. |
| **Post Condición** | [cite_start]Matriz de permisos actualizada, alterando de inmediato las capacidades de los usuarios en su próximo inicio de sesión[cite: 1595, 2000]. |
| **Excepciones** | [cite_start]**EX-01:** Intento de revocar permisos críticos al rol de SuperAdministrador que dejaría al sistema sin gestor[cite: 1596, 2001]. [cite_start]El backend de NestJS rechaza la operación por regla dura de negocio[cite: 1597, 2002]. |

---

### CU-23
| Caso de Uso | CU-23: Subir archivos y documentos al repositorio seguro (Amazon S3) |
| :--- | :--- |
| **Propósito** | [cite_start]Almacenar de forma confiable, escalable y aislada objetos digitales de gran peso (PDFs de contratos, fotos de bajas médicas)[cite: 1600, 2004]. |
| **Descripción** | [cite_start]Transfiere el flujo binario de archivos hacia buckets seguros de Amazon S3, guardando la referencia de descarga en Postgres[cite: 1601, 2005]. |
| **Actores** | [cite_start]Empleado, Director de RRHH, Bot de Automatización (Sistema / n8n)[cite: 1602, 2006]. |
| **Actor iniciador** | [cite_start]Cualquiera de los actores habilitados de acuerdo con la pantalla correspondiente[cite: 1603, 2007]. |
| **Precondición** | [cite_start]Conectividad activa y credenciales vigentes de AWS IAM asignadas en el backend de NestJS[cite: 1604, 2008]. |
| **Proceso** | 1. [cite_start]El actor selecciona un archivo local desde la interfaz cliente (Angular o React Native)[cite: 1605, 2009].<br>2. [cite_start]El cliente remite el archivo binario mediante un canal multipart/GraphQL a NestJS[cite: 1606, 2010].<br>3. [cite_start]NestJS calcula un nombre único único (UUID) y transmite el objeto a la API de Amazon S3 usando el AWS SDK[cite: 1607, 2011].<br>4. [cite_start]Al confirmarse el éxito del almacenamiento, NestJS guarda la URL resultante en la tabla de metadatos de PostgreSQL[cite: 1608, 2012].|
| **Post Condición** | [cite_start]Objeto almacenado de forma segura en la infraestructura en la nube y referenciado en base de datos[cite: 1609, 2013]. |
| **Excepciones** | [cite_start]**EX-01:** Error en el enlace de red con los servidores de Amazon S3[cite: 1610, 2014]. [cite_start]Se cancela la operación y se despliega aviso de reintento al cliente[cite: 1611, 2015]. |

---

### CU-24
| Caso de Uso | CU-24: Descargar archivos y documentos desde el repositorio seguro (Amazon S3) |
| :--- | :--- |
| **Propósito** | [cite_start]Proveer acceso regulado y descarga controlada de documentos confidenciales únicamente al personal con los permisos correspondientes[cite: 1614, 2017]. |
| **Descripción** | [cite_start]Solicita a S3 la recuperación de un objeto usando URLs firmadas por un tiempo de vida corto para resguardo del documento[cite: 1615, 2018]. |
| **Actores** | [cite_start]Director de RRHH, Jefe de Área, Auditor Externo[cite: 1616, 2019]. |
| **Actor iniciador** | [cite_start]Cualquiera de los actores administrativos con permisos concedidos[cite: 1617, 2020]. |
| **Precondición** | [cite_start]El objeto consultado debe existir en S3 y estar mapeado correctamente en PostgreSQL[cite: 1618, 2021]. |
| **Proceso** | 1. [cite_start]El usuario presiona el icono de descarga de un archivo (ej. Certificado Médico) en Angular[cite: 1619, 2022].<br>2. [cite_start]NestJS recibe la solicitud GraphQL e interclasa el rol del usuario con la tabla de privilegios[cite: 1620, 2023].<br>3. [cite_start]Al verificarse el permiso, NestJS genera una URL firmada temporal con AWS S3 (expira en 15 minutos)[cite: 1621, 2024].<br>4. [cite_start]El frontend redirige o gatilla la descarga automática transparente del archivo usando dicha URL segura[cite: 1622, 2025]. |
| **Post Condición** | [cite_start]Descarga de archivo consumada de forma exitosa bajo protocolos de seguridad activa[cite: 1623, 2026]. |
| **Excepciones** | [cite_start]**EX-01:** El archivo fue removido físicamente de S3 por mantenimiento manual incorrecto, provocando un código 404 de AWS[cite: 1624, 2027]. [cite_start]Se notifica la inconsistencia de metadatos[cite: 1625, 2028]. |

---

### CU-25
| Caso de Uso | CU-25: Registrar bitácora de accesos y auditoría de archivos en DynamoDB |
| :--- | :--- |
| **Propósito** | [cite_start]Disponer de un rastro inmutable y masivo de auditoría técnica que detalle con precisión cada interacción con datos sensibles de la empresa[cite: 1628, 2030]. |
| **Descripción** | [cite_start]Registra de forma asíncrona un log estructurado detallando actor, acción, recurso e IP cada vez que se toca un archivo o permiso[cite: 1629, 2031]. |
| **Actores** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1630, 2032]. |
| **Actor iniciador** | [cite_start]Bot de Automatización (Sistema / n8n) (Mecanismo interceptor automático en NestJS)[cite: 1631, 2033]. |
| **Precondición** | [cite_start]El microservicio NestJS debe haber processed cualquier acción de lectura/escritura de archivos (CU-23/CU-24) o privilegios[cite: 1632, 2034]. |
| **Proceso** | 1. [cite_start]Un interceptor interno en NestJS captura en segundo plano el fin de una consulta GraphQL administrativa[cite: 1633, 2035].<br>2. [cite_start]Se estructura un documento JSON de auditoría con la información: ID de Usuario, Rol, Timestamp exacto, Acción ejecutada (ej. Descarga Contrato) y dirección IP del cliente[cite: 1634, 2036].<br>3. [cite_start]Se efectúa una escritura directa y sin bloqueos en la tabla masiva `Bitacora_Auditoria` en Amazon DynamoDB[cite: 1635, 2037].|
| **Post Condición** | [cite_start]Registro de auditoría salvaguardado de manera definitiva en el clúster NoSQL[cite: 1636, 2038]. |
| **Excepciones** | [cite_start]**EX-01:** Ninguna considerada con impacto crítico al cliente por tratarse de una tarea ejecutada enteramente en segundo plano[cite: 1637, 2039]. |

---

### CU-26
| Caso de Uso | CU-26: Capturar mensaje y certificado médico vía Bot (Trigger Telegram/WhatsApp) |
| :--- | :--- |
| **Propósito** | [cite_start]Proveer un medio de comunicación de contingencia accesible las 24 horas para reportar ausencias por motivos de salud[cite: 1640, 2041]. |
| **Descripción** | [cite_start]Recibe el mensaje inicial del empleado y la imagen del certificado adjunto utilizando las interfaces de mensajería comercial externas[cite: 1641, 2042]. |
| **Actores** | [cite_start]Empleado, Bot de Automatización (Sistema / n8n)[cite: 1642, 2043]. |
| **Actor iniciador** | [cite_start]Empleado[cite: 1642, 2043]. |
| **Precondición** | [cite_start]El empleado debe enviar la comunicación desde el número de teléfono o cuenta de Telegram enlazada previamente a su ficha corporativa[cite: 1643, 2044]. |
| **Proceso** | 1. [cite_start]El empleado amanece imposibilitado de asistir y envía un mensaje al bot corporativo adjuntando foto del certificado médico[cite: 1644, 2045].<br>2. [cite_start]La API externa (Telegram/WhatsApp) dispara un Webhook dirigido a la plataforma de automatización de n8n[cite: 1645, 2046].<br>3. [cite_start]El motor de n8n actúa como Trigger capturando el stream del texto del mensaje y descargando temporalmente el archivo binario de la foto de los servidores de chat[cite: 1646, 2047].|
| **Post Condición** | [cite_start]Mensaje y archivo binario capturados de forma íntegra por el bus de automatización empresarial[cite: 1647, 2048]. |
| **Excepciones** | [cite_start]**EX-01:** El archivo recibido es un mensaje de voz o sticker inválido[cite: 1648, 2049]. [cite_start]El bot responde con un mensaje preconfigurado solicitando de forma explícita una imagen clara[cite: 1649, 2050]. |

---

### CU-27
| Caso de Uso | CU-27: Procesar certificado médico mediante análisis OCR en el bot |
| :--- | :--- |
| **Propósito** | [cite_start]Automatizar la extracción de texto del certificado digitalizado para validar la autenticidad del justificante y pre-llenar los registros[cite: 1652, 2052]. |
| **Descripción** | [cite_start]El flujo de n8n envía la imagen al backend de IA en Python para realizar reconocimiento óptico de caracteres (OCR) sobre el documento médico[cite: 1653, 2053]. |
| **Actores** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1654, 2054]. |
| **Actor iniciador** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1655, 2055]. |
| **Precondición** | [cite_start]La imagen del certificado debe haber sido capturada con éxito en el paso previo (CU-26)[cite: 1656, 2056]. |
| **Proceso** | 1. [cite_start]El flujo n8n emite una petición POST enviando la imagen descargada hacia el microservicio en FastAPI[cite: 1657, 2057].<br>2. [cite_start]FastAPI procesa la imagen con librerías OCR de Python[cite: 1658, 2058].<br>3. [cite_start]Se extraen palabras clave del bloque de texto recuperado (ej: "Certificado Médico", "Reposo", "Días de baja", nombre del médico)[cite: 1658, 2058].<br>4. [cite_start]FastAPI valida estructuralmente si el documento cumple los patrones de un justificante legítimo e informa el texto limpio a n8n[cite: 1659, 2059]. |
| **Post Condición** | [cite_start]Datos textuales del certificado médico extraídos de manera digital[cite: 1660, 2060]. |
| **Excepciones** | [cite_start]**EX-01:** La imagen está extremadamente borrosa o pixelada, haciendo imposible la lectura del texto por OCR [cite: 1661, 2061][cite_start]. n8n instruye al bot para que le pida una nueva foto al empleado[cite: 1662, 2062]. |

---

### CU-28
| Caso de Uso | CU-28: Notificar solicitud de justificación por correo electrónico al Jefe de Área |
| :--- | :--- |
| **Propósito** | [cite_start]Agilizar el canal de revisión mandando los datos de la baja directo al correo del responsable del equipo para su pronta resolución[cite: 1665, 2064]. |
| [cite_start]**Descripción** | n8n unifica la información del empleado y las URLs de S3, enviando un correo con botones interactivos de decisión de forma automatizada[cite: 1666, 2065]. |
| **Actores** | [cite_start]Bot de Automatización (Sistema / n8n), Jefe de Área[cite: 1667, 2066]. |
| **Actor iniciador** | [cite_start]Bot de Automatización (Sistema / n8n)[cite: 1668, 2067]. |
| **Precondición** | [cite_start]Los datos del certificado médico debieron almacenarse en S3 y Postgres mediante las llamadas de n8n a NestJS[cite: 1669, 2068]. |
| **Proceso** | 1. [cite_start]El nodo final del flujo de n8n compone un correo electrónico dinámico en HTML utilizando la Gmail API[cite: 1670, 2069].<br>2. [cite_start]El cuerpo del correo detalla: "El empleado X solicita justificación médica para la fecha Y"[cite: 1671, 2070].<br>3. [cite_start]Se añade un hipervínculo seguro que apunta directamente a la visualización del archivo PDF/Foto guardado en S3[cite: 1672, 2071].<br>4. [cite_start]Se despacha el mensaje hacia la casilla de correo del Jefe de Área asignado[cite: 1673, 2072].|
| **Post Condición** | [cite_start]Correo electrónico de notificación enviado y depositado en la bandeja del aprobador[cite: 1674, 2073]. |
| **Excepciones** | [cite_start]**EX-01:** La API de Gmail reporta un fallo de cuotas o el correo del Jefe de Área está mal configurado en Postgres[cite: 1675, 2074]. [cite_start]Se genera un log crítico en el panel de control de n8n[cite: 1676, 2075]. |

---

### CU-29
| Caso de Uso | CU-29: Aprobar o rechazar solicitud de justificación médica |
| :--- | :--- |
| **Propósito** | [cite_start]Aplicar el juicio administrativo definitivo sobre la solicitud de baja médica enviada por el empleado en contingencia[cite: 1679, 2077]. |
| **Descripción** | [cite_start]El Jefe de Área evalúa los anexos cargados y asienta su voto en el sistema cambiando el estado de la solicitud en PostgreSQL[cite: 1680, 2078]. |
| **Actores** | [cite_start]Jefe de Área[cite: 1681, 2079]. |
| **Actor iniciador** | [cite_start]Jefe de Área[cite: 1681, 2079]. |
| **Precondición** | [cite_start]Debe existir una solicitud en estado "Pendiente" previamente creada en la base relacional[cite: 1682, 2080]. |
| **Proceso** | 1. [cite_start]El Jefe de Área hace clic en el enlace provisto o ingresa al portal administrativo de Angular[cite: 1683, 2081].<br>2. [cite_start]Visualiza el justificante médico descargado desde Amazon S3[cite: 1684, 2082].<br>3. [cite_start]Selecciona la opción "Aprobar" o "Rechazar" agregando un comentario de retroalimentación opcional[cite: 1684, 2082].<br>4. [cite_start]El frontend dispara la mutación GraphQL respectiva a Spring Boot[cite: 1685, 2083].<br>5. [cite_start]Spring Boot actualiza la solicitud en la base PostgreSQL y, si es aprobada, marca los días del periodo como justificados para mitigar los descuentos en el cálculo del CU-16[cite: 1686, 2084]. |
| **Post Condición** | [cite_start]Solicitud resuelta definitivamente; se dispara una notificación push automática informando la resolución al celular del empleado[cite: 1687, 2085]. |
| **Excepciones** | [cite_start]**EX-01:** El Jefe intenta resolver una solicitud que ya fue modificada o aprobada por RRHH previamente[cite: 1688, 2086]. [cite_start]El sistema informa el estado actual e impide la doble votación[cite: 1689, 2087]. |

---

### CU-30
| Caso de Uso | CU-30: Visualizar gráfico de líneas de la Tasa de Ausentismo (KPI) |
| :--- | :--- |
| **Propósito** | [cite_start]Analizar el comportamiento evolutivo del ausentismo corporativo a lo largo de los meses para identificar patrones estacionales[cite: 1692, 2089]. |
| **Descripción** | [cite_start]El frontend de Angular renderiza un gráfico de líneas dinámico alimentado con la métrica procesada en el backend de Python[cite: 1693, 2090]. |
| **Actores** | [cite_start]Director de RRHH[cite: 1694, 2091]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1694, 2091]. |
| **Precondición** | [cite_start]El microservicio analítico en FastAPI debe haber calculado las fórmulas integradas utilizando Pandas sobre los sets de datos[cite: 1695, 2092]. |
| **Proceso** | 1. [cite_start]El Director accede al panel de Business Intelligence en Angular[cite: 1696, 2093].<br>2. [cite_start]El frontend ejecuta un query solicitando el KPI basado en la fórmula matemática especificada: $$\text{Tasa de Ausentismo} = \left(\frac{\text{Total Días Ausentes}}{\text{Total Días Laborables de toda la plantilla}}\right) \times 100$$[cite: 1697, 2094].<br>3. [cite_start]El componente de Angular toma el JSON limpio provisto por FastAPI[cite: 1698, 2095].<br>4. [cite_start]Se dibuja un gráfico interactivo utilizando librerías de visualización (Chart.js / D3.js)[cite: 1699, 2096]. |
| **Post Condición** | [cite_start]Gráfico analítico de líneas desplegado con éxito en el dashboard[cite: 1700, 2097]. |
| **Excepciones** | [cite_start]**EX-01:** El servidor de Python devuelve valores nulos debido a la falta de registros laborables cargados en el periodo inicial del sistema[cite: 2098]. [cite_start]El componente muestra un estado de "Gráfico sin datos"[cite: 1702, 2099]. |

---

### CU-31
| Caso de Uso | CU-31: Visualizar gráfico de barras del Índice de Puntualidad (KPI) |
| :--- | :--- |
| **Propósito** | [cite_start]Evaluar de forma agregada el nivel de puntualidad y compromiso horario de los equipos o sucursales[cite: 1705, 2011]. |
| **Descripción** | [cite_start]Despliega barras comparativas que ilustrun el volumen de registros a tiempo versus retrasos por departamentos en la interfaz directiva[cite: 1706, 2102]. |
| **Actores** | [cite_start]Director de RRHH[cite: 1707, 2103]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1707, 2103]. |
| **Precondición** | [cite_start]Conectividad establecida con el API de Business Intelligence de la solución[cite: 1708, 2104]. |
| **Proceso** | 1. [cite_start]Se selecciona la pestaña de métricas de puntualidad en el dashboard[cite: 1709, 2105].<br>2. [cite_start]Se consulta la métrica resuelta bajo la fórmula analítica estructural: $$\text{Índice de Puntualidad} = \left(\frac{\text{Marcaciones a Tiempo}}{\text{Total de Marcaciones}}\right) \times 100$$[cite: 1710, 2106].<br>3. [cite_start]El backend de Python (FastAPI + Pandas) responde en milisegundos entregando el consolidado de datos[cite: 1711, 2107].<br>4. [cite_start]Angular dibuja el gráfico interactivo de barras permitiendo filtrar los datos por fecha o departamento[cite: 1712, 2108]. |
| **Post Condición** | [cite_start]Gráfico analítico de barras desplegado correctamente en pantalla[cite: 1713, 2108]. |
| **Excepciones** | [cite_start]Ninguna de impacto directo considerada[cite: 1713, 2109]. |

---

### CU-32
| Caso de Uso | CU-32: Visualizar gráfico de dona del Gasto en Horas Extras vs Presupuesto (KPI) |
| :--- | :--- |
| **Propósito** | [cite_start]Monitorear el impacto financiero real causado por el pago de horas extras frente al presupuesto tope asignado a la gerencia[cite: 1716, 2111]. |
| **Descripción** | [cite_start]Renderiza una gráfica circular de tipo dona indicando el porcentaje de presupuesto consumido y remanente para control de costos financieros[cite: 1717, 2112]. |
| **Actores** | [cite_start]Director de RRHH[cite: 1718, 2113]. |
| **Actor iniciador** | [cite_start]Director de RRHH[cite: 1718, 2113]. |
| **Precondición** | [cite_start]Los montos presupuestarios anuales deben haberse introducido previamente en la configuración financiera del Core relacional[cite: 1719, 2114]. |
| **Proceso** | 1. [cite_start]El usuario navega al módulo de costos de RRHH en la plataforma[cite: 1720, 2115].<br>2. [cite_start]El sistema recupera el Costo Total de Horas Extra Mensual (derivado de las planillas del CU-17) y lo divide sobre el Presupuesto Asignado de HR[cite: 1721, 2116].<br>3. [cite_start]Se calcula de forma dinámica el porcentaje operativo mediante la fórmula establecida: $$\text{KPI Dona} = \left(\frac{\text{Costo Total Horas Extra Mensual}}{\text{Presupuesto Asignado HR}}\right) \times 100$$[cite: 1722, 2117].<br>4. [cite_start]Se genera el renderizado de la dona de control en Angular mediante librerías gráficas[cite: 1723, 2118]. |
| **Post Condición** | [cite_start]Indicador circular financiero desplegado con éxito para toma de decisiones corporativas[cite: 1724, 2119]. |
| **Excepciones** | [cite_start]**EX-01:** El presupuesto configurado en base de datos es igual a cero (0), lo que generaría un error de división por cero en el servidor[cite: 1725, 2120]. [cite_start]El backend intercepta la condición y devuelve un valor de consumo de 100% de forma controlada para evitar caídas del pod[cite: 1726, 2121]. |