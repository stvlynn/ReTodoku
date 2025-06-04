import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from './components/layouts/main-layout';
import { Loader } from './components/ui/loader';

// Lazy-loaded pages
const Landing = lazy(() => import('./pages/landing'));
const RequestPage = lazy(() => import('./pages/request'));
const HistoryPage = lazy(() => import('./pages/history'));
const PostcardPage = lazy(() => import('./pages/postcard'));
const UserPage = lazy(() => import('./pages/user'));

const routes = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loader />}>
            <Landing />
          </Suspense>
        ),
      },
      {
        path: 'request',
        element: (
          <Suspense fallback={<Loader />}>
            <RequestPage />
          </Suspense>
        ),
      },
      {
        path: 'p/:slug',
        element: (
          <Suspense fallback={<Loader />}>
            <HistoryPage />
          </Suspense>
        ),
      },
      {
        path: 'postcard/:hash',
        element: (
          <Suspense fallback={<Loader />}>
            <PostcardPage />
          </Suspense>
        ),
      },
      {
        path: 'u/:slug',
        element: (
          <Suspense fallback={<Loader />}>
            <UserPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={routes} />;
}