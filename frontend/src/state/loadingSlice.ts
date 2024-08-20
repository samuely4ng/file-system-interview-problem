import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

type SliceState = {
  chatLoading: boolean,
};

const initialState: SliceState = {
  chatLoading: true,
};

export const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setChatLoading(state, action: PayloadAction<boolean>) {
      state.chatLoading = action.payload;
    }
  },
});

export const { setChatLoading } =
loadingSlice.actions;

export const selectChatLoading = createSelector(
  (state: any) => state.loading.chatLoading,
  (chatLoading) => chatLoading
);

export default loadingSlice.reducer;
