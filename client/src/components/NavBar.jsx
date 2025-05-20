import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// NavBar component
const NavBar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-blue-700' : '';
    };

    return (
        <nav className = 'bg-blue-600 text-white p-4'>
            <div className = 'container mx-auto flex justify-between items-center'>
                <Link to = '/' className = 'text-xl font-bold'>Baseball Betting Analytics</Link>

                <div className = 'flex space x-4'>
                    <Link to = '/games' className = {`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/games')}`}></Link>
                    <Link to = '/players' className = {`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/players')}`}></Link>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;