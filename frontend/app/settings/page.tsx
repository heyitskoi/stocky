import { ProtectedRoute } from "@/components/protected-route"
import SettingsPage from "@/settings-page"

export default function Settings() {
  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <SettingsPage />
    </ProtectedRoute>
  )
}
