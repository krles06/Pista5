import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/useAuth';

// Layouts and Auth
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

// Auth Pages
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import ProfilePage from '@/features/auth/ProfilePage';

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

// Calendario
import CalendarioPage from '@/features/calendario/CalendarioPage';

// Dashboard
import DashboardPage from '@/features/dashboard/DashboardPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/recuperar-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout><Outlet /></AppLayout>}>
              <Route path="/" element={<DashboardPage />} />
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
              <Route path="/partidos/:id/editar" element={<PartidoForm />} />

              {/* Calendario Routes */}
              <Route path="/calendario" element={<CalendarioPage />} />
              <Route path="/calendario/:id_temporada" element={<CalendarioPage />} />

              {/* Fallback internal */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>

          {/* Fallback global */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster richColors position="top-right" theme="dark" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
// Trigger redeploy
