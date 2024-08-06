import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useSigner } from './utils/ethers';
import { depositToVault } from './utils/superform';
import { generatePrefilledData } from './utils/prefilledData'; // Import the utility function

const VaultActions = ({ vaultData }) => {
  const signer = useSigner();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    outputAmount: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    const prefilledData = generatePrefilledData(vaultData);

    const combinedData = {
      ...prefilledData,
      amount: ethers.parseUnits(formData.amount, 'ether'),
      outputAmount: ethers.parseUnits(formData.outputAmount, 'ether'),
    };

    try {
      const tx = await depositToVault(combinedData, signer);
      console.log('Transaction:', tx);
    } catch (error) {
      console.error('Error during deposit:', error);
    } finally {
      handleCloseModal();
    }
  };

  return (
    <div>
      <button onClick={handleOpenModal}>Deposit</button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Enter Deposit Details</h2>
            <label>
              Amount:
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Output Amount:
              <input
                type="text"
                name="outputAmount"
                value={formData.outputAmount}
                onChange={handleInputChange}
              />
            </label>
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={handleCloseModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultActions;
