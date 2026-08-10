import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, Sparkles, Check, CheckCircle2, ShieldAlert } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const concernsList = [
    { id: 'acne', label: 'Acne & Blemishes' },
    { id: 'dry_skin', label: 'Dryness / Flakiness' },
    { id: 'oily_skin', label: 'Excess Sebum / Shine' },
    { id: 'pigmentation', label: 'Dark Spots / Hyperpigmentation' },
    { id: 'sensitive_skin', label: 'Redness / Sensitivity' },
    { id: 'wrinkles', label: 'Wrinkles' },
    { id: 'fine_lines', label: 'Fine Lines' },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      age: '',
      gender: '',
      skin_type: '',
      concerns: [],
      allergy_details: '',
    },
  });

  // Prepopulate form when user data loads
  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      setValue('age', p.age || '');
      setValue('gender', p.gender || '');
      setValue('skin_type', p.skin_type || '');
      setValue('concerns', p.concerns || []);
      setValue('allergy_details', p.allergy_details || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      // Cast age to integer
      const payload = {
        ...data,
        age: data.age ? parseInt(data.age, 10) : null,
      };
      await updateProfile(payload);
      setSuccessMsg('Skin profile updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          Skin Profile & Assessment
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tell us about your skin to optimize ingredient matches and routines.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Summary Card */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                👤
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.full_name || 'Guest'}</h3>
                <p className="text-[11px] text-slate-400 font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Assigned Role:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Skin Type:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">{user?.profile?.skin_type || 'Not Set'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Age Parameter:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{user?.profile?.age || 'Not Set'}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-brand-50/50 dark:bg-slate-900/30 border border-brand-100 dark:border-slate-800/50 space-y-2">
            <h4 className="text-xs font-extrabold text-brand-700 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Core Ingredients Matching
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Updating your profile triggers automatic mapping in the Skincare Intelligence Engine. In subsequent phases, ingredients like salicylic acid will be flagged if you mark sensitive skin, ensuring safe routines.
            </p>
          </Card>
        </div>

        {/* Right Side: Form Card */}
        <Card className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
              Skin Assessment Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Age (Years)"
                type="number"
                placeholder="e.g. 25"
                error={errors.age}
                {...register('age', {
                  min: { value: 0, message: 'Age cannot be negative' },
                  max: { value: 120, message: 'Please enter a valid age' },
                })}
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Gender
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100"
                  {...register('gender')}
                >
                  <option value="">Select Gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-Binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Skin Type (Self-Assessed / Preliminary)
              </label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100"
                {...register('skin_type')}
              >
                <option value="">Select Skin Type</option>
                <option value="normal">Normal</option>
                <option value="dry">Dry</option>
                <option value="oily">Oily</option>
                <option value="combination">Combination</option>
                <option value="sensitive">Sensitive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Active Skin Concerns
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {concernsList.map((concern) => (
                  <label
                    key={concern.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800/80 cursor-pointer transition-colors duration-150 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <input
                      type="checkbox"
                      value={concern.id}
                      className="w-4 h-4 rounded text-brand-500 border-slate-300 dark:border-slate-700 focus:ring-brand-500"
                      {...register('concerns')}
                    />
                    {concern.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Allergy Details & Ingredient Sensitivities
              </label>
              <textarea
                placeholder="e.g. Sensitive to Benzoyl Peroxide, Vitamin C causes hives..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100"
                {...register('allergy_details')}
              />
            </div>

            <Button
              type="submit"
              className="px-6"
              isLoading={loading}
            >
              Save Skin Profile
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
export default Profile;
