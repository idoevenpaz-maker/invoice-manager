export function LoginScreen({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-5xl">🧾</div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-500 mb-1">מנהל חשבוניות</h1>
          <p className="text-sm text-gray-500">התחבר כדי לגשת לעסק שלך</p>
        </div>
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-4 h-4"
          />
          התחבר עם Google
        </button>
      </div>
    </div>
  )
}
