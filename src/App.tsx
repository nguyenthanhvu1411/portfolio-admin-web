import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BlogFormPage } from '@/pages/BlogFormPage';
import { BlogsPage } from '@/pages/BlogsPage';
import { CertificatesPage } from '@/pages/CertificatesPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EducationPage } from '@/pages/EducationPage';
import { ExperiencesPage } from '@/pages/ExperiencesPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ProjectFormPage } from '@/pages/ProjectFormPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SkillsPage } from '@/pages/SkillsPage';
import { UploadsPage } from '@/pages/UploadsPage';
import { UsersPage } from '@/pages/UsersPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'skills', element: <SkillsPage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/new', element: <ProjectFormPage /> },
          { path: 'projects/:id/edit', element: <ProjectFormPage /> },
          { path: 'experiences', element: <ExperiencesPage /> },
          { path: 'education', element: <EducationPage /> },
          { path: 'certificates', element: <CertificatesPage /> },
          { path: 'blogs', element: <BlogsPage /> },
          { path: 'blogs/new', element: <BlogFormPage /> },
          { path: 'blogs/:id/edit', element: <BlogFormPage /> },
          { path: 'contacts', element: <ContactsPage /> },
          { path: 'uploads', element: <UploadsPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'settings', element: <SettingsPage /> }
        ]
      }
    ]
  },
  { path: '*', element: <NotFoundPage /> }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
