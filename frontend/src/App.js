import React, { useState } from "react";
import "./index.css";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import HomeView from "./components/HomeView";
import SearchView from "./components/SearchView";
import MusicPlayer from "./components/MusicPlayer";

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const renderMainContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeView setCurrentSong={setCurrentSong} />;
      case 'search':
        return <SearchView searchQuery={searchQuery} />;
      default:
        return <HomeView setCurrentSong={setCurrentSong} />;
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <TopBar 
            currentView={currentView} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
          <div className="flex-1 overflow-y-auto">
            {renderMainContent()}
          </div>
        </div>
      </div>
      
      {/* Music Player */}
      <MusicPlayer 
        currentSong={currentSong} 
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying} 
      />
    </div>
  );
}

export default App;