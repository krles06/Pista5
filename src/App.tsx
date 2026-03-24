import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

// Layouts and Auth
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { OnboardingModal } from '@/components/shared/OnboardingModal';

// Auth Pages
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import ProfilePage from '@/features/auth/ProfilePage';
import VerificacionEmailPage from '@/features/auth/VerificacionEmailPage';
import ActualizarPasswordPage from '@/features/auth/ActualizarPasswordPage';

// Temporadas Pages
import TemporadasPage from '@/features/temporadas/TemporadasPage';
import TemporadaForm from '@/features/temporadas/TemporadaForm';
import TemporadaDetailPage from '@/features/temporadas/TemporadaDetailPage';

// Planificacion Pages
import PlanificacionPage from '@/features/planificacion/PlanificacionPage';

// Ejercicios Pages
import EjerciciosPage from '@/features/ejercicios/EjerciciosPage';
import EjercicioForm from '@/features/ejercicios/EjercicioForm';
import EjercicioDetailPage from '@/features/ejercicios/EjercicioDetailPage';

// Sesiones Pages
import SesionesPage from '@/features/sesiones/SesionesPage';
import SesionForm from '@/features/sesiones/SesionForm';
import SesionDetailPage from '@/features/sesiones/SesionDetailPage';

// Jugadores Pages
import JugadoresPage from '@/features/jugadores/JugadoresPage';
import JugadorForm from '@/features/jugadores/JugadorForm';
import JugadorDetailPage from '@/features/jugadores/JugadorDetailPage';

// Partidos Pages
import PartidosPage from '@/features/partidos/PartidosPage';
import PartidoForm from '@/features/partidos/PartidoForm';
import PartidoDetailPage from '@/features/partidos/PartidoDetailPage';

// Calendario
import CalendarioPage from '@/features/calendario/CalendarioPage';

// Dashboard
import DashboardPage from '@/features/dashboard/DashboardPage';

// Static Pages
import ContactoPage from '@/features/contacto/ContactoPage';
import TerminosPage from '@/features/terminos/TerminosPage';
import PrivacidadPage from '@/features/privacidad/PrivacidadPage';
import LandingPage from '@/features/landing/LandingPage';
import NotFoundPage from '@/features/errors/NotFoundPage';

// Landing route: shows landing if not logged in, dashboard if logged in
function HomeRoute() {
  const { session, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
    </div>
  );
  return session ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<HomeRoute />} />

            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
            <Route path="/verificar-email" element={<VerificacionEmailPage />} />
            <Route path="/actualizar-password" element={<ActualizarPasswordPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/terminos" element={<TerminosPage />} />
            <Route path="/privacidad" element={<PrivacidadPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout><Outlet /></AppLayout>}>
                <Route path="/dashboard" element={<><DashboardPage /><OnboardingModal /></>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/perfil" element={<ProfilePage />} />

                {/* Temporadas Routes */}
                <Route path="/temporadas" element={<TemporadasPage />} />
                <Route path="/temporadas/nueva" element={<TemporadaForm />} />
                <Route path="/temporadas/:id" element={<TemporadaDetailPage />} />
                <Route path="/temporadas/:id/editar" element={<TemporadaForm />} />

                {/* Ejercicios Routes */}
                <Route path="/ejercicios" element={<EjerciciosPage esPorteros={false} />} />
                <Route path="/ejercicios/nuevo" element={<EjercicioForm esPorteros={false} />} />
                <Route path="/ejercicios/:id" element={<EjercicioDetailPage />} />
                <Route path="/ejercicios/:id/editar" element={<EjercicioForm esPorteros={false} />} />

                {/* Porteros Routes */}
                <Route path="/porteros" element={<EjerciciosPage esPorteros={true} />} />
                <Route path="/porteros/nuevo" element={<EjercicioForm esPorteros={true} />} />
                <Route path="/porteros/:id" element={<EjercicioDetailPage />} />
                <Route path="/porteros/:id/editar" element={<EjercicioForm esPorteros={true} />} />

                {/* Planificación & Sesiones Routes */}
                <Route path="/planificacion/:id_temp" element={<PlanificacionPage />} />
                <Route path="/sesiones/:id_microciclo" element={<SesionesPage />} />
                <Route path="/sesiones/nueva" element={<SesionForm />} />
                <Route path="/sesiones/:id/ver" element={<SesionDetailPage />} />
                <Route path="/sesiones/:id/editar" element={<SesionForm />} />

                {/* Jugadores Routes */}
                <Route path="/jugadores" element={<JugadoresPage />} />
                <Route path="/temporadas/:id_temporada/jugadores" element={<JugadoresPage />} />
                <Route path="/jugadores/nuevo" element={<JugadorForm />} />
                <Route path="/jugadores/:id" element={<JugadorDetailPage />} />
                <Route path="/jugadores/:id/editar" element={<JugadorForm />} />

                {/* Partidos Routes */}
                <Route path="/partidos" element={<PartidosPage />} />
                <Route path="/partidos/nuevo" element={<PartidoForm />} />
                <Route path="/partidos/:id" element={<PartidoDetailPage />} />
                <Route path="/partidos/:id/editar" element={<PartidoForm />} />

                {/* Calendario Routes */}
                <Route path="/calendario" element={<CalendarioPage />} />
                <Route path="/calendario/:id_temporada" element={<CalendarioPage />} />

              </Route>
            </Route>

            {/* 404 — must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster richColors position="top-right" theme="dark" />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
