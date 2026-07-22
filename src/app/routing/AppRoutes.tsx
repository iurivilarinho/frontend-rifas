import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppNav } from "@/components/layout/AppNav";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LandingPage } from "@/features/landing";
import { LoginPage, SignupPage } from "@/features/auth";
import { PanelPage } from "@/features/panel";
import { PrivacyPolicyPage, TermsOfUsePage } from "@/features/legal";
import { AdminTermsPage, TermsGate } from "@/features/terms";
import { UserFormPage } from "@/features/user";
import {
  RafflePage,
  RaffleFormPage,
  RaffleListPage,
  RaffleBuyersPage,
} from "@/features/raffle";

import { ProtectedRoute } from "./ProtectedRoute";
import { SessionGate } from "./SessionGate";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <SessionGate />
      <TermsGate />
      <AppNav />
      <Routes>
        {/* ===== Públicas ===== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignupPage />} />
        <Route path="/raffles/:cpf?" element={<RaffleListPage />} />
        <Route path="/raffle/:raffleId/:cpf?" element={<RafflePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />

        {/* ===== Protegidas (qualquer user autenticado) ===== */}
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <PanelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/raffle/form/:formType/:raffleId?"
          element={
            <ProtectedRoute>
              <RaffleFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/raffle/:raffleId/buyers"
          element={
            <ProtectedRoute>
              <RaffleBuyersPage />
            </ProtectedRoute>
          }
        />

        {/* ===== Protegidas (somente admin) ===== */}
        <Route
          path="/user/form/:formType/:userId?"
          element={
            <ProtectedRoute requireAdmin>
              <UserFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/terms"
          element={
            <ProtectedRoute requireAdmin>
              <AdminTermsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <CookieConsent />
    </BrowserRouter>
  );
};
