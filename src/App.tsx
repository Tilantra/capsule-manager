
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CapsulesPage from "./pages/Capsules";
import TeamsPage from "./pages/Teams";
import SettingsPage from "./pages/Settings";
import BillingPage from "./pages/Billing";
import CreateCapsule from "./pages/CreateCapsule";
import LandingPage from "./pages/Landing";
import Register from "./pages/Register";
import WhatsNext from "./pages/WhatsNext";
import DocsOverview from "./pages/docs/Overview";
import GettingStarted from "./pages/docs/GettingStarted";
import UseCases from "./pages/docs/UseCases";
import Features from "./pages/docs/Features";
import MCPIntegration from "./pages/docs/MCP";
import Plans from "./pages/docs/Plans";
import Platforms from "./pages/docs/Platforms";
import Privacy from "./pages/docs/Privacy";
import AppLayout from "./components/layout/AppLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Simple auth check wrapper component
function PrivateRoute({ children }: { children: JSX.Element }) {
    const currentPath = window.location.pathname + window.location.search;
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
        return <Navigate to={`/login?next=${encodeURIComponent(currentPath)}`} replace />;
    }

    return children;
}

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/whats-next" element={<WhatsNext />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Docs routes */}
                    <Route path="/docs" element={<DocsOverview />} />
                    <Route path="/docs/getting-started" element={<GettingStarted />} />
                    <Route path="/docs/use-cases" element={<UseCases />} />
                    <Route path="/docs/features" element={<Features />} />
                    <Route path="/docs/mcp" element={<MCPIntegration />} />
                    <Route path="/docs/plans" element={<Plans />} />
                    <Route path="/docs/platforms" element={<Platforms />} />
                    <Route path="/docs/privacy" element={<Privacy />} />

                    <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                        <Route path="/capsules" element={<CapsulesPage />} />
                        <Route path="/create-capsule" element={<CreateCapsule />} />
                        <Route path="/teams" element={<TeamsPage />} />
                        <Route path="/billing" element={<BillingPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/capsules" replace />} />
                </Routes>
            </BrowserRouter>
            <Toaster />
        </ThemeProvider>
    );
}

export default App;
