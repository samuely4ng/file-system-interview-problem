import React from "react";
import TreeNode from "./TreeNode";

interface ExplorerTreeProps {
  files: any[];
}

function ExplorerTree({ files }: ExplorerTreeProps) {
  return (
    <div className="w-full overflow-x-auto h-full pt-[4px]">
      {files.map((file) => (
        <TreeNode key={file.path} path={file.path} />
      ))}
    </div>
  );
}

export default ExplorerTree;
