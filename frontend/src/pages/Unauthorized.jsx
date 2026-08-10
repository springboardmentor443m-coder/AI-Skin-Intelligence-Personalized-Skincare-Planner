import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ShieldAlert } from 'lucide-react';

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center space-y-4 p-8 glass-card border border-red-200/20">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto text-red-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Access Denied</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          You do not have the required permissions to view this resource. If you believe this is an error, please contact your administrator.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};
export default Unauthorized;
