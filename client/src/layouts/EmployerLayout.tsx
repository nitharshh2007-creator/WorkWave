import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const EmployerLayout: React.FC = () => {
  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  );
};

export default EmployerLayout;
