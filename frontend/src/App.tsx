import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FamilyTreeListPage } from './pages/FamilyTreeListPage';
import { FamilyTreeDetailPage } from './pages/FamilyTreeDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes - redirect to /family-trees if logged in */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected routes - redirect to /login if not logged in */}
            <Route element={<ProtectedRoute />}>
              <Route path="/family-trees" element={<FamilyTreeListPage />} />
              <Route path="/family-trees/:id" element={<FamilyTreeDetailPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/family-trees" replace />} />
            <Route path="*" element={<Navigate to="/family-trees" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
