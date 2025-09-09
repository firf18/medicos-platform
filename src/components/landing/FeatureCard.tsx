import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
        <svg 
          className="w-8 h-8 text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {icon}
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-center mb-3">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
}
