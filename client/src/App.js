import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import GamesDashboard from './components/GamesDashboard';
import GameAnalysis from './components/GameAnalysis';
import PlayerPropAnalyzer from './components/PlayerPropAnalyzer';
import PlayerList from './components/PlayerList';
import HomePage from './components/HomePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/games" element={<GamesDashboard />} />
            <Route path="/game/:gameId" element={<GameAnalysis />} />
            <Route path="/players" element={<PlayerList />} />
            <Route path="/player/:playerId" element={<PlayerPropAnalyzer />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;