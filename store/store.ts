import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slices/counterSlice";
import userReducer from "./slices/userSlice";
import componentReducer from "./slices/componentSlice";
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    component:componentReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
