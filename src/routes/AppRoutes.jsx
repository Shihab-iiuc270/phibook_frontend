import { Navigate, Route, Routes } from 'react-router';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
import Feed from '../components/feed/Feed';
import ProtectedRoute from '../components/ProtectedRoute';
import useAuthContext from '../hooks/useAuthContext';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import UserPosts from '../pages/UserPosts';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPasswordConfirm from '../pages/ResetPasswordConfirm';
import ChangePassword from '../pages/ChangePassword';
import Likes from '../pages/Likes';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFail from '../pages/PaymentFail';
import PaymentCancel from '../pages/PaymentCancel';

const AppRoutes = () => {
  const { user } = useAuthContext();

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Feed />} />
        <Route
          path="/profile"
          element={<Navigate to="/profile/edit" replace />}
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/posts"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/users/:userId/posts" element={<UserPosts />} />
        <Route
          path="/profile/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/likes"
          element={
            <ProtectedRoute>
              <Likes />
            </ProtectedRoute>
          }
        />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Route>

      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />
      <Route
        path="/password/reset/confirm/:uid/:token"
        element={<ResetPasswordConfirm />}
      />
      <Route
        path="/password/reset/confirm/:uid/:token/"
        element={<ResetPasswordConfirm />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
