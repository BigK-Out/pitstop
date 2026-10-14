import { useEffect, useRef } from "react";

// Native <dialog> as a modal: browser handles focus trapping, Esc and focus return.
export default function Modal({ open, onClose, className, labelledBy, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const isOpen = dialog.hasAttribute("open");
    if (open && !isOpen) dialog.showModal();
    if (!open && isOpen) dialog.close();
  }, [open]);

  return (
    // Backdrop clicks land on the <dialog> itself; keyboard users close with Esc.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={className}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
