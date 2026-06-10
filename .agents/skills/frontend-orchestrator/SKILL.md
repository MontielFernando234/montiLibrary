---
name: frontend-orchestrator
description: >
  Orquesta el desarrollo frontend combinando lineamientos arquitectónicos y mejores prácticas.
  Se debe usar ante una nueva funcionalidad que implique crear, modificar, deprecar funcionalidades/componentes/elementos de la UI, o cuando existan bugs de frontend.
---

# Frontend Orchestrator

## Visión General (Overview)

Esta skill actúa como un orquestador o Lead de Frontend. Su objetivo es guiar las tareas de desarrollo frontend integrando y aplicando las guías de arquitectura y las mejores prácticas de React/Next.js para asegurar que el código de la UI sea de alta calidad, consistente y con un rendimiento óptimo.

## Cuándo usar esta Skill (When to Use)

- Ante el desarrollo de una **nueva funcionalidad** que requiera cambios en la interfaz.
- Cuando haya que **crear, modificar o deprecar** funcionalidades, componentes o elementos de la UI del sistema.
- Cuando existan **bugs** que deban ser corregidos y que impliquen esfuerzo por parte del equipo de frontend.

## Instrucciones y Dependencias

Esta skill actúa como un meta-orquestador. Cuando se invoca esta skill, debes **obligatoriamente** apoyarte en las siguientes skills para tomar decisiones de implementación:

1. **`/frontend-dev-guidelines`**: Debes usarla para aplicar estándares estrictos de arquitectura y rendimiento al momento de crear componentes o páginas, añadir nuevas funcionalidades, o realizar fetch/mutación de datos.
2. **`/vercel-react-best-practices`**: Debes usarla para garantizar que el código de React/Next.js esté optimizado siguiendo los patrones y lineamientos de ingeniería de Vercel (ej. server components vs client components, bundle optimization, data fetching).

## Flujo de Trabajo del Orquestador (Workflow)

1. **Análisis y Requisitos**: Entiende a fondo la funcionalidad a crear, el componente a deprecar, o el bug a resolver.
2. **Carga de Contexto**: Asegúrate de revisar y tener en mente los principios definidos en `/frontend-dev-guidelines` y `/vercel-react-best-practices`.
3. **Planificación (Diseño y Arquitectura)**: 
   - Define qué componentes serán Server Components y cuáles Client Components.
   - Establece la estrategia de estado y el fetching de datos.
   - Planifica la estructura de carpetas y modularización necesaria.
4. **Ejecución (Implementación)**: Escribe el código siguiendo el plan y asegurándote de no violar ninguna regla de las guías mencionadas.
5. **Revisión de Calidad**: Verifica que los cambios no introduzcan regresiones de performance y mantengan la coherencia visual y arquitectónica del sistema.

## Mejores Prácticas (Best Practices)

- **Consistencia:** Mantén la cohesión con el código existente que ya siga estas directrices.
- **Performance First:** Piensa en el rendimiento (LCP, CLS, FID) desde el diseño del componente, usando el conocimiento de Vercel/React.
- **Mantenibilidad:** Escribe componentes pequeños, testeables y con una única responsabilidad.
