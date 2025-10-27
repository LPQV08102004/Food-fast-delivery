import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { DeleteAccountDialog } from './DeleteAccountDialog';
import { Lock, Trash2 } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangePassword: (oldPassword: string, newPassword: string) => void;
  onDeleteAccount: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  onChangePassword,
  onDeleteAccount,
}: SettingsDialogProps) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-orange-500">Account Settings</DialogTitle>
            <DialogDescription>
              Manage your account security and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card className="border-orange-200 hover:border-orange-500 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <Button
                  onClick={() => {
                    setChangePasswordOpen(true);
                    onOpenChange(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-start gap-4 w-full">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Lock className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-orange-500">Change Password</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Update your password to keep your account secure
                      </p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200 hover:border-red-500 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <Button
                  onClick={() => {
                    setDeleteAccountOpen(true);
                    onOpenChange(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-start gap-4 w-full">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-red-500">Delete Account</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        onChangePassword={onChangePassword}
      />

      <DeleteAccountDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        onDeleteAccount={onDeleteAccount}
      />
    </>
  );
}
