import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// export default function AuthCallback() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   useEffect(() => {
//     const handleAuthCallback = async () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const code = urlParams.get("code");
//       const error = urlParams.get("error");

//       if (error) {
//         console.error("OAuth 오류:", error);
//         navigate("/login?error=oauth_error");
//         return;
//       }

//       if (!authCode) {
//         console.error("인증 코드가 없습니다.");
//         navigate("/login?error=no_code");
//         return;
//       }

//       try {
//         const result = await loginWithGoogle(authCode);
//         console.log("Login response:", result);

//         if (result.success) {
//           // accessToken은 헤더에서, refreshToken은 쿠키에서 자동으로 처리됨
//           // 사용자 정보만 localStorage에 저장
//           localStorage.setItem("user", JSON.stringify(result.data.user));

//           // 메인 페이지로 이동
//           navigate("/main");
//         } else {
//           console.error("로그인 실패:", result.error);
//           navigate("/login?error=login_failed");
//         }
//       } catch (error) {
//         console.error("로그인 처리 중 오류:", error);
//         navigate("/login?error=server_error");
//       }
//     };

//     handleAuthCallback();
//   }, [navigate]);

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "100vh",
//         fontSize: "1.2rem",
//         color: "#6b7280",
//       }}
//     >
//       로그인 처리 중...
//     </div>
//   );
// }
export default function AuthCallback() {
  const calledRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (calledRef.current) return; // 이미 한 번 호출했으면 무시
    calledRef.current = true;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    //   console.log("Auth callback code:", code);

    //   if (code) {
    //     axios
    //   .post(`https://grouptodo.freeddns.org/api/v1/users/auth/login/google?code=${encodeURIComponent(code)}`)
    //   .then((res) => {
    //     console.log("로그인 성공", res.data);
    //   })
    //   .catch((err) => {
    //     console.error("에러", err);
    //   });
    //   }
    // }, []);
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
              redirect_uri: "http://localhost:5173/auth/callback",
            },
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          console.log("🔑 Google에서 받은 토큰:", tokenResponse.data);
          const googleAccessToken = tokenResponse.data.access_token;

          if (googleAccessToken) {
            console.log("✅ Google accessToken 받음:", googleAccessToken);

            // 2단계: 백엔드로 Google accessToken 전송하여 JWT 토큰 받기
            return sendTokenToBackend(googleAccessToken);
          }
        } catch (error) {
          console.error("Google 토큰 받기 실패:", error);
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
            console.error("❌ 응답이 undefined입니다");
            return;
          }

          console.log("=== 로그인 응답 분석 ===");
          console.log("📦 전체 응답 객체:", res);
          console.log("📋 응답 상태:", res.status);
          console.log("📄 응답 데이터:", res.data);
          console.log("🔗 응답 헤더:", res.headers);
          console.log("🔗 헤더 전체 키들:", Object.keys(res.headers));

          // 🔍 Access Token 확인 (헤더에서)
          const accessTokenFromHeader = res.headers["authorization"]?.replace(
            "Bearer ",
            ""
          );
          console.log("🔑 헤더에서 받은 accessToken:", accessTokenFromHeader);
          console.log(
            "🔑 헤더 authorization 전체:",
            res.headers["authorization"]
          );

          // 🔍 다른 헤더들도 확인
          console.log("🔑 x-access-token:", res.headers["x-access-token"]);
          console.log("🔑 access-token:", res.headers["access-token"]);
          console.log("🔑 token:", res.headers["token"]);
          console.log("🔑 set-cookie:", res.headers["set-cookie"]);

          // 🔍 서버에서 받은 JWT 토큰 저장
          if (accessTokenFromHeader) {
            localStorage.setItem("accessToken", accessTokenFromHeader);
            console.log("✅ 서버 JWT 토큰 저장 완료:", accessTokenFromHeader);
          } else {
            console.log("❌ 서버에서 JWT 토큰을 받지 못했습니다!");
          }

          // 🔍 현재 백엔드 응답 구조 확인
          console.log("🔑 body 데이터 구조:", Object.keys(res.data));
          console.log("🔑 body에서 받은 accessToken:", res.data.accessToken);
          console.log("🔄 refreshToken:", res.data.refreshToken);

          // 현재 백엔드는 사용자 정보만 보내주므로, 사용자 정보를 user 객체로 저장
          const userData = {
            nickname: res.data.nickname,
            email: res.data.email,
            imageUrl: res.data.imageUrl,
            introduction: res.data.introduction,
          };
          console.log("👤 사용자 정보:", userData);

          // 🔍 Refresh Token 확인 (Set-Cookie 헤더에서)
          const setCookieHeader = res.headers["set-cookie"];
          console.log("🍪 Set-Cookie 헤더:", setCookieHeader);

          // Refresh Token은 HttpOnly 쿠키로 자동 저장되므로 별도 처리 불필요
          if (setCookieHeader) {
            console.log("✅ refreshToken이 HttpOnly 쿠키로 자동 저장됨");
          } else {
            console.log("❌ refreshToken 쿠키가 없습니다!");
          }

          // 사용자 정보 저장
          localStorage.setItem("user", JSON.stringify(userData));
          console.log("✅ 사용자 정보 저장 완료");

          console.log("=== 로그인 처리 완료 ===");
          navigate("/main"); // 로그인 후 메인으로 이동
        })
        .catch((err) => {
          console.error("에러", err);
        });
    }
  }, [navigate]);

  return <div>로그인 중...</div>;
}
