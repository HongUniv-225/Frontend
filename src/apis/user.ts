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
    console.log(
      "🔑 현재 토큰:",
      accessToken && accessToken !== "null" ? "존재함" : "없음"
    );
    if (accessToken && accessToken !== "null") {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("📤 요청 헤더에 토큰 추가됨");
    } else {
      console.warn("⚠️ 토큰이 없어서 인증 헤더를 추가하지 않음");
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
        console.log("🔄 401 오류 감지, 토큰 재발급 시도");

        // 토큰 재발급 요청 (리프레시 토큰은 쿠키에서 자동으로 전송됨)
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/v1/users/auth/reissue`,
          {},
          {
            withCredentials: true,
          }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        console.log("✅ 새로운 액세스 토큰 발급 성공");

        // 새로운 토큰을 로컬 스토리지에 저장
        setStoredToken(newAccessToken);

        // 원래 요청의 Authorization 헤더를 새로운 토큰으로 업데이트
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 원래 요청 재시도
        console.log("🔄 원래 요청 재시도");
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        console.error("❌ 토큰 재발급 실패:", refreshError);

        // 토큰 재발급 실패 시 로그인 페이지로 리다이렉트
        if (
          refreshError &&
          typeof refreshError === "object" &&
          "response" in refreshError
        ) {
          const axiosError = refreshError as { response?: { status: number } };
          if (axiosError.response?.status === 401) {
            console.log("🚪 리프레시 토큰도 만료됨, 로그인 페이지로 이동");
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
  try {
    const response = await apiClient.get("/api/v1/users/profile");
    return response.data;
  } catch (error) {
    console.error("사용자 정보 가져오기 실패:", error);
    throw error;
  }
};

// 사용자 통계 가져오기
export const getUserStats = async () => {
  try {
    const response = await apiClient.get("/api/v1/users/stats");
    return response.data;
  } catch (error) {
    console.error("사용자 통계 가져오기 실패:", error);
    throw error;
  }
};

// 사용자 그룹 목록 가져오기
export const getUserGroups = async () => {
  try {
    const response = await apiClient.get("/api/v1/users/me/groups");
    return response.data;
  } catch (error) {
    console.error("사용자 그룹 가져오기 실패:", error);
    throw error;
  }
};

// 최근 활동 가져오기
export const getRecentActivities = async () => {
  try {
    const response = await apiClient.get("/api/v1/users/me/activities/recent");
    return response.data;
  } catch (error) {
    console.error("최근 활동 가져오기 실패:", error);
    throw error;
  }
};

// 주간 활동 데이터 가져오기
export const getWeeklyStats = async () => {
  try {
    const response = await apiClient.get("/api/v1/users/me/week");
    return response.data;
  } catch (error) {
    console.error("주간 활동 데이터 가져오기 실패:", error);
    throw error;
  }
};

// 활동 전황 데이터 가져오기
export const getActivityReport = async () => {
  try {
    const response = await apiClient.get("/api/v1/users/me/report");
    return response.data;
  } catch (error) {
    console.error("활동 전황 데이터 가져오기 실패:", error);
    throw error;
  }
};

// 업적 목록 가져오기
export const getAchievements = async () => {
  try {
    const response = await apiClient.get("/api/v1/users/achievements");
    return response.data;
  } catch (error) {
    console.error("업적 가져오기 실패:", error);
    throw error;
  }
};

// 추천 할일 가져오기
export const getRecommendedTodos = async () => {
  try {
    const response = await apiClient.get("/api/v1/todos/me/recommend");
    return response.data;
  } catch (error) {
    console.error("추천 할일 가져오기 실패:", error);
    throw error;
  }
};

// 공개 그룹 목록 가져오기
export const getPublicGroups = async () => {
  try {
    const response = await apiClient.get("/api/v1/groups");
    return response.data;
  } catch (error) {
    console.error("공개 그룹 목록 가져오기 실패:", error);
    throw error;
  }
};

// 내가 속한 그룹 목록 가져오기
export const getMyGroups = async () => {
  try {
    const response = await apiClient.get("/api/v1/groups/me");
    return response.data;
  } catch (error) {
    console.error("내 그룹 목록 가져오기 실패:", error);
    throw error;
  }
};

// 특정 그룹 정보 가져오기
export const getGroupById = async (groupId: number) => {
  try {
    const response = await apiClient.get(`/api/v1/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("그룹 정보 가져오기 실패:", error);
    throw error;
  }
};

