import React from "react";
import styles from "../App.module.css";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  guestName: string;
  setGuestName: (val: string) => void;
  roomNumber: string;
  setRoomNumber: (val: string) => void;
  bookingStatus: "idle" | "loading" | "success" | "error";
  errorMessage: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  guestName,
  setGuestName,
  roomNumber,
  setRoomNumber,
  bookingStatus,
  errorMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {bookingStatus === "success" && (
          <div style={{ textAlign: "center" }}>
            <h2 className={styles.modalHeader}>Booking Confirmed!</h2>
            <p>Enjoy your luxury stay at our resort.</p>
            <button className={styles.btnConfirm} onClick={onClose}>
              Great!
            </button>
          </div>
        )}

        {bookingStatus === "error" && (
          <div style={{ textAlign: "center" }}>
            <h2 className={styles.modalHeader} style={{ color: "red" }}>
              Oops!
            </h2>
            <p>{errorMessage}</p>
            <button className={styles.btnConfirm} onClick={onClose}>
              Try Again
            </button>
          </div>
        )}

        {(bookingStatus === "idle" || bookingStatus === "loading") && (
          <>
            <h2 className={styles.modalHeader}>Book Your Cabana</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                Guest Name:
              </label>
              <input
                className={styles.modalInput}
                placeholder="e.g. Alice Smith"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                autoFocus
              />
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                Room Number:
              </label>
              <input
                className={styles.modalInput}
                placeholder="e.g. 101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.btnCancel}
                onClick={onClose}
                disabled={bookingStatus === "loading"}
              >
                Cancel
              </button>
              <button
                className={styles.btnConfirm}
                onClick={onConfirm}
                disabled={
                  !guestName || !roomNumber || bookingStatus === "loading"
                }
              >
                {bookingStatus === "loading"
                  ? "Processing..."
                  : "Confirm Booking"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
