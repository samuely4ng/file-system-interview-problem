import { createSelector, createSlice } from "@reduxjs/toolkit";
import { listFiles } from "#/services/fileService";
import { GetState, Dispatch } from "./store";

export interface File {
  is_dir: boolean;
  mtime: number;
  path: string;
  size: number;
  isOpen?: boolean;
  children?: string[];
  parent?: string;
}

// files is a map of path to File objects
// study the File interface above
// to determine how to implement this

interface InitialState {
  code: string;
  path: string;
  files: Record<string, File>;
}

export const initialState: InitialState = {
  code: "",
  path: "",
  files: {},
};

export const codeSlice = createSlice({
  name: "code",
  initialState,
  reducers: {
    setCode: (state, action) => {
      state.code = action.payload;
    },
    setActiveFilepath: (state, action) => {
      state.path = action.payload;
    },
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    updateFile: (state, action) => {
      state.files[action.payload.path] = {
        ...(state.files[action.payload.path] || {}),
        ...action.payload,
      };
    },
    removeFile: (state, action) => {
      delete state.files[action.payload];
    },
  },
});

export const { setCode, setActiveFilepath, setFiles, updateFile, removeFile } =
  codeSlice.actions;

export const selectActiveFilepath = createSelector(
  (state) => state.code.path,
  (path) => path,
);

export const selectCode = createSelector(
  (state) => state.code.code,
  (code) => code,
);

// select a particular file from the state
export const selectFileFromPath = createSelector(
  [(state) => state.code.files || {}, (state, path: string) => path],
  (files, path) => files[path],
);

// select root files
export const selectRootFiles = createSelector(
  (state) => state.code.files || {},
  (files) => Object.values(files).filter((file: File) => !file.parent),
);

// TO-DO (PROBLEM #1)
// LOAD THE FILES AND FOLDERS INTO THE REDUX STORE
// in the format described in the File interface above
// this function should update the files that is passed in

const processFolder = async (path: string, files: Record<string, File>) => {
  const children = await listFiles(path);

  // TO-DO:
  // Implement this
};

// loads the files in a particular path into redux
export const loadFiles =
  (startPath: string = "") =>
  async (dispatch: Dispatch, getState: GetState) => {
    // THE CURRENT FILES (you may need to use this)
    const currFiles = { ...(getState().code.files || {}) };

    try {
      // update currFiles with the file data loaded from the API
      await processFolder(startPath, currFiles);

      // update the redux store with the new version of currFiles
      dispatch(setFiles(currFiles));
    } catch (error) {
      // Handle error
      console.error("Failed to load files and folders", error);
    }
  };

export default codeSlice.reducer;
