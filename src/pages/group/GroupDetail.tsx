import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  AvatarFallback,
  AvatarImage,
} from "../../components/common/avatar/Avatar";
import Input from "../../components/common/input/Input";
import Textarea from "../../components/common/textarea/Textarea";
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
  ArrowLeft,
  Users,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  MoreHorizontal,
  Settings,
  PlayCircle,
  XCircle,
  ChevronDown,
  LogOut,
  User,
  Edit,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getStoredUser } from "../../apis/auth";
import questionmarkIcon from "../../assets/questionmark.svg";
import {
  getGroupById,
  getGroupMembers,
  getGroupTodos,
  deleteGroup,
  leaveGroup,
  updateGroup,
  updateMemberNicknameById,
  getUserProfile,
  getMemberDetail,
  updateMemberRole,
  createGroupTodo,
  updateGroupTodo,
  deleteGroupTodoById,
} from "../../apis/user";
import styles from "./groupDetail.module.scss";

type TaskStatus = "pending" | "in-progress" | "completed" | "failed";
type TaskType = "공용" | "공통" | "개인";

interface Task {
  id: number;
  content: string;
  description?: string;
  assignee?: string;
  assigned?: number | null;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  type: TaskType;
  todoType?: string;
}

interface Member {
  id: number;
  nickname: string;
  role: string;
  userId: number;
  groupId: number;
  email: string;
  introduction: string;
  imageUrl: string;
}

interface MemberDetail {
  id: number;
  nickname: string;
  role: string;
  userId: number;
  groupId: number;
  email: string;
  introduction: string;
  imageUrl: string;
}

interface Group {
  id: number;
  groupName: string;
  description: string;
  scope: string;
  category: string;
  imageUrl: string | null;
  createdAt: string | null;
  numMember: number;
  creatorId?: number;
  members?: Member[];
  tasks?: Task[];
}

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

  const colorIndex = groupId % colors.length;
  return colors[colorIndex];
};

// 날짜를 YYYY-MM-DD 형식으로 포맷팅하는 함수
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "정보 없음";

  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("날짜 포맷팅 오류:", error);
    return "정보 없음";
  }
};

// 역할을 한국어로 매핑하는 함수
const getRoleLabel = (role: string): string => {
  switch (role) {
    case "CREATOR":
      return "그룹 생성자";
    case "ADMIN":
      return "관리자";
    case "MEMBER":
      return "일반 멤버";
    default:
      return role;
  }
};

// 역할 우선순위 함수
const getRolePriority = (role: string): number => {
  switch (role) {
    case "CREATOR":
      return 1; // 가장 높은 우선순위
    case "ADMIN":
      return 2; // 두 번째 우선순위
    case "MEMBER":
      return 3; // 가장 낮은 우선순위
    default:
      return 4;
  }
};

// 카테고리를 한국어로 매핑하는 함수
const getCategoryLabel = (category: string): string => {
  switch (category) {
    case "STUDY":
      return "스터디";
    case "PROJECT":
      return "프로젝트";
    case "WORK":
      return "업무";
    case "OTHER":
      return "기타";
    default:
      return category;
  }
};

// Mock data는 더 이상 사용하지 않음 (실제 API 사용)

// API 상태를 UI 상태로 변환하는 헬퍼 함수
const convertApiStatusToUiStatus = (
  apiStatus: string
): "pending" | "in-progress" | "completed" | "failed" => {
  switch (apiStatus) {
    case "WAITING":
      return "pending";
    case "IN_PROGRESS":
      return "in-progress";
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return "failed";
    default:
      return "pending";
  }
};

// API todoType을 UI type으로 변환하는 헬퍼 함수
const convertApiTodoTypeToUiType = (todoType: string): TaskType => {
  switch (todoType) {
    case "EXCLUSIVE":
      return "공용";
    case "COPYABLE":
      return "공통";
    case "PERSONAL":
      return "개인";
    default:
      return "공통";
  }
};

