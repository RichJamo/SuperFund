import React from "react";
import Modal from "react-modal";

interface NewUserModalViewProps {
  isOpen: boolean;
  onRequestClose: () => void;
  username: string;
  isLoading: boolean;
  onChangeUsername: (username: string) => void;
  onCreateAccount: () => void;
  onAddUser: (username: string, walletAddress: string) => void; // Add this line
}

const NewUserModalView: React.FC<NewUserModalViewProps> = ({
  isOpen,
  onRequestClose,
  username,
  isLoading,
  onChangeUsername,
  onCreateAccount
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          padding: "20px",
          backgroundColor: "#ffffff"
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)"
        }
      }}
    >
      <h2 className="text-lg font-bold mb-4 text-gray-900">Add New Client</h2>
      <div className="flex flex-col space-y-4">
        <label className="flex flex-col text-gray-800">
          <span className="mb-2 text-gray-900">Username</span>
          <input
            type="text"
            value={username}
            onChange={e => onChangeUsername(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
        </label>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onRequestClose}
            className="p-2 bg-gray-500 text-white rounded"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onCreateAccount}
            className="p-2 bg-green-500 text-white rounded"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NewUserModalView;
