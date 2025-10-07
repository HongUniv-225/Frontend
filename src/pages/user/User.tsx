import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/common/card/Card";
import Button from "../../components/common/button/Button";
import Badge from "../../components/common/badge/Badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/common/avatar/Avatar";
import styles from "./user.module.scss";

// Mock user data
const mockUserData = {
  id: 1,
  name: "김철수",
  email: "kim@example.com",
  avatar: "",
  joinDate: "2024-01-01",
  bio: "효율적인 업무 관리를 추구하는 개발자입니다.",
  stats: {
    totalTasks: 45,
    completedTasks: 32,
    inProgressTasks: 8,
    todoTasks: 5,
    completionRate: 71,
    streak: 7,
  },
  groups: [
    { id: 1, name: "프로젝트 팀", role: "팀장", color: "#3b82f6", tasks: 12 },
    { id: 2, name: "가족", role: "아빠", color: "#10b981", tasks: 3 },
    { id: 3, name: "운동 모임", role: "멤버", color: "#8b5cf6", tasks: 7 },
  ],
  recentActivities: [
    {
      id: 1,
      action: "완료",
      task: "프로젝트 기획서 작성",
      group: "프로젝트 팀",
      date: "2024-01-20",
    },
    {
      id: 2,
      action: "추가",
      task: "UI/UX 디자인",
      group: "프로젝트 팀",
      date: "2024-01-19",
    },
    {
      id: 3,
      action: "완료",
      task: "장보기",
      group: "가족",
      date: "2024-01-19",
    },
    {
      id: 4,
      action: "수정",
      task: "헬스장 가기",
      group: "운동 모임",
      date: "2024-01-18",
    },
    {
      id: 5,
      action: "완료",
      task: "코드 리뷰",
      group: "프로젝트 팀",
      date: "2024-01-18",
    },
  ],
  achievements: [
    {
      id: 1,
      title: "첫 할일 완료",
      description: "첫 번째 할일을 완료했습니다",
      icon: "🎯",
      earned: true,
    },
    {
      id: 2,
      title: "연속 7일",
      description: "7일 연속 할일을 완료했습니다",
      icon: "🔥",
      earned: true,
    },
    {
      id: 3,
      title: "팀 플레이어",
      description: "3개 이상의 그룹에 참여했습니다",
      icon: "👥",
      earned: true,
    },
    {
      id: 4,
      title: "완료율 80%",
      description: "할일 완료율 80%를 달성했습니다",
      icon: "⭐",
      earned: false,
    },
  ],
};

