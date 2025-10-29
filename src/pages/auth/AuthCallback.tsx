import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthCallback() {
  const calledRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (calledRef.current) return; // 이미 한 번 호출했으면 무시
    calledRef.current = true;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // 1단계: Google에서 accessToken 받아오기
      const getGoogleAccessToken = async () => {
        try {
          const tokenResponse = await axios.post(
            "https://oauth2.googleapis.com/token",
            {
              client_id:
                import.meta.env.VITE_GOOGLE_CLIENT_ID ||
                "1023446766812-f0ac4cpu94tjc48188dnq59de5sh3kej.apps.googleusercontent.com",
              client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
              code: code,
              grant_type: "authorization_code",
              redirect_uri: `${window.location.origin}/auth/callback`,
            },
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          const googleAccessToken = tokenResponse.data.access_token;

          if (googleAccessToken) {
            // 2단계: 백엔드로 Google accessToken 전송하여 JWT 토큰 받기
            return sendTokenToBackend(googleAccessToken);
          }
        } catch {
          // 백엔드로 직접 코드 전송 (기존 방식)
          return sendCodeToBackend(code);
        }
      };

      const sendTokenToBackend = async (googleAccessToken: string) => {
        return axios.post(
          `https://grouptodo.freeddns.org/api/v1/users/auth/login/google`,
          { accessToken: googleAccessToken },
          {
            withCredentials: true,
          }
        );
      };

      const sendCodeToBackend = async (code: string) => {
        return axios.post(
          `https://grouptodo.freeddns.org/api/v1/users/auth/login/google?code=${encodeURIComponent(
            code
          )}`,
          {},
          {
            withCredentials: true,
          }
        );
      };

      getGoogleAccessToken()
        .then((res) => {
          if (!res) {
            return;
          }

          // 🔍 Access Token 확인 (헤더에서)
          const accessTokenFromHeader = res.headers["authorization"]?.replace(
            "Bearer ",
            ""
          );

          // 🔍 다른 헤더들도 확인

          // 🔍 서버에서 받은 JWT 토큰 저장
          if (accessTokenFromHeader) {
            localStorage.setItem("accessToken", accessTokenFromHeader);
          }

          // 🔍 현재 백엔드 응답 구조 확인

          // 현재 백엔드는 사용자 정보만 보내주므로, 사용자 정보를 user 객체로 저장
          const userData = {
            nickname: res.data.nickname,
            email: res.data.email,
            imageUrl: res.data.imageUrl,
            introduction: res.data.introduction,
          };

          // 🔍 Refresh Token 확인 (Set-Cookie 헤더에서)
          const setCookieHeader = res.headers["set-cookie"];

          // Refresh Token은 HttpOnly 쿠키로 자동 저장되므로 별도 처리 불필요
          if (setCookieHeader) {
            // HttpOnly 쿠키 자동 저장
          }

          // 사용자 정보 저장
          localStorage.setItem("user", JSON.stringify(userData));

          navigate("/main"); // 로그인 후 메인으로 이동
        })
        .catch(() => {});
    }
  }, [navigate]);

  return <div>로그인 중...</div>;
}
