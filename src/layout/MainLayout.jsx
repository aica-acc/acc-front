import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import StepProgress from '../components/step/StepProgress';
import BackButton from '../components/buttons/BackButton';

const MainLayout = () => {
    return (
        <div className=" flex flex-col min-h-screen mt-20">
            <Header/>
            <BackButton/>
            <StepProgress/>
            <main className="container mx-auto px-4">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;