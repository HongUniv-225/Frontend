import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/common/card/Card";
import Button from "../../components/common/button/Button";
import Badge from "../../components/common/badge/Badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/common/avatar/Avatar";
import Input from "../../components/common/input/Input";
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
import Textarea from "../../components/common/textarea/Textarea";
import { type Todo, type User } from "../../types";
import { getStoredUser } from "../../apis/auth";
import styles from "./main.module.scss";

// Mock data
const mockGroups = [
  { id: 1, name: "프로젝트 팀", members: 5, color: "#3b82f6", tasks: 12 },
  { id: 2, name: "가족", members: 4, color: "#10b981", tasks: 3 },
  { id: 3, name: "운동 모임", members: 8, color: "#8b5cf6", tasks: 7 },
];

const mockTodosByDate: Record<string, Todo[]> = {
  [new Date().toISOString().split("T")[0]]: [
    {
      id: 1,
      text: "프로젝트 기획서 작성",
      completed: false,
      group: "프로젝트 팀",
    },
    { id: 2, text: "장보기", completed: true, group: "가족" },
    { id: 3, text: "헬스장 가기", completed: false, group: "운동 모임" },
  ],
};

const mockRecommendedTodos = [
  {
    id: 1,
    text: "회의 준비하기",
    group: "프로젝트 팀",
    frequency: "자주 사용",
  },
  {
    id: 2,
    text: "코드 리뷰하기",
    group: "프로젝트 팀",
    frequency: "그룹 추천",
  },
  { id: 3, text: "운동복 준비", group: "운동 모임", frequency: "자주 사용" },
  { id: 4, text: "식료품 리스트 작성", group: "가족", frequency: "그룹 추천" },
];

