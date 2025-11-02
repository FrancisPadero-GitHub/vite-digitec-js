import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./features/redux/paymentModalSlice"; // for the payment modal in payment schedules
import modalStateReducer from "./features/redux/modalStateSlice"; // for the loan product edit button or general use

export const store = configureStore({
  reducer: {
    modal: modalReducer,  // experimental
    modalState: modalStateReducer,  // general use
  },
});

export default store;
