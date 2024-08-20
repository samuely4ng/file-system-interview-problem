import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoFileTray } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { listFiles, selectFile, uploadFiles } from "#/services/fileService";
import ExplorerTree from "./ExplorerTree";
import toast from "#/utils/toast";
import {
  loadFiles,
  selectActiveFilepath,
  selectRootFiles,
  setCode,
  setFiles,
} from "#/state/codeSlice";
import ExplorerActions from "./ExplorerActions";

function FileExplorer() {
  const [isHidden, setIsHidden] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const files = useSelector(selectRootFiles);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const dispatch = useDispatch();

  const activeFilepath = useSelector(selectActiveFilepath);

  const selectFileInput = () => {
    fileInputRef.current?.click(); // Trigger the file browser
  };

  const refreshWorkspace = async () => {
    // LOAD ALL ACTIVE FILES...
    // dispatch(setFiles({}));
    dispatch(loadFiles(""));

    console.log("activeFilepath::", activeFilepath);
    if (activeFilepath) {
      const newCode = await selectFile(activeFilepath);
      dispatch(setCode(newCode));
    }
  };

  const uploadFileData = async (toAdd: FileList) => {
    try {
      await uploadFiles(toAdd);
      await refreshWorkspace();
    } catch (error) {
      toast.error("ws", "Error uploading file");
    }
  };

  React.useEffect(() => {
    refreshWorkspace();
  }, []);

  React.useEffect(() => {
    const enableDragging = () => {
      setIsDragging(true);
    };

    const disableDragging = () => {
      setIsDragging(false);
    };

    document.addEventListener("dragenter", enableDragging);
    document.addEventListener("drop", disableDragging);

    return () => {
      document.removeEventListener("dragenter", enableDragging);
      document.removeEventListener("drop", disableDragging);
    };
  }, []);

  if (!files.length) {
    return null;
  }

  return (
    <div className="relative">
      {isDragging && (
        <div
          data-testid="dropzone"
          onDrop={(event) => {
            event.preventDefault();
            uploadFileData(event.dataTransfer.files);
          }}
          onDragOver={(event) => event.preventDefault()}
          className="z-10 absolute flex flex-col justify-center items-center bg-black top-0 bottom-0 left-0 right-0 opacity-65"
        >
          <IoFileTray size={32} />
          <p className="font-bold text-xl">Drop Files Here</p>
        </div>
      )}
      <div
        className={twMerge(
          "bg-dark-500 h-full border-r-1 border-r-gray-600 flex flex-col transition-all ease-soft-spring overflow-auto",
          isHidden ? "min-w-[48px]" : "min-w-[228px]",
        )}
      >
        <div className="flex flex-col px-2 relative">
          <div className="flex items-center justify-end mb-8">
            <ExplorerActions
              isHidden={isHidden}
              toggleHidden={() => setIsHidden((prev) => !prev)}
              onRefresh={refreshWorkspace}
              onUpload={selectFileInput}
            />
          </div>

          <div style={{ display: isHidden ? "none" : "block" }}>
            <ExplorerTree files={files} />
          </div>
        </div>
        <input
          data-testid="file-input"
          type="file"
          multiple
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(event) => {
            if (event.target.files) {
              uploadFileData(event.target.files);
            }
          }}
        />
      </div>
    </div>
  );
}

export default React.memo(FileExplorer);
