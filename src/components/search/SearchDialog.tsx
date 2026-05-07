import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SearchCommand } from "@/components/search/SearchCommand";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 shadow-2xl sm:max-w-[640px] top-[10%] sm:top-[80px] translate-y-0 data-[state=open]:slide-in-from-top-[2%]"
        aria-describedby={undefined}
      >
        <VisuallyHidden>
          <DialogTitle>Search products and brands</DialogTitle>
        </VisuallyHidden>
        <SearchCommand onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
