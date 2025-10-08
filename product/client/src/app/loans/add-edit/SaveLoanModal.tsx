import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanNumber: number;
}


const SaveLoanModal: React.FC<LoanModalProps> = ({ isOpen, onClose, loanNumber}) => {
  const router = useRouter();
  const handleBack = () => {
    onClose(); 
    router.back(); 
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/6 bg-white shadow-lg rounded-lg">
  
        {/* HEADER MODAL */}
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold">
            Completar venta
          </DialogTitle>
        </DialogHeader>
  
        {/* CONTENT MODAL */}
        <p>El pase <strong>{loanNumber}</strong> fue guardada con éxito.</p>
  
        {/* FOOTER WITH FINISH BUTTON */}
        <DialogFooter className="flex justify-end">
          <Button onClick={handleBack} variant="default">
            Finalizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
};
export default SaveLoanModal;