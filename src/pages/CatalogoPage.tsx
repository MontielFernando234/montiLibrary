/** CatalogoPage — Placeholder for catalog (to be implemented in catalog stories) */
export default function CatalogoPage(): React.JSX.Element {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-surface-100 mb-2">Catálogo de Libros</h1>
      <p className="text-surface-400 text-sm">
        Esta sección se implementará en las historias del catálogo (US-04 a US-07).
      </p>

      <div className="glass-card p-12 mt-6 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-semibold text-surface-200 mb-2">
          Próximamente
        </h2>
        <p className="text-surface-400 text-sm max-w-md mx-auto">
          El catálogo de libros con búsqueda, paginación y detalle será implementado
          en la siguiente fase del desarrollo.
        </p>
      </div>
    </div>
  );
}
