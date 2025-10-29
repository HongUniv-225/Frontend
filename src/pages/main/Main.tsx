import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/common/card/Card";
import Button from "../../components/common/button/Button";
import Badge from "../../components/common/badge/Badge";
import Input from "../../components/common/input/Input";
import Textarea from "../../components/common/textarea/Textarea";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/common/avatar/Avatar";
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
import {
  Plus,
  Users,
  CalendarIcon,
  Star,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Edit,
  Trash2,
  Compass,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { getStoredUser } from "../../apis/auth";
import questionmarkIcon from "../../assets/questionmark.svg";
import {
  getRecommendedTodos,
  getMyGroups,
  addTodoToGroup,
  getUserTodosByDate,
  deleteUserTodo,
  completeUserTodo,
  createGroup,
  addRecommendedTodoToToday,
  deleteGroupTodoById,
} from "../../apis/user";
import styles from "./main.module.scss";

type TodoStatus = "pending" | "in-progress" | "completed" | "failed";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  group: string;
  status?: TodoStatus;
  groupId?: number;
  todoId?: number;
}

interface RecommendedTodo {
  id: number;
  content: string;
  todoType: "EXCLUSIVE" | "COPYABLE" | "PERSONAL";
  assigned: number;
  todoStatus: string;
  startDate: string;
  dueDate: string;
  groupId: number;
}

interface Group {
  id: number;
  groupName: string;
  description: string;
  scope: string;
  category: string;
  imageUrl: string;
  createdAt: string;
  numMember: number;
}

// Mock data

const mockTodosByDate: Record<string, Todo[]> = {
  // 기본적으로 빈 상태로 시작
};

// todoType을 한국어로 매핑하는 함수
const getTodoTypeLabel = (todoType: string): string => {
  switch (todoType) {
    case "EXCLUSIVE":
      return "공용";
    case "COPYABLE":
      return "공통";
    case "PERSONAL":
      return "개인";
    default:
      return "기타";
  }
};

