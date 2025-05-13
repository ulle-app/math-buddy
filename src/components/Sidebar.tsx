
import React from 'react';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TopicItem {
  name: string;
  topics: string[];
}

const mathTopics: TopicItem[] = [
  {
    name: "Grade 7",
    topics: ["Fractions", "Integers", "Basic Algebra", "Geometry Basics"]
  },
  {
    name: "Grade 8",
    topics: ["Linear Equations", "Geometry", "Statistics", "Rational Numbers"]
  },
  {
    name: "Grade 9",
    topics: ["Quadratic Equations", "Systems of Equations", "Statistics & Probability", "Transformations"]
  },
  {
    name: "Grade 10",
    topics: ["Functions", "Trigonometry", "Quadratics", "Analytical Geometry"]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <div 
      className={`fixed top-0 left-0 h-full bg-mathBuddy-secondaryBg w-3/4 md:w-64 transition-all duration-300 ease-in-out z-20 
                  ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <div className="p-4 border-b border-mathBuddy-cardBg">
        <div className="flex justify-between items-center">
          <h1 className="text-mathBuddy-teal text-xl font-bold">Math Buddy</h1>
          <button 
            className="text-white md:hidden" 
            onClick={onClose}
          >
            <X size={20} />
            <span className="ml-1">Close</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-122px)]">
        {mathTopics.map((grade, index) => (
          <div key={index} className="mb-4">
            <h2 className="text-mathBuddy-purple px-4 py-2 font-semibold">
              {grade.name}
            </h2>
            <ul>
              {grade.topics.map((topic, topicIndex) => (
                <li 
                  key={topicIndex} 
                  className="px-6 py-2 text-white hover:text-mathBuddy-teal hover:bg-mathBuddy-background cursor-pointer transition-all duration-200"
                >
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-0 w-full border-t border-mathBuddy-cardBg p-4">
        <button className="w-full text-white hover:text-mathBuddy-teal py-2 text-left transition-all duration-200">
          Progress
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
