/**
 * Email Verification Error Page
 */

export default function EmailErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Error de Verificación
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hubo un problema al verificar tu email. El enlace puede haber expirado o ser inválido.
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => window.close()}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
