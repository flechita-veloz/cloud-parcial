import React from "react";

interface RemoveClientModalProps {
    isOpen: boolean;
    message: React.ReactNode; // Recibe el mensaje dinámico
    onClose: () => void;
    onConfirm: () => void;
}

const RemoveClientModal: React.FC<RemoveClientModalProps> = ({ isOpen, message, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
                <h2 className="text-lg font-bold">Eliminar cliente</h2>
                <p className="mt-2">{typeof message === "string" ? message : <>{message}</>}</p>
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemoveClientModal;
