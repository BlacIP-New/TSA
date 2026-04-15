import { useEffect, useState } from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';

interface ProfileSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ open, onClose }: ProfileSettingsModalProps) {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [open, user]);

  if (!user) return null;

  const handleSave = () => {
    setUser({
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Profile settings"
      description="Update your display details for the current session."
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto sm:min-w-[128px]">
            Cancel
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto sm:min-w-[128px]">Save changes</Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Email address" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-gray-300 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Role</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{user.role === 'aggregator_admin' ? 'Aggregator Admin' : 'MDA Viewer'}</p>
          </div>
          <div className="rounded-lg border border-gray-300 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
            <div className="mt-2">
              <Badge variant={user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'neutral'}>
                {user.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
