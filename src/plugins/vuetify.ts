import "vuetify/styles";
import { createVuetify } from "vuetify";

export default createVuetify({
  icons: {
    defaultSet: "mdi",
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: "#1867C0",
          secondary: "#5CBBF6",
        },
      },
    },
  },
});
