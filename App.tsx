import React, { useState } from 'react';
import { GameMode } from './types';
import { TrainingMode } from './views/TrainingMode';
import { LocalBattleMode } from './views/LocalBattleMode';
import { OnlineBattleMode } from './views/OnlineBattleMode';
import { Zap, Users, Globe, Calculator } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);

  const renderContent = () => {
    switch (mode) {
      case GameMode.TRAINING:
        return <TrainingMode onBack={() => setMode(GameMode.MENU)} />;
      case GameMode.LOCAL_BATTLE:
        return <LocalBattleMode onBack={() => setMode(GameMode.MENU)} />;
      case GameMode.ONLINE_BATTLE:
        return <OnlineBattleMode onBack={() => setMode(GameMode.MENU)} />;
      default:
        return <Menu onSelectMode={setMode} />;
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {renderContent()}
    </div>
  );
};

const Menu: React.FC<{ onSelectMode: (mode: GameMode) => void }> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col h-full p-6 max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-brand-500 p-4 rounded-3xl shadow-xl shadow-brand-200 mb-6 rotate-3 transform transition-transform hover:rotate-6">
          <Calculator className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">速算大师</h1>
        <p className="text-slate-500 font-medium mb-10 text-center">极速口算 · 脑力觉醒</p>

        <div className="w-full space-y-4">
          <MenuButton 
            icon={<Zap className="w-6 h-6" />}
            title="一分钟训练"
            desc="极速单人闯关"
            color="bg-blue-500"
            onClick={() => onSelectMode(GameMode.TRAINING)}
          />
          <MenuButton 
            icon={<Users className="w-6 h-6" />}
            title="本地双人对战"
            desc="同屏面对面PK"
            color="bg-purple-500"
            onClick={() => onSelectMode(GameMode.LOCAL_BATTLE)}
          />
          <MenuButton 
            icon={<Globe className="w-6 h-6" />}
            title="在线 PK"
            desc="匹配全球玩家"
            color="bg-orange-500"
            onClick={() => onSelectMode(GameMode.ONLINE_BATTLE)}
          />
        </div>
      </div>
      
      <div className="py-4 text-center text-xs text-slate-300">
        v1.0.0 • By 速算大师团队
      </div>
    </div>
  );
};

interface MenuButtonProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, title, desc, color, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-100 flex items-center gap-4 hover:border-brand-200 hover:shadow-md active:scale-98 transition-all group"
  >
    <div className={`${color} text-white p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div className="text-left">
      <div className="font-bold text-lg text-slate-800">{title}</div>
      <div className="text-xs text-slate-400 font-medium">{desc}</div>
    </div>
  </button>
);

export default App;