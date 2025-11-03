import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: {
    isOpen: false,
    mode: null, // 'loanAccount' | 'loanApplication' | null
    type: null,  // 'add' | 'edit' | null
    data: null,
  },
};

const modalStateSlice = createSlice({
  name: "modalState",
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.value.isOpen = true;
      state.value.type = "add";
      state.value.mode = action.payload.mode;
      state.value.data = action.payload.data;
    },
    editModal: (state, action) => {
      state.value.isOpen = true;
      state.value.type = "edit";
      state.value.mode = action.payload.mode;
      state.value.data = action.payload.data;

    },
    closeModal: (state) => {
      state.value.isOpen = false;
      state.value.type = null;
      state.value.data = null;
      state.value.mode = null;  // always reset to a clean state
    },

  },
});

export const modalData = (state) => state.modalState.value;
export const { openModal, closeModal, editModal } = modalStateSlice.actions;
export default modalStateSlice.reducer;