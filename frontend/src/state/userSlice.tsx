import { createSelector, createSlice } from "@reduxjs/toolkit";
import { Dispatch, GetState } from "./store";
import instance from "#/services/api";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    token: "", // JWT token
    showSidebar: true,
  },
  reducers: {
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    updateToken: (state, action) => {
      state.token = action.payload;
    },
    updateShowSidebar: (state, action) => {
      state.showSidebar = action.payload;
    },
  },
});

export const {
  updateUser: _updateUser,
  updateToken,
  updateShowSidebar,
} = userSlice.actions;

export const fetchUser =
  (id: string) => async (dispatch: Dispatch, getState: GetState) => {
    try {
      const { data } = await instance.get(`/users/${id}`);
      dispatch(_updateUser(data));
      return data;
    } catch (error) {
      console.log("error status...", error?.response?.status);
      console.error("error getting user...", error?.message);
      // return the error status so we can check if it's a 404
      return error?.response?.status;
    }
  };

export const updateUser =
  (user: any) => async (dispatch: Dispatch, getState: GetState) => {
    try {
      const id = getState().user.user?.id;
      const { data } = await instance.put(`/users/${id}`, user);
      dispatch(_updateUser(data));
    } catch (error) {
      console.error("error updating user...", error?.message);
    }
  };

export const selectUser = createSelector(
  (state: any) => state.user.user,
  (user) => user,
);

export const selectShowSidebar = createSelector(
  (state: any) => state.user.showSidebar,
  (showSidebar) => showSidebar,
);

export default userSlice.reducer;