// 그룹 멤버 목록 가져오기
export const getGroupMembers = async (groupId: number) => {
  try {
    const response = await apiClient.get(`/api/v1/groups/${groupId}/members`);
    return response.data;
  } catch (error) {
    console.error("그룹 멤버 목록 가져오기 실패:", error);
    throw error;
  }
};

// 액세스 토큰 재발급
export const reissueAccessToken = async () => {
  try {
    console.log("🔄 액세스 토큰 재발급 요청");
    const response = await apiClient.post("/api/v1/users/auth/reissue");
    console.log("✅ 액세스 토큰 재발급 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 액세스 토큰 재발급 실패:", error);
    throw error;
  }
};

// 추천할일을 오늘 날짜로 추가
export const addRecommendedTodoToToday = async (
  todoId: number,
  date: string
) => {
  try {
    console.log("📤 추천할일 오늘 추가 요청:", { todoId, date });
    const response = await apiClient.post(`/api/v1/todos/${todoId}`, {
      date: date,
    });
    console.log("📥 추천할일 오늘 추가 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 추천할일 오늘 추가 실패:", error);
    throw error;
  }
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
  try {
    const response = await apiClient.post(
      `/api/v1/todos/groups/${groupId}`,
      todoData
    );
    return response.data;
  } catch (error) {
    console.error("할일 추가 실패:", error);
    throw error;
  }
};

// 유저의 특정 날짜 할일 목록 가져오기
export const getUserTodosByDate = async (date: string) => {
  try {
    const response = await apiClient.get(`/api/v1/todos?date=${date}`);
    return response.data;
  } catch (error) {
    console.error("날짜별 할일 목록 가져오기 실패:", error);
    throw error;
  }
};

// 유저 할일 삭제
export const deleteUserTodo = async (userTodoId: number) => {
  try {
    console.log("🗑️ 삭제 요청:", {
      userTodoId: userTodoId,
      url: `/api/v1/todos/${userTodoId}`,
    });

    // 올바른 엔드포인트: /api/v1/todos/{userTodoId}
    const response = await apiClient.delete(`/api/v1/todos/${userTodoId}`);

    console.log("✅ 삭제 응답:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("❌ 할일 삭제 실패:", error);
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
      };
      console.error("❌ 응답 데이터:", axiosError.response?.data);
      console.error("❌ 상태 코드:", axiosError.response?.status);
    }
    throw error;
  }
};

// 할일 상태 변경 (삭제 전 상태 변경용)
export const updateTodoStatus = async (todoId: number, status: string) => {
  try {
    console.log("🔄 상태 변경 요청:", { todoId, status });

    // 상태 변경 API (추정)
    const response = await apiClient.patch(`/api/v1/todos/${todoId}`, {
      status,
    });

    console.log("✅ 상태 변경 응답:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("❌ 상태 변경 실패:", error);
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
      };
      console.error("❌ 응답 데이터:", axiosError.response?.data);
      console.error("❌ 상태 코드:", axiosError.response?.status);
    }
    throw error;
  }
};

// 유저 할일 완료 체크
export const completeUserTodo = async (
  userTodoId: number,
  completed: boolean
) => {
  try {
    console.log("✅ 완료 체크 요청:", {
      userTodoId: userTodoId,
      completed: completed,
      url: `/api/v1/todos/${userTodoId}/complete`,
    });
    const response = await apiClient.patch(
      `/api/v1/todos/${userTodoId}/complete`,
      {
        completed: completed,
      }
    );
    console.log("✅ 완료 체크 응답:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("❌ 할일 완료 체크 실패:", error);
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
      };
      console.error("❌ 응답 데이터:", axiosError.response?.data);
      console.error("❌ 상태 코드:", axiosError.response?.status);
    }
    throw error;
  }
};

// 그룹 생성
export const createGroup = async (groupData: {
  groupName: string;
  description: string;
  scope: "PUBLIC" | "PRIVATE";
  category: "STUDY" | "PROJECT" | "WORK" | "OTHER";
}) => {
  try {
    console.log("📝 그룹 생성 요청:", groupData);

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
    console.log("✅ 그룹 생성 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 그룹 생성 실패:", error);
    throw error;
  }
};

