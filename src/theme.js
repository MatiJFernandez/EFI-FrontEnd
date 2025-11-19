import { createTheme } from '@mui/material/styles'

const COLORS = {
  primary: '#ff7a1d',
  primarySoft: '#ff9a4d',
  bg: '#0e0e10',
  surface: '#151518',
  border: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.06)',
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: COLORS.primary },
    secondary: { main: COLORS.primarySoft },
    background: {
      default: COLORS.bg,
      paper: COLORS.surface,
    },
    success: { main: '#2e7d32' },
    info: { main: '#1976d2' },
    warning: { main: '#ed6c02' },
    error: { main: '#c62828' },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h3: { fontWeight: 800, letterSpacing: .2 },
    h4: { fontWeight: 800, letterSpacing: .2 },
    h5: { fontWeight: 700 },
    button: { fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: COLORS.bg,
          backgroundImage: 'radial-gradient(1200px 600px at 10% -10%, rgba(255,122,29,0.08), transparent 60%), radial-gradient(800px 400px at 110% 10%, rgba(255,122,29,0.06), transparent 60%)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(180deg, rgba(21,21,24,0.95) 0%, rgba(21,21,24,0.85) 100%)',
          backdropFilter: 'saturate(160%) blur(8px)'
        },
      },
      defaultProps: {
        color: 'transparent',
        elevation: 0,
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid',
          borderColor: COLORS.border,
          borderRadius: 16,
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, textTransform: 'none' },
        contained: { boxShadow: '0 8px 24px rgba(255,122,29,0.25)' },
        outlined: { borderColor: COLORS.border },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 700 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid',
          borderColor: COLORS.border,
          borderRadius: 16,
          background: COLORS.surface,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: COLORS.divider },
      },
    },
  },
})

export default theme
