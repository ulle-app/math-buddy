
import React from 'react';
import { Award } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-[#1A1F2C] to-[#403E43] px-6 py-3 flex items-center shadow-md border-b border-white/5">
      <Award className="text-[#9b87f5] mr-2" size={22} />
      <h1 className="text-gray-50 text-xl font-semibold">Math Tutor</h1>
    </div>
  );
};

export default Header;
