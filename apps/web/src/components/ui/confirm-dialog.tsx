"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ConfirmDialog({
  description,
  isPending,
  onCancel,
  onConfirm,
  open,
  title
}: {
  description: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}) {
  return (
    <Modal onClose={onCancel} open={open} title={title}>
      <p className="mb-5 text-sm text-muted">{description}</p>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} type="button" variant="secondary">
          Cancelar
        </Button>
        <Button
          disabled={isPending}
          onClick={onConfirm}
          type="button"
          variant="danger"
        >
          Confirmar
        </Button>
      </div>
    </Modal>
  );
}
