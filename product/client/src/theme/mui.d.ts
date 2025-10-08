// src/mui.d.ts
import type { ComponentsPropsList, ComponentsOverrides, ComponentsVariants } from "@mui/material/styles/overrides";

declare module "@mui/material/styles" {
  interface Components {
    MuiDataGrid?: {
      defaultProps?: ComponentsPropsList["MuiDataGrid"];
      styleOverrides?: ComponentsOverrides["MuiDataGrid"];
      variants?: ComponentsVariants["MuiDataGrid"];
    };
  }
}