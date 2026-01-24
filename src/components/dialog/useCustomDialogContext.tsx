import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import CustomDialog from "./CustomDialog";

interface CustomDialogContextProps {
  title?: string;
  message?: string;
  type?: "default" | "success" | "error";
  requiresAction?: boolean;
  closeHandler?: () => void;
  closeText?: string;
  confirmHandler?: () => void;
  confirmText?: string;
  children?: React.ReactNode;
}

type SetCustomDialogState = Dispatch<SetStateAction<CustomDialogContextProps>>;

const CustomDialogContext = createContext<{
  customDialog: CustomDialogContextProps;
  setCustomDialog: SetCustomDialogState;
}>({
  customDialog: {} as CustomDialogContextProps,
  setCustomDialog: () => {},
});

const useCustomDialogContext = () => useContext(CustomDialogContext);

const CustomDialogContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [customDialog, setCustomDialog] = useState<CustomDialogContextProps>(
    {}
  );

  return (
    <CustomDialogContext.Provider value={{ customDialog, setCustomDialog }}>
      {children}
      {customDialog.message && <CustomDialog />}
    </CustomDialogContext.Provider>
  );
};

export { useCustomDialogContext, CustomDialogContextProvider };
