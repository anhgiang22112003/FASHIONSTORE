import React from 'react';
import { Play } from 'lucide-react';
import { mockTrendingSongs, mockPopularArtists, mockRecentlyPlayed } from '../data/mock';
import { Button } from './ui/button';

const HomeView = ({ setCurrentSong }) => {
  const handlePlay = (song) => {
    setCurrentSong(song);
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-full">
      <div className="px-6 py-8">
        {/* Good morning greeting */}
        <h1 className="text-white text-3xl font-bold mb-6">Good afternoon</h1>

        {/* Recently Played */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {mockRecentlyPlayed.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 hover:bg-gray-700 transition-colors rounded-md flex items-center overflow-hidden group cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-20 h-20 object-cover"
              />
              <div className="p-4 flex-1">
                <h3 className="text-white font-semibold truncate">{item.title}</h3>
              </div>
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-400 rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity mr-4"
                onClick={() => handlePlay(item)}
              >
                <Play className="w-4 h-4 text-black fill-black" />
              </Button>
            </div>
          ))}
        </div>

        {/* Trending Songs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-2xl font-bold">Trending songs</h2>
            <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">
              Show all
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockTrendingSongs.map((song) => (
              <div
                key={song.id}
                className="bg-gray-900 hover:bg-gray-800 transition-colors p-4 rounded-md group cursor-pointer"
                onClick={() => handlePlay(song)}
              >
                <div className="relative mb-4">
                  <img
                    src={song.image}
                    alt={song.title}
                    className="w-full aspect-square object-cover rounded-md"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-400 rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0"
                  >
                    <Play className="w-4 h-4 text-black fill-black" />
                  </Button>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1 truncate">{song.title}</h3>
                <p className="text-gray-400 text-xs truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Artists */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-2xl font-bold">Popular artists</h2>
            <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">
              Show all
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {mockPopularArtists.map((artist) => (
              <div
                key={artist.id}
                className="bg-gray-900 hover:bg-gray-800 transition-colors p-4 rounded-md group cursor-pointer"
              >
                <div className="relative mb-4">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full aspect-square object-cover rounded-full"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-400 rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0"
                  >
                    <Play className="w-4 h-4 text-black fill-black" />
                  </Button>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1 truncate">{artist.name}</h3>
                <p className="text-gray-400 text-xs">{artist.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sticky bottom-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Preview of Spotify</h3>
            <p className="text-white text-sm opacity-90">
              Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed.
            </p>
          </div>
          <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 py-2 font-semibold">
            Sign up free
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeView;