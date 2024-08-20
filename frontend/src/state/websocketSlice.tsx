import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dispatch, GetState } from "./store";
import { selectFile } from "#/services/fileService";
import { loadFiles, removeFile, setActiveFilepath, setCode } from "./codeSlice";
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
  (message: any[]) => async (dispatch: Dispatch, getState: GetState) => {
    const activeFilepath = getState().code.path;

    message.forEach(async (msg) => {
      const editedPath = msg.path.split("home/runner/File-System-Backend/")[1];

      // there is a bug in the backend where
      // the "modified" status is being sent as created
      // so we should handle it here by checking if the edited filepath is the current filepath...
      if (msg.status === "created") {
        const isActiveFilepath = activeFilepath === editedPath;
        if (isActiveFilepath) {
          // update the file in the directory
          const newCode = await selectFile(activeFilepath);
          dispatch(setCode(newCode));
        } else {
          // update the files fro the right directory...
          const folder = editedPath.split("/").slice(0, -1).join("/");
          dispatch(loadFiles(folder, false));
        }
      }

      if (msg.status === "deleted") {
        // update the files fro the right directory...
        dispatch(removeFile(editedPath));
        if (activeFilepath === editedPath) {
          dispatch(setActiveFilepath(""));
        }
      }
    });
  };

export const startWebsocket =
  () => (dispatch: Dispatch, getState: GetState) => {
    const { activeWebsocket } = getState().websocket;

    if (activeWebsocket) {
      activeWebsocket?.close?.();
    }

    // TO-DO: NEED TO UPDATE THIS WITH THE PROPER URL
    const newFileWebsocket = new Session(
      `${WS_URL}/fs/update_stream/`,
      (message) => dispatch(consumeLatestMessage(message)),
    );
    dispatch(setActiveWebsocket(newFileWebsocket._socket));
  };

export default websocketSlice.reducer;
