import { Router } from "express";
import { 
    getUserProfile, 
    getUserProfiles, 
    registerUser, 
    updateUserProfile, 
    userLogin, 
    userLogout, 
    requestPasswordReset, 
    resetPassword, 
    adminUpdateUserProfile
} from "../controllers/user.js";
import { checkBlacklist, hasPermission, isAuthenticated } from "../middlewares/auth.js";
import { userAvatarUpload } from "../middlewares/upload.js";

const userRouter = Router();

// Public routes
userRouter.post('/users/signUp', userAvatarUpload.single('images'), registerUser);
userRouter.post('/users/login', userLogin);
userRouter.post('/request-password-reset', isAuthenticated, requestPasswordReset);
userRouter.post('/reset-password', resetPassword);

// Protected routes
userRouter.post('/users/logout', isAuthenticated, userLogout);
userRouter.get('/users/me', isAuthenticated, checkBlacklist, hasPermission('get_profile'), getUserProfile);
userRouter.get('/users', isAuthenticated, hasPermission('get_profiles'), getUserProfiles);
userRouter.patch('/users/update', isAuthenticated, userAvatarUpload.single('images'), updateUserProfile);
userRouter.patch('/admin/users/:userId', isAuthenticated, hasPermission('update_profiles'), userAvatarUpload.single('images'), adminUpdateUserProfile)

export default userRouter;