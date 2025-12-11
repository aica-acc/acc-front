import React from 'react';
import { Outlet } from 'react-router-dom';
import StepHeader from './StepHeader';

const MainLayout = () => {
    return (
        <div className="flex min-h-screen bg-neutral-900">
            <StepHeader/>
            {/* 메인 컨텐츠 - 헤더 아래 */}
            <main className="flex-1 container mx-auto px-4 overflow-auto pt-28">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
