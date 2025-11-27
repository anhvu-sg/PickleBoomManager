import React, { useState } from 'react';
import { UserPlus, Save } from 'lucide-react';

interface PlayerRegistrationProps {
  onRegister: (name: string, initialRating: number) => void;
  onCancel: () => void;
}

const PlayerRegistration: React.FC<PlayerRegistrationProps> = ({ onRegister, onCancel }) => {
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState('3.500'); // Default Intermediate

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRegister(name.trim(), parseFloat(skillLevel));
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6 text-pickle-800">
        <UserPlus className="w-6 h-6" />
        <h2 className="text-2xl font-bold">New Player Registration</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pickle-500 outline-none"
            placeholder="e.g. Serena Williams"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Initial DUPR Estimation</label>
          <select
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pickle-500 outline-none"
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
          >
            <option value="2.500">Beginner (DUPR ~2.5)</option>
            <option value="3.000">Novice (DUPR ~3.0)</option>
            <option value="3.500">Intermediate (DUPR ~3.5)</option>
            <option value="4.000">Advanced (DUPR ~4.0)</option>
            <option value="4.500">Expert (DUPR ~4.5)</option>
            <option value="5.000">Pro (DUPR ~5.0+)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            This sets your provisional rating. It will adjust automatically after matches.
          </p>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-pickle-600 text-white rounded-lg hover:bg-pickle-700 font-bold shadow-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Join Club</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerRegistration;