import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/common/card/Card";
import Button from "../../components/common/button/Button";
import Badge from "../../components/common/badge/Badge";
import Input from "../../components/common/input/Input";
import styles from "./userSearch.module.scss";

// Mock data for group discovery
const mockDiscoverGroups = [
  {
    id: 1,
    name: "독서 모임",
    description: "매주 새로운 책을 읽고 토론하는 모임입니다",
    members: 24,
    category: "취미",
    image: "",
    isPublic: true,
  },
  {
    id: 2,
    name: "프로그래밍 스터디",
    description: "JavaScript와 React를 함께 공부하는 개발자 모임",
    members: 18,
    category: "학습",
    image: "",
    isPublic: true,
  },
  {
    id: 3,
    name: "등산 동호회",
    description: "주말마다 산을 오르며 건강한 취미를 즐기는 모임",
    members: 32,
    category: "운동",
    image: "",
    isPublic: true,
  },
  {
    id: 4,
    name: "요리 클래스",
    description: "다양한 요리를 배우고 레시피를 공유하는 모임",
    members: 15,
    category: "취미",
    image: "",
    isPublic: true,
  },
  {
    id: 5,
    name: "영어 회화",
    description: "원어민과 함께하는 영어 회화 연습 모임",
    members: 28,
    category: "학습",
    image: "",
    isPublic: true,
  },
  {
    id: 6,
    name: "사진 동호회",
    description: "사진 촬영 기법을 배우고 작품을 공유하는 모임",
    members: 21,
    category: "문학",
    image: "",
    isPublic: true,
  },
];

const categories = ["전체", "취미", "학습", "운동", "문학"];

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filteredGroups = mockDiscoverGroups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "전체" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.userSearch}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Link to="/">
                <Button variant="ghost" size="sm">
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
                  돌아가기
                </Button>
              </Link>
              <div className={styles.headerTitle}>
                <div className={styles.logo}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                </div>
                <h1>그룹 탐색</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.content}>
        <div className={styles.container}>
          {/* Search Section */}
          <div className={styles.searchSection}>
            <div className={styles.searchBox}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className={styles.searchIcon}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <Input
                placeholder="그룹을 검색해보세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className={styles.categorySection}>
            <div className={styles.categoryFilter}>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={styles.categoryButton}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Groups Grid */}
          <div className={styles.groupsGrid}>
            {filteredGroups.map((group) => (
              <Card key={group.id} className={styles.groupCard}>
                <div className={styles.groupImage}>
                  <div className={styles.imagePlaceholder}>
                    <svg
                      width="48"
                      height="48"
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
                  <Badge className={styles.memberBadge}>
                    {group.members}명
                  </Badge>
                </div>
                <CardContent>
                  <div className={styles.groupContent}>
                    <div className={styles.groupHeader}>
                      <h3>{group.name}</h3>
                      <Badge variant="outline">{group.category}</Badge>
                    </div>
                    <p className={styles.groupDescription}>
                      {group.description}
                    </p>
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
                        <span>{group.members}명 참여중</span>
                      </div>
                      <Button size="sm">참여하기</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredGroups.length === 0 && (
            <div className={styles.noResults}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <h3>검색 결과가 없습니다</h3>
              <p>다른 검색어를 시도하거나 카테고리를 변경해보세요</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserSearch;
