import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./AlertDialog";
import { useCustomDialogContext } from "./useCustomDialogContext";
import { Outlet } from "react-router-dom";
import { Button } from "../button/button";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

const CustomDialog = () => {
  const { customDialog } = useCustomDialogContext();

  const renderIcon = () => {
    switch (customDialog.type) {
      case "success":
        return (
          <CircleCheckIcon strokeWidth={2} className="h-5 w-5 text-green-500" />
        );
      case "error":
        return (
          <CircleAlertIcon strokeWidth={2} className="h-5 w-5 text-red-500" />
        );
      default:
        return null;
    }
  };
  const titleStyle =
    customDialog.type === "error"
      ? "text-red-500"
      : customDialog.type === "success"
        ? "text-green-500"
        : "";

  const icon = renderIcon();

  return (
    <>
      {customDialog.requiresAction ? (
        <AlertDialog open={Boolean(customDialog.message)}>
          <AlertDialogContent className="w-fit min-w-96 max-w-xl gap-6">
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                {icon}
                <AlertDialogTitle className={titleStyle}>
                  {customDialog.title}
                </AlertDialogTitle>
              </div>
            </AlertDialogHeader>

            <AlertDialogDescription>
              {customDialog.message}
            </AlertDialogDescription>
            {customDialog.children}

            <AlertDialogFooter className="flex justify-end">
              <AlertDialogCancel
                onClick={customDialog.closeHandler}
                className="min-w-28"
              >
                {customDialog.closeText || "Cancelar"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={customDialog.confirmHandler}
                className="min-w-28"
              >
                {customDialog.confirmText || "Confirmar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Dialog
          open={Boolean(customDialog.message)}
          onOpenChange={customDialog.closeHandler}
        >
          <DialogContent className="w-fit min-w-96 max-w-xl gap-6">
            <DialogHeader>
              <div className="flex items-center gap-2">
                {icon}
                <DialogTitle className={titleStyle}>
                  {customDialog.title}
                </DialogTitle>
              </div>
            </DialogHeader>

            <DialogDescription>{customDialog.message}</DialogDescription>
            {customDialog.children}

            <DialogFooter className="flex w-full justify-center">
              <Button onClick={customDialog.closeHandler} className="min-w-28">
                {customDialog.closeText || "Ok"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Outlet />
    </>
  );
};

export default CustomDialog;
