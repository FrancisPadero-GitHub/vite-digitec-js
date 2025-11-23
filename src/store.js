import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./features/redux/paymentModalSlice"; // for the payment modal in payment schedules
import modalStateReducer from "./features/redux/modalStateSlice"; // for the loan product edit button or general use
import notificationModalReducer from "./features/redux/notificationModalSlice"; // for notification modal management

export const store = configureStore({
  reducer: {
    modal: modalReducer,  // experimental
    modalState: modalStateReducer,  // general use
    notificationModal: notificationModalReducer,  // notification modal
  },
});

export default store;
