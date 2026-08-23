"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";

type DeleteConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  confirmationText?: string;
};

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete item?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  isDeleting: externalIsDeleting = false,
  confirmationText,
}: DeleteConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [typedConfirmation, setTypedConfirmation] = useState("");

  const isDeleting = externalIsDeleting || isConfirming;

  const requiresConfirmation = Boolean(confirmationText);

  const confirmationValid =
    !requiresConfirmation || typedConfirmation.trim() === confirmationText;

  const handleConfirm = async () => {
    if (!confirmationValid || isDeleting) return;

    setIsConfirming(true);

    try {
      await onConfirm();
      setTypedConfirmation("");
      onOpenChange(false);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return;

    if (!nextOpen) {
      setTypedConfirmation("");
    }

    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {requiresConfirmation ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type{" "}
              <span className="font-semibold text-foreground">
                {confirmationText}
              </span>{" "}
              to confirm.
            </p>

            <Input
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder={confirmationText}
              autoComplete="off"
              disabled={isDeleting}
            />
          </div>
        ) : null}

        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || !confirmationValid}
          >
            {isDeleting ? (
              <>
                <Spinner />
                Deleting…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
