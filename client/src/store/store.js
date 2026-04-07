import { configureStore } from "@reduxjs/toolkit";
import userReducer from  "../store/slices/userSlice";
import videoReducer from "../store/slices/videoSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    video: videoReducer,
  },

  
});
