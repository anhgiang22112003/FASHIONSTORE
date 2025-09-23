import React from 'react';
import { ChevronLeft, ChevronRight, Search, Download, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const TopBar = ({ currentView, searchQuery, setSearchQuery }) => {
  return (
    <div className="bg-black px-6 py-4 flex items-center justify-between">
      {/* Navigation Arrows */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="rounded-full bg-gray-900 text-gray-400 hover:text-white">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full bg-gray-900 text-gray-400 hover:text-white">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Search Bar (only show on search view) */}
      {currentView === 'search' && (
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="What do you want to play?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-none pl-10 text-white placeholder-gray-400 rounded-full h-10 focus:bg-gray-700"
            />
          </div>
        </div>
      )}

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          Premium
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          Support
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          Download
        </Button>
        
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Bell className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          Install App
        </Button>
        
        <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 py-2 text-sm font-semibold">
          Sign up
        </Button>
        <Button variant="ghost" className="text-white hover:text-gray-300 text-sm font-semibold">
          Log in
        </Button>
      </div>
    </div>
  );
};

export default TopBar;