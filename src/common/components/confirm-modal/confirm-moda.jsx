import React from 'react';
import { Button } from '../button/button';

export default function ConfirmModal({
  open,
  title,
  loading,
  message,
  onCancel,
  onConfirm
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <h3 className="text-lg font-bold mb-2">{title || 'Confirm'}</h3>
        <p className="mb-4">{message || 'Are you sure?'}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'Loading...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}
