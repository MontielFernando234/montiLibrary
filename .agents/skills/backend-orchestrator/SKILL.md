---
name: backend-orchestrator
description: >
  Orquesta el desarrollo backend combinando lineamientos de arquitectura, diseño de APIs y mejores prácticas de Node.js y bases de datos.
  Se debe usar ante una nueva funcionalidad que implique crear, modificar o deprecar APIs, esquemas de BD u otras funcionalidades del backend, o cuando existan bugs de backend.
---

# Backend Orchestrator

## Visión General (Overview)

Esta skill actúa como un orquestador o Lead de Backend. Su objetivo es guiar las tareas de desarrollo backend integrando y aplicando las guías de arquitectura general, diseño de APIs, y mejores prácticas de Node.js y Supabase/PostgreSQL, asegurando que el sistema sea robusto, seguro, escalable y fácil de mantener.

## Cuándo usar esta Skill (When to Use)

- Ante el desarrollo de una **nueva funcionalidad** que requiera cambios en la lógica de negocio, endpoints o servicios back-end.
- Cuando haya que **crear, modificar o deprecar** APIs (por ejemplo, endpoints REST).
- Cuando se requiera realizar **actualizaciones en la base de datos** (modificar esquemas, tablas, optimizar consultas, realizar migraciones).
- Cuando existan **bugs** que deban ser corregidos y que impliquen esfuerzo por parte del equipo de backend.

## Instrucciones y Dependencias

Esta skill actúa como un meta-orquestador. Cuando se invoca esta skill, debes **obligatoriamente** apoyarte en las siguientes skills complementarias para tomar decisiones de diseño e implementación:

1. **`/backend-development`**: Úsala como la base para el diseño general de los sistemas, aplicando estrategias de seguridad (OWASP), buenas prácticas en APIs, testing y consideraciones de escalabilidad.
2. **`/nodejs-best-practices`**: Úsala para tomar decisiones arquitectónicas específicas del entorno Node.js, incluyendo patrones asíncronos correctos, manejo centralizado de errores, estructura de carpetas y selección de librerías.
3. **`/supabase-postgres-best-practices`**: Úsala estrictamente al interactuar con la base de datos, escribir o revisar consultas de Postgres, diseñar esquemas relacionales o configurar Supabase, para garantizar un rendimiento óptimo de los datos.

## Flujo de Trabajo del Orquestador (Workflow)

1. **Análisis y Requisitos**: Comprende a fondo la lógica de negocio requerida, los contratos de datos de la API (inputs/outputs) o la causa raíz del bug a resolver.
2. **Carga de Contexto**: Revisa internamente los principios definidos en `/backend-development`, `/nodejs-best-practices` y `/supabase-postgres-best-practices`.
3. **Planificación (Diseño y Arquitectura)**: 
   - Define el diseño de los nuevos endpoints o servicios.
   - Establece el esquema de la base de datos o las migraciones necesarias, analizando el impacto de las queries a realizar.
   - Planifica la modularización dentro de Node.js, garantizando una clara separación de responsabilidades (ej. controladores, capa de servicios, capa de acceso a datos).
4. **Ejecución (Implementación)**: Escribe el código según el plan, prestando especial atención a validaciones de seguridad, manejo de errores y consultas eficientes.
5. **Revisión de Calidad**: Verifica que la nueva funcionalidad esté cubierta por tests cuando sea posible, que las queries estén indexadas correctamente y que no existan fugas de memoria o vulnerabilidades.

## Mejores Prácticas (Best Practices)

- **Seguridad y Validación:** Valida exhaustivamente las entradas de la API y maneja correctamente la autenticación y autorización. No confíes ciegamente en los datos del cliente.
- **Eficiencia de la Base de Datos:** Previene problemas como "N+1 queries" desde la fase de diseño. Asegúrate de añadir los índices necesarios para las consultas frecuentes.
- **Gestión de Errores Asíncronos:** Utiliza correctamente `async/await` y bloques `try/catch` o un middleware global de errores para evitar `unhandled promise rejections` que puedan tirar el servidor Node.js.
- **Desacoplamiento:** Mantén la lógica de negocio independiente del framework web (Express, Fastify, etc.) en la medida de lo posible.
