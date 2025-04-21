import { createTheme } from "@mui/material/styles";

const themeOptions = createTheme({
  palette: {
    type: "light",
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

export default themeOptions;
