import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { useDispatch } from "react-redux";
import CodeEditor from "./components/CodeEditor";
import { startWebsocket } from "./state/websocketSlice";

function App(): JSX.Element {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(startWebsocket());
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex flex-row grow bg-dark-900 text-white min-h-0">
        <CodeEditor key="code" />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
