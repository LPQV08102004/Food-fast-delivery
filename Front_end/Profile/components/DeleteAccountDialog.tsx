import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertTriangle } from 'lucide-react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteAccount: () => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onDeleteAccount,
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const CONFIRM_PHRASE = 'DELETE';

  const handleDelete = () => {
    if (confirmText === CONFIRM_PHRASE) {
      onDeleteAccount();
      setConfirmText('');
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-red-500">
              Delete Account
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                <strong>Warning:</strong> This action cannot be undone!
              </p>
            </div>
            
            <div className="space-y-2 text-gray-700">
              <p>Deleting your account will:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Permanently remove all your personal information</li>
                <li>Delete your order history</li>
                <li>Cancel any pending orders</li>
                <li>Remove all saved addresses and payment methods</li>
                <li>Revoke access to your account immediately</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="confirmDelete" className="text-gray-700">
                Type <span className="text-red-500 px-1">{CONFIRM_PHRASE}</span> to
                confirm:
              </Label>
              <Input
                id="confirmDelete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                className="border-red-200 focus:border-red-500"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText('')}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={confirmText !== CONFIRM_PHRASE}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
