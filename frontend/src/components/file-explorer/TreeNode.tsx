import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { twMerge } from "tailwind-merge";
import FolderIcon from "../FolderIcon";
import FileIcon from "../FileIcons";
import { listFiles, selectFile } from "#/services/fileService";
import {
  setCode,
  setActiveFilepath,
  selectActiveFilepath,
  File,
  selectFileFromPath,
  loadFiles,
  updateFile,
} from "#/state/codeSlice";
import { RootState } from "#/state/store";

interface TitleProps {
  name: string;
  type: "folder" | "file";
  isOpen: boolean;
  onClick: () => void;
}

function Title({ name, type, isOpen, onClick }: TitleProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-[5px] p-1 nowrap flex items-center gap-2 aria-selected:bg-neutral-600 aria-selected:text-white hover:text-white duration-200"
    >
      {type === "folder" && <FolderIcon isOpen={isOpen} />}
      {type === "file" && <FileIcon filename={name} />}
      {name}
    </div>
  );
}

interface TreeNodeProps {
  path: string;
}

function TreeNode({ path }: TreeNodeProps) {
  const file = useSelector((state: RootState) =>
    selectFileFromPath(state, path),
  );
  const { is_dir: isDirectory, isOpen, children: _children } = file || {};
  const children = _children?.filter((child: string) => child !== path);
  const activeFilepath = useSelector(selectActiveFilepath);

  const dispatch = useDispatch();

  const refreshChildren = async () => {
    if (!isDirectory || !isOpen) {
      return;
    }
    dispatch(loadFiles(path));
  };

  React.useEffect(() => {
    refreshChildren();
  }, [isOpen]);

  if (!file) {
    return <div />;
  }

  const fileParts = path.split("/");
  const filename =
    fileParts[fileParts.length - 1] || fileParts[fileParts.length - 2];

  const handleClick = async () => {
    if (isDirectory) {
      dispatch(
        updateFile({
          path,
          isOpen: !isOpen,
        }),
      );
    } else {
      const newCode = await selectFile(path);
      dispatch(setCode(newCode));
      dispatch(setActiveFilepath(path));
    }
  };

  return (
    <div
      className={twMerge(
        "text-sm text-neutral-400",
        path === activeFilepath ? "bg-gray-700" : "",
      )}
    >
      <Title
        name={filename}
        type={isDirectory ? "folder" : "file"}
        isOpen={isOpen}
        onClick={handleClick}
      />

      {isOpen && children?.length && (
        <div className="ml-5">
          {children.map((child: string) => (
            <TreeNode key={child} path={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(TreeNode);
