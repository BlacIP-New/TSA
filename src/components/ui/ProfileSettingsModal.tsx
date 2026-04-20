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
  const [isEditing, setIsEditing] = useState(false);

  const resetForm = (nextUser = user) => {
    if (!nextUser) return;
    setName(nextUser.name);
    setEmail(nextUser.email);
    setIsEditing(false);
  };

  useEffect(() => {
    if (open && user) resetForm(user);
  }, [open, user]);

  if (!user) return null;

  const handleSave = () => {
    setUser({
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    resetForm(user);
  };

  const roleLabels: Record<typeof user.role, string> = {
    system_admin: 'NSW SYSTEM ADMIN',
    system_user: 'NSW SYSTEM USER',
    mda_admin: 'MDA ADMIN',
    mda_user: 'MDA USER',
  };

  return (
    <Modal
      open={open}
      title="Profile settings"
      description="View your profile details, then edit and save changes when needed."
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={handleCancelEdit}
                className="w-full sm:w-auto sm:min-w-[128px]"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="w-full sm:w-auto sm:min-w-[128px]">
                Save changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto sm:min-w-[128px]">
                Close
              </Button>
              <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto sm:min-w-[128px]">
                Edit profile
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Full name"
            value={name}
            disabled={!isEditing}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label="Email address"
            value={email}
            disabled={!isEditing}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-gray-300 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Role</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{roleLabels[user.role]}</p>
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
