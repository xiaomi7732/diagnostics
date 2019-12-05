import React from 'react';
export const AppHeader: React.FunctionComponent<{ isHome: boolean, goHome: () => void }> = ({ isHome, goHome }) => (
    <div className='app-header'>
        {!isHome && <div className='back-home-button' onClick={goHome}>&lt;- Back</div>}
        <h1>.NET Core Profiling Console</h1>
    </div>
);