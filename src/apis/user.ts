import axios from "axios";
import { getStoredToken, setStoredToken } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://grouptodo.freeddns.org";

// API 요청 시 accessToken을 헤더에 포함하는 axios 인스턴스
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 요청 인터셉터: accessToken을 헤더에 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getStoredToken();
    if (accessToken && accessToken !== "null") {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 오류 시 토큰 자동 갱신
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 오류이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 재발급 요청 (리프레시 토큰은 쿠키에서 자동으로 전송됨)
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/v1/users/auth/reissue`,
          {},
          {
            withCredentials: true,
          }
        );

        const newAccessToken = refreshResponse.data.accessToken;

        // 새로운 토큰을 로컬 스토리지에 저장
        setStoredToken(newAccessToken);

        // 원래 요청의 Authorization 헤더를 새로운 토큰으로 업데이트
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        // 토큰 재발급 실패 시 로그인 페이지로 리다이렉트
        if (
          refreshError &&
          typeof refreshError === "object" &&
          "response" in refreshError
        ) {
          const axiosError = refreshError as { response?: { status: number } };
          if (axiosError.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 사용자 정보 가져오기
export const getUserProfile = async () => {
  const response = await apiClient.get("/api/v1/users/profile");
  return response.data;
};

// 사용자 통계 가져오기
export const getUserStats = async () => {
  const response = await apiClient.get("/api/v1/users/stats");
  return response.data;
};

// 사용자 그룹 목록 가져오기
export const getUserGroups = async () => {
  const response = await apiClient.get("/api/v1/users/me/groups");
  return response.data;
};

// 최근 활동 가져오기
export const getRecentActivities = async () => {
  const response = await apiClient.get("/api/v1/users/me/activities/recent");
  return response.data;
};

// 주간 활동 데이터 가져오기
export const getWeeklyStats = async () => {
  const response = await apiClient.get("/api/v1/users/me/week");
  return response.data;
};

// 활동 전황 데이터 가져오기
export const getActivityReport = async () => {
  const response = await apiClient.get("/api/v1/users/me/report");
  return response.data;
};

// 업적 목록 가져오기
export const getAchievements = async () => {
  const response = await apiClient.get("/api/v1/users/achievements");
  return response.data;
};

// 추천 할일 가져오기
export const getRecommendedTodos = async () => {
  const response = await apiClient.get("/api/v1/todos/me/recommend");
  return response.data;
};

// 공개 그룹 목록 가져오기
export const getPublicGroups = async () => {
  const response = await apiClient.get("/api/v1/groups");
  return response.data;
};

// 내가 속한 그룹 목록 가져오기
export const getMyGroups = async () => {
  const response = await apiClient.get("/api/v1/groups/me");
  return response.data;
};

// 특정 그룹 정보 가져오기
export const getGroupById = async (groupId: number) => {
  const response = await apiClient.get(`/api/v1/groups/${groupId}`);
  return response.data;
};

// 그룹 멤버 목록 가져오기
export const getGroupMembers = async (groupId: number) => {
  const response = await apiClient.get(`/api/v1/groups/${groupId}/members`);
  return response.data;
};

// 액세스 토큰 재발급
export const reissueAccessToken = async () => {
  const response = await apiClient.post("/api/v1/users/auth/reissue");
  return response.data;
};

// 추천할일을 오늘 날짜로 추가
export const addRecommendedTodoToToday = async (
  todoId: number,
  date: string
) => {
  const response = await apiClient.post(`/api/v1/todos/${todoId}`, {
    date: date,
  });
  return response.data;
};

// 그룹에 할일 추가
export const addTodoToGroup = async (
  groupId: number,
  todoData: {
    content: string;
    todoType: "EXCLUSIVE" | "COPYABLE" | "PERSONAL";
    startDate: string;
    dueDate: string;
    assigned: number | null;
  }
) => {
  const response = await apiClient.post(
    `/api/v1/todos/groups/${groupId}`,
    todoData
  );
  return response.data;
};

// 유저의 특정 날짜 할일 목록 가져오기
export const getUserTodosByDate = async (date: string) => {
  const response = await apiClient.get(`/api/v1/todos?date=${date}`);
  return response.data;
};

// 유저 할일 삭제
export const deleteUserTodo = async (userTodoId: number) => {
  const response = await apiClient.delete(`/api/v1/todos/${userTodoId}`);
  return response.data;
};

// 할일 상태 변경 (삭제 전 상태 변경용)
export const updateTodoStatus = async (todoId: number, status: string) => {
  const response = await apiClient.patch(`/api/v1/todos/${todoId}`, {
    status,
  });
  return response.data;
};

// 유저 할일 완료 체크
export const completeUserTodo = async (
  userTodoId: number,
  completed: boolean
) => {
  const response = await apiClient.patch(
    `/api/v1/todos/${userTodoId}/complete`,
    {
      completed: completed,
    }
  );
  return response.data;
};

// 그룹 생성
export const createGroup = async (groupData: {
  groupName: string;
  description: string;
  scope: "PUBLIC" | "PRIVATE";
  category: "STUDY" | "PROJECT" | "WORK" | "OTHER";
}) => {
  const formData = new FormData();
  formData.append("groupName", groupData.groupName);
  formData.append("description", groupData.description);
  formData.append("scope", groupData.scope);
  formData.append("category", groupData.category);
  // image 필드는 아예 추가하지 않음

  const response = await apiClient.post("/api/v1/groups", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 그룹 할일 전체 조회
export const getGroupTodos = async (groupId: number) => {
  const response = await apiClient.get(`/api/v1/todos/groups/${groupId}`);
  return response.data;
};

// 프로필 소개 수정
// 프로필 전체 업데이트 (닉네임, 소개, 프로필 이미지)
export const updateUserProfile = async (profileData: {
  nickname: string;
  introduction: string;
  profileImage?: File;
  imageUrl?: string;
}) => {
  const formData = new FormData();
  formData.append("nickname", profileData.nickname);
  formData.append("introduction", profileData.introduction);

  // 새 파일이 선택된 경우에만 profileImage 추가, imageUrl은 전송하지 않음
  if (profileData.profileImage) {
    formData.append("profileImage", profileData.profileImage);
    // imageUrl 필드는 아예 추가하지 않음
  } else {
    // 새 파일이 없으면 imageUrl만 전송
    if (profileData.imageUrl) {
      formData.append("imageUrl", profileData.imageUrl);
    }
    // profileImage 필드는 아예 추가하지 않음
  }

  const response = await apiClient.post("/api/v1/users/me/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateUserIntroduction = async (introduction: string) => {
  const response = await apiClient.post("/api/v1/users/me/introduction", {
    introduction,
  });
  return response.data;
};

// 그룹 삭제 (생성자만 가능)
export const deleteGroup = async (groupId: number) => {
  const response = await apiClient.delete(`/api/v1/groups/${groupId}`);
  return response.data;
};

// 그룹 탈퇴 (멤버만 가능)
export const leaveGroup = async (groupId: number) => {
  const response = await apiClient.delete(`/api/v1/groups/${groupId}/members`);
  return response.data;
};

// 그룹 할일 삭제
export const deleteGroupTodo = async (todoId: number, groupId: number) => {
  const response = await apiClient.delete(
    `/api/v1/todos/${todoId}/groups/${groupId}`
  );
  return response.data;
};

// 그룹 참여
export const joinGroup = async (groupId: number) => {
  const response = await apiClient.post(`/api/v1/groups/${groupId}`);
  return response.data;
};

// 그룹 수정
export const updateGroup = async (
  groupId: number,
  groupData: {
    groupName: string;
    description: string;
    category: string;
    image?: File | null;
    imageUrl?: string | null;
    scope: string;
  }
) => {
  const formData = new FormData();
  formData.append("groupName", groupData.groupName);
  formData.append("description", groupData.description);
  formData.append("category", groupData.category);
  formData.append("scope", groupData.scope);

  if (groupData.image) {
    formData.append("image", groupData.image);
  } else {
    if (groupData.imageUrl) {
      formData.append("imageUrl", groupData.imageUrl);
    }
  }

  const response = await apiClient.patch(
    `/api/v1/groups/${groupId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// 멤버 닉네임 변경 (Request Body에 memberId 포함)
export const updateMemberNickname = async (
  groupId: number,
  memberId: number,
  nickname: string
) => {
  const response = await apiClient.patch(`/api/v1/groups/${groupId}/members`, {
    memberId,
    nickname,
  });
  return response.data;
};

// 멤버 닉네임 변경 (userId 사용)
export const updateMemberNicknameByUserId = async (
  groupId: number,
  userId: number,
  nickname: string
) => {
  const response = await apiClient.patch(`/api/v1/groups/${groupId}/members`, {
    userId,
    nickname,
  });
  return response.data;
};

// 특정 멤버 상세 정보 가져오기
export const getMemberDetail = async (groupId: number, memberId: number) => {
  const response = await apiClient.get(
    `/api/v1/groups/${groupId}/members/${memberId}`
  );
  return response.data;
};

// 멤버 역할 변경 (CREATOR만 가능)
export const updateMemberRole = async (
  groupId: number,
  memberId: number,
  role: string
) => {
  const response = await apiClient.patch(
    `/api/v1/groups/${groupId}/members/${memberId}`,
    { role }
  );
  return response.data;
};

// 멤버 닉네임 변경 (멤버 ID 사용)
export const updateMemberNicknameById = async (
  groupId: number,
  memberId: number,
  nickname: string
) => {
  const response = await apiClient.patch(`/api/v1/groups/${groupId}/members`, {
    memberId,
    nickname,
  });
  return response.data;
};

// 그룹 할 일 추가
export const createGroupTodo = async (
  groupId: number,
  todoData: {
    content: string;
    todoType: "EXCLUSIVE" | "COPYABLE" | "PERSONAL";
    startDate: string;
    dueDate: string;
    assigned: number | null;
    role?: string;
  }
) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      "X-Debug-GroupId": groupId.toString(),
      "X-Debug-TodoType": todoData.todoType,
    },
  };
  const response = await apiClient.post(
    `/api/v1/todos/groups/${groupId}`,
    todoData,
    config
  );
  return response.data;
};

// 그룹 할 일 수정
export const updateGroupTodo = async (
  todoId: number,
  groupId: number,
  todoData: {
    content: string;
    startDate: string;
    dueDate: string;
    assigned: number | null;
  }
) => {
  const response = await apiClient.patch(
    `/api/v1/todos/${todoId}/groups/${groupId}`,
    todoData
  );
  return response.data;
};

// 그룹 할 일 삭제
export const deleteGroupTodoById = async (todoId: number, groupId: number) => {
  const response = await apiClient.delete(
    `/api/v1/todos/${todoId}/groups/${groupId}`
  );
  return response.data;
};
