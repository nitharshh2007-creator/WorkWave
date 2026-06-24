import React from 'react';
import { Outlet } from 'react-router-dom';

const AppLayout: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default AppLayout;