// 그룹 ID를 기반으로 일관된 색상을 생성하는 함수
const getGroupColor = (groupId: number): string => {
  const colors = [
    "#3b82f6", // 파란색
    "#10b981", // 초록색
    "#8b5cf6", // 보라색
    "#f59e0b", // 주황색
    "#ef4444", // 빨간색
    "#06b6d4", // 청록색
    "#84cc16", // 라임색
    "#f97316", // 오렌지색
    "#ec4899", // 핑크색
    "#6366f1", // 인디고색
  ];

  // 그룹 ID를 기반으로 색상 인덱스 계산
  const colorIndex = groupId % colors.length;
  return colors[colorIndex];
};

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todosByDate, setTodosByDate] = useState(mockTodosByDate);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [newTodo, setNewTodo] = useState({ text: "", group: "개인" });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isRecommendedHelpModalOpen, setIsRecommendedHelpModalOpen] =
    useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: "스터디",
    isPublic: true,
  });
  const [user, setUser] = useState<{
    nickname?: string;
    email?: string;
    imageUrl?: string;
  } | null>(null);
  const [recommendedTodos, setRecommendedTodos] = useState<RecommendedTodo[]>(
    []
  );
  const [groups, setGroups] = useState<Group[]>([]);

  // 특정 날짜의 할일을 가져오는 함수
  const fetchTodosByDate = useCallback(async (dateKey: string) => {
    try {
      // 해당 날짜의 할일 목록 가져오기
      const userTodos = await getUserTodosByDate(dateKey);

      // Todo 형식으로 변환
      const convertedTodos: Todo[] = userTodos.map(
        (todo: {
          userTodoId: number;
          content: string;
          completed: boolean;
          groupName: string;
          groupId?: number;
          todoId?: number;
        }) => ({
          id: todo.userTodoId, // userTodoId를 id로 사용
          text: todo.content, // 원본 내용 그대로
          completed: todo.completed,
          group: todo.groupName, // API에서 받은 그룹명 그대로
          status: todo.completed ? "completed" : ("pending" as TodoStatus),
          groupId: todo.groupId,
          todoId: todo.todoId,
        })
      );

      // 상태 업데이트
      setTodosByDate((prev) => ({
        ...prev,
        [dateKey]: convertedTodos,
      }));
    } catch {
      // 에러 처리 (로그 출력 없음)
    }
  }, []);

  // 오늘 날짜의 할일을 가져오는 함수 (기존 호환성 유지)
  const fetchTodayTodos = useCallback(async () => {
    const today = getDateKey(new Date());
    await fetchTodosByDate(today);
  }, [fetchTodosByDate]);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    // 추천 할일 가져오기
    const fetchRecommendedTodos = async () => {
      try {
        const data = await getRecommendedTodos();
        setRecommendedTodos(data);
      } catch {
        // API 실패 시 빈 배열로 설정
        setRecommendedTodos([]);
      }
    };

    // 내가 속한 그룹 목록 가져오기
    const fetchMyGroups = async () => {
      try {
        const data = await getMyGroups();
        // id 순으로 정렬
        const sortedGroups = data.sort((a: Group, b: Group) => a.id - b.id);
        setGroups(sortedGroups);
      } catch {
        // API 실패 시 빈 배열로 설정
        setGroups([]);
      }
    };

    fetchRecommendedTodos();
    fetchMyGroups();
  }, []);

  // 그룹이 로드된 후 오늘 할일 가져오기
  useEffect(() => {
    if (groups.length > 0) {
      fetchTodayTodos();
    }
  }, [groups, fetchTodayTodos]);

  // 선택된 날짜가 변경될 때마다 해당 날짜의 할일 가져오기
  useEffect(() => {
    if (groups.length > 0) {
      const dateKey = getDateKey(selectedDate);
      fetchTodosByDate(dateKey);
    }
  }, [selectedDate, groups, fetchTodosByDate]);

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const selectedDateKey = getDateKey(selectedDate);
  const todayTodos = todosByDate[selectedDateKey] || [];

  const toggleTodo = async (id: number) => {
    try {
      // 현재 할일의 완료 상태 찾기
      const currentTodo = todosByDate[selectedDateKey]?.find(
        (todo) => todo.id === id
      );
      if (!currentTodo) {
        return;
      }

      // 반대 상태로 API 호출
      const newCompletedState = !currentTodo.completed;
      await completeUserTodo(id, newCompletedState);

      // 로컬 상태 업데이트
      setTodosByDate((prev) => ({
        ...prev,
        [selectedDateKey]: (prev[selectedDateKey] || []).map((todo) =>
          todo.id === id ? { ...todo, completed: newCompletedState } : todo
        ),
      }));

      // 완료 상태 변경 후 추천할일 목록도 새로고침
      const updatedRecommendedTodos = await getRecommendedTodos();
      setRecommendedTodos(updatedRecommendedTodos);
    } catch {
      alert("할 일 완료 상태 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const addTodoFromRecommended = async (recommendedTodo: RecommendedTodo) => {
    try {
      // 오늘 날짜로 설정
      const today = getDateKey(new Date());
      // 올바른 API 호출: POST /api/v1/todos/{todoId} with {"date": "YYYY-MM-DD"}
      await addRecommendedTodoToToday(recommendedTodo.id, today);

      // 할일 추가 후 선택된 날짜의 할일 다시 가져오기
      await fetchTodosByDate(selectedDateKey);
      const updatedRecommendedTodos = await getRecommendedTodos();

      setRecommendedTodos(updatedRecommendedTodos);
    } catch (error) {
      // 권한 오류인 경우 더 자세한 안내
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 403) {
          alert(
            "권한이 없습니다. 추천할 일을 오늘로 추가할 수 없습니다.\n\n해결 방법:\n1. 해당 할일에 대한 권한 확인\n2. 다시 시도해주세요"
          );
        } else {
          alert("추천할 일 오늘 추가에 실패했습니다. 다시 시도해주세요.");
        }
      } else {
        alert("추천할 일 오늘 추가에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const addNewTodo = async () => {
    if (newTodo.text.trim()) {
      try {
        // Mine 그룹 찾기 (기본 그룹)
        const mineGroup = groups.find((g) => g.groupName === "Mine");
        const groupId = mineGroup?.id || 7; // Mine 그룹이 없으면 기본값 7 사용

        // API로 할일 추가
        const todoData = {
          content: newTodo.text,
          todoType: "PERSONAL" as const,
          startDate: selectedDateKey,
          dueDate: selectedDateKey,
          assigned: 0,
        };

        await addTodoToGroup(groupId, todoData);

        // 할일 추가 후 선택된 날짜의 할일 다시 가져오기
        await fetchTodosByDate(selectedDateKey);

        setNewTodo({ text: "", group: "개인" });
        setIsAddingTodo(false);
      } catch {
        // 에러가 발생해도 사용자에게 알림 (선택사항)
        alert("할 일 추가에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const deleteTodo = async (userTodoId: number) => {
    try {
      // 삭제할 할일 정보 찾기
      const todoToDelete = todosByDate[selectedDateKey]?.find(
        (todo) => todo.id === userTodoId
      );

      if (!todoToDelete) {
        return;
      }

      // 그룹이 "Mine"이고 groupId와 todoId가 있으면 그룹 할일 삭제 API 사용
      if (
        todoToDelete.group === "Mine" &&
        todoToDelete.groupId &&
        todoToDelete.todoId
      ) {
        await deleteGroupTodoById(todoToDelete.todoId, todoToDelete.groupId);
      } else {
        // 일반 사용자 할일 삭제 API 사용
        await deleteUserTodo(userTodoId);
      }

      // 삭제 후 선택된 날짜의 할일 다시 가져오기
      await fetchTodosByDate(selectedDateKey);

      // 추천할일 목록도 새로고침 (삭제된 할일이 추천할일로 다시 추가될 수 있음)
      const updatedRecommendedTodos = await getRecommendedTodos();
      setRecommendedTodos(updatedRecommendedTodos);
    } catch {
      // 서버 삭제 실패 시 사용자에게 선택권 제공
      const shouldDeleteLocally = confirm(
        "서버에서 할일 삭제에 실패했습니다. 할일이 이미 삭제되었거나 권한이 없을 수 있습니다.\n\n" +
          "로컬에서만 삭제하시겠습니까? (페이지 새로고침 시 다시 나타날 수 있습니다)"
      );

      if (shouldDeleteLocally) {
        // 로컬에서만 삭제
        setTodosByDate((prev) => ({
          ...prev,
          [selectedDateKey]: (prev[selectedDateKey] || []).filter(
            (todo) => todo.id !== userTodoId
          ),
        }));

        // 로컬 삭제 후에도 추천할일 목록 새로고침
        const updatedRecommendedTodos = await getRecommendedTodos();
        setRecommendedTodos(updatedRecommendedTodos);
      }
    }
  };

  const editTodo = (id: number, newText: string) => {
    setTodosByDate((prev) => ({
      ...prev,
      [selectedDateKey]: (prev[selectedDateKey] || []).map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      ),
    }));
    setEditingTodo(null);
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const hasTasksOnDate = (date: Date) => {
    const dateKey = getDateKey(date);
    return todosByDate[dateKey] && todosByDate[dateKey].length > 0;
  };

  const createGroupHandler = async () => {
    if (!newGroup.name.trim()) {
      alert("그룹 이름을 입력해주세요.");
      return;
    }

    try {
      // 카테고리 매핑
      const categoryMap: { [key: string]: string } = {
        스터디: "STUDY",
        프로젝트: "PROJECT",
        업무: "WORK",
        기타: "OTHER",
      };

      const groupData = {
        groupName: newGroup.name,
        description: newGroup.description,
        scope: (newGroup.isPublic ? "PUBLIC" : "PRIVATE") as
          | "PUBLIC"
          | "PRIVATE",
        category: (categoryMap[newGroup.category] || "STUDY") as
          | "STUDY"
          | "PROJECT"
          | "WORK"
          | "OTHER",
      };
      await createGroup(groupData);

      // 성공 시 폼 초기화 및 다이얼로그 닫기
      setNewGroup({
        name: "",
        description: "",
        category: "스터디",
        isPublic: true,
      });
      setIsCreatingGroup(false);

      // 그룹 목록 새로고침
      const fetchMyGroups = async () => {
        try {
          const data = await getMyGroups();
          const sortedGroups = data.sort((a: Group, b: Group) => a.id - b.id);
          setGroups(sortedGroups);
        } catch {
          // 그룹 목록 새로고침 실패 (무시)
        }
      };

      await fetchMyGroups();
    } catch {
      alert("그룹 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logoSection}>
              <div className={styles.logoIcon}>
                <Users className="h-5 w-5" />
              </div>
              <h1 className={styles.title}>GroupTodo</h1>
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
            <Link to="/group-search">
              <Button variant="outline" size="sm">
                <Compass className="h-4 w-4 mr-2" />
                그룹 탐색
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>나</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link to="/user" className={styles.dropdownItem}>
                    <User className="h-4 w-4 mr-2" />
                    프로필
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className={styles.logoutItem}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.grid}>
          {/* Left Section - My Groups */}
          <div className={styles.leftSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Users className="h-6 w-6" />내 그룹
              </h2>
              <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    그룹 생성
                  </Button>
                </DialogTrigger>
                <DialogContent className={styles.dialogContent}>
                  <DialogHeader>
                    <DialogTitle>새 그룹 만들기</DialogTitle>
                  </DialogHeader>
                  <div className={styles.dialogForm}>
                    <div>
                      <label className={styles.label}>그룹 이름</label>
                      <Input
                        value={newGroup.name}
                        onChange={(e) =>
                          setNewGroup({ ...newGroup, name: e.target.value })
                        }
                        placeholder="그룹 이름을 입력하세요"
                        className={styles.input}
                      />
                    </div>
                    <div>
                      <label className={styles.label}>그룹 설명</label>
                      <Textarea
                        value={newGroup.description}
                        onChange={(e) =>
                          setNewGroup({
                            ...newGroup,
                            description: e.target.value,
                          })
                        }
                        placeholder="그룹에 대한 간단한 설명을 입력하세요"
                        className={styles.textarea}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className={styles.label}>카테고리</label>
                      <select
                        className={styles.select}
                        value={newGroup.category}
                        onChange={(e) =>
                          setNewGroup({ ...newGroup, category: e.target.value })
                        }
                      >
                        <option value="스터디">스터디</option>
                        <option value="프로젝트">프로젝트</option>
                        <option value="업무">업무</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>
                    <div className={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={newGroup.isPublic}
                        onChange={(e) =>
                          setNewGroup({
                            ...newGroup,
                            isPublic: e.target.checked,
                          })
                        }
                        className={styles.checkbox}
                      />
                      <label
                        htmlFor="isPublic"
                        className={styles.checkboxLabel}
                      >
                        공개 그룹으로 만들기
                      </label>
                    </div>
                    <div className={styles.dialogActions}>
                      <Button
                        onClick={createGroupHandler}
                        className={styles.primaryButton}
                      >
                        그룹 만들기
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreatingGroup(false)}
                        className={styles.secondaryButton}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className={styles.groupsList}>
              {groups.length === 0 ? (
                <div className={styles.emptyGroups}>
                  <Users className={styles.emptyGroupsIcon} />
                  <p className={styles.emptyGroupsText}>공개 그룹이 없습니다</p>
                </div>
              ) : (
                groups.map((group) => (
                  <Card key={group.id}>
                    <CardContent className={styles.groupCardContent}>
                      <div className={styles.groupHeader}>
                        <div className={styles.groupInfo}>
                          <div
                            className={styles.groupColor}
                            style={{ backgroundColor: getGroupColor(group.id) }}
                          />
                          <h3 className={styles.groupName}>
                            {group.groupName}
                          </h3>
                        </div>
                      </div>

                      <div className={styles.groupFooter}>
                        <div className={styles.memberInfo}>
                          <Users className={styles.memberIcon} />
                          <span className={styles.memberCount}>
                            {group.numMember}명
                          </span>
                        </div>
                        <Link to={`/group/${group.id}`}>
                          <Button size="sm" variant="ghost">
                            자세히 보기 →
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Center Section - Date Header and Selected Date Todos */}
          <div className={styles.centerSection}>
            <div className={styles.dateHeader}>
              <div className={styles.dateNavigation}>
                <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Dialog
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" className={styles.dateButton}>
                      <CalendarIcon className="h-6 w-6 mr-2" />
                      {selectedDate.toLocaleDateString("ko-KR", {
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={styles.calendarDialog}>
                    <DialogHeader className={styles.calendarHeader}>
                      <DialogTitle>날짜 선택</DialogTitle>
                    </DialogHeader>
                    <div className={styles.calendarContent}>
                      <div className={styles.calendar}>
                        {/* 간단한 달력 구현 */}
                        <div className={styles.calendarGrid}>
                          {Array.from({ length: 30 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() + i - 15);
                            const isSelected =
                              date.toDateString() ===
                              selectedDate.toDateString();
                            const hasTasks = hasTasksOnDate(date);

                            return (
                              <button
                                key={i}
                                className={`${styles.calendarDay} ${
                                  isSelected ? styles.selected : ""
                                } ${hasTasks ? styles.hasTasks : ""}`}
                                onClick={() => {
                                  setSelectedDate(date);
                                  setIsDatePickerOpen(false);
                                }}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className={styles.calendarActions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToToday}
                          className={styles.todayButton}
                        >
                          오늘
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsDatePickerOpen(false)}
                          className={styles.closeButton}
                        >
                          닫기
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="ghost" size="sm" onClick={goToNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 할 일 추가</DialogTitle>
                  </DialogHeader>
                  <div className={styles.todoDialogForm}>
                    <div>
                      <label className={styles.label}>할 일</label>
                      <Input
                        value={newTodo.text}
                        onChange={(e) =>
                          setNewTodo({ ...newTodo, text: e.target.value })
                        }
                        placeholder="할 일을 입력하세요"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.todoDialogActions}>
                      <Button
                        onClick={addNewTodo}
                        className={styles.primaryButton}
                      >
                        추가
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingTodo(false)}
                        className={styles.secondaryButton}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className={styles.todosContent}>
                {todayTodos.length === 0 ? (
                  <div className={styles.emptyState}>
                    <CalendarIcon className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>
                      선택한 날짜에 할 일이 없습니다
                    </p>
                    <p className={styles.emptyDescription}>
                      추천 할 일을 추가하거나 새로운 할 일을 만들어보세요
                    </p>
                  </div>
                ) : (
                  <div className={styles.todosList}>
                    {todayTodos.map((todo) => (
                      <div key={todo.id} className={styles.todoItem}>
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className={styles.todoCheckbox}
                        >
                          {todo.completed ? (
                            <CheckCircle2
                              className={`h-6 w-6 ${styles.todoCheckboxCompleted}`}
                            />
                          ) : (
                            <Circle
                              className={`h-6 w-6 ${styles.todoCheckboxPending}`}
                            />
                          )}
                        </button>

                        <div className={styles.todoContent}>
                          {editingTodo === todo.id ? (
                            <Input
                              defaultValue={todo.text}
                              onBlur={(e) => editTodo(todo.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  editTodo(todo.id, e.currentTarget.value);
                                }
                                if (e.key === "Escape") {
                                  setEditingTodo(null);
                                }
                              }}
                              autoFocus
                              className={styles.editInput}
                            />
                          ) : (
                            <>
                              <p
                                className={`${styles.todoText} ${
                                  todo.completed ? styles.completed : ""
                                }`}
                              >
                                {todo.text}
                              </p>
                              <p className={styles.todoGroup}>{todo.group}</p>
                            </>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => setEditingTodo(todo.id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteTodo(todo.id)}
                              className={styles.deleteItem}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Recommended Todos */}
          <div className={styles.rightSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.recommendedTitle}>
                <Star className="h-6 w-6 text-yellow-500" />
                <h2 className={styles.sectionTitle}>추천 할 일</h2>
                <button
                  className={styles.helpButton}
                  onClick={() => setIsRecommendedHelpModalOpen(true)}
                >
                  <img
                    src={questionmarkIcon}
                    alt="도움말"
                    className={styles.helpIcon}
                  />
                </button>
              </div>
            </div>

            <div className={styles.recommendedList}>
              {recommendedTodos.length === 0 ? (
                <div className={styles.emptyRecommended}>
                  <Star className={styles.emptyRecommendedIcon} />
                  <p className={styles.emptyRecommendedText}>
                    추천 할 일이 없습니다
                  </p>
                </div>
              ) : (
                recommendedTodos.map((todo) => (
                  <Card key={todo.id} className={styles.recommendedCard}>
                    <CardContent className={styles.recommendedContent}>
                      <div className={styles.recommendedInfo}>
                        <div className={styles.recommendedHeader}>
                          <div className={styles.recommendedText}>
                            <p className={styles.recommendedTitle}>
                              {todo.content}
                            </p>
                            <p className={styles.recommendedGroup}>
                              {groups.find((g) => g.id === todo.groupId)
                                ?.groupName || `그룹 ${todo.groupId}`}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={styles.frequencyBadge}
                          >
                            {getTodoTypeLabel(todo.todoType)}
                          </Badge>
                        </div>

                        <Button
                          size="sm"
                          className={styles.addButton}
                          onClick={() => addTodoFromRecommended(todo)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          오늘 날짜에 추가
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 도움말 모달 */}
      <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <DialogContent className={styles.helpModal}>
          <DialogHeader>
            <DialogTitle>그룹 투두 사용 가이드</DialogTitle>
          </DialogHeader>
          <div className={styles.helpContent}>
            <div className={styles.helpSection}>
              <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                그룹 투두는 <strong>그룹의 할 일과 개인의 할 일</strong>을 함께
                관리할 수 있는
                <br />
                <strong>협업형 투두 서비스</strong>입니다.
              </p>
              <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
                프로젝트, 스터디, 과제 등 다양한 상황에서 함께 일정을
                관리해보세요.
              </p>
            </div>

            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}>✅ 할 일 추가</h3>
              <ul className={styles.helpList}>
                <li>
                  그룹 페이지 또는 메인 화면에서 <strong>"할 일 추가"</strong>{" "}
                  버튼을 눌러 할 일을 만들 수 있습니다.
                </li>
                <li>
                  생성된 투두는 <strong>그룹 할 일</strong> 또는{" "}
                  <strong>개인 할 일(Mine)</strong>로 분류됩니다.
                </li>
              </ul>
            </div>

            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}># 그룹 할 일 유형</h3>
              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    color: "#111827",
                  }}
                >
                  <strong>공용 할 일</strong>
                </h4>
                <ul className={styles.helpList}>
                  <li>
                    담당자를 지정해 <strong>특정 멤버가 수행하는 할 일</strong>
                  </li>
                  <li>예: 프로젝트, 업무</li>
                </ul>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    color: "#111827",
                  }}
                >
                  <strong>공통 할 일</strong>
                </h4>
                <ul className={styles.helpList}>
                  <li>
                    <strong>모든 그룹원이 함께 수행하는 할 일</strong>
                  </li>
                  <li>예: 스터디, 과제</li>
                </ul>
              </div>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  borderLeft: "3px solid #3b82f6",
                  marginBottom: "1rem",
                }}
              >
                <p
                  style={{ margin: 0, fontSize: "0.875rem", color: "#374151" }}
                >
                  💡 상황에 따라 공용/공통 할 일을 구분해 사용하면
                  <br />
                  그룹 내 역할 분담이 훨씬 효율적이에요.
                </p>
              </div>
            </div>

            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}>
                # 개인 할 일 (Mine 그룹)
              </h3>
              <ul className={styles.helpList}>
                <li>
                  메인 페이지에서 추가한 투두는 <strong>Mine 그룹</strong>에
                  저장됩니다.
                </li>
                <li>개인적인 일정이나 할 일을 관리할 때 활용하세요.</li>
              </ul>
            </div>
          </div>
          <div className={styles.helpFooter}>
            <Button onClick={() => setIsHelpModalOpen(false)}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 추천 투두 설명 모달 */}
      <Dialog
        open={isRecommendedHelpModalOpen}
        onOpenChange={setIsRecommendedHelpModalOpen}
      >
        <DialogContent className={styles.helpModal}>
          <DialogHeader>
            <DialogTitle>💫 추천 투두</DialogTitle>
          </DialogHeader>
          <div className={styles.helpContent}>
            <div className={styles.helpSection}>
              <p style={{ marginBottom: "0.75rem", lineHeight: "1.6" }}>
                매일 나에게 필요한 할 일을 자동으로 추천해줍니다.
              </p>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: "1.25rem",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  lineHeight: "1.5",
                }}
              >
                <li>
                  <strong>내가 담당자</strong>인 진행 중인 공용 할 일
                </li>
                <li>
                  <strong>공통으로 진행</strong>되고 있는 할 일
                </li>
                <li>
                  <strong>Favorite Todo</strong>로 등록한 자주 쓰는 할 일
                </li>
              </ol>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  borderLeft: "3px solid #3b82f6",
                  marginTop: "1rem",
                }}
              >
                <p
                  style={{ margin: 0, fontSize: "0.875rem", color: "#374151" }}
                >
                  💡 자주 반복되는 할 일은 Favorite에 추가해두면
                  <br />
                  매일 자동으로 추천받을 수 있습니다.
                </p>
              </div>
            </div>
          </div>
          <div className={styles.helpFooter}>
            <Button onClick={() => setIsRecommendedHelpModalOpen(false)}>
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
