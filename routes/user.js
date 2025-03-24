import { Router } from "express";
import { getUserProfile, getUserProfiles, registerUser, updateUserProfile, userLogin, userLogout } from "../controllers/user.js";
import { checkBlacklist, hasPermission, isAuthenticated } from "../middlewares/auth.js";

const userRouter = Router();

userRouter.post('/users/signUp', registerUser);

userRouter.post('/users/login', userLogin);

userRouter.post('/users/logout', isAuthenticated, userLogout);

userRouter.get('/users/me', isAuthenticated, checkBlacklist, hasPermission('get_profile'), getUserProfile);

userRouter.get('/users', isAuthenticated, hasPermission('get_profiles'), getUserProfiles);

userRouter.patch('/users/update', isAuthenticated, updateUserProfile)

export default userRouter;