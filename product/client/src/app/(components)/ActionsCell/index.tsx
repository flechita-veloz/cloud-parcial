"use client";

import React from "react";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { MoreVertical } from "lucide-react";
import { Menu as HeadlessMenu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";

type Action = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
};

interface ActionsCellProps {
  params: GridRenderCellParams;
  actions: Action[];
}

const ActionsCell: React.FC<ActionsCellProps> = ({ actions }) => {
  return (
    <div className="absolute">
      <HeadlessMenu as="div" className="relative inline-block text-left">
        <MenuButton className="rounded hover:bg-gray-200 p-1">
          <MoreVertical size={18} />
        </MenuButton>
        <MenuItems
          className="table-action w-36"
          style={{
            top: 0,
            right: "100%",
          }}
        >
          {actions.map((action, i) => (
            <MenuItem key={i}>
              <button
                onClick={action.onClick}
                className={`flex items-center gap-2 py-1 px-2 w-full hover:bg-gray-100 ${action.className || ""}`}
              >
                {action.icon}
                {action.label}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </HeadlessMenu>
    </div>
  );
};

export default ActionsCell;