import { ComponentData } from "@/types/ComponentData";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ComponentState {
  component: ComponentData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ComponentState = {
  component: null,
  loading: false,
  error: null,
};

export const componentSlice = createSlice({
  name: "component",
  initialState,
  reducers: {
    setComponent(state, action: PayloadAction<ComponentData>) {
      state.component = action.payload;
      state.error = null;
    },
    updateComponent(state, action: PayloadAction<Partial<ComponentData>>) {
      if (state.component) {
        state.component = { ...state.component, ...action.payload };
      }
    },
    clearComponent(state) {
      state.component = null;
      state.error = null;
      state.loading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setComponent, updateComponent, clearComponent, setLoading, setError } =
  componentSlice.actions;

export default componentSlice.reducer;
