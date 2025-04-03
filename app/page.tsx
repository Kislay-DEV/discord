"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react"; // Fixed import
import { useState } from "react"; // Fixed import
import axios from "axios"; // Fixed import
import toast from "react-hot-toast";
import { ModeToggle } from "@/components/mode-toggle";

interface LoginFormData {
  username: string;
  password: string;
}

interface SignupFormData {
  username: string;
  email: string;
  password: string;
}

export default function DialogDemo() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<SignupFormData>();

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const response = await axios.post("/api/admin/login", data);
      
      if (response.status === 200) {
        toast.success("Login successful");
        router.push("/dashboard");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Login failed";
      setAuthError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      const response = await axios.post("/api/admin/signup", data);
      
      if (response.status === 200) {
        toast.success("Signup successful");
        router.push("/dashboard");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Signup failed";
      setAuthError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div>
      <ModeToggle/>
      {/* Login Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Login</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login To Your Account</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your account
            </DialogDescription>
          </DialogHeader>
          {authError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{authError}</span>
            </div>
          )}
          <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  {...loginRegister("username", { required: "Username is required" })}
                  className="col-span-3"
                />
                {loginErrors.username && (
                  <p className="text-red-500 text-sm col-span-4">
                    {loginErrors.username.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...loginRegister("password", { required: "Password is required" })}
                  className="col-span-3"
                />
                {loginErrors.password && (
                  <p className="text-red-500 text-sm col-span-4">
                    {loginErrors.password.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="w-full sm:w-auto">LOG IN</Button>
              <Button
                type="button"
                variant="outline"
                disabled={isGoogleLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
                onClick={() => {
                  setIsGoogleLoading(true);
                  signIn('google', { callbackUrl: '/dashboard' })
                    .catch(() => setIsGoogleLoading(false));
                }}
              >
                {isGoogleLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full mr-2"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  </svg>
                )}
                Login with Google
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Signup Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Signup</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create an Account</DialogTitle>
            <DialogDescription>
              Create yourself an account by entering all required details
            </DialogDescription>
          </DialogHeader>
          {authError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{authError}</span>
            </div>
          )}
          <form onSubmit={handleSignupSubmit(onSignupSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  {...signupRegister("username", { required: "Username is required" })}
                  className="col-span-3"
                />
                {signupErrors.username && (
                  <p className="text-red-500 text-sm col-span-4">
                    {signupErrors.username.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...signupRegister("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                  className="col-span-3"
                />
                {signupErrors.email && (
                  <p className="text-red-500 text-sm col-span-4">
                    {signupErrors.email.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...signupRegister("password", { required: "Password is required" })}
                  className="col-span-3"
                />
                {signupErrors.password && (
                  <p className="text-red-500 text-sm col-span-4">
                    {signupErrors.password.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="w-full sm:w-auto">SIGN UP</Button>
              <Button
                type="button"
                variant="outline"
                disabled={isGoogleLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
                onClick={() => {
                  setIsGoogleLoading(true);
                  signIn('google', { callbackUrl: '/dashboard' })
                    .catch(() => setIsGoogleLoading(false));
                }}
              >
                {isGoogleLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full mr-2"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  </svg>
                )}
                Signup with Google
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}