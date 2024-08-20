import {
  legacy_createStore as createStore,
  combineReducers,
  applyMiddleware,
} from "redux";
import thunkMiddleware, { ThunkDispatch } from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { composeWithDevTools } from "redux-devtools-extension";
import codeReducer from "./codeSlice";
import loadingReducer from "./loadingSlice";
import websocketReducer from "./websocketSlice";

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["loading"],
};

export const rootReducer = combineReducers({
  code: codeReducer,
  loading: loadingReducer,
  websocket: websocketReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const enhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

const store = createStore(persistedReducer, enhancer);

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type Dispatch = ThunkDispatch<RootState, unknown, any>;
export type GetState = () => RootState;

export { store, persistor };

export default store;
