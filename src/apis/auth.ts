import type { User } from "@/types";

// export const loginWithGoogle = async (code: string): Promise<User> => {
//   try {
//     console.log("🔐 Google OAuth 로그인 시작:", code);

//     const response = await axios.post(
//       `${API_BASE_URL}/api/v1/users/auth/login/google`,
//       null, // body 없음 (code는 query param으로 보냄)
//       {
//         params: { code },
//         withCredentials: true, // ✅ 쿠키 받기 위해 필요
//       }
//     );

//     console.log("📡 로그인 응답:", response);

//     // accessToken은 헤더에서 추출
//     const accessToken = response.headers["authorization"]?.replace(
//       "Bearer ",
//       ""
//     );

//     console.log("🔑 추출된 토큰:", accessToken ? "존재함" : "없음");

//     if (accessToken) {
//       localStorage.setItem("accessToken", accessToken);
//       console.log("💾 토큰 localStorage에 저장 완료");
//     } else {
//       console.warn("⚠️ 응답 헤더에서 토큰을 찾을 수 없음");
//     }

//     // refreshToken은 쿠키로 내려오므로 localStorage에 따로 저장할 필요는 없음 (자동으로 브라우저에 저장됨)
//     // user 정보는 body에 있음
//     const user = response.data;
//     localStorage.setItem("user", JSON.stringify(user));
//     console.log("👤 사용자 정보 localStorage에 저장 완료:", user);

//     return user;
//   } catch (error) {
//     console.error("❌ Google OAuth 로그인 실패:", error);
//     throw error;
//   }
// };

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
