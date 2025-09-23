import React, { useState } from 'react';
import { Home, Search, Library, Plus, Heart, Download } from 'lucide-react';
import { Button } from './ui/button';

const Sidebar = ({ currentView, setCurrentView }) => {
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: Search, label: 'Search', id: 'search' }
  ];

  return (
    <div className="w-60 bg-black h-full flex flex-col">
      {/* Main Navigation */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-full"></div>
          </div>
          <span className="text-white font-bold text-xl">Spotify</span>
        </div>
        
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-4 text-left w-full p-2 rounded-md transition-colors ${
                currentView === item.id
                  ? 'text-white bg-gray-800'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Your Library Section */}
      <div className="flex-1 px-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
            className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors"
          >
            <Library className="w-6 h-6" />
            <span className="font-medium">Your Library</span>
          </button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Create Playlist Prompt */}
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <h3 className="text-white font-semibold mb-2">Create your first playlist</h3>
          <p className="text-gray-400 text-sm mb-4">It's easy, we'll help you</p>
          <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-2 text-sm font-semibold">
            Create playlist
          </Button>
        </div>

        {/* Browse Podcasts Prompt */}
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <h3 className="text-white font-semibold mb-2">Let's find some podcasts to follow</h3>
          <p className="text-gray-400 text-sm mb-4">We'll keep you updated on new episodes</p>
          <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-2 text-sm font-semibold">
            Browse podcasts
          </Button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="p-6 pt-4 border-t border-gray-800">
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="#" className="hover:text-white">Legal</a>
            <a href="#" className="hover:text-white">Safety & Privacy Center</a>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="#" className="hover:text-white">About Ads</a>
            <a href="#" className="hover:text-white">Accessibility</a>
          </div>
          <a href="#" className="hover:text-white">Notice at Collection</a>
        </div>
        
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Your privacy choices
          </span>
        </div>
        
        <div className="mt-4">
          <Button variant="outline" className="w-full text-gray-400 border-gray-600 hover:border-white">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            English
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;