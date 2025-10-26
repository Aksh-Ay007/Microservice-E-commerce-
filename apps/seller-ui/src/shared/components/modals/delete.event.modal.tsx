import { X, Loader2, AlertTriangle } from "lucide-react";

const DeleteEventModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  eventName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  eventName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-semibold text-white">Delete Event</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            disabled={isDeleting}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="mb-6">
          <p className="text-gray-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">"{eventName}"</span>?
          </p>
          <p className="text-gray-400 mt-2 text-sm">
            This action cannot be undone. The event will be permanently removed.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventModal;
