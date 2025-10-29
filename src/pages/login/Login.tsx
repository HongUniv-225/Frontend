import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "@/components/common/button/Button";
import { Card } from "@/components/common/card/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./login.module.scss";

export default function LoginPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const features = [
    {
      title: "메인에서 오늘 할 일을 한눈에",
      description: "중앙 패널에서 오늘의 할 일을 빠르게 확인하고 관리하세요.",
      image: "/main.svg",
    },
    {
      title: "그룹 상세에서 협업을 더 쉽게",
      description: "그룹별 진행 현황과 할 일을 한 곳에서 정리하고 소통하세요.",
      image: "/profile.svg",
    },
    {
      title: "프로필에서 나의 기록을",
      description: "완료 현황과 활동 기록을 프로필에서 확인하세요.",
      image: "/group-detail.svg",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [features.length]);

  // URL 파라미터에서 에러 메시지 확인
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);

      const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        "1023446766812-f0ac4cpu94tjc48188dnq59de5sh3kej.apps.googleusercontent.com";

      if (!clientId) {
        setError(
          "Google OAuth 설정이 필요합니다. 환경변수 VITE_GOOGLE_CLIENT_ID를 확인해주세요."
        );
        return;
      }

      // Google OAuth 인증 페이지로 리다이렉트
      const redirectUri = encodeURIComponent(
        `${window.location.origin}/auth/callback`
      );
      const scope = encodeURIComponent("openid email profile");
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline`;

      window.location.href = authUrl;
    } catch (error) {
      setError("Google 로그인 중 오류가 발생했습니다.");
    }
  };

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
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className={styles.slideImage}
                    />
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
            <ChevronLeft className={styles.icon} />
          </button>
          <button
            onClick={nextSlide}
            className={styles.carouselButton}
            style={{ right: "8px" }}
            aria-label="다음 슬라이드"
          >
            <ChevronRight className={styles.icon} />
          </button>

          {/* 인디케이터 */}
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
          <Button
            onClick={handleGoogleLogin}
            className={styles.googleButton}
            size="lg"
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google 계정으로 가입
          </Button>

          <p className={styles.terms}>
            로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </Card>
    </div>
  );
}
