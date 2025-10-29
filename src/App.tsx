import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const queryClient = new QueryClient();
  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "1023446766812-f0ac4cpu94tjc48188dnq59de5sh3kej.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={routes} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