const Main = () => {
  const [selectedDate] = useState<Date>(new Date());
  const [todosByDate, setTodosByDate] = useState(mockTodosByDate);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [newTodo, setNewTodo] = useState({ text: "", group: "개인" });
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: "취미",
    isPublic: true,
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const selectedDateKey = getDateKey(selectedDate);
  const todayTodos = todosByDate[selectedDateKey] || [];

  const toggleTodo = (id: number) => {
    setTodosByDate((prev) => ({
      ...prev,
      [selectedDateKey]: (prev[selectedDateKey] || []).map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  };

  const addTodoFromRecommended = (
    recommendedTodo: (typeof mockRecommendedTodos)[0]
  ) => {
    const newTodoItem: Todo = {
      id: Date.now(),
      text: recommendedTodo.text,
      completed: false,
      group: recommendedTodo.group,
    };
    setTodosByDate((prev) => ({
      ...prev,
      [selectedDateKey]: [...(prev[selectedDateKey] || []), newTodoItem],
    }));
  };

  const addNewTodo = () => {
    if (newTodo.text.trim()) {
      const todo: Todo = {
        id: Date.now(),
        text: newTodo.text,
        completed: false,
        group: newTodo.group,
      };
      setTodosByDate((prev) => ({
        ...prev,
        [selectedDateKey]: [...(prev[selectedDateKey] || []), todo],
      }));
      setNewTodo({ text: "", group: "개인" });
      setIsAddingTodo(false);
    }
  };

  const deleteTodo = (id: number) => {
    setTodosByDate((prev) => ({
      ...prev,
      [selectedDateKey]: (prev[selectedDateKey] || []).filter(
        (todo) => todo.id !== id
      ),
    }));
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

  const createGroup = () => {
    if (newGroup.name.trim() && newGroup.description.trim()) {
      console.log("새 그룹 생성:", newGroup);
      setNewGroup({
        name: "",
        description: "",
        category: "취미",
        isPublic: true,
      });
      setIsCreatingGroup(false);
    }
  };

  const completedCount = todayTodos.filter((t) => t.completed).length;
  const pendingCount = todayTodos.filter((t) => !t.completed).length;

  return (
    <div className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <div className={styles.logo}>
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
              </div>
              <h1>그룹 투두</h1>
            </div>
            <div className={styles.headerRight}>
              <Link to="/user-search">
                <Button variant="outline" size="sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                  그룹 탐색
                </Button>
              </Link>
              <Link to="/user">
                <Button variant="ghost" size="sm">
                  <Avatar>
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>
                      {user?.nickname ? user.nickname[0] : "나"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Left Section - My Groups */}
            <div className={styles.leftSection}>
              <div className={styles.sectionHeader}>
                <h2>
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
                  내 그룹
                </h2>
                <Dialog
                  open={isCreatingGroup}
                  onOpenChange={setIsCreatingGroup}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <span>+</span> 그룹 생성
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 그룹 만들기</DialogTitle>
                    </DialogHeader>
                    <div className={styles.dialogForm}>
                      <div>
                        <label>그룹 이름</label>
                        <Input
                          value={newGroup.name}
                          onChange={(e) =>
                            setNewGroup({ ...newGroup, name: e.target.value })
                          }
                          placeholder="그룹 이름을 입력하세요"
                        />
                      </div>
                      <div>
                        <label>그룹 설명</label>
                        <Textarea
                          value={newGroup.description}
                          onChange={(e) =>
                            setNewGroup({
                              ...newGroup,
                              description: e.target.value,
                            })
                          }
                          placeholder="그룹에 대한 간단한 설명을 입력하세요"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label>카테고리</label>
                        <select
                          className={styles.select}
                          value={newGroup.category}
                          onChange={(e) =>
                            setNewGroup({
                              ...newGroup,
                              category: e.target.value,
                            })
                          }
                        >
                          <option value="취미">취미</option>
                          <option value="학습">학습</option>
                          <option value="운동">운동</option>
                          <option value="문학">문학</option>
                          <option value="기타">기타</option>
                        </select>
                      </div>
                      <div className={styles.checkbox}>
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
                        />
                        <label htmlFor="isPublic">공개 그룹으로 만들기</label>
                      </div>
                      <div className={styles.dialogActions}>
                        <Button onClick={createGroup}>그룹 만들기</Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreatingGroup(false)}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className={styles.groupList}>
                {mockGroups.map((group) => (
                  <Card key={group.id}>
                    <CardContent>
                      <div className={styles.groupCard}>
                        <div className={styles.groupHeader}>
                          <div className={styles.groupInfo}>
                            <div
                              className={styles.groupColor}
                              style={{ backgroundColor: group.color }}
                            />
                            <h3>{group.name}</h3>
                          </div>
                          <Badge variant="secondary">
                            {group.tasks}개 할일
                          </Badge>
                        </div>
                        <div className={styles.groupFooter}>
                          <div className={styles.groupMembers}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>{group.members}명</span>
                          </div>
                          <Link to={`/team-detail?id=${group.id}`}>
                            <Button size="sm" variant="ghost">
                              자세히 보기 →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Center Section - Today's Todos */}
            <div className={styles.centerSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.dateHeader}>
                  <h2>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {selectedDate.toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </h2>
                </div>
                <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <span>+</span> 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 할일 추가</DialogTitle>
                    </DialogHeader>
                    <div className={styles.dialogForm}>
                      <div>
                        <label>할일</label>
                        <Input
                          value={newTodo.text}
                          onChange={(e) =>
                            setNewTodo({ ...newTodo, text: e.target.value })
                          }
                          placeholder="할일을 입력하세요"
                        />
                      </div>
                      <div>
                        <label>그룹</label>
                        <select
                          className={styles.select}
                          value={newTodo.group}
                          onChange={(e) =>
                            setNewTodo({ ...newTodo, group: e.target.value })
                          }
                        >
                          <option value="개인">개인</option>
                          {mockGroups.map((group) => (
                            <option key={group.id} value={group.name}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.dialogActions}>
                        <Button onClick={addNewTodo}>추가</Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingTodo(false)}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent>
                  {todayTodos.length === 0 ? (
                    <div className={styles.emptyState}>
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <p className={styles.emptyTitle}>
                        선택한 날짜에 할일이 없습니다
                      </p>
                      <p className={styles.emptyDesc}>
                        오른쪽에서 추천 할일을 추가하거나 새로운 할일을
                        만들어보세요
                      </p>
                    </div>
                  ) : (
                    <div className={styles.todoList}>
                      {todayTodos.map((todo) => (
                        <div key={todo.id} className={styles.todoItem}>
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className={styles.todoCheckbox}
                          >
                            {todo.completed ? (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                className={styles.checked}
                              >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                            ) : (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                              </svg>
                            )}
                          </button>
                          <div className={styles.todoContent}>
                            {editingTodo === todo.id ? (
                              <Input
                                defaultValue={todo.text}
                                onBlur={(e) =>
                                  editTodo(todo.id, e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    editTodo(todo.id, e.currentTarget.value);
                                  }
                                  if (e.key === "Escape") {
                                    setEditingTodo(null);
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <>
                                <p
                                  className={
                                    todo.completed ? styles.completed : ""
                                  }
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
                                onClick={() => setEditingTodo(todo.id)}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteTodo(todo.id)}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
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

              {todayTodos.length > 0 && (
                <Card>
                  <CardContent>
                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}>
                        <p className={styles.statValue}>{completedCount}</p>
                        <p className={styles.statLabel}>완료</p>
                      </div>
                      <div className={styles.statItem}>
                        <p className={styles.statValue}>{pendingCount}</p>
                        <p className={styles.statLabel}>미완료</p>
                      </div>
                    </div>
                    <div className={styles.statsTotal}>
                      총 {todayTodos.length}개
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Section - Recommended Todos */}
            <div className={styles.rightSection}>
              <div className={styles.sectionHeader}>
                <h2>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className={styles.starIcon}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  추천 할일
                </h2>
              </div>

              <div className={styles.recommendedList}>
                {mockRecommendedTodos.map((todo) => (
                  <Card key={todo.id} className={styles.recommendedCard}>
                    <CardContent>
                      <div className={styles.recommendedHeader}>
                        <div className={styles.recommendedContent}>
                          <p className={styles.recommendedText}>{todo.text}</p>
                          <p className={styles.recommendedGroup}>
                            {todo.group}
                          </p>
                        </div>
                        <Badge variant="outline">{todo.frequency}</Badge>
                      </div>
                      <Button
                        size="sm"
                        className={styles.addButton}
                        onClick={() => addTodoFromRecommended(todo)}
                      >
                        <span>+</span> 선택한 날짜에 추가
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Main;
