import { DataUser, UserState } from "@/types/dataUser"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<DataUser>) {
      state.user = action.payload
      state.error = null
    },
    updateUser(state, action: PayloadAction<Partial<DataUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    clearUser(state) {
      state.user = null
      state.error = null
      state.loading = false
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
  },
})

export const { setUser, updateUser, clearUser, setLoading, setError } = userSlice.actions
export default userSlice.reducer
