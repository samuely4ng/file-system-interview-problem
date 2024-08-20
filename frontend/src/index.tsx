// import React from "react";
import * as React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { NextUIProvider } from "@nextui-org/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { persistor, store } from "#/state/store";
import "#/i18n";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <React.Suspense
        fallback={
          /* <div className="flex justify-center items-center h-screen bg-neutral-900 w-full">
            <Loading size={12} />
          </div> */
          <div className="bg-dark-900 w-full h-screen" />
        }
      >
        <PersistGate loading={null} persistor={persistor}>
          <NextUIProvider>
            <RouterProvider router={router} />
          </NextUIProvider>
        </PersistGate>
      </React.Suspense>
    </Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
