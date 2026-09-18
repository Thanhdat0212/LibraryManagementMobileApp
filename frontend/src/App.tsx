import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import MemberLayout from "./components/layout/MemberLayout";
import HomeRedirect from "./pages/HomeRedirect";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthorsPage from "./pages/admin/AuthorsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import PublishersPage from "./pages/admin/PublishersPage";
import BooksPage from "./pages/admin/BooksPage";
import BookCopiesPage from "./pages/admin/BookCopiesPage";
import BorrowRecordsPage from "./pages/admin/BorrowRecordsPage";
import BorrowRequestsPage from "./pages/admin/BorrowRequestsPage";
import FinesPage from "./pages/admin/FinesPage";
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import CatalogPage from "./pages/member/CatalogPage";
import BookDetailPage from "./pages/member/BookDetailPage";
import MyBorrowsPage from "./pages/member/MyBorrowsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="books" element={<BooksPage />} />
              <Route path="book-copies" element={<BookCopiesPage />} />
              <Route path="authors" element={<AuthorsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="publishers" element={<PublishersPage />} />
              <Route path="borrow-records" element={<BorrowRecordsPage />} />
              <Route path="borrow-requests" element={<BorrowRequestsPage />} />
              <Route path="fines" element={<FinesPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["Member"]} />}>
            <Route element={<MemberLayout />}>
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/:id" element={<BookDetailPage />} />
              <Route path="/my-borrows" element={<MyBorrowsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
