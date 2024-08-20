import { createSelector, createSlice } from "@reduxjs/toolkit";
import { Dispatch } from "redux";
import { listFiles } from "#/services/fileService";
import { GetState } from "./store";

export interface File {
  is_dir: boolean;
  mtime: number;
  path: string;
  size: number;
  isOpen?: boolean;
  children?: string[];
  parent?: string;
}

export const initialState = {
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

const processFolder = async (
  path: string,
  files: Object,
  loadMore: boolean = true,
) => {
  const children = await listFiles(path);

  // Process folders
  children?.forEach(async (child: File) => {
    if (path?.length > 0) {
      child.parent = path;

      if (!files[path].children?.includes(child.path)) {
        files[path] = {
          ...files[path],
          children: [...(files[path].children || []), child.path],
        };
      }
    }

    files[child.path] = { ...(files[child.path] || {}), ...child };

    // Recursively process child folders
    if (
      child?.is_dir &&
      files[child.path]?.isOpen &&
      child.path !== path &&
      loadMore
    ) {
      await processFolder(child.path, files); // Recursive call
    }
  });
};

// loads the files in a particular path into redux
export const loadFiles =
  (startPath: string = "", loadMore: boolean = true) =>
  async (dispatch: Dispatch, getState: GetState) => {
    const currFiles = { ...(getState().code.files || {}) };

    try {
      // Start with the start path
      await processFolder(startPath, currFiles, loadMore);

      // Dispatch success action
      dispatch(setFiles(currFiles));
    } catch (error) {
      // Handle error
      console.error("Failed to load files and folders", error);
    }
  };

export default codeSlice.reducer;
