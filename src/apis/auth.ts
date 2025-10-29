import type { User } from "@/types";

export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  // refreshToken은 HttpOnly 쿠키이므로 별도 제거 불필요
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const getStoredToken = () => {
  return localStorage.getItem("accessToken");
};

export const setStoredToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};
