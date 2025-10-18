import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Card } from "@/components/common/card/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./login.module.scss";

export default function LoginPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const features = [
    {
      title: "그룹으로 함께 관리하세요",
      description:
        "팀원들과 함께 할일을 공유하고 협업하세요. 실시간으로 진행 상황을 확인할 수 있습니다.",
      image: "/feature-group.jpg",
    },
    {
      title: "스마트한 일정 관리",
      description:
        "AI가 도와주는 스마트한 일정 관리로 더 효율적인 하루를 만들어보세요.",
      image: "/feature-schedule.jpg",
    },
    {
      title: "진행률 추적",
      description:
        "할일의 진행률을 시각적으로 확인하고 목표 달성률을 추적해보세요.",
      image: "/feature-progress.jpg",
    },
  ];

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      switch (errorParam) {
        case "oauth_error":
          setError("OAuth 인증 중 오류가 발생했습니다.");
          break;
        case "no_code":
          setError("인증 코드를 받지 못했습니다.");
          break;
        case "login_failed":
          setError("로그인에 실패했습니다.");
          break;
        case "server_error":
          setError("서버 오류가 발생했습니다.");
          break;
        default:
          setError("알 수 없는 오류가 발생했습니다.");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [features.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  const handleGoogleSuccess = async (codeResponse: { code: string }) => {
    console.log("🚀 handleGoogleSuccess 시작");
    console.log("📝 Authorization Code:", codeResponse.code);

    try {
      setError(null);
      console.log("✅ 에러 상태 초기화");

      if (!codeResponse.code) {
        console.error("❌ Authorization Code가 없습니다:", codeResponse);
        setError("Google 인증에 실패했습니다.");
        return;
      }

      console.log("✅ Authorization Code 확인됨:", codeResponse.code);

      // 백엔드 API로 Authorization Code 전송
      const apiUrl =
        import.meta.env.VITE_API_URL || "https://grouptodo.freeddns.org";
      const requestUrl = `${apiUrl}/api/v1/users/auth/login/google?code=${codeResponse.code}`;

      console.log("🌐 API URL:", apiUrl);
      console.log("🔗 요청 URL:", requestUrl);
      console.log("📤 요청 시작...");

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("📥 응답 받음");
      console.log("📊 응답 상태:", response.status);
      console.log("📊 응답 상태 텍스트:", response.statusText);
      console.log(
        "📋 응답 헤더:",
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();
      console.log("📄 응답 데이터:", data);

      if (response.ok) {
        console.log("✅ 로그인 성공!");
        console.log("💾 사용자 정보 저장:", data);

        // accessToken은 헤더에서, refreshToken은 쿠키에서 자동으로 처리됨
        // 사용자 정보만 localStorage에 저장
        localStorage.setItem("user", JSON.stringify(data));
        console.log("💾 localStorage에 저장 완료");

        // 메인 페이지로 이동
        console.log("🏠 /main으로 이동");
        navigate("/main");
      } else {
        console.error("❌ 로그인 실패 - 응답 상태:", response.status);
        console.error("❌ 로그인 실패 - 응답 데이터:", data);
        console.error(
          "❌ 로그인 실패 - 에러 메시지:",
          data.error || data.message
        );
        setError(data.error || data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("💥 로그인 처리 중 오류 발생:");
      console.error("💥 오류 타입:", typeof error);
      console.error("💥 오류 객체:", error);
      console.error(
        "💥 오류 메시지:",
        error instanceof Error ? error.message : String(error)
      );
      console.error(
        "💥 오류 스택:",
        error instanceof Error ? error.stack : "스택 없음"
      );
      setError("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleGoogleError = () => {
    setError("Google 로그인에 실패했습니다.");
  };

  // useGoogleLogin 훅 사용
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    redirect_uri: "http://localhost:5173/",
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        {/* 로고 및 제목 */}
        <div className={styles.header}>
          <h1 className={styles.title}>그룹 투두</h1>
          <p className={styles.subtitle}>함께 만드는 생산적인 하루</p>
        </div>

        {/* 서비스 소개 캐러셀 */}
        <div className={styles.carouselContainer}>
          <div className={styles.carousel}>
            <div
              className={styles.slides}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div key={index} className={styles.slide}>
                  <div className={styles.imageContainer}>
                    <div className={styles.placeholderImage}>
                      {/* 이미지가 없을 경우 그라데이션 배경만 표시 */}
                    </div>
                  </div>
                  <div className={styles.slideContent}>
                    <h3 className={styles.slideTitle}>{feature.title}</h3>
                    <p className={styles.slideDescription}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 캐러셀 컨트롤 */}
          <button
            onClick={prevSlide}
            className={styles.carouselButton}
            style={{ left: "8px" }}
            aria-label="이전 슬라이드"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className={styles.carouselButton}
            style={{ right: "8px" }}
            aria-label="다음 슬라이드"
          >
            <ChevronRight size={20} />
          </button>

          {/* 캐러셀 인디케이터 */}
          <div className={styles.indicators}>
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`${styles.indicator} ${
                  index === currentSlide ? styles.active : ""
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </div>

        {/* 구글 로그인 버튼 */}
        <div className={styles.loginSection}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <button
            onClick={() => googleLogin()}
            className={styles.googleLoginButton}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 시작하기
          </button>

          <p className={styles.terms}>
            로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </Card>
    </div>
  );
}
