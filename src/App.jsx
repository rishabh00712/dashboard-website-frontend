import React from 'react';
import {
  createHashRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from 'react-router-dom';
import AdminLogin from '../src/screens/AdminLogin';
import PrivateRoute from '../src/components/PrivateRoute';
import Error from './components/Error';
import Unauthorized from './components/Unauthorized';
import Dashboard from './screens/Dashboard';
import axios from 'axios';
import AdminLayout from './layouts/MainLayout'; // ⬅️ import layout

axios.defaults.withCredentials = true; // Allow cookies

const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<AdminLogin />} />

      {/* Private Routes with Navbar */}
      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      <Route path="/error" element={<Error />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
    </>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
