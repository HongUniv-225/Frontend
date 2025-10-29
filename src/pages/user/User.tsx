import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/card/Card";
import Button from "@/components/common/button/Button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/common/avatar/Avatar";
import { Progress } from "@/components/common/progress/Progress";
import completeImage from "../../assets/complete.png";
import uncompleteImage from "../../assets/uncomplete.png";
import createImage from "../../assets/create.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/common/dialog/Dialog";
import Textarea from "@/components/common/textarea/Textarea";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Circle,
  TrendingUp,
  Users,
  Flame,
  BarChart3,
  Edit,
} from "lucide-react";
import { getStoredUser, getStoredToken } from "@/apis/auth";
import {
  getUserProfile,
  getUserStats,
  getUserGroups,
  getRecentActivities,
  getWeeklyStats,
  getActivityReport,
  getAchievements,
  updateUserProfile,
} from "@/apis/user";
import styles from "./user.module.scss";

// Type definitions
interface Group {
  id: number;
  groupName: string;
  description: string;
  numMember: number;
}

interface Activity {
  action: string;
  todoContent: string;
  timeAgo: string;
}

interface WeeklyStats {
  totalTodoCount: number;
  completedTodoCount: number;
  completedRate: number;
  groupTodoRate: number;
  dailyCompletedCount: number[];
}

interface ActivityReport {
  completedCount: number;
  inProgressCount: number;
  inCompletedCount: number;
  userMaxStreak: number;
  userCurrentStreak: number;
  completeRate: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
}

interface UserData {
  id: number;
  name: string;
  nickname?: string;
  email: string;
  avatar: string;
  imageUrl?: string; // 프로필 이미지 URL 추가
  joinDate: string;
  bio: string;
  introduction?: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    completionRate: number;
    streak: number;
  };
  groups: Group[];
  recentActivities: Activity[];
  achievements: Achievement[];
}

// 시간 형식 변환 함수
function formatTimeAgo(timeAgo: string): string {
  // "hours ago" -> "x시간 전" 형식으로 변환
  if (timeAgo.includes("hours ago")) {
    const hours = timeAgo.match(/(\d+)\s*hours?\s*ago/);
    if (hours) {
      return `${hours[1]}시간 전`;
    }
  }

  // "minutes ago" -> "x분 전" 형식으로 변환
  if (timeAgo.includes("minutes ago")) {
    const minutes = timeAgo.match(/(\d+)\s*minutes?\s*ago/);
    if (minutes) {
      return `${minutes[1]}분 전`;
    }
  }

  // "days ago" -> "x일 전" 형식으로 변환
  if (timeAgo.includes("days ago")) {
    const days = timeAgo.match(/(\d+)\s*days?\s*ago/);
    if (days) {
      return `${days[1]}일 전`;
    }
  }

  // "weeks ago" -> "x주 전" 형식으로 변환
  if (timeAgo.includes("weeks ago")) {
    const weeks = timeAgo.match(/(\d+)\s*weeks?\s*ago/);
    if (weeks) {
      return `${weeks[1]}주 전`;
    }
  }

  // "months ago" -> "x개월 전" 형식으로 변환
  if (timeAgo.includes("months ago")) {
    const months = timeAgo.match(/(\d+)\s*months?\s*ago/);
    if (months) {
      return `${months[1]}개월 전`;
    }
  }

  // "years ago" -> "x년 전" 형식으로 변환
  if (timeAgo.includes("years ago")) {
    const years = timeAgo.match(/(\d+)\s*years?\s*ago/);
    if (years) {
      return `${years[1]}년 전`;
    }
  }

  // 이미 한국어 형식이거나 변환할 수 없는 경우 그대로 반환
  return timeAgo;
}

