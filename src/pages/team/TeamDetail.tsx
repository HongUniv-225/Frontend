import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import Input from "../../components/common/input/Input";
import Textarea from "../../components/common/textarea/Textarea";
import questionmarkIcon from "../../assets/questionmark.svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/common/dialog/Dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/common/dropdown/Dropdown";
import { type Task, type Member, type TodoStatus } from "../../types";
import styles from "./teamDetail.module.scss";

// Mock data
const mockGroupData: Record<number, any> = {
  1: {
    id: 1,
    name: "프로젝트 팀",
    description: "새로운 웹 애플리케이션 개발 프로젝트",
    color: "#171717",
    createdAt: "2024-01-15",
    members: [
      { id: 1, name: "김철수", email: "kim@example.com", role: "팀장" },
      { id: 2, name: "이영희", email: "lee@example.com", role: "개발자" },
      { id: 3, name: "박민수", email: "park@example.com", role: "디자이너" },
      { id: 4, name: "정수진", email: "jung@example.com", role: "개발자" },
      { id: 5, name: "최동욱", email: "choi@example.com", role: "QA" },
    ],
    tasks: [
      {
        id: 1,
        title: "프로젝트 기획서 작성",
        description: "전체 프로젝트 범위와 일정 정리",
        assignee: "김철수",
        status: "pending" as TodoStatus,
        dueDate: "2024-01-20",
        priority: "high" as const,
      },
      {
        id: 2,
        title: "UI/UX 디자인",
        description: "메인 페이지 및 주요 화면 디자인",
        assignee: "박민수",
        status: "in-progress" as TodoStatus,
        dueDate: "2024-01-25",
        priority: "high" as const,
      },
      {
        id: 3,
        title: "데이터베이스 설계",
        description: "ERD 작성 및 테이블 구조 설계",
        assignee: "이영희",
        status: "in-progress" as TodoStatus,
        dueDate: "2024-01-22",
        priority: "medium" as const,
      },
      {
        id: 4,
        title: "API 개발",
        description: "백엔드 API 엔드포인트 구현",
        assignee: "정수진",
        status: "completed" as TodoStatus,
        dueDate: "2024-01-30",
        priority: "medium" as const,
      },
      {
        id: 5,
        title: "테스트 계획 수립",
        description: "테스트 케이스 작성 및 테스트 환경 구축",
        assignee: "최동욱",
        status: "failed" as TodoStatus,
        dueDate: "2024-02-05",
        priority: "low" as const,
      },
    ],
  },
  2: {
    id: 2,
    name: "가족",
    description: "우리 가족의 일상 관리",
    color: "#10b981",
    createdAt: "2024-01-10",
    members: [
      { id: 1, name: "아빠", email: "dad@family.com", role: "가장" },
      { id: 2, name: "엄마", email: "mom@family.com", role: "주부" },
      { id: 3, name: "첫째", email: "child1@family.com", role: "학생" },
      { id: 4, name: "둘째", email: "child2@family.com", role: "학생" },
    ],
    tasks: [
      {
        id: 1,
        title: "장보기",
        description: "주간 식료품 구매",
        assignee: "엄마",
        status: "completed" as TodoStatus,
        dueDate: "2024-01-21",
        priority: "medium" as const,
      },
      {
        id: 2,
        title: "아이들 학용품 준비",
        description: "새 학기 준비물 구매",
        assignee: "아빠",
        status: "in-progress" as TodoStatus,
        dueDate: "2024-01-25",
        priority: "high" as const,
      },
    ],
  },
};

const TeamDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = Number(searchParams.get("id") || "1");
  const group = mockGroupData[groupId];

  const [tasks, setTasks] = useState<Task[]>(group?.tasks || []);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    dueDate: "",
    priority: "medium",
  });
  const [showCompleted, setShowCompleted] = useState(true);
  const [showFailed, setShowFailed] = useState(true);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<TodoStatus, boolean>
  >({
    pending: false,
    "in-progress": false,
    completed: false,
    failed: false,
  });

  if (!group) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundContent}>
          <h1>그룹을 찾을 수 없습니다</h1>
          <Button onClick={() => navigate("/")}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const tasksByStatus = {
    pending: tasks.filter((t) => t.status === "pending"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    completed: tasks.filter((t) => t.status === "completed"),
    failed: tasks.filter((t) => t.status === "failed"),
  };

  const getDisplayedTasks = (status: TodoStatus) => {
    const statusTasks = tasksByStatus[status];
    const maxDisplay = 7;
    return expandedSections[status]
      ? statusTasks
      : statusTasks.slice(0, maxDisplay);
  };

  const toggleExpanded = (status: TodoStatus) => {
    setExpandedSections((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const changeTaskStatus = (taskId: number, newStatus: TodoStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const addTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now(),
        ...newTask,
        status: "pending" as TodoStatus,
        priority: newTask.priority as "low" | "medium" | "high",
      };
      setTasks([...tasks, task]);
      setNewTask({
        title: "",
        description: "",
        assignee: "",
        dueDate: "",
        priority: "medium",
      });
      setIsAddingTask(false);
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return styles.priorityHigh;
      case "medium":
        return styles.priorityMedium;
      default:
        return styles.priorityLow;
    }
  };

  const renderTaskItem = (task: Task) => (
    <Card key={task.id} className={styles.taskCard}>
      <CardContent>
        <div className={styles.taskHeader}>
          <h3>{task.title}</h3>
          <Badge className={getPriorityClass(task.priority)}>
            {task.priority === "high"
              ? "높음"
              : task.priority === "medium"
              ? "보통"
              : "낮음"}
          </Badge>
        </div>

        <p className={styles.taskDescription}>{task.description}</p>

        <div className={styles.taskFooter}>
          <div className={styles.taskInfo}>
            <span>담당: {task.assignee}</span>
            <div className={styles.taskDate}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {task.dueDate}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => changeTaskStatus(task.id, "pending")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                대기로 변경
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeTaskStatus(task.id, "in-progress")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                진행중으로 변경
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeTaskStatus(task.id, "completed")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                완료로 변경
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeTaskStatus(task.id, "failed")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                미완료로 변경
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={styles.teamDetail}>
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
              <div className={styles.groupTitle}>
                <div
                  className={styles.groupColor}
                  style={{ backgroundColor: group.color }}
                />
                <h1>{group.name}</h1>
                <button
                  className={styles.helpButton}
                  onClick={() => setIsHelpModalOpen(true)}
                >
                  <img
                    src={questionmarkIcon}
                    alt="도움말"
                    className={styles.helpIcon}
                  />
                </button>
              </div>
            </div>
            <div className={styles.headerRight}>
              <Button variant="outline" size="sm">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                멤버 초대
              </Button>
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
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Left Section - Group Info & Members */}
            <div className={styles.leftSection}>
              {/* Group Info */}
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
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    그룹 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.groupInfo}>
                    <div className={styles.infoItem}>
                      <p className={styles.infoLabel}>설명</p>
                      <p className={styles.infoValue}>{group.description}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <p className={styles.infoLabel}>생성일</p>
                      <p className={styles.infoValue}>{group.createdAt}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <p className={styles.infoLabel}>멤버 수</p>
                      <p className={styles.infoValue}>
                        {group.members.length}명
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Members */}
              <Card>
                <CardHeader>
                  <CardTitle>그룹원</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.memberList}>
                    {group.members.map((member: Member) => (
                      <div key={member.id} className={styles.memberItem}>
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className={styles.memberInfo}>
                          <p className={styles.memberName}>{member.name}</p>
                          <p className={styles.memberRole}>{member.role}</p>
                        </div>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Section - Tasks */}
            <div className={styles.rightSection}>
              <div className={styles.sectionHeader}>
                <h2>그룹 할일</h2>
                <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
                  <DialogTrigger asChild>
                    <Button>
                      <span>+</span> 할일 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 할일 추가</DialogTitle>
                    </DialogHeader>
                    <div className={styles.dialogForm}>
                      <div>
                        <label>제목</label>
                        <Input
                          value={newTask.title}
                          onChange={(e) =>
                            setNewTask({ ...newTask, title: e.target.value })
                          }
                          placeholder="할일 제목을 입력하세요"
                        />
                      </div>
                      <div>
                        <label>설명</label>
                        <Textarea
                          value={newTask.description}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              description: e.target.value,
                            })
                          }
                          placeholder="할일 설명을 입력하세요"
                        />
                      </div>
                      <div>
                        <label>담당자</label>
                        <select
                          className={styles.select}
                          value={newTask.assignee}
                          onChange={(e) =>
                            setNewTask({ ...newTask, assignee: e.target.value })
                          }
                        >
                          <option value="">담당자 선택</option>
                          {group.members.map((member: Member) => (
                            <option key={member.id} value={member.name}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>마감일</label>
                        <Input
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) =>
                            setNewTask({ ...newTask, dueDate: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label>우선순위</label>
                        <select
                          className={styles.select}
                          value={newTask.priority}
                          onChange={(e) =>
                            setNewTask({ ...newTask, priority: e.target.value })
                          }
                        >
                          <option value="low">낮음</option>
                          <option value="medium">보통</option>
                          <option value="high">높음</option>
                        </select>
                      </div>
                      <div className={styles.dialogActions}>
                        <Button onClick={addTask}>추가</Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingTask(false)}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {tasksByStatus.pending.length > 0 && (
                <div className={styles.taskSection}>
                  <div className={styles.taskSectionHeader}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className={styles.iconPending}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <h3>대기</h3>
                    <Badge variant="secondary">
                      {tasksByStatus.pending.length}개
                    </Badge>
                  </div>
                  <div className={styles.taskList}>
                    {getDisplayedTasks("pending").map(renderTaskItem)}
                    {tasksByStatus.pending.length > 7 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={styles.expandButton}
                        onClick={() => toggleExpanded("pending")}
                      >
                        {expandedSections.pending
                          ? "접기"
                          : `더보기 (${tasksByStatus.pending.length - 7}개 더)`}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {tasksByStatus["in-progress"].length > 0 && (
                <div className={styles.taskSection}>
                  <div className={styles.taskSectionHeader}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className={styles.iconProgress}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="10 8 16 12 10 16 10 8"></polygon>
                    </svg>
                    <h3>진행중</h3>
                    <Badge variant="secondary">
                      {tasksByStatus["in-progress"].length}개
                    </Badge>
                  </div>
                  <div className={styles.taskList}>
                    {getDisplayedTasks("in-progress").map(renderTaskItem)}
                    {tasksByStatus["in-progress"].length > 7 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={styles.expandButton}
                        onClick={() => toggleExpanded("in-progress")}
                      >
                        {expandedSections["in-progress"]
                          ? "접기"
                          : `더보기 (${
                              tasksByStatus["in-progress"].length - 7
                            }개 더)`}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {tasksByStatus.completed.length > 0 && (
                <div className={styles.taskSection}>
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={styles.taskSectionHeaderCollapsible}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className={styles.iconCompleted}
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <h3>완료</h3>
                    <Badge variant="secondary">
                      {tasksByStatus.completed.length}개
                    </Badge>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className={showCompleted ? styles.chevronUp : ""}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {showCompleted && (
                    <div className={styles.taskList}>
                      {getDisplayedTasks("completed").map(renderTaskItem)}
                      {tasksByStatus.completed.length > 7 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={styles.expandButton}
                          onClick={() => toggleExpanded("completed")}
                        >
                          {expandedSections.completed
                            ? "접기"
                            : `더보기 (${
                                tasksByStatus.completed.length - 7
                              }개 더)`}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {tasksByStatus.failed.length > 0 && (
                <div className={styles.taskSection}>
                  <button
                    onClick={() => setShowFailed(!showFailed)}
                    className={styles.taskSectionHeaderCollapsible}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className={styles.iconFailed}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <h3>미완료</h3>
                    <Badge variant="secondary">
                      {tasksByStatus.failed.length}개
                    </Badge>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className={showFailed ? styles.chevronUp : ""}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {showFailed && (
                    <div className={styles.taskList}>
                      {getDisplayedTasks("failed").map(renderTaskItem)}
                      {tasksByStatus.failed.length > 7 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={styles.expandButton}
                          onClick={() => toggleExpanded("failed")}
                        >
                          {expandedSections.failed
                            ? "접기"
                            : `더보기 (${
                                tasksByStatus.failed.length - 7
                              }개 더)`}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {tasks.length === 0 && (
                <Card>
                  <CardContent>
                    <div className={styles.emptyState}>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <p>아직 할일이 없습니다</p>
                      <p className={styles.emptyDesc}>
                        새로운 할일을 추가해보세요
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tasks.length > 0 && (
                <Card>
                  <CardContent>
                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className={styles.iconPending}
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{tasksByStatus.pending.length}개 대기</span>
                      </div>
                      <div className={styles.statItem}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className={styles.iconProgress}
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polygon points="10 8 16 12 10 16 10 8"></polygon>
                        </svg>
                        <span>
                          {tasksByStatus["in-progress"].length}개 진행중
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className={styles.iconCompleted}
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>{tasksByStatus.completed.length}개 완료</span>
                      </div>
                      <div className={styles.statItem}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className={styles.iconFailed}
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <span>{tasksByStatus.failed.length}개 미완료</span>
                      </div>
                    </div>
                    <div className={styles.statsTotal}>총 {tasks.length}개</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 도움말 모달 */}
      <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <DialogContent className={styles.helpModal}>
          <DialogHeader>
            <DialogTitle>팀 상세 페이지 사용법</DialogTitle>
          </DialogHeader>
          <div className={styles.helpContent}>
            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}>📋 할일 관리</h3>
              <ul className={styles.helpList}>
                <li>"할 일 추가" 버튼으로 새로운 할일을 생성할 수 있습니다</li>
                <li>할일을 클릭하여 상세 정보를 확인할 수 있습니다</li>
                <li>할일 상태를 변경하여 진행 상황을 관리할 수 있습니다</li>
              </ul>
            </div>

            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}>👥 팀원 관리</h3>
              <ul className={styles.helpList}>
                <li>팀원 목록에서 각 팀원의 정보를 확인할 수 있습니다</li>
                <li>팀원의 프로필 이미지와 역할을 볼 수 있습니다</li>
                <li>팀원별 할일 현황을 확인할 수 있습니다</li>
              </ul>
            </div>

            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}>📊 통계 정보</h3>
              <ul className={styles.helpList}>
                <li>완료된 할일과 미완료 할일 수를 확인할 수 있습니다</li>
                <li>전체 할일 수와 진행률을 볼 수 있습니다</li>
                <li>팀의 전체적인 진행 상황을 파악할 수 있습니다</li>
              </ul>
            </div>
          </div>
          <div className={styles.helpFooter}>
            <Button onClick={() => setIsHelpModalOpen(false)}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamDetail;
