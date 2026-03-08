
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CapsulesPage from "./pages/Capsules";
import TeamsPage from "./pages/Teams";
import SettingsPage from "./pages/Settings";
import AppLayout from "./components/layout/AppLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Simple auth check wrapper component could be added here
// For now, we rely on the client handling redirects or errors if token is missing.

function PrivateRoute({ children }: { children: JSX.Element }) {
    const token = localStorage.getItem("guidera_jwt");
    const expStr = localStorage.getItem("guidera_jwt_exp");

    let isValid = false;
    if (token && expStr) {
        const exp = parseInt(expStr, 10);
        const now = Math.floor(Date.now() / 1000);
        isValid = now < exp;
    }

    if (!isValid) {
        // Clear all auth-related storage to ensure a clean state
        localStorage.removeItem("guidera_jwt");
        localStorage.removeItem("guidera_jwt_exp");
        localStorage.removeItem("guidera_session_id");
        localStorage.removeItem("guidera_session_exp");
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                        <Route path="/" element={<CapsulesPage />} />
                        <Route path="/teams" element={<TeamsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
            <Toaster />
        </ThemeProvider>
    );
}

export default App;
