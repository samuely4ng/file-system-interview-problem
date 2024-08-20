import axios from "axios";

export const BASE_URL =
  "https://dc360c23-5e35-4a31-b05e-9d670c8a9ed6-00-zwu0s1ivlfgs.riker.replit.dev";

export const WS_URL =
  "dc360c23-5e35-4a31-b05e-9d670c8a9ed6-00-zwu0s1ivlfgs.riker.replit.dev";

const instance = axios.create({
  baseURL: BASE_URL, // USE ENV VARIABLE
  timeout: 20000,
});

const fileAPI = axios.create({
  baseURL: BASE_URL, // USE ENV VARIABLE OR MAKE THIS DYNAMIC
  timeout: 20000,
});

export { fileAPI };

export default instance;
