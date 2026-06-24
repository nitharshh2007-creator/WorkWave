import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs.tsx';
import JobDetails from './pages/JobDetails';
import MyApplications from './pages/MyApplications';
import SavedJobs from './pages/SavedJobs';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import CandidateLayout from './layouts/CandidateLayout';
import AppLayout from './components/AppLayout';
import ManageJobs from './pages/ManageJobs';
import EmployerDashboard from './pages/EmployerDashboard';
import EmployerLayout from './layouts/EmployerLayout';
import EmployerProtectedRoute from './components/EmployerProtectedRoute';
import PostJob from './pages/employer/PostJob';
import Analytics from './pages/employer/Analytics';
import EmployerSettings from './pages/employer/EmployerSettings';
import Applicants from './pages/employer/Applicants';
import CompanyProfile from './pages/employer/CompanyProfile';
import MyAccount from './pages/employer/MyAccount';

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<CandidateLayout />}>
              <Route path="/" element={<Navigate replace to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/applications" element={<MyApplications />} />
              <Route path="/saved-jobs" element={<SavedJobs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route element={<EmployerProtectedRoute />}>
            <Route element={<EmployerLayout />}>
              <Route path="/employer" element={<Navigate replace to="/employer/dashboard" />} />
              <Route path="/employer/dashboard" element={<EmployerDashboard />} />
              <Route path="/employer/jobs" element={<ManageJobs />} />
              <Route path="/employer/jobs/new" element={<PostJob />} />
              <Route path="/employer/applicants" element={<Applicants />} />
              <Route path="/employer/analytics" element={<Analytics />} />
              <Route path="/employer/settings" element={<EmployerSettings />} />
              <Route path="/employer/profile" element={<CompanyProfile />} />
              <Route path="/employer/account" element={<MyAccount />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;