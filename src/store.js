import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./features/redux/modalSlice"; // Add this import
// ...other imports...

export const store = configureStore({
  reducer: {
    modal: modalReducer, // Add this line
    // ...other reducers...
  },
});

export default store;
