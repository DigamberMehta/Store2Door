import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { StoreAuthProvider } from "./context/StoreAuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <StoreAuthProvider>
      <AdminAuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AdminAuthProvider>
    </StoreAuthProvider>
  );
};

export default App;
