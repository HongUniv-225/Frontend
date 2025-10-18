import type { User } from "@/types";

export const logout = () => {
  // accessToken과 refreshToken은 백엔드에서 관리되므로 별도 처리 불필요
  localStorage.removeItem("user");
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const getStoredToken = () => {
  // accessToken은 백엔드에서 헤더로 전송되므로 별도 저장 불필요
  // 필요시 API 호출 시 자동으로 쿠키와 함께 전송됨
  return null;
};
