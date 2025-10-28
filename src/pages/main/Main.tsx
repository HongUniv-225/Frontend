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
      console.log("📋 날짜별 할일 가져오기:", dateKey);

      // 해당 날짜의 할일 목록 가져오기
      const userTodos = await getUserTodosByDate(dateKey);
      console.log("📋 날짜별 할일 목록:", userTodos);

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

      console.log("✅ 날짜별 할일 로드 완료:", convertedTodos);
    } catch (error) {
      console.error("❌ 날짜별 할일 로드 실패:", error);
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
        console.log("✅ 추천 할일 로드 완료:", data);
      } catch (error) {
        console.error("❌ 추천 할일 로드 실패:", error);
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
        console.log("✅ 내 그룹 로드 완료:", sortedGroups);
      } catch (error) {
        console.error("❌ 내 그룹 로드 실패:", error);
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
        console.error("❌ 할일을 찾을 수 없습니다:", id);
        return;
      }

      // 반대 상태로 API 호출
      const newCompletedState = !currentTodo.completed;
      const response = await completeUserTodo(id, newCompletedState);
      console.log("✅ 할일 완료 상태 변경:", response);

      // 로컬 상태 업데이트
      setTodosByDate((prev) => ({
        ...prev,
        [selectedDateKey]: (prev[selectedDateKey] || []).map((todo) =>
          todo.id === id ? { ...todo, completed: newCompletedState } : todo
        ),
      }));

      // 완료 상태 변경 후 추천할일 목록도 새로고침
      console.log("🔄 완료 상태 변경 후 추천할일 목록 새로고침 중...");
      const updatedRecommendedTodos = await getRecommendedTodos();
      setRecommendedTodos(updatedRecommendedTodos);
      console.log("📋 새로고침된 추천할일 목록:", updatedRecommendedTodos);
    } catch (error) {
      console.error("❌ 할일 완료 상태 변경 실패:", error);
      alert("할일 완료 상태 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const addTodoFromRecommended = async (recommendedTodo: RecommendedTodo) => {
    try {
      console.log("🔍 추천할일 오늘 추가 시작:", {
        추천할일ID: recommendedTodo.id,
        내용: recommendedTodo.content,
        원래그룹ID: recommendedTodo.groupId,
        원래타입: recommendedTodo.todoType,
        원래할당자: recommendedTodo.assigned,
        원래상태: recommendedTodo.todoStatus,
        원래시작일: recommendedTodo.startDate,
        원래마감일: recommendedTodo.dueDate,
      });

      // 오늘 날짜로 설정
      const today = getDateKey(new Date());

      console.log("📤 추천할일 오늘 추가 요청:", {
        todoId: recommendedTodo.id,
        date: today,
        원래할일: recommendedTodo.content,
      });

      // 올바른 API 호출: POST /api/v1/todos/{todoId} with {"date": "2025-10-27"}
      const response = await addRecommendedTodoToToday(
        recommendedTodo.id,
        today
      );
      console.log("📥 추천할일 오늘 추가 응답:", response);

      // 할일 추가 후 선택된 날짜의 할일 다시 가져오기
      await fetchTodosByDate(selectedDateKey);

      console.log("🔄 추천할일 목록 새로고침 중...");
      const updatedRecommendedTodos = await getRecommendedTodos();
      console.log("📋 새로고침된 추천할일 목록:", updatedRecommendedTodos);

      const stillExists = updatedRecommendedTodos.find(
        (todo: RecommendedTodo) => todo.id === recommendedTodo.id
      );
      if (stillExists) {
        console.log(
          "⚠️ 백엔드에서 추천할일이 제거되지 않았습니다:",
          stillExists
        );
        console.log(
          "🔍 백엔드 로직을 확인해주세요. 추천할일 추가 후 해당 할일이 추천 목록에서 제거되어야 합니다."
        );
      } else {
        console.log("✅ 백엔드에서 추천할일이 성공적으로 제거되었습니다!");
      }

      setRecommendedTodos(updatedRecommendedTodos);

      console.log("✅ 추천할일 오늘 추가 완료:", response);
    } catch (error) {
      console.error("❌ 추천할일 오늘 추가 실패:", error);

      // 권한 오류인 경우 더 자세한 안내
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 403) {
          alert(
            "권한이 없습니다. 추천할일을 오늘로 추가할 수 없습니다.\n\n해결 방법:\n1. 해당 할일에 대한 권한 확인\n2. 다시 시도해주세요"
          );
        } else {
          alert("추천할일 오늘 추가에 실패했습니다. 다시 시도해주세요.");
        }
      } else {
        alert("추천할일 오늘 추가에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const addNewTodo = async () => {
    if (newTodo.text.trim()) {
      try {
        // Mine 그룹 찾기 (기본 그룹)
        console.log("🔍 전체 그룹 목록:", groups);
        const mineGroup = groups.find((g) => g.groupName === "Mine");
        console.log("🔍 Mine 그룹 찾기 결과:", mineGroup);
        const groupId = mineGroup?.id || 7; // Mine 그룹이 없으면 기본값 7 사용
        console.log("📝 사용된 Group ID:", groupId);

        // API로 할일 추가
        const todoData = {
          content: newTodo.text,
          todoType: "PERSONAL" as const,
          startDate: selectedDateKey,
          dueDate: selectedDateKey,
          assigned: 0,
        };

        console.log("📤 API 호출 데이터:", todoData);
        const response = await addTodoToGroup(groupId, todoData);
        console.log("📥 API 응답:", response);

        // 할일 추가 후 선택된 날짜의 할일 다시 가져오기
        await fetchTodosByDate(selectedDateKey);

        setNewTodo({ text: "", group: "개인" });
        setIsAddingTodo(false);

        console.log("✅ 할일 추가 완료:", response);
      } catch (error) {
        console.error("❌ 할일 추가 실패:", error);
        // 에러가 발생해도 사용자에게 알림 (선택사항)
        alert("할일 추가에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const deleteTodo = async (userTodoId: number) => {
    try {
      console.log("🗑️ 삭제 시도:", { userTodoId });

      // 삭제할 할일 정보 찾기
      const todoToDelete = todosByDate[selectedDateKey]?.find(
        (todo) => todo.id === userTodoId
      );

      if (!todoToDelete) {
        console.error("❌ 삭제할 할일을 찾을 수 없습니다:", userTodoId);
        return;
      }

      console.log("🔍 삭제할 할일 정보:", {
        userTodoId,
        group: todoToDelete.group,
        groupId: todoToDelete.groupId,
        todoId: todoToDelete.todoId,
      });

      // 그룹이 "Mine"이고 groupId와 todoId가 있으면 그룹 할일 삭제 API 사용
      if (
        todoToDelete.group === "Mine" &&
        todoToDelete.groupId &&
        todoToDelete.todoId
      ) {
        console.log("🏠 Mine 그룹 할일 삭제:", {
          groupId: todoToDelete.groupId,
          todoId: todoToDelete.todoId,
        });
        await deleteGroupTodoById(todoToDelete.todoId, todoToDelete.groupId);
      } else {
        // 일반 사용자 할일 삭제 API 사용
        console.log("👤 일반 사용자 할일 삭제:", userTodoId);
        await deleteUserTodo(userTodoId);
      }

      // 삭제 후 선택된 날짜의 할일 다시 가져오기
      await fetchTodosByDate(selectedDateKey);

      // 추천할일 목록도 새로고침 (삭제된 할일이 추천할일로 다시 추가될 수 있음)
      console.log("🔄 추천할일 목록 새로고침 중...");
      const updatedRecommendedTodos = await getRecommendedTodos();
      setRecommendedTodos(updatedRecommendedTodos);
      console.log("📋 새로고침된 추천할일 목록:", updatedRecommendedTodos);

      console.log("✅ 할일 삭제 완료:", userTodoId);
    } catch (error) {
      console.error("❌ 할일 삭제 실패:", error);

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
        console.log("🔄 로컬 삭제 후 추천할일 목록 새로고침 중...");
        const updatedRecommendedTodos = await getRecommendedTodos();
        setRecommendedTodos(updatedRecommendedTodos);
        console.log("📋 새로고침된 추천할일 목록:", updatedRecommendedTodos);

        console.log("✅ 로컬에서 할일 삭제 완료:", userTodoId);
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

      console.log("📤 그룹 생성 요청:", groupData);
      const response = await createGroup(groupData);
      console.log("✅ 그룹 생성 완료:", response);

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
          console.log("✅ 그룹 목록 새로고침 완료:", sortedGroups);
        } catch (error) {
          console.error("❌ 그룹 목록 새로고침 실패:", error);
        }
      };

      await fetchMyGroups();
    } catch (error) {
      console.error("❌ 그룹 생성 실패:", error);
      alert("그룹 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleLogout = () => {
    console.log("로그아웃");
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
              <h1 className={styles.title}>그룹 투두</h1>
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
                    <DialogTitle>새 할일 추가</DialogTitle>
                  </DialogHeader>
                  <div className={styles.todoDialogForm}>
                    <div>
                      <label className={styles.label}>할일</label>
                      <Input
                        value={newTodo.text}
                        onChange={(e) =>
                          setNewTodo({ ...newTodo, text: e.target.value })
                        }
                        placeholder="할일을 입력하세요"
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
                      선택한 날짜에 할일이 없습니다
                    </p>
                    <p className={styles.emptyDescription}>
                      오른쪽에서 추천 할일을 추가하거나 새로운 할일을
                      만들어보세요
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
                <h2 className={styles.sectionTitle}>추천 할일</h2>
              </div>
            </div>

            <div className={styles.recommendedList}>
              {recommendedTodos.length === 0 ? (
                <div className={styles.emptyRecommended}>
                  <Star className={styles.emptyRecommendedIcon} />
                  <p className={styles.emptyRecommendedText}>
                    추천 할일이 없습니다
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
            <DialogTitle>그룹 투두 사용법</DialogTitle>
          </DialogHeader>
          <div className={styles.helpContent}>
            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}>📋 할일 관리</h3>
              <ul className={styles.helpList}>
                <li>좌측에서 그룹을 선택하여 할일을 추가할 수 있습니다</li>
                <li>중앙에서 오늘 날짜의 할일을 확인하고 체크할 수 있습니다</li>
                <li>우측에서 추천 할일을 오늘 날짜에 추가할 수 있습니다</li>
              </ul>
            </div>

            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}>👥 그룹 관리</h3>
              <ul className={styles.helpList}>
                <li>"그룹 생성" 버튼으로 새로운 그룹을 만들 수 있습니다</li>
                <li>"그룹 탐색"에서 공개 그룹을 찾아 참여할 수 있습니다</li>
                <li>그룹별로 색상이 다르게 표시됩니다</li>
              </ul>
            </div>

            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}>📅 날짜 관리</h3>
              <ul className={styles.helpList}>
                <li>날짜 버튼을 클릭하여 다른 날짜를 선택할 수 있습니다</li>
                <li>화살표 버튼으로 이전/다음 날로 이동할 수 있습니다</li>
                <li>"오늘" 버튼으로 오늘 날짜로 빠르게 이동할 수 있습니다</li>
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
}