export default function UserPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalTodoCount: 0,
    completedTodoCount: 0,
    completedRate: 0,
    groupTodoRate: 0,
    dailyCompletedCount: [0, 0, 0, 0, 0, 0, 0],
  });
  const [activityReport, setActivityReport] = useState<ActivityReport>({
    completedCount: 0,
    inProgressCount: 0,
    inCompletedCount: 0,
    userMaxStreak: 0,
    userCurrentStreak: 0,
    completeRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingIntroduction, setEditingIntroduction] = useState("");
  const [editingNickname, setEditingNickname] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mock data for fallback
  const mockUserData: UserData = useMemo(
    () => ({
      id: 1,
      name: "한이음",
      email: "hanieum2@gmail.com",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocLBnmQVTKR8Hb7ULHdRNp5LBr99_hjysfpiorAR0yp-f8hKJw=s96-c",
      joinDate: "2024-01-01",
      bio: "프로젝트 관리 전문가입니다.",
      introduction: "프로젝트 관리 전문가입니다.",
      stats: {
        totalTasks: 45,
        completedTasks: 32,
        inProgressTasks: 8,
        todoTasks: 5,
        completionRate: 71,
        streak: 7,
      },
      groups: [
        {
          id: 1,
          groupName: "프로젝트 개발팀",
          description: "메인 프로젝트 개발",
          numMember: 12,
        },
        {
          id: 2,
          groupName: "디자인 시스템",
          description: "UI/UX 디자인",
          numMember: 8,
        },
        {
          id: 3,
          groupName: "주간 스터디",
          description: "기술 스터디",
          numMember: 10,
        },
      ],
      recentActivities: [
        {
          action: "완료",
          todoContent: "프로젝트 제안서 작성",
          timeAgo: "2시간 전",
        },
        {
          action: "참석",
          todoContent: "팀 미팅",
          timeAgo: "4시간 전",
        },
        {
          action: "진행중",
          todoContent: "코드 리뷰",
          timeAgo: "5시간 전",
        },
        {
          action: "대기",
          todoContent: "디자인 시안 검토",
          timeAgo: "1일 전",
        },
      ],
      achievements: [
        {
          id: 1,
          title: "첫 할 일 완료",
          description: "첫 번째 할 일을 완료했습니다",
          icon: "🎯",
          earned: true,
        },
        {
          id: 2,
          title: "연속 7일",
          description: "7일 연속으로 할 일을 완료했습니다",
          icon: "🔥",
          earned: true,
        },
        {
          id: 3,
          title: "팀 플레이어",
          description: "10개 이상의 그룹에 참여했습니다",
          icon: "👥",
          earned: false,
        },
      ],
    }),
    []
  );

  // 주간 활동 데이터는 weeklyStats.dailyCompletedCount에서 가져옴

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Get stored user data first
        const storedUser = getStoredUser();
        const storedToken = getStoredToken();

        if (!storedToken) {
          setUserData(mockUserData);
          return;
        }

        // Try to fetch data from API
        const [profileData, , groups, activities, weeklyData, reportData] =
          await Promise.all([
            getUserProfile().catch(() => {
              return null;
            }),
            getUserStats().catch(() => {
              return null;
            }),
            getUserGroups().catch(() => {
              return null;
            }),
            getRecentActivities().catch(() => {
              return null;
            }),
            getWeeklyStats().catch(() => {
              return null;
            }),
            getActivityReport().catch(() => {
              return null;
            }),
            getAchievements().catch(() => {
              return null;
            }),
          ]);

        // Use stored user data or mock data
        const finalUserData = storedUser
          ? {
              ...mockUserData,
              name: storedUser.nickname || mockUserData.name,
              email: storedUser.email || mockUserData.email,
              avatar:
                storedUser.imageUrl ||
                profileData?.imageUrl ||
                mockUserData.avatar,
              imageUrl: storedUser.imageUrl || profileData?.imageUrl,
              bio: storedUser.introduction || mockUserData.bio,
              introduction:
                storedUser.introduction ||
                profileData?.introduction ||
                mockUserData.introduction,
              nickname: storedUser.nickname || profileData?.nickname,
              groups: groups || mockUserData.groups,
              recentActivities: activities || mockUserData.recentActivities,
            }
          : {
              ...mockUserData,
              introduction:
                profileData?.introduction || mockUserData.introduction,
              nickname: profileData?.nickname,
              groups: groups || mockUserData.groups,
              recentActivities: activities || mockUserData.recentActivities,
            };

        setUserData(finalUserData);

        // 주간 데이터 설정
        if (weeklyData) {
          setWeeklyStats(weeklyData);
        }

        // 활동 전황 데이터 설정
        if (reportData) {
          setActivityReport(reportData);
        }
      } catch {
        setUserData(mockUserData);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [mockUserData]);

  // 프로필 수정 함수
  const handleEditProfile = () => {
    if (userData) {
      setEditingIntroduction(userData.introduction || "");
      setEditingNickname(userData.nickname || userData.name || "");
      setSelectedImage(null);
      setImagePreview(null);
      setIsEditingProfile(true);
    }
  };

  // 이미지 선택 핸들러
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const profileData = {
        nickname: editingNickname,
        introduction: editingIntroduction,
        profileImage: selectedImage || undefined,
        imageUrl: userData?.imageUrl, // 기존 이미지 URL 추가
      };

      const updatedUser = await updateUserProfile(profileData);
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              ...updatedUser,
              avatar: updatedUser.imageUrl || prev.avatar, // avatar 필드도 업데이트
            }
          : null
      );

      // localStorage 업데이트
      const storedUser = getStoredUser();
      if (storedUser) {
        const updatedStoredUser = {
          ...storedUser,
          nickname: updatedUser.nickname,
          introduction: updatedUser.introduction,
          imageUrl: updatedUser.imageUrl || storedUser.imageUrl,
        };
        localStorage.setItem("user", JSON.stringify(updatedStoredUser));
      }

      setIsEditingProfile(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch {
      alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>사용자 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.errorContainer}>
        <p>사용자 정보를 불러올 수 없습니다.</p>
        <Button onClick={() => navigate("/login")}>로그인 페이지로</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* API Warning Banner */}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className={styles.headerTitle}>프로필</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.grid}>
          {/* Left Section */}
          <div className={styles.leftSection}>
            {/* Profile Card */}
            <Card className={styles.profileCard}>
              <CardContent className={styles.profileContent}>
                <div className={styles.profileInfo}>
                  <Avatar className={styles.avatar}>
                    {userData.imageUrl ? (
                      <AvatarImage
                        src={userData.imageUrl}
                        alt={`${userData.name}의 프로필 이미지`}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                    <AvatarFallback className={styles.avatarFallback}>
                      {userData.name ? userData.name[0] : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={styles.userInfo}>
                    <h2 className={styles.userName}>
                      {userData.nickname || userData.name}
                    </h2>
                    <p className={styles.userEmail}>{userData.email}</p>
                  </div>
                  <p className={styles.userBio}>
                    {userData.introduction || userData.bio}
                  </p>
                </div>
                <div className={styles.profileActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={styles.editButton}
                    onClick={handleEditProfile}
                  >
                    <Edit className="h-4 w-4" />
                    프로필 수정
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className={styles.statsCard}>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>
                  <TrendingUp className="h-4 w-4" />
                  빠른 통계
                </CardTitle>
              </CardHeader>
              <CardContent className={styles.statsContent}>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>
                      {activityReport.completedCount}
                    </div>
                    <div className={styles.statLabel}>완료한 할 일</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>
                      {activityReport.userMaxStreak}
                    </div>
                    <div className={styles.statLabel}>최대 연속일</div>
                  </div>
                </div>
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>완료율</span>
                    <span className={styles.progressValue}>
                      {activityReport.completeRate}%
                    </span>
                  </div>
                  <Progress
                    value={activityReport.completeRate}
                    className={styles.progress}
                  />
                </div>
                <div className={styles.streakSection}>
                  <div className={styles.streakInfo}>
                    <Flame className="h-5 w-5" />
                    <span className={styles.streakLabel}>연속 완료</span>
                  </div>
                  <span className={styles.streakNumber}>
                    {activityReport.userCurrentStreak}일
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Groups */}
            <Card className={styles.groupsCard}>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>
                  <Users className="h-4 w-4" />
                  참여 그룹
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.groupsList}>
                  {userData.groups.map((group) => (
                    <div key={group.id} className={styles.groupItem}>
                      <div className={styles.groupInfo}>
                        <Users className="h-4 w-4" />
                        <span className={styles.groupName}>
                          {group.groupName}
                        </span>
                      </div>
                      <span className={styles.groupMembers}>
                        {group.numMember}명
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section */}
          <div className={styles.rightSection}>
            {/* Activity Overview */}
            <Card className={styles.activityCard}>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>활동 전황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.activityGrid}>
                  <div className={styles.activityItem}>
                    <CheckCircle2 className="h-8 w-8" />
                    <div className={styles.activityNumber}>
                      {activityReport.completedCount}
                    </div>
                    <div className={styles.activityLabel}>완료한 할 일</div>
                  </div>
                  <div className={styles.activityItem}>
                    <Clock className="h-8 w-8" />
                    <div className={styles.activityNumber}>
                      {activityReport.inProgressCount}
                    </div>
                    <div className={styles.activityLabel}>진행중인 할 일</div>
                  </div>
                  <div className={styles.activityItem}>
                    <Circle className="h-8 w-8" />
                    <div className={styles.activityNumber}>
                      {activityReport.inCompletedCount}
                    </div>
                    <div className={styles.activityLabel}>미완료 할 일</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goals */}
            <Card className={styles.goalsCard}>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>이번 주 목표</CardTitle>
              </CardHeader>
              <CardContent className={styles.goalsContent}>
                <div className={styles.goalItem}>
                  <div className={styles.goalHeader}>
                    <span className={styles.goalLabel}>주간 활동 완료</span>
                    <span className={styles.goalValue}>
                      {weeklyStats.completedTodoCount}/
                      {weeklyStats.totalTodoCount}
                    </span>
                  </div>
                  <Progress
                    value={weeklyStats.completedRate}
                    className={styles.goalProgress}
                  />
                </div>
                <div className={styles.goalItem}>
                  <div className={styles.goalHeader}>
                    <span className={styles.goalLabel}>그룹 참여도</span>
                    <span className={styles.goalValue}>
                      {weeklyStats.groupTodoRate}%
                    </span>
                  </div>
                  <Progress
                    value={weeklyStats.groupTodoRate}
                    className={styles.goalProgress}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Weekly Activity Chart */}
            <Card className={styles.chartCard}>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>
                  <BarChart3 className="h-4 w-4" />
                  주간 활동 차트
                </CardTitle>
                <p className={styles.chartDescription}>
                  최근 7일간의 완료한 작업 수
                </p>
              </CardHeader>
              <CardContent>
                <div className={styles.chartContainer}>
                  {weeklyStats.dailyCompletedCount.map((count, index) => {
                    // 더 간단한 높이 계산
                    let barHeight;
                    if (count === 0) {
                      barHeight = 8; // 0개일 때 8px
                    } else {
                      barHeight = 8 + count * 20; // 1개당 20px씩 추가
                    }

                    return (
                      <div key={index} className={styles.chartBar}>
                        <div
                          className={styles.bar}
                          style={{
                            height: `${barHeight}px`,
                            backgroundColor: count > 0 ? "#22c55e" : "#e5e7eb",
                            minHeight: "8px",
                            width: "100%",
                            borderRadius: "2px 2px 0 0",
                          }}
                        />
                        <span className={styles.barLabel}>
                          {["월", "화", "수", "목", "금", "토", "일"][index]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className={styles.bottomGrid}>
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className={styles.cardTitle}>최근 활동</CardTitle>
                  <p className={styles.recentDescription}>최근 작업 내역</p>
                </CardHeader>
                <div className={styles.recentCard}>
                  <div className={styles.activitiesList}>
                    {userData.recentActivities.map((activity, index) => {
                      // action에 따라 이미지 결정
                      let iconImage;
                      let iconAlt;

                      switch (activity.action) {
                        case "COMPLETE":
                          iconImage = completeImage;
                          iconAlt = "완료";
                          break;
                        case "CREATE":
                          iconImage = createImage;
                          iconAlt = "생성";
                          break;
                        case "UNCOMPLETED":
                          iconImage = uncompleteImage;
                          iconAlt = "미완료";
                          break;
                        default:
                          iconImage = createImage; // 기본값
                          iconAlt = "활동";
                          break;
                      }

                      return (
                        <div key={index} className={styles.activityListItem}>
                          <div className={styles.activityIcon}>
                            <img
                              src={iconImage}
                              alt={iconAlt}
                              className={styles.activityIconImage}
                            />
                          </div>
                          <div className={styles.activityDetails}>
                            <p className={styles.activityTask}>
                              {activity.todoContent}
                            </p>
                            <p className={styles.activityDate}>
                              {formatTimeAgo(activity.timeAgo)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* 프로필 수정 다이얼로그 */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
          </DialogHeader>
          <div className={styles.profileEditForm}>
            <div className={styles.profileInfo}>
              {/* 프로필 이미지 */}
              <div className={styles.profileField}>
                <label className={styles.fieldLabel}>프로필 이미지</label>
                <div className={styles.imageUploadSection}>
                  <div className={styles.imagePreview}>
                    <img
                      src={imagePreview || userData?.imageUrl || ""}
                      alt="프로필 미리보기"
                      className={styles.previewImage}
                      onError={(e) => {
                        // 미리보기 이미지가 없거나 로드 실패 시 비움
                        e.currentTarget.src = "";
                      }}
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className={styles.imageInput}
                    id="profile-image-input"
                  />
                  <label
                    htmlFor="profile-image-input"
                    className={styles.imageUploadButton}
                  >
                    이미지 선택
                  </label>
                </div>
              </div>

              {/* 닉네임 */}
              <div className={styles.profileField}>
                <label className={styles.fieldLabel}>닉네임</label>
                <input
                  type="text"
                  value={editingNickname}
                  onChange={(e) => setEditingNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className={styles.nicknameInput}
                />
              </div>

              {/* 이메일 (읽기 전용) */}
              <div className={styles.profileField}>
                <label className={styles.fieldLabel}>이메일</label>
                <p className={styles.fieldValue}>{userData?.email}</p>
              </div>

              {/* 소개 */}
              <div className={styles.profileField}>
                <label className={styles.fieldLabel}>소개</label>
                <Textarea
                  value={editingIntroduction}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditingIntroduction(e.target.value)
                  }
                  placeholder="자기소개를 입력하세요"
                  className={styles.introductionTextarea}
                />
              </div>
            </div>
            <div className={styles.dialogActions}>
              <Button
                onClick={handleSaveProfile}
                className={styles.primaryButton}
              >
                저장
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditingProfile(false)}
                className={styles.secondaryButton}
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