export default function GroupDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    description: "",
    assignee: "",
    startDate: "",
    dueDate: "",
    type: "공통" as TaskType,
  });
  const [showPending, setShowPending] = useState(true);
  const [showInProgress, setShowInProgress] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    pending: false,
    "in-progress": false,
    completed: false,
    failed: false,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [editGroupData, setEditGroupData] = useState({
    groupName: "",
    description: "",
    category: "STUDY",
    image: null as string | null,
    scope: "PERSONAL",
  });
  const [editGroupImageFile, setEditGroupImageFile] = useState<File | null>(
    null
  );
  const [user, setUser] = useState<{
    id?: number;
    userId?: number;
    nickname?: string;
    email?: string;
    imageUrl?: string;
    [key: string]: unknown; // 다른 필드들도 허용
  } | null>(null);
  const [isEditNicknameOpen, setIsEditNicknameOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newNickname, setNewNickname] = useState("");
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);

  // 멤버 상세 정보 팝업 상태
  const [isMemberDetailOpen, setIsMemberDetailOpen] = useState(false);
  const [memberDetail, setMemberDetail] = useState<MemberDetail | null>(null);
  const [isLoadingMemberDetail, setIsLoadingMemberDetail] = useState(false);

  // 멤버 역할 변경 상태
  const [isRoleChangeOpen, setIsRoleChangeOpen] = useState(false);
  const [selectedMemberForRole, setSelectedMemberForRole] =
    useState<MemberDetail | null>(null);
  const [newRole, setNewRole] = useState("");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // 저장된 사용자 정보 먼저 로드
        const storedUser = getStoredUser();
        setUser(storedUser as typeof user);
        console.log("🔍 저장된 사용자 정보:", storedUser);

        // 서버에서 최신 사용자 정보 가져오기
        const userProfile = await getUserProfile();
        console.log("🔍 서버에서 가져온 사용자 정보 상세:", {
          userProfile,
          hasId: !!userProfile?.id,
          hasUserId: !!userProfile?.userId,
          keys: userProfile ? Object.keys(userProfile) : [],
          fullObject: userProfile,
        });
        setUser(userProfile as typeof user);
      } catch (error) {
        console.error("❌ 사용자 정보 로드 실패:", error);
        // 실패 시 저장된 정보라도 사용
        const storedUser = getStoredUser();
        setUser(storedUser as typeof user);
      }
    };

    loadUserData();

    // 그룹 정보 가져오기
    const fetchGroupData = async () => {
      try {
        const groupData = await getGroupById(groupId);
        setGroup(groupData);
        console.log("✅ 그룹 정보 로드 완료:", groupData);
      } catch (error) {
        console.error("❌ 그룹 정보 로드 실패:", error);
        setGroup(null);
      }
    };

    // 그룹 멤버 목록 가져오기
    const fetchGroupMembers = async () => {
      try {
        const membersData = await getGroupMembers(groupId);
        setMembers(membersData);
        console.log("✅ 그룹 멤버 로드 완료:", membersData);
        console.log("🔍 멤버 데이터 상세:", {
          count: membersData.length,
          members: membersData.map((m: Member) => ({
            id: m.id,
            userId: m.userId,
            nickname: m.nickname,
            role: m.role,
            groupId: m.groupId,
          })),
        });
      } catch (error) {
        console.error("❌ 그룹 멤버 로드 실패:", error);
        setMembers([]);
      }
    };

    if (groupId) {
      fetchGroupData();
      fetchGroupMembers();
    }
  }, [groupId]);

  // 멤버 정보가 로드된 후 할 일 로드
  useEffect(() => {
    if (groupId && members.length > 0) {
      const fetchGroupTodos = async () => {
        try {
          const todosData = await getGroupTodos(groupId);
          console.log("✅ 그룹 할일 로드 완료:", todosData);

          // API 응답을 Task 형태로 변환
          const convertedTasks: Task[] = todosData.map(
            (todo: {
              id: number;
              content: string;
              todoType: string;
              assigned: number;
              todoStatus: string;
              startDate: string;
              dueDate: string;
            }) => {
              // assigned ID로 닉네임 찾기
              const assignedMember = members.find(
                (member) => member.userId === todo.assigned
              );
              const assigneeNickname = assignedMember?.nickname || "";

              return {
                id: todo.id,
                content: todo.content,
                description: todo.content,
                todoType: todo.todoType,
                type: convertApiTodoTypeToUiType(todo.todoType),
                assigned: todo.assigned,
                assignee: assigneeNickname,
                status: convertApiStatusToUiStatus(todo.todoStatus),
                startDate: todo.startDate,
                dueDate: todo.dueDate,
              };
            }
          );

          setTasks(convertedTasks);
        } catch (error) {
          console.error("❌ 그룹 할일 로드 실패:", error);
          setTasks([]);
        }
      };

      fetchGroupTodos();
    }
  }, [groupId, members]);

  const handleLogout = () => {
    console.log("로그아웃");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 기본 그룹인지 확인하는 함수
  const isDefaultGroup = (groupName: string) => {
    return groupName === "Mine" || groupName === "Favorite";
  };

  // 그룹 삭제 함수 (생성자만)
  const handleDeleteGroup = async () => {
    if (
      !group ||
      !confirm(
        "정말로 이 그룹을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return;
    }

    try {
      setIsDeletingGroup(true);
      await deleteGroup(group.id);
      alert("그룹이 성공적으로 삭제되었습니다.");
      navigate("/main");
    } catch (error) {
      console.error("❌ 그룹 삭제 실패:", error);
      alert("그룹 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsDeletingGroup(false);
      setIsSettingsOpen(false);
    }
  };

  // 그룹 탈퇴 함수 (멤버만)
  const handleLeaveGroup = async () => {
    if (!group || !confirm("정말로 이 그룹에서 탈퇴하시겠습니까?")) {
      return;
    }

    try {
      setIsLeavingGroup(true);
      await leaveGroup(group.id);
      alert("그룹에서 성공적으로 탈퇴했습니다.");
      navigate("/main");
    } catch (error) {
      console.error("❌ 그룹 탈퇴 실패:", error);
      alert("그룹 탈퇴에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLeavingGroup(false);
      setIsSettingsOpen(false);
    }
  };

  // 그룹 수정 함수
  const handleUpdateGroup = async () => {
    if (!group) return;

    // 기본 그룹은 수정할 수 없음
    if (isDefaultGroup(group.groupName)) {
      alert(`${group.groupName}은(는) 수정할 수 없는 그룹입니다.`);
      return;
    }

    // 생성자 권한 확인
    if (group.creatorId !== user?.id) {
      alert("그룹 생성자만 그룹 정보를 수정할 수 있습니다.");
      return;
    }

    try {
      setIsUpdatingGroup(true);

      const groupUpdateData = {
        groupName: editGroupData.groupName,
        description: editGroupData.description,
        category: editGroupData.category,
        scope: editGroupData.scope,
        image: editGroupImageFile,
        imageUrl: editGroupData.image, // 기존 이미지 URL
      };

      const updatedGroup = await updateGroup(group.id, groupUpdateData);
      // 그룹 정보 업데이트
      setGroup(updatedGroup);
      setIsEditGroupOpen(false);
      alert("그룹 정보가 성공적으로 수정되었습니다.");
    } catch (error: unknown) {
      console.error("❌ 그룹 수정 실패:", error);

      // 더 자세한 에러 메시지
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 403) {
          alert("권한이 없습니다. 그룹 생성자만 수정할 수 있습니다.");
        } else if (axiosError.response?.status === 404) {
          alert("그룹을 찾을 수 없습니다.");
        } else {
          alert(
            `그룹 수정에 실패했습니다: ${
              axiosError.response?.data?.message || "알 수 없는 오류"
            }`
          );
        }
      } else {
        alert("그룹 수정에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsUpdatingGroup(false);
    }
  };

  // 그룹 수정 다이얼로그 열기
  const openEditGroupDialog = () => {
    if (!group) return;

    // 기본 그룹은 수정할 수 없음
    if (isDefaultGroup(group.groupName)) {
      alert(`${group.groupName}은(는) 수정할 수 없는 그룹입니다.`);
      return;
    }

    // 생성자 권한 확인
    if (group.creatorId !== user?.id) {
      alert("그룹 생성자만 그룹 정보를 수정할 수 있습니다.");
      return;
    }

    setEditGroupData({
      groupName: group.groupName,
      description: group.description,
      category: group.category,
      image: group.imageUrl || null,
      scope: group.scope,
    });
    setEditGroupImageFile(null);
    setIsEditGroupOpen(true);
  };

  // 멤버 닉네임 변경 다이얼로그 열기
  const openEditNicknameDialog = (member: Member) => {
    console.log("🔍 편집할 멤버 정보:", {
      id: member.id,
      nickname: member.nickname,
      userId: member.userId,
      role: member.role,
    });
    setEditingMember(member);
    setNewNickname(member.nickname || "");
    setIsEditNicknameOpen(true);
  };

  // 멤버 상세 정보 팝업 열기
  const openMemberDetail = async (member: Member) => {
    if (!group) return;

    try {
      setIsLoadingMemberDetail(true);

      const detail = await getMemberDetail(group.id, member.id);
      setMemberDetail(detail);
      setIsMemberDetailOpen(true);
    } catch (error) {
      console.error("❌ 멤버 상세 정보 로드 실패:", error);
      alert("멤버 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingMemberDetail(false);
    }
  };

  // 역할 변경 다이얼로그 열기
  const openRoleChangeDialog = (member: MemberDetail) => {
    // CREATOR는 역할 변경 불가
    if (member.role === "CREATOR") {
      alert("생성자의 역할은 변경할 수 없습니다.");
      return;
    }

    setSelectedMemberForRole(member);
    setNewRole(member.role);
    setIsRoleChangeOpen(true);
  };

  // 멤버 역할 변경 함수
  const handleUpdateRole = async () => {
    if (!selectedMemberForRole || !group) return;

    if (!newRole.trim()) {
      alert("역할을 선택해주세요.");
      return;
    }

    // CREATOR로 변경하려고 할 때 경고
    if (newRole === "CREATOR") {
      alert("생성자는 한 명뿐이어야 합니다. 다른 역할을 선택해주세요.");
      return;
    }

    try {
      setIsUpdatingRole(true);
      await updateMemberRole(group.id, selectedMemberForRole.id, newRole);

      // 멤버 목록 업데이트
      setMembers((prev) =>
        prev.map((member) =>
          member.id === selectedMemberForRole.id
            ? { ...member, role: newRole }
            : member
        )
      );

      // 멤버 상세 정보도 업데이트
      setMemberDetail((prev) => (prev ? { ...prev, role: newRole } : null));

      setIsRoleChangeOpen(false);
      alert("역할이 성공적으로 변경되었습니다.");
    } catch (error: unknown) {
      console.error("❌ 역할 변경 실패:", error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 403) {
          alert("권한이 없습니다. CREATOR만 역할을 변경할 수 있습니다.");
        } else if (axiosError.response?.status === 404) {
          alert("멤버를 찾을 수 없습니다.");
        } else if (axiosError.response?.status === 500) {
          alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else {
          alert(
            `역할 변경에 실패했습니다: ${
              axiosError.response?.data?.message || "알 수 없는 오류"
            }`
          );
        }
      } else {
        alert("역할 변경에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // 멤버 닉네임 변경 함수
  const handleUpdateNickname = async () => {
    if (!editingMember || !group || !user) return;

    if (!newNickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      setIsUpdatingNickname(true);
      await updateMemberNicknameById(
        group.id,
        editingMember.id,
        newNickname.trim()
      );

      // 사용자 정보 업데이트
      setUser((prev) =>
        prev ? { ...prev, nickname: newNickname.trim() } : null
      );

      // 멤버 목록 업데이트
      setMembers((prev) =>
        prev.map((member) =>
          member.id === editingMember.id
            ? { ...member, nickname: newNickname.trim() }
            : member
        )
      );

      setIsEditNicknameOpen(false);
      alert("닉네임이 성공적으로 변경되었습니다.");
    } catch (error: unknown) {
      console.error("❌ 닉네임 변경 실패:", error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 403) {
          alert("권한이 없습니다. 본인의 닉네임만 변경할 수 있습니다.");
        } else if (axiosError.response?.status === 404) {
          alert("멤버를 찾을 수 없습니다.");
        } else if (axiosError.response?.status === 500) {
          alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else {
          alert(
            `닉네임 변경에 실패했습니다: ${
              axiosError.response?.data?.message || "알 수 없는 오류"
            }`
          );
        }
      } else {
        alert("닉네임 변경에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsUpdatingNickname(false);
    }
  };

  const toggleExpanded = (status: TaskStatus) => {
    setExpandedSections((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  // 할일 삭제 함수
  const handleDeleteTask = async (taskId: number) => {
    if (!group || !confirm("정말로 이 할일을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteGroupTodoById(taskId, group.id);
      // 로컬 상태에서도 제거
      setTasks(tasks.filter((task) => task.id !== taskId));
      alert("할일이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("❌ 할일 삭제 실패:", error);
      alert("할일 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 현재 사용자의 역할 확인 함수
  const getCurrentUserRole = () => {
    const currentUserMember = members.find(
      (member) =>
        member.userId === user?.id ||
        member.userId === user?.userId ||
        member.email === user?.email ||
        member.nickname === user?.nickname
    );
    return currentUserMember?.role;
  };

  // 관리자 이상 권한 확인 함수
  const canManageTasks = () => {
    const role = getCurrentUserRole();
    return role === "CREATOR" || role === "ADMIN";
  };

  const addTask = async () => {
    if (!group) return;

    // 멤버 정보에서 현재 사용자의 실제 ID 찾기
    const currentUserMember = members.find(
      (member) =>
        member.userId === user?.id ||
        member.userId === user?.userId ||
        member.email === user?.email ||
        member.nickname === user?.nickname
    );

    console.log("🔍 할 일 추가 시작:", {
      groupId: group.id,
      user: user,
      userId: user?.id,
      userIdAlt: user?.userId,
      userEmail: user?.email,
      currentUserMember,
      actualUserId: currentUserMember?.userId,
      newTask: newTask,
    });

    // 그룹 데이터 전체 확인
    console.log("🔍 그룹 데이터 전체:", {
      group: group,
      groupKeys: group ? Object.keys(group) : [],
      groupCreatorId: group?.creatorId,
      groupCreatedAt: group?.createdAt,
      groupNumMember: group?.numMember,
    });

    // 사용자 정보에 ID가 없으면 멤버 정보에서 가져와서 업데이트
    if (!user?.id && !user?.userId && currentUserMember?.userId) {
      console.log(
        "🔍 사용자 정보에 ID가 없어서 멤버 정보에서 가져옴:",
        currentUserMember.userId
      );
      setUser({
        ...user,
        id: currentUserMember.userId,
        userId: currentUserMember.userId,
      });
    }

    // 멤버 상세 정보로 정확한 역할 확인
    if (currentUserMember?.id) {
      try {
        console.log("🔍 멤버 상세 정보 확인 중...", {
          groupId: group.id,
          memberId: currentUserMember.id,
        });
        const memberDetail = await getMemberDetail(
          group.id,
          currentUserMember.id
        );
        console.log("🔍 멤버 상세 정보:", memberDetail);
      } catch (error) {
        console.error("❌ 멤버 상세 정보 확인 실패:", error);
      }
    }

    // 필수 입력 검사
    if (!newTask.description.trim()) {
      alert("할 일 내용을 입력해주세요.");
      return;
    }
    if (!newTask.startDate) {
      alert("시작일을 선택해주세요.");
      return;
    }
    if (!newTask.dueDate) {
      alert("마감일을 선택해주세요.");
      return;
    }
    if (newTask.type === "공용" && !newTask.assignee) {
      alert("담당자를 선택해주세요.");
      return;
    }

    try {
      setIsAddingTask(true);

      // 담당자 ID 찾기
      let assignedId = null;
      if (newTask.assignee) {
        const assignedMember = members.find(
          (member) => member.nickname === newTask.assignee
        );
        assignedId = assignedMember?.userId || null;
        console.log("🔍 담당자 정보:", {
          assignee: newTask.assignee,
          assignedMember,
          assignedId,
        });
      }

      const todoData = {
        content: newTask.description.trim(),
        todoType: (newTask.type === "공용"
          ? "EXCLUSIVE"
          : newTask.type === "공통"
          ? "COPYABLE"
          : "PERSONAL") as "EXCLUSIVE" | "COPYABLE" | "PERSONAL",
        startDate: newTask.startDate,
        dueDate: newTask.dueDate,
        assigned: assignedId,
        role: currentUserMember?.role || "MEMBER", // 역할 정보 추가
      };

      console.log("🔍 할 일 추가 요청 데이터:", {
        groupId: group.id,
        todoData,
        userInfo: {
          id: user?.id,
          userId: user?.userId,
          email: user?.email,
          nickname: user?.nickname,
        },
        currentUserMember,
        actualUserId: currentUserMember?.userId,
      });

      // 권한 확인을 위한 추가 정보
      console.log("🔍 권한 확인 정보:", {
        groupId: group.id,
        groupCreatorId: group.creatorId,
        userRole: currentUserMember?.role,
        isCreatorByRole: currentUserMember?.role === "CREATOR",
        isCreatorById: group.creatorId === currentUserMember?.userId,
        memberId: currentUserMember?.id,
        userId: currentUserMember?.userId,
      });

      const createdTask = await createGroupTodo(group.id, todoData);

      // 할 일 목록에 추가
      setTasks([
        ...tasks,
        {
          id: createdTask.id,
          content: createdTask.content,
          description: createdTask.content,
          assignee: newTask.assignee,
          assigned: assignedId,
          startDate: createdTask.startDate,
          dueDate: createdTask.dueDate,
          type: convertApiTodoTypeToUiType(createdTask.todoType),
          status: "pending",
        },
      ]);

      // 폼 초기화
      setNewTask({
        description: "",
        assignee: "",
        startDate: "",
        dueDate: "",
        type: "공통",
      });

      setIsAddingTask(false);
      alert("할 일이 성공적으로 추가되었습니다.");
    } catch (error: unknown) {
      console.error("❌ 할 일 추가 실패:", error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status: number; data?: { message?: string } };
        };

        if (axiosError.response?.status === 403) {
          alert("권한이 없습니다. 관리자 이상만 할 일을 추가할 수 있습니다.");
        } else if (axiosError.response?.status === 404) {
          alert("그룹을 찾을 수 없습니다.");
        } else if (axiosError.response?.status === 500) {
          alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else {
          alert(
            `할 일 추가에 실패했습니다: ${
              axiosError.response?.data?.message || "알 수 없는 오류"
            }`
          );
        }
      } else {
        alert("할 일 추가에 실패했습니다. 다시 시도해주세요.");
      }

      setIsAddingTask(false);
    }
  };

  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditingTask(true);
  };

  const saveEditTask = async () => {
    if (!editingTask || !group) return;

    // 필수 입력 검사
    if (!editingTask.description?.trim()) {
      alert("할 일 내용을 입력해주세요.");
      return;
    }
    if (!editingTask.startDate) {
      alert("시작일을 선택해주세요.");
      return;
    }
    if (!editingTask.dueDate) {
      alert("마감일을 선택해주세요.");
      return;
    }
    if (editingTask.type === "공용" && !editingTask.assignee) {
      alert("담당자를 선택해주세요.");
      return;
    }

    try {
      // 담당자 ID 찾기
      let assignedId = null;
      if (editingTask.assignee) {
        const assignedMember = members.find(
          (member) => member.nickname === editingTask.assignee
        );
        assignedId = assignedMember?.userId || null;
      }

      const todoData = {
        content: editingTask.description.trim(),
        startDate: editingTask.startDate,
        dueDate: editingTask.dueDate,
        assigned: assignedId,
      };

      const updatedTask = await updateGroupTodo(
        editingTask.id,
        group.id,
        todoData
      );

      // 할 일 목록 업데이트
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...updatedTask,
                description: updatedTask.content,
                assignee: editingTask.assignee,
                assigned: assignedId,
              }
            : task
        )
      );

      setEditingTask(null);
      setIsEditingTask(false);
      alert("할 일이 성공적으로 수정되었습니다.");
    } catch (error) {
      console.error("❌ 할 일 수정 실패:", error);
      alert("할 일 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const getTypeBadgeVariant = (type: TaskType) => {
    switch (type) {
      case "공용":
        return "default"; // 파란색
      case "공통":
        return "secondary"; // 초록색
      case "개인":
        return "outline"; // 회색
      default:
        return "outline";
    }
  };

  const renderTaskItem = (task: Task) => {
    // 관리자 이상 권한 확인 (CREATOR, ADMIN)
    const canManageThisTask = canManageTasks();

    return (
      <Card key={task.id} className={styles.taskCard}>
        <CardContent className={styles.taskContent}>
          <div className={styles.taskWrapper}>
            <div className={styles.taskMain}>
              <div className={styles.taskHeader}>
                <div className={styles.taskInfo}>
                  <Badge
                    variant={getTypeBadgeVariant(task.type)}
                    className={styles.typeBadge}
                  >
                    {task.type}
                  </Badge>
                  <p className={styles.taskDescription}>
                    {task.description || task.content}
                  </p>
                </div>
              </div>

              <div className={styles.taskFooter}>
                <div className={styles.taskDetails}>
                  {task.type === "공용" && task.assignee && (
                    <span className={styles.assignee}>
                      담당: {task.assignee}
                    </span>
                  )}
                  <div className={styles.dateInfo}>
                    <Calendar className={styles.dateIcon} />
                    {task.startDate} ~ {task.dueDate}
                  </div>
                </div>
                {canManageThisTask && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={styles.moreButton}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => startEditTask(task)}>
                        <Edit className="h-4 w-4 mr-2" />할 일 수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteTask(task.id)}
                        className={styles.deleteItem}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />할 일 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!group) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <h1 className={styles.notFoundTitle}>그룹을 찾을 수 없습니다</h1>
          <Link to="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
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

  const getDisplayedTasks = (status: TaskStatus) => {
    const statusTasks = tasksByStatus[status];
    const maxDisplay = 7;
    return expandedSections[status]
      ? statusTasks
      : statusTasks.slice(0, maxDisplay);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className={styles.titleSection}>
              <div
                className={styles.groupColor}
                style={{ backgroundColor: getGroupColor(group.id) }}
              />
              <h1 className={styles.title}>{group.groupName}</h1>
              <Badge variant="outline" className={styles.categoryBadge}>
                {getCategoryLabel(group.category)}
              </Badge>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
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
          {/* Left Section - Group Info & Members */}
          <div className={styles.leftSection}>
            {/* Group Info */}
            <Card>
              <CardHeader>
                <CardTitle className={styles.sectionTitle}>
                  <div className={styles.groupInfoHeader}>
                    <div className={styles.groupInfoTitle}>
                      <Users className="h-5 w-5" />
                      그룹 정보
                    </div>
                    {(() => {
                      // 현재 사용자의 멤버 정보 찾기
                      const currentUserMember = members.find(
                        (member) =>
                          member.userId === user?.id ||
                          member.email === user?.email ||
                          member.nickname === user?.nickname
                      );

                      // CREATOR이고 기본 그룹이 아닌 경우에만 톱니바퀴 표시
                      return (
                        currentUserMember?.role === "CREATOR" &&
                        !isDefaultGroup(group.groupName)
                      );
                    })() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={openEditGroupDialog}
                        className={styles.editGroupButton}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className={styles.groupInfoContent}>
                <div className={styles.infoItem}>
                  <p className={styles.infoLabel}>설명</p>
                  <p className={styles.infoValue}>{group.description}</p>
                </div>
                <div className={styles.infoItem}>
                  <p className={styles.infoLabel}>생성일</p>
                  <p className={styles.infoValue}>
                    {formatDate(group.createdAt)}
                  </p>
                </div>
                <div className={styles.infoItem}>
                  <p className={styles.infoLabel}>멤버 수</p>
                  <p className={styles.infoValue}>{group.numMember}명</p>
                </div>
              </CardContent>
            </Card>

            {/* Members */}
            {members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>그룹원</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.membersList}>
                    {members
                      .sort((a, b) => {
                        const priorityA = getRolePriority(a.role);
                        const priorityB = getRolePriority(b.role);

                        // 역할 우선순위로 정렬
                        if (priorityA !== priorityB) {
                          return priorityA - priorityB;
                        }

                        // 같은 역할이면 닉네임으로 정렬
                        return a.nickname.localeCompare(b.nickname);
                      })
                      .map((member) => (
                        <div
                          key={member.id}
                          className={styles.memberItem}
                          onClick={() => openMemberDetail(member)}
                          style={{ cursor: "pointer" }}
                        >
                          <Avatar className={styles.memberAvatar}>
                            <AvatarImage src={member.imageUrl} />
                            <AvatarFallback>
                              {member.nickname[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className={styles.memberInfo}>
                            <p className={styles.memberName}>
                              {member.nickname}
                            </p>
                            {member.introduction && (
                              <p className={styles.memberIntroduction}>
                                {member.introduction}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={styles.memberRole}
                          >
                            {getRoleLabel(member.role)}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Section - Tasks */}
          <div className={styles.rightSection}>
            <div className={styles.tasksHeader}>
              <h2 className={styles.tasksTitle}>그룹 할일</h2>
              <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
                <DialogTrigger asChild>
                  <Button
                    disabled={!canManageTasks()}
                    title={
                      !canManageTasks()
                        ? "관리자 이상만 할 일을 추가할 수 있습니다."
                        : ""
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    할일 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 할일 추가</DialogTitle>
                  </DialogHeader>
                  <div className={styles.taskDialogForm}>
                    <div>
                      <label className={styles.label}>설명</label>
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
                      <label className={styles.label}>타입</label>
                      <select
                        className={styles.select}
                        value={newTask.type}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            type: e.target.value as TaskType,
                          })
                        }
                      >
                        <option value="공통">공통</option>
                        <option value="공용">공용</option>
                        <option value="개인">개인</option>
                      </select>
                    </div>
                    {newTask.type === "공용" && (
                      <div>
                        <label className={styles.label}>담당자</label>
                        <select
                          className={styles.select}
                          value={newTask.assignee}
                          onChange={(e) =>
                            setNewTask({ ...newTask, assignee: e.target.value })
                          }
                        >
                          <option value="">담당자 선택</option>
                          {members
                            .sort((a, b) => {
                              const priorityA = getRolePriority(a.role);
                              const priorityB = getRolePriority(b.role);

                              if (priorityA !== priorityB) {
                                return priorityA - priorityB;
                              }

                              return a.nickname.localeCompare(b.nickname);
                            })
                            .map((member) => (
                              <option key={member.id} value={member.nickname}>
                                {member.nickname}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className={styles.label}>시작일</label>
                      <Input
                        type="date"
                        value={newTask.startDate}
                        onChange={(e) =>
                          setNewTask({ ...newTask, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={styles.label}>마감일</label>
                      <Input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) =>
                          setNewTask({ ...newTask, dueDate: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.dialogActions}>
                      <Button
                        onClick={addTask}
                        className={styles.primaryButton}
                      >
                        추가
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingTask(false)}
                        className={styles.secondaryButton}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={isEditingTask} onOpenChange={setIsEditingTask}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>할 일 수정</DialogTitle>
                </DialogHeader>
                {editingTask && (
                  <div className={styles.taskDialogForm}>
                    <div>
                      <label className={styles.label}>설명</label>
                      <Textarea
                        value={editingTask.description || ""}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            description: e.target.value,
                          })
                        }
                        placeholder="할일 설명을 입력하세요"
                      />
                    </div>
                    <div>
                      <label className={styles.label}>타입</label>
                      <div className={styles.disabledField}>
                        <Badge
                          variant={getTypeBadgeVariant(editingTask.type)}
                          className={styles.typeBadge}
                        >
                          {editingTask.type}
                        </Badge>
                      </div>
                    </div>
                    {editingTask.type === "공용" && (
                      <div>
                        <label className={styles.label}>담당자</label>
                        <select
                          className={styles.select}
                          value={editingTask.assignee}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              assignee: e.target.value,
                            })
                          }
                        >
                          <option value="">담당자 선택</option>
                          {members
                            .sort((a, b) => {
                              const priorityA = getRolePriority(a.role);
                              const priorityB = getRolePriority(b.role);

                              if (priorityA !== priorityB) {
                                return priorityA - priorityB;
                              }

                              return a.nickname.localeCompare(b.nickname);
                            })
                            .map((member) => (
                              <option key={member.id} value={member.nickname}>
                                {member.nickname}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className={styles.label}>시작일</label>
                      <Input
                        type="date"
                        value={editingTask.startDate}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={styles.label}>마감일</label>
                      <Input
                        type="date"
                        value={editingTask.dueDate}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            dueDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className={styles.dialogActions}>
                      <Button
                        onClick={saveEditTask}
                        className={styles.primaryButton}
                      >
                        저장
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingTask(false)}
                        className={styles.secondaryButton}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {tasksByStatus.pending.length > 0 && (
              <div className={styles.taskSection}>
                <button
                  onClick={() => setShowPending(!showPending)}
                  className={styles.sectionHeader}
                >
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <h3 className={styles.sectionTitle}>대기</h3>
                  <Badge variant="secondary" className={styles.sectionBadge}>
                    {tasksByStatus.pending.length}개
                  </Badge>
                  <ChevronDown
                    className={`${styles.chevron} ${
                      showPending ? styles.rotated : ""
                    }`}
                  />
                </button>
                {showPending && (
                  <div className={styles.tasksList}>
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
                        <ChevronDown
                          className={`${styles.chevron} ${
                            expandedSections.pending ? styles.rotated : ""
                          }`}
                        />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {tasksByStatus["in-progress"].length > 0 && (
              <div className={styles.taskSection}>
                <button
                  onClick={() => setShowInProgress(!showInProgress)}
                  className={styles.sectionHeader}
                >
                  <PlayCircle className="h-5 w-5 text-blue-500" />
                  <h3 className={styles.sectionTitle}>진행중</h3>
                  <Badge variant="secondary" className={styles.sectionBadge}>
                    {tasksByStatus["in-progress"].length}개
                  </Badge>
                  <ChevronDown
                    className={`${styles.chevron} ${
                      showInProgress ? styles.rotated : ""
                    }`}
                  />
                </button>
                {showInProgress && (
                  <div className={styles.tasksList}>
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
                        <ChevronDown
                          className={`${styles.chevron} ${
                            expandedSections["in-progress"]
                              ? styles.rotated
                              : ""
                          }`}
                        />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {tasksByStatus.completed.length > 0 && (
              <div className={styles.taskSection}>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={styles.sectionHeader}
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className={styles.sectionTitle}>완료</h3>
                  <Badge variant="secondary" className={styles.sectionBadge}>
                    {tasksByStatus.completed.length}개
                  </Badge>
                  <ChevronDown
                    className={`${styles.chevron} ${
                      showCompleted ? styles.rotated : ""
                    }`}
                  />
                </button>
                {showCompleted && (
                  <div className={styles.tasksList}>
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
                        <ChevronDown
                          className={`${styles.chevron} ${
                            expandedSections.completed ? styles.rotated : ""
                          }`}
                        />
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
                  className={styles.sectionHeader}
                >
                  <XCircle className="h-5 w-5 text-red-500" />
                  <h3 className={styles.sectionTitle}>미완료</h3>
                  <Badge variant="secondary" className={styles.sectionBadge}>
                    {tasksByStatus.failed.length}개
                  </Badge>
                  <ChevronDown
                    className={`${styles.chevron} ${
                      showFailed ? styles.rotated : ""
                    }`}
                  />
                </button>
                {showFailed && (
                  <div className={styles.tasksList}>
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
                          : `더보기 (${tasksByStatus.failed.length - 7}개 더)`}
                        <ChevronDown
                          className={`${styles.chevron} ${
                            expandedSections.failed ? styles.rotated : ""
                          }`}
                        />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {tasks.length === 0 && (
              <Card>
                <CardContent className={styles.emptyTasks}>
                  <Clock className={styles.emptyIcon} />
                  <p className={styles.emptyTitle}>아직 할일이 없습니다</p>
                  <p className={styles.emptyDescription}>
                    새로운 할일을 추가해보세요
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* 설정 다이얼로그 */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>그룹 설정</DialogTitle>
          </DialogHeader>
          <div className={styles.settingsContent}>
            {group && (
              <>
                {/* 내 닉네임 변경 섹션 */}
                <div className={styles.memberManagementSection}>
                  <h3 className={styles.sectionSubtitle}>내 닉네임 변경</h3>
                  <div className={styles.membersList}>
                    {(() => {
                      // 여러 방법으로 현재 사용자 멤버 찾기
                      let currentUserMember = members.find(
                        (member) =>
                          member.userId === user?.id ||
                          member.userId === user?.userId
                      );

                      // userId로 찾을 수 없다면 다른 방법 시도
                      if (!currentUserMember) {
                        // 이메일로 찾기 시도 (가장 확실한 방법)
                        currentUserMember = members.find(
                          (member) => member.email === user?.email
                        );

                        // 닉네임으로 찾기 시도
                        if (!currentUserMember) {
                          currentUserMember = members.find(
                            (member) => member.nickname === user?.nickname
                          );
                        }
                      }

                      console.log("🔍 디버깅 정보:", {
                        user: user,
                        userId: user?.id,
                        userEmail: user?.email,
                        userNickname: user?.nickname,
                        members: members,
                        membersCount: members.length,
                        memberUserIds: members.map((m) => ({
                          id: m.id,
                          userId: m.userId,
                          nickname: m.nickname,
                          email: m.email,
                        })),
                        foundMember: currentUserMember,
                      });

                      if (!user) {
                        return (
                          <div className={styles.noMemberMessage}>
                            <p>로그인 정보를 찾을 수 없습니다.</p>
                          </div>
                        );
                      }

                      if (!currentUserMember) {
                        return (
                          <div className={styles.noMemberMessage}>
                            <p>현재 사용자의 멤버 정보를 찾을 수 없습니다.</p>
                            <p>사용자 ID: {user.id}</p>
                            <p>사용자 이메일: {user.email}</p>
                            <p>사용자 닉네임: {user.nickname}</p>
                            <p>멤버 수: {members.length}</p>
                            <p>
                              멤버 목록:{" "}
                              {JSON.stringify(
                                members.map((m) => ({
                                  id: m.id,
                                  userId: m.userId,
                                  nickname: m.nickname,
                                  email: m.email,
                                })),
                                null,
                                2
                              )}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={currentUserMember.id}
                          className={styles.memberItem}
                        >
                          <div className={styles.memberInfo}>
                            <Avatar className={styles.memberAvatar}>
                              <AvatarImage src={currentUserMember.imageUrl} />
                            </Avatar>
                            <div className={styles.memberDetails}>
                              <p className={styles.memberName}>
                                {currentUserMember.nickname}
                              </p>
                              <p className={styles.memberRole}>
                                {currentUserMember.role === "CREATOR"
                                  ? "생성자"
                                  : "멤버"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openEditNicknameDialog(currentUserMember)
                            }
                            className={styles.editNicknameButton}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 그룹 관리 섹션 */}
                <div className={styles.settingsActions}>
                  {(() => {
                    // 현재 사용자의 멤버 정보 찾기
                    const currentUserMember = members.find(
                      (member) =>
                        member.userId === user?.id ||
                        member.userId === user?.userId ||
                        member.email === user?.email ||
                        member.nickname === user?.nickname
                    );

                    console.log("🔍 그룹 관리 권한 확인:", {
                      currentUserMember,
                      userRole: currentUserMember?.role,
                      isCreator: group.creatorId === user?.id,
                      isCreatorByMember:
                        group.creatorId === currentUserMember?.userId,
                      groupCreatorId: group.creatorId,
                      userId: user?.id,
                      memberUserId: currentUserMember?.userId,
                      groupName: group.groupName,
                    });

                    // CREATOR인 경우 (멤버 역할만 확인)
                    if (currentUserMember?.role === "CREATOR") {
                      return isDefaultGroup(group.groupName) ? (
                        // 기본 그룹인 경우 - 삭제 불가 안내
                        <div className={styles.defaultGroupMessage}>
                          <p className={styles.messageText}>
                            {group.groupName}은(는) 삭제할 수 없는 그룹입니다
                          </p>
                        </div>
                      ) : (
                        // 일반 그룹인 경우 - 그룹 삭제
                        <Button
                          variant="destructive"
                          onClick={handleDeleteGroup}
                          disabled={isDeletingGroup}
                          className={styles.dangerButton}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeletingGroup ? "삭제 중..." : "그룹 삭제"}
                        </Button>
                      );
                    }

                    // ADMIN이나 MEMBER인 경우 - 그룹 탈퇴
                    if (
                      currentUserMember?.role === "ADMIN" ||
                      currentUserMember?.role === "MEMBER"
                    ) {
                      return (
                        <Button
                          variant="outline"
                          onClick={handleLeaveGroup}
                          disabled={isLeavingGroup}
                          className={styles.leaveButton}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {isLeavingGroup ? "탈퇴 중..." : "그룹 탈퇴"}
                        </Button>
                      );
                    }

                    // 역할을 확인할 수 없는 경우
                    return (
                      <div className={styles.noMemberMessage}>
                        <p>그룹 권한을 확인할 수 없습니다.</p>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
            <div className={styles.settingsFooter}>
              <Button variant="ghost" onClick={() => setIsSettingsOpen(false)}>
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 그룹 수정 다이얼로그 */}
      <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>그룹 정보 수정</DialogTitle>
          </DialogHeader>
          <div className={styles.editGroupContent}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>그룹명</label>
              <Input
                value={editGroupData.groupName}
                onChange={(e) =>
                  setEditGroupData((prev) => ({
                    ...prev,
                    groupName: e.target.value,
                  }))
                }
                placeholder="그룹명을 입력하세요"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>설명</label>
              <textarea
                className={styles.textarea}
                value={editGroupData.description}
                onChange={(e) =>
                  setEditGroupData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="그룹 설명을 입력하세요"
                rows={3}
                style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>카테고리</label>
              <select
                className={styles.select}
                value={editGroupData.category}
                onChange={(e) =>
                  setEditGroupData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                <option value="STUDY">스터디</option>
                <option value="WORK">업무</option>
                <option value="HOBBY">취미</option>
                <option value="HEALTH">건강</option>
                <option value="OTHER">기타</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>공개 범위</label>
              <select
                className={styles.select}
                value={editGroupData.scope}
                onChange={(e) =>
                  setEditGroupData((prev) => ({
                    ...prev,
                    scope: e.target.value,
                  }))
                }
              >
                <option value="PERSONAL">개인</option>
                <option value="PUBLIC">공개</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>그룹 이미지</label>
              <div className={styles.fileUploadContainer}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditGroupImageFile(file);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result as string;
                        setEditGroupData((prev) => ({
                          ...prev,
                          image: result,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className={styles.fileInput}
                  id="groupImageUpload"
                />
                <label
                  htmlFor="groupImageUpload"
                  className={styles.fileUploadButton}
                >
                  파일 선택
                </label>
                {editGroupData.image && (
                  <div className={styles.imagePreview}>
                    <img
                      src={editGroupData.image}
                      alt="미리보기"
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEditGroupImageFile(null);
                        setEditGroupData((prev) => ({
                          ...prev,
                          image: null,
                        }));
                      }}
                      className={styles.removeImageButton}
                    >
                      제거
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.editGroupFooter}>
              <Button variant="ghost" onClick={() => setIsEditGroupOpen(false)}>
                취소
              </Button>
              <Button onClick={handleUpdateGroup} disabled={isUpdatingGroup}>
                {isUpdatingGroup ? "수정 중..." : "수정하기"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 닉네임 변경 다이얼로그 */}
      <Dialog open={isEditNicknameOpen} onOpenChange={setIsEditNicknameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>닉네임 변경</DialogTitle>
          </DialogHeader>
          <div className={styles.editNicknameContent}>
            {editingMember && (
              <div className={styles.memberInfo}>
                <Avatar className={styles.memberAvatar}>
                  <AvatarImage src={editingMember.imageUrl} />
                </Avatar>
                <div className={styles.memberDetails}>
                  <p className={styles.memberName}>{editingMember.nickname}</p>
                  <p className={styles.memberRole}>
                    {editingMember.role === "CREATOR" ? "생성자" : "멤버"}
                  </p>
                </div>
              </div>
            )}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>새 닉네임</label>
              <Input
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="새 닉네임을 입력하세요"
              />
            </div>
            <div className={styles.editNicknameFooter}>
              <Button
                variant="ghost"
                onClick={() => setIsEditNicknameOpen(false)}
              >
                취소
              </Button>
              <Button
                onClick={handleUpdateNickname}
                disabled={isUpdatingNickname}
              >
                {isUpdatingNickname ? "변경 중..." : "변경하기"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 멤버 상세 정보 팝업 */}
      <Dialog open={isMemberDetailOpen} onOpenChange={setIsMemberDetailOpen}>
        <DialogContent className={styles.memberDetailDialog}>
          <DialogHeader>
            <DialogTitle>멤버 정보</DialogTitle>
          </DialogHeader>
          <div className={styles.memberDetailContent}>
            {isLoadingMemberDetail ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>멤버 정보를 불러오는 중...</p>
              </div>
            ) : memberDetail ? (
              <div className={styles.memberDetailInfo}>
                <div className={styles.memberDetailAvatar}>
                  <Avatar className={styles.largeAvatar}>
                    <AvatarImage src={memberDetail.imageUrl} />
                    <AvatarFallback>{memberDetail.nickname[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className={styles.memberDetailText}>
                  <div className={styles.memberDetailItem}>
                    <label className={styles.memberDetailLabel}>닉네임</label>
                    <p className={styles.memberDetailValue}>
                      {memberDetail.nickname}
                    </p>
                  </div>
                  <div className={styles.memberDetailItem}>
                    <label className={styles.memberDetailLabel}>역할</label>
                    <Badge
                      variant="outline"
                      className={styles.memberDetailBadge}
                    >
                      {getRoleLabel(memberDetail.role)}
                    </Badge>
                  </div>
                  <div className={styles.memberDetailItem}>
                    <label className={styles.memberDetailLabel}>이메일</label>
                    <p className={styles.memberDetailValue}>
                      {memberDetail.email}
                    </p>
                  </div>
                  <div className={styles.memberDetailItem}>
                    <label className={styles.memberDetailLabel}>소개</label>
                    <p className={styles.memberDetailValue}>
                      {memberDetail.introduction || "소개가 없습니다."}
                    </p>
                  </div>
                </div>

                {/* CREATOR만 역할 변경 버튼 표시 */}
                {(() => {
                  const currentUserMember = members.find(
                    (member) =>
                      member.userId === user?.id ||
                      member.email === user?.email ||
                      member.nickname === user?.nickname
                  );

                  return (
                    currentUserMember?.role === "CREATOR" &&
                    memberDetail.role !== "CREATOR" && (
                      <div className={styles.memberDetailActions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleChangeDialog(memberDetail)}
                          className={styles.roleChangeButton}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          역할 변경
                        </Button>
                      </div>
                    )
                  );
                })()}
              </div>
            ) : (
              <div className={styles.errorContainer}>
                <p>멤버 정보를 불러올 수 없습니다.</p>
              </div>
            )}
          </div>
          <div className={styles.memberDetailFooter}>
            <Button
              variant="ghost"
              onClick={() => setIsMemberDetailOpen(false)}
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 역할 변경 다이얼로그 */}
      <Dialog open={isRoleChangeOpen} onOpenChange={setIsRoleChangeOpen}>
        <DialogContent className={styles.roleChangeDialog}>
          <DialogHeader>
            <DialogTitle>역할 변경</DialogTitle>
          </DialogHeader>
          <div className={styles.roleChangeContent}>
            {selectedMemberForRole && (
              <div className={styles.roleChangeInfo}>
                <div className={styles.roleChangeMember}>
                  <Avatar className={styles.memberAvatar}>
                    <AvatarImage src={selectedMemberForRole.imageUrl} />
                    <AvatarFallback>
                      {selectedMemberForRole.nickname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={styles.memberDetails}>
                    <p className={styles.memberName}>
                      {selectedMemberForRole.nickname}
                    </p>
                    <p className={styles.memberRole}>
                      현재 역할: {getRoleLabel(selectedMemberForRole.role)}
                    </p>
                  </div>
                </div>

                <div className={styles.roleChangeForm}>
                  <label className={styles.label}>새로운 역할</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className={styles.roleSelect}
                  >
                    <option value="MEMBER">멤버</option>
                    <option value="ADMIN">관리자</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className={styles.roleChangeFooter}>
            <Button variant="ghost" onClick={() => setIsRoleChangeOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateRole} disabled={isUpdatingRole}>
              {isUpdatingRole ? "변경 중..." : "변경하기"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 도움말 모달 */}
      <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <DialogContent className={styles.helpModal}>
          <DialogHeader>
            <DialogTitle>그룹 상세 페이지 사용법</DialogTitle>
          </DialogHeader>
          <div className={styles.helpContent}>
            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}>📋 할일 관리</h3>
              <ul className={styles.helpList}>
                <li>"할 일 추가" 버튼으로 새로운 할일을 생성할 수 있습니다</li>
                <li>
                  할일 타입: 공통(모든 멤버), 공용(담당자 지정), 개인(개인용)
                </li>
                <li>관리자 이상만 할일을 추가/수정/삭제할 수 있습니다</li>
              </ul>
            </div>

            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}>👥 멤버 관리</h3>
              <ul className={styles.helpList}>
                <li>멤버를 클릭하면 상세 정보를 볼 수 있습니다</li>
                <li>생성자만 다른 멤버의 역할을 변경할 수 있습니다</li>
                <li>멤버는 관리자, 일반 멤버로 구분됩니다</li>
              </ul>
            </div>

            <div className={styles.helpSection}>
              <h3 className={styles.helpSectionTitle}>⚙️ 그룹 설정</h3>
              <ul className={styles.helpList}>
                <li>생성자만 그룹 정보를 수정할 수 있습니다</li>
                <li>생성자는 그룹을 삭제할 수 있습니다</li>
                <li>관리자와 멤버는 그룹을 탈퇴할 수 있습니다</li>
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
