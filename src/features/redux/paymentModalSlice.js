/**
 * Redux slice for managing modal states throughout the application
 * Currently handles loan payment modal state management
 */
import { createSlice } from "@reduxjs/toolkit";

/**
 * Initial state for all modals in the application
 * @property {Object} loanPaymentModal - State for loan payment modal
 * @property {boolean} loanPaymentModal.isOpen - Controls modal visibility
 * @property {string|null} loanPaymentModal.type - Modal operation type ('add' or 'edit')
 * @property {Object|null} loanPaymentModal.data - Data to be passed to the modal (e.g., loan details for editing)
 */
const initialState = {
  loanPaymentModal: {
    isOpen: false,
    type: null, // 'add' | 'edit' | null
    data: null,
  },
};

/**
 * Modal slice for centralized modal state management using Redux Toolkit
 * Provides actions and reducers for opening and closing modals
 */
const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    /**
     * Opens the loan payment modal with specified configuration
     * @param {Object} state - Current state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - Modal configuration
     * @param {string} action.payload.type - Operation type ('add' or 'edit')
     * @param {Object} action.payload.data - Optional data for the modal (required for 'edit' type)
     */
    openLoanPaymentModal: (state, action) => {
      state.loanPaymentModal.isOpen = true;
      state.loanPaymentModal.type = action.payload.type || "add";
      state.loanPaymentModal.data = action.payload.data || null;
    },

    /**
     * Closes the loan payment modal and resets its state
     * Clears all modal data to prevent stale data on next open
     * @param {Object} state - Current state
     */
    closeLoanPaymentModal: (state) => {
      state.loanPaymentModal.isOpen = false;
      state.loanPaymentModal.type = null;
      state.loanPaymentModal.data = null;
    },
  },
});

// Export action creators for use in components
export const { openLoanPaymentModal, closeLoanPaymentModal } =
  modalSlice.actions;

/**
 * Selector to retrieve loan payment modal state from Redux store
 * @param {Object} state - Redux root state
 * @returns {Object} Current loan payment modal state (isOpen, type, data)
 * @example
 * const modalState = useSelector(selectModalData);
 * // { isOpen: true, type: 'edit', data: { loanId: 123, amount: 5000 } }
 */
export const selectModalData = (state) => state.modal.loanPaymentModal;

// Export the reducer to be included in the Redux store configuration
export default modalSlice.reducer;
