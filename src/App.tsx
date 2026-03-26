/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-x-hidden font-terminal">
      {/* Static Noise Overlay */}
      <div className="static-noise"></div>

      {/* Header */}
      <header className="relative z-10 w-full py-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-pixel text-[#00FFFF] glitch-text mb-4 tracking-tighter text-center inline-block" data-text="NEON_SNAKE.EXE">
          NEON_SNAKE.EXE
        </h1>
        <div className="flex items-center gap-4">
          <div className="h-[2px] w-12 bg-[#FF00FF]"></div>
          <p className="text-[#FF00FF] font-pixel text-[10px] md:text-xs tracking-[0.5em] uppercase">
            SYS.VER.2.0.26
          </p>
          <div className="h-[2px] w-12 bg-[#FF00FF]"></div>
        </div>
      </header>

      {/* Main Content - Game Area */}
      <main className="flex-1 relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16 p-4 w-full max-w-6xl mx-auto pb-12">
        <SnakeGame />
        <MusicPlayer />
      </main>
    </div>
  );
}
