import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dispatch, GetState } from "./store";
import Session from "#/services/session";
import { WS_URL } from "#/services/api";

type SliceState = {
  activeWebsocket: WebSocket | null;
};

const initialState: SliceState = {
  activeWebsocket: null,
};

export const websocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    setActiveWebsocket: (state, action: PayloadAction<WebSocket | null>) => {
      state.activeWebsocket = action.payload;
    },
  },
});

export const { setActiveWebsocket } = websocketSlice.actions;

export const selectActiveWebsocket = createSelector(
  (state: { websocket: SliceState }) => state.websocket,
  (websocket) => websocket.activeWebsocket,
);

// need the type
export const consumeLatestMessage =
  (message) => async (dispatch: Dispatch, getState: GetState) => {
    // the current active filepath that is opened
    const activeFilepath = getState().code.path;

    message.forEach(async (msg) => {
      // TO-DO (PROBLEM #2)
      // handle file updates in real-time
    });
  };

export const startWebsocket =
  () => (dispatch: Dispatch, getState: GetState) => {
    const { activeWebsocket } = getState().websocket;

    if (activeWebsocket) {
      activeWebsocket?.close?.();
    }

    const newFileWebsocket = new Session(
      `${WS_URL}/fs/update_stream/`,
      (message) => dispatch(consumeLatestMessage(message)),
    );
    dispatch(setActiveWebsocket(newFileWebsocket._socket));
  };

export default websocketSlice.reducer;
