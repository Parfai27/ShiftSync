import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Overview from './components/Dashboard/overview.jsx'
import Profiles from './components/Dashboard/profiles.jsx'
import Scheduling from './components/Dashboard/scheduling.jsx'
import Adjustments from './components/Dashboard/adjustments.jsx'
import Notifications from './components/Dashboard/notifications.jsx'
import Compliances from './components/Dashboard/compliances.jsx'
import Reports from './components/Dashboard/reports.jsx'
import ManagerSettings from './components/Dashboard/manager_settings.jsx'
import Login from './components/login.jsx'
import EmployeeOverview from './components/Employee/employee_overview.jsx'
import SystemOverview from './components/Admin/system_overview.jsx'
import UserManagement from './components/Admin/user_management.jsx'
import AuditLogs from './components/Admin/auditlogs.jsx'
import ApiIntegrations from './components/Admin/api.jsx'
import AdminSettings from './components/Admin/admin_settings.jsx'
import MySchedule from './components/Employee/my_schedule.jsx'
import Announcements from './components/Employee/announcements.jsx'
import EarningsAndPays from './components/Employee/earnings&pays.jsx'
import Profile from './components/Employee/profile.jsx'
import EmployeeNotifications from './components/Employee/notifications.jsx'
import PersonalSettings from './components/Employee/personal_settings.jsx'
import Landing from './pages/landing.jsx'

function App() {
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
        <Route path="/admin-overview" element={<SystemOverview />} />
        <Route path="/admin-user-management" element={<UserManagement />} />
        <Route path="/admin-auditlogs" element={<AuditLogs />} />
        <Route path="/admin-api" element={<ApiIntegrations />} />
        <Route path="/admin-settings" element={<AdminSettings />} />
        <Route path="/employee-dashboard" element={<EmployeeOverview />} />
        <Route path="/employee-schedule" element={<MySchedule />} />
        <Route path="/employee-announcements" element={<Announcements />} />
        <Route path="/employee-earnings" element={<EarningsAndPays />} />
        <Route path="/employee-profile" element={<Profile />} />
        <Route path="/employee-notifications" element={<EmployeeNotifications />} />
        <Route path="/employee-settings" element={<PersonalSettings />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/adjustments" element={<Adjustments />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/compliances" element={<Compliances />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/manager-settings" element={<ManagerSettings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
