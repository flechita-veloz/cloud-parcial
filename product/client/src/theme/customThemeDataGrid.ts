// theme.ts
import { createTheme, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material';
import { gridClasses } from '@mui/x-data-grid';

export default function getCustomTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
    },
    components: {
      MuiDataGrid: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            [`& .${gridClasses.row}.odd`]: {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? alpha('#1E293B', 0.6)
                  : alpha('#F3F4F6', 0.8),
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? alpha('#3B82F6', 0.3)
                    : alpha('#E0F2FE', 0.9),
              },
            },
            [`& .${gridClasses.row}.even`]: {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? alpha('#0F172A', 0.6)
                  : alpha('#FFFFFF', 0.9),
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? alpha('#3B82F6', 0.3)
                    : alpha('#E0F2FE', 0.9),
              },
            },
            [`& .MuiDataGrid-columnHeaderCheckbox`]: { 
              backgroundColor:
                theme.palette.mode === 'dark' ? '#f3f4f6' : '#1f2937',
              color: '#FFFFFF'
            },
            [`& .MuiCheckbox-root`]: {
              color: '#000000', 
              '&.Mui-checked': {
                color: '#3b82f6', 
              },
            },
          }),
        },
      },
    },
  });
}