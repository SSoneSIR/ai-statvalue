"use client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

export function LogoutConfirmation({
  onLogoutAction,
}: {
  onLogoutAction: () => void;
}) {
  const [open, setOpen] = useState(false);

  const handleConfirmLogout = () => {
    // Execute logout and then close dialog
    onLogoutAction();
  };

  const logout = () => {
    handleConfirmLogout();
    setOpen(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="flex items-center text-red-700 gap-2 px-4 py-2 rounded-md bg-destructive  hover:bg-destructive/90 transition">
          Logout
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white text-black">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-black">
            Logging out will redirect you to the login page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-200 text-black hover:bg-gray-300 transition">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={logout}
            className="bg-indigo-600 hover:bg-purple-600 text-white transition"
          >
            Yes, Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
