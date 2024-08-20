import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";

interface FolderIconProps {
  isOpen: boolean;
}

function FolderIcon({ isOpen }: FolderIconProps): JSX.Element {
  return isOpen ? (
    <ChevronUp color="#D9D3D0" className="-ml-0.5 -mr-1" size={16} />
  ) : (
    <ChevronDown color="#D9D3D0" className="-ml-0.5 -mr-1" size={16} />
  );
}

export default FolderIcon;