const User = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const getActionClass = (action: string) => {
    switch (action) {
      case "완료":
        return styles.actionCompleted;
      case "추가":
        return styles.actionAdded;
      case "수정":
        return styles.actionModified;
      default:
        return "";
    }
  };

  return (
    <div className={styles.user}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </Button>
              <h1>프로필</h1>
            </div>
            <Button variant="outline" size="sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              설정
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Left Section - Profile Info */}
            <div className={styles.leftSection}>
              {/* Profile Card */}
              <Card>
                <CardContent>
                  <div className={styles.profileCard}>
                    <div className={styles.avatarWrapper}>
                      <Avatar className={styles.avatar}>
                        <AvatarImage src={mockUserData.avatar} />
                        <AvatarFallback>{mockUserData.name[0]}</AvatarFallback>
                      </Avatar>
                      <button className={styles.editButton}>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    </div>
                    <div className={styles.profileInfo}>
                      <h2>{mockUserData.name}</h2>
                      <p className={styles.email}>{mockUserData.email}</p>
                    </div>
                    <p className={styles.bio}>{mockUserData.bio}</p>
                    <div className={styles.joinDate}>
                      가입일: {mockUserData.joinDate}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    빠른 통계
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.quickStats}>
                    <div className={styles.statsRow}>
                      <div className={styles.statBox}>
                        <div className={styles.statValue}>
                          {mockUserData.stats.completedTasks}
                        </div>
                        <div className={styles.statLabel}>완료</div>
                      </div>
                      <div className={styles.statBox}>
                        <div className={styles.statValue}>
                          {mockUserData.stats.inProgressTasks}
                        </div>
                        <div className={styles.statLabel}>진행중</div>
                      </div>
                    </div>
                    <div className={styles.progressSection}>
                      <div className={styles.progressHeader}>
                        <span>완료율</span>
                        <span>{mockUserData.stats.completionRate}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${mockUserData.stats.completionRate}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.streakBox}>
                      <div className={styles.streakIcon}>🔥</div>
                      <span className={styles.streakLabel}>연속 완료</span>
                      <span className={styles.streakValue}>
                        {mockUserData.stats.streak}일
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Section - Detailed Info */}
            <div className={styles.rightSection}>
              {/* Tabs */}
              <div className={styles.tabs}>
                <button
                  className={
                    activeTab === "overview" ? styles.tabActive : styles.tab
                  }
                  onClick={() => setActiveTab("overview")}
                >
                  개요
                </button>
                <button
                  className={
                    activeTab === "groups" ? styles.tabActive : styles.tab
                  }
                  onClick={() => setActiveTab("groups")}
                >
                  그룹
                </button>
                <button
                  className={
                    activeTab === "activity" ? styles.tabActive : styles.tab
                  }
                  onClick={() => setActiveTab("activity")}
                >
                  활동
                </button>
                <button
                  className={
                    activeTab === "achievements" ? styles.tabActive : styles.tab
                  }
                  onClick={() => setActiveTab("achievements")}
                >
                  성취
                </button>
              </div>

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className={styles.tabContent}>
                  <Card>
                    <CardHeader>
                      <CardTitle>할일 현황</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={styles.overviewGrid}>
                        <div className={styles.overviewItem}>
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className={styles.iconCompleted}
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          <div className={styles.overviewValue}>
                            {mockUserData.stats.completedTasks}
                          </div>
                          <div className={styles.overviewLabel}>
                            완료된 할일
                          </div>
                        </div>
                        <div className={styles.overviewItem}>
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className={styles.iconProgress}
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <div className={styles.overviewValue}>
                            {mockUserData.stats.inProgressTasks}
                          </div>
                          <div className={styles.overviewLabel}>
                            진행중인 할일
                          </div>
                        </div>
                        <div className={styles.overviewItem}>
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className={styles.iconPending}
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                          <div className={styles.overviewValue}>
                            {mockUserData.stats.todoTasks}
                          </div>
                          <div className={styles.overviewLabel}>
                            대기중인 할일
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>이번 주 목표</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={styles.goalsSection}>
                        <div className={styles.goalItem}>
                          <div className={styles.goalHeader}>
                            <span>주간 할일 완료</span>
                            <span>12/15</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: "80%" }}
                            />
                          </div>
                        </div>
                        <div className={styles.goalItem}>
                          <div className={styles.goalHeader}>
                            <span>그룹 참여도</span>
                            <span>85%</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: "85%" }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Groups Tab */}
              {activeTab === "groups" && (
                <div className={styles.tabContent}>
                  <Card>
                    <CardHeader>
                      <CardTitle>참여 중인 그룹</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={styles.groupsList}>
                        {mockUserData.groups.map((group) => (
                          <div key={group.id} className={styles.groupItem}>
                            <div className={styles.groupItemLeft}>
                              <div
                                className={styles.groupColor}
                                style={{ backgroundColor: group.color }}
                              />
                              <div className={styles.groupItemInfo}>
                                <h3>{group.name}</h3>
                                <p>{group.role}</p>
                              </div>
                            </div>
                            <div className={styles.groupItemRight}>
                              <Badge variant="secondary">
                                {group.tasks}개 할일
                              </Badge>
                              <Button size="sm" variant="outline">
                                보기
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div className={styles.tabContent}>
                  <Card>
                    <CardHeader>
                      <CardTitle>최근 활동</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={styles.activityList}>
                        {mockUserData.recentActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className={styles.activityItem}
                          >
                            <Badge className={getActionClass(activity.action)}>
                              {activity.action}
                            </Badge>
                            <div className={styles.activityContent}>
                              <p className={styles.activityTask}>
                                {activity.task}
                              </p>
                              <p className={styles.activityGroup}>
                                {activity.group}
                              </p>
                            </div>
                            <div className={styles.activityDate}>
                              {activity.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === "achievements" && (
                <div className={styles.tabContent}>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                          <path d="M4 22h16"></path>
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                        </svg>
                        성취 목록
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={styles.achievementsGrid}>
                        {mockUserData.achievements.map((achievement) => (
                          <div
                            key={achievement.id}
                            className={
                              achievement.earned
                                ? styles.achievementEarned
                                : styles.achievementLocked
                            }
                          >
                            <div className={styles.achievementHeader}>
                              <div className={styles.achievementIcon}>
                                {achievement.icon}
                              </div>
                              <div className={styles.achievementInfo}>
                                <h3>{achievement.title}</h3>
                                {achievement.earned && (
                                  <Badge variant="secondary">달성</Badge>
                                )}
                              </div>
                            </div>
                            <p className={styles.achievementDesc}>
                              {achievement.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default User;
