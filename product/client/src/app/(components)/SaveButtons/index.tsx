import { Button } from "@/components/ui/button";

type SaveButtonsProps = {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
};

const SaveButtons = ({
  onCancel,
  onSave,
  isSaving = false,
}: SaveButtonsProps) => {
  return (
    // <div className="flex justify-end gap-4 mt-10 flex-wrap md:flex md:justify-end md:gap-4 md:mt-10 md:flex-wrap">
    <div className="grid grid-cols-2 gap-4 md:flex md:justify-end md:gap-4 mt-8 md:flex-wrap">
        {/* BUTTON CANCEL */}
        <Button
          variant="editAction"
          onClick={onCancel}
          className="width-full text-lg font-bold"
        >
          Cancelar
        </Button>

        {/* BUTTON SAVE */}
        <Button
          variant="confirmAction"
          onClick={onSave}
          disabled={isSaving}
          className="width-full text-lg font-bold"
        >
          Guardar
        </Button>
      </div>
  );
};

export default SaveButtons;