import React, { useState, useCallback, useEffect } from "react";

/**
 * Higher Order Component for modal functionality
 * @param {React.Component} ComponentToWrap - Component to wrap
 * @returns {React.Component} - Component with modal state
 */
// eslint-disable-next-line no-unused-vars
export function withModal(ComponentToWrap) {
  return function ModalWrapper(props) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    const openModal = useCallback((data = null) => {
      setModalData(data);
      setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
      setIsOpen(false);
      setModalData(null);
    }, []);

    useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (event) => {
        if (event.key === "Escape") {
          closeModal();
        }
      };

      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, closeModal]);

    return (
      <ComponentToWrap
        {...props}
        isModalOpen={isOpen}
        modalData={modalData}
        openModal={openModal}
        closeModal={closeModal}
      />
    );
  };
}

