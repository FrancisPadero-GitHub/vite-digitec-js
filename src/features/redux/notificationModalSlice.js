import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  selectedNotif: null,
};

const notificationModalSlice = createSlice({
  name: "notificationModal",
  initialState,
  reducers: {
    openNotificationModal: (state, action) => {
      state.isOpen = true;
      state.selectedNotif = action.payload || null;
    },
    closeNotificationModal: (state) => {
      state.isOpen = false;
      state.selectedNotif = null;
    },
    setSelectedNotification: (state, action) => {
      state.selectedNotif = action.payload;
    },
  },
});

export const notificationModalState = (state) => state.notificationModal;
export const { openNotificationModal, closeNotificationModal, setSelectedNotification } = notificationModalSlice.actions;
export default notificationModalSlice.reducer;
