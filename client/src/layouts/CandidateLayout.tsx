import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CandidateLayout: React.FC = () => {
  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  );
};

export default CandidateLayout;
