import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    if (pw.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success('Password updated'); setPw(''); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>

        <Card>
          <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ''} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Change password</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>New password</Label>
              <Input type="password" value={pw} onChange={e => setPw(e.target.value)} />
            </div>
            <Button onClick={changePassword} disabled={loading}>Update password</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