// 그룹 할일 전체 조회
export const getGroupTodos = async (groupId: number) => {
  try {
    const response = await apiClient.get(`/api/v1/todos/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("그룹 할일 조회 실패:", error);
    throw error;
  }
};

// 프로필 소개 수정
// 프로필 전체 업데이트 (닉네임, 소개, 프로필 이미지)
export const updateUserProfile = async (profileData: {
  nickname: string;
  introduction: string;
  profileImage?: File;
  imageUrl?: string;
}) => {
  try {
    console.log("📤 프로필 전체 수정 요청:", profileData);

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

    const response = await apiClient.post(
      "/api/v1/users/me/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("✅ 프로필 전체 수정 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 프로필 전체 수정 실패:", error);
    throw error;
  }
};

export const updateUserIntroduction = async (introduction: string) => {
  try {
    console.log("📤 프로필 소개 수정 요청:", { introduction });
    const response = await apiClient.post("/api/v1/users/me/introduction", {
      introduction,
    });
    console.log("✅ 프로필 소개 수정 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 프로필 소개 수정 실패:", error);
    throw error;
  }
};

// 그룹 삭제 (생성자만 가능)
export const deleteGroup = async (groupId: number) => {
  try {
    console.log("📤 그룹 삭제 요청:", { groupId });
    const response = await apiClient.delete(`/api/v1/groups/${groupId}`);
    console.log("✅ 그룹 삭제 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 그룹 삭제 실패:", error);
    throw error;
  }
};

// 그룹 탈퇴 (멤버만 가능)
export const leaveGroup = async (groupId: number) => {
  try {
    console.log("📤 그룹 탈퇴 요청:", { groupId });
    const response = await apiClient.delete(
      `/api/v1/groups/${groupId}/members`
    );
    console.log("✅ 그룹 탈퇴 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 그룹 탈퇴 실패:", error);
    throw error;
  }
};

// 그룹 할일 삭제
export const deleteGroupTodo = async (todoId: number, groupId: number) => {
  try {
    console.log("📤 그룹 할일 삭제 요청:", { todoId, groupId });
    const response = await apiClient.delete(
      `/api/v1/todos/${todoId}/groups/${groupId}`
    );
    console.log("✅ 그룹 할일 삭제 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 그룹 할일 삭제 실패:", error);
    throw error;
  }
};

// 그룹 참여
export const joinGroup = async (groupId: number) => {
  try {
    console.log("📤 그룹 참여 요청:", { groupId });
    const response = await apiClient.post(`/api/v1/groups/${groupId}`);
    console.log("✅ 그룹 참여 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 그룹 참여 실패:", error);
    throw error;
  }
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
  try {
    console.log("📤 그룹 수정 요청:", { groupId, groupData });

    const formData = new FormData();
    formData.append("groupName", groupData.groupName);
    formData.append("description", groupData.description);
    formData.append("category", groupData.category);
    formData.append("scope", groupData.scope);

    // 사진을 첨부하면 image에만 넣고 imageUrl은 아예 비움
    if (groupData.image) {
      formData.append("image", groupData.image);
      // imageUrl 필드는 아예 추가하지 않음
    } else {
      // 사진을 첨부 안하면 imageUrl만 넣고 image는 아예 비움
      if (groupData.imageUrl) {
        formData.append("imageUrl", groupData.imageUrl);
      }
      // image 필드는 아예 추가하지 않음
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
    console.log("✅ 그룹 수정 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 그룹 수정 실패:", error);
    throw error;
  }
};

// 멤버 닉네임 변경 (Request Body에 memberId 포함)
export const updateMemberNickname = async (
  groupId: number,
  memberId: number,
  nickname: string
) => {
  try {
    console.log("📤 멤버 닉네임 변경 요청:", { groupId, memberId, nickname });
    console.log("📤 요청 URL:", `/api/v1/groups/${groupId}/members`);
    console.log("📤 요청 바디:", { memberId, nickname });

    const response = await apiClient.patch(
      `/api/v1/groups/${groupId}/members`,
      { memberId, nickname }
    );

    console.log("✅ 멤버 닉네임 변경 완료:", response.data);
    console.log("🔍 응답 데이터 상세:", {
      requestedMemberId: memberId,
      responseId: response.data.id,
      responseNickname: response.data.nickname,
      responseUserId: response.data.userId,
      responseGroupId: response.data.groupId,
    });
    return response.data;
  } catch (error) {
    console.error("❌ 멤버 닉네임 변경 실패:", error);
    throw error;
  }
};

// 멤버 닉네임 변경 (userId 사용)
export const updateMemberNicknameByUserId = async (
  groupId: number,
  userId: number,
  nickname: string
) => {
  try {
    console.log("📤 멤버 닉네임 변경 요청 (userId):", {
      groupId,
      userId,
      nickname,
    });
    console.log("📤 요청 URL:", `/api/v1/groups/${groupId}/members`);
    console.log("📤 요청 바디:", { userId, nickname });

    const response = await apiClient.patch(
      `/api/v1/groups/${groupId}/members`,
      { userId, nickname }
    );

    console.log("✅ 멤버 닉네임 변경 완료 (userId):", response.data);
    console.log("🔍 응답 데이터 상세:", {
      requestedUserId: userId,
      responseId: response.data.id,
      responseNickname: response.data.nickname,
      responseUserId: response.data.userId,
      responseGroupId: response.data.groupId,
    });
    return response.data;
  } catch (error) {
    console.error("❌ 멤버 닉네임 변경 실패 (userId):", error);
    throw error;
  }
};

// 특정 멤버 상세 정보 가져오기
export const getMemberDetail = async (groupId: number, memberId: number) => {
  try {
    console.log("📤 멤버 상세 정보 요청:", { groupId, memberId });
    const response = await apiClient.get(
      `/api/v1/groups/${groupId}/members/${memberId}`
    );
    console.log("✅ 멤버 상세 정보 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 멤버 상세 정보 실패:", error);
    throw error;
  }
};

// 멤버 역할 변경 (CREATOR만 가능)
export const updateMemberRole = async (
  groupId: number,
  memberId: number,
  role: string
) => {
  try {
    console.log("📤 멤버 역할 변경 요청:", { groupId, memberId, role });
    const response = await apiClient.patch(
      `/api/v1/groups/${groupId}/members/${memberId}`,
      { role }
    );
    console.log("✅ 멤버 역할 변경 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 멤버 역할 변경 실패:", error);
    throw error;
  }
};

// 멤버 닉네임 변경 (멤버 ID 사용)
export const updateMemberNicknameById = async (
  groupId: number,
  memberId: number,
  nickname: string
) => {
  try {
    console.log("📤 멤버 닉네임 변경 요청 (memberId):", {
      groupId,
      memberId,
      nickname,
    });
    console.log("📤 요청 URL:", `/api/v1/groups/${groupId}/members`);
    console.log("📤 요청 바디:", { memberId, nickname });

    const response = await apiClient.patch(
      `/api/v1/groups/${groupId}/members`,
      { memberId, nickname }
    );

    console.log("✅ 멤버 닉네임 변경 완료 (memberId):", response.data);
    console.log("🔍 응답 데이터 상세:", {
      requestedMemberId: memberId,
      responseId: response.data.id,
      responseNickname: response.data.nickname,
      responseUserId: response.data.userId,
      responseGroupId: response.data.groupId,
    });
    return response.data;
  } catch (error) {
    console.error("❌ 멤버 닉네임 변경 실패 (memberId):", error);
    throw error;
  }
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
  try {
    console.log("📤 그룹 할 일 추가 요청:", { groupId, todoData });

    // 요청 헤더에 추가 정보 포함
    const config = {
      headers: {
        "Content-Type": "application/json",
        // 추가 디버깅 정보
        "X-Debug-GroupId": groupId.toString(),
        "X-Debug-TodoType": todoData.todoType,
      },
    };

    const response = await apiClient.post(
      `/api/v1/todos/groups/${groupId}`,
      todoData,
      config
    );
    console.log("✅ 그룹 할 일 추가 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 그룹 할 일 추가 실패:", error);
    throw error;
  }
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
  try {
    console.log("📤 그룹 할 일 수정 요청:", { todoId, groupId, todoData });
    const response = await apiClient.patch(
      `/api/v1/todos/${todoId}/groups/${groupId}`,
      todoData
    );
    console.log("✅ 그룹 할 일 수정 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 그룹 할 일 수정 실패:", error);
    throw error;
  }
};

// 그룹 할 일 삭제
export const deleteGroupTodoById = async (todoId: number, groupId: number) => {
  try {
    console.log("📤 그룹 할 일 삭제 요청:", { todoId, groupId });
    const response = await apiClient.delete(
      `/api/v1/todos/${todoId}/groups/${groupId}`
    );
    console.log("✅ 그룹 할 일 삭제 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 그룹 할 일 삭제 실패:", error);
    throw error;
  }
};
