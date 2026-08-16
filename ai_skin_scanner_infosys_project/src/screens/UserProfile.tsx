import React, { useState } from 'react';
import type { UserProfileData } from '../App';

interface UserProfileProps {
  userProfile: UserProfileData;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userProfile, setUserProfile }) => {
  const [personalInfo, setPersonalInfo] = useState({
    name: userProfile.name,
    email: userProfile.email,
    dob: userProfile.dob,
    phone: userProfile.phone
  });

  const [skinProfile, setSkinProfile] = useState({
    skinType: userProfile.skinType,
    sensitivity: userProfile.sensitivity,
    skinGoals: userProfile.skinGoals
  });

  const [allergies, setAllergies] = useState<string[]>(userProfile.allergies);
  const [newAllergy, setNewAllergy] = useState('');

  const [lifestyle, setLifestyle] = useState({
    waterTarget: userProfile.waterTarget,
    sleepSchedule: userProfile.sleepSchedule
  });

  React.useEffect(() => {
    setPersonalInfo({
      name: userProfile.name,
      email: userProfile.email,
      dob: userProfile.dob,
      phone: userProfile.phone
    });
    setSkinProfile({
      skinType: userProfile.skinType,
      sensitivity: userProfile.sensitivity,
      skinGoals: userProfile.skinGoals
    });
    setAllergies(userProfile.allergies);
    setLifestyle({
      waterTarget: userProfile.waterTarget,
      sleepSchedule: userProfile.sleepSchedule
    });
  }, [userProfile]);

  const availableGoals = ['Anti-Aging', 'Acne Control', 'Hydration', 'Brightening', 'Barrier Repair', 'Pore Minimizing'];

  const toggleGoal = (goal: string) => {
    setSkinProfile(prev => ({
      ...prev,
      skinGoals: prev.skinGoals.includes(goal) 
        ? prev.skinGoals.filter(g => g !== goal) 
        : [...prev.skinGoals, goal]
    }));
  };

  const addAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  const handleSave = () => {
    setUserProfile({
      name: personalInfo.name,
      email: personalInfo.email,
      dob: personalInfo.dob,
      phone: personalInfo.phone,
      skinType: skinProfile.skinType,
      sensitivity: skinProfile.sensitivity,
      skinGoals: skinProfile.skinGoals,
      allergies: allergies,
      waterTarget: lifestyle.waterTarget,
      sleepSchedule: lifestyle.sleepSchedule
    });
    alert("Profile configurations updated and synchronized with Aetheris Cloud.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">User Skin Profile Settings</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Configure your personal information, skin concerns, lifestyle baselines, and allergy warnings.</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-bold text-xs shadow-lg shadow-primary/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-12 gap-card-gap">
        {/* Personal Details */}
        <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-2xl border border-white/20 space-y-4">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/10 pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="userName">Full Name</label>
              <input
                type="text"
                id="userName"
                value={personalInfo.name}
                onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="userEmail">Email Address</label>
              <input
                type="email"
                id="userEmail"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="userDob">Date of Birth</label>
              <input
                type="date"
                id="userDob"
                value={personalInfo.dob}
                onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="userPhone">Phone Number</label>
              <input
                type="text"
                id="userPhone"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Skin Profile details */}
        <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-2xl border border-white/20 space-y-4">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/10 pb-2">Skin Bio-Profile</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Skin Type</label>
              <select
                value={skinProfile.skinType}
                onChange={(e) => setSkinProfile({ ...skinProfile, skinType: e.target.value })}
                className="w-full py-2 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none"
              >
                <option value="Dry">Dry</option>
                <option value="Oily">Oily</option>
                <option value="Combination">Combination</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sensitivity</label>
              <select
                value={skinProfile.sensitivity}
                onChange={(e) => setSkinProfile({ ...skinProfile, sensitivity: e.target.value })}
                className="w-full py-2 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none"
              >
                <option value="Resilient">Resilient (None)</option>
                <option value="Sensitive">Sensitive (Mild)</option>
                <option value="Highly Sensitive">Highly Sensitive</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Skincare Goals</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableGoals.map((goal, idx) => {
                const active = skinProfile.skinGoals.includes(goal);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      active 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-surface-container-low dark:bg-zinc-800 border-transparent text-on-surface-variant hover:border-outline-variant/30'
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Allergies list */}
        <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-2xl border border-white/20 space-y-4">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/10 pb-2">Allergies &amp; Avoidances</h3>
          
          <form onSubmit={addAllergy} className="flex gap-2">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              placeholder="e.g. Salicylic Acid, Fragrance, Nuts..."
              className="flex-1 px-3 py-2 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
            >
              Add
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 px-3 py-1 rounded-xl text-[10px] font-bold border border-rose-500/10">
                {allergy}
                <button 
                  type="button" 
                  onClick={() => removeAllergy(allergy)}
                  className="material-symbols-outlined text-xs leading-none font-bold hover:text-rose-800"
                >
                  close
                </button>
              </span>
            ))}
            {allergies.length === 0 && (
              <p className="text-[10px] text-on-surface-variant font-medium">No active allergies listed.</p>
            )}
          </div>
        </div>

        {/* Lifestyle settings */}
        <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-2xl border border-white/20">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/10 pb-2">Lifestyle Baselines</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="waterTarget">Water Intake Target (L)</label>
                <input
                  type="number"
                  step="0.25"
                  id="waterTarget"
                  value={lifestyle.waterTarget}
                  onChange={(e) => setLifestyle({ ...lifestyle, waterTarget: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="sleepTime">Sleep Schedule</label>
                <input
                  type="text"
                  id="sleepTime"
                  value={lifestyle.sleepSchedule}
                  onChange={(e) => setLifestyle({ ...lifestyle, sleepSchedule: e.target.value })}
                  className="w-full px-3 py-1.5 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
