import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./components/auth/AuthContext";
import { TodoProvider } from "./components/todos/TodoContext";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <AuthProvider>
      <TodoProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#f1f5f9" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" },
            },
          }}
        />
      </TodoProvider>
    </AuthProvider>
  );
}

export default App;
