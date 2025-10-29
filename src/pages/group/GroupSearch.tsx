import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/common/card/Card";
import Button from "../../components/common/button/Button";
import Badge from "../../components/common/badge/Badge";
import Input from "../../components/common/input/Input";
import { getPublicGroups, getMyGroups, joinGroup } from "../../apis/user";
import styles from "./groupSearch.module.scss";

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

const categories = ["전체", "스터디", "프로젝트", "업무", "기타"];

const GroupSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const [publicGroupsData, myGroupsData] = await Promise.all([
          getPublicGroups(),
          getMyGroups().catch(() => []), // 내 그룹 로드 실패 시 빈 배열
        ]);

        setGroups(publicGroupsData);
        setMyGroups(myGroupsData);
      } catch {
        setGroups([]);
        setMyGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((group) => {
    // 이미 참여한 그룹인지 확인
    const isAlreadyJoined = myGroups.some((myGroup) => myGroup.id === group.id);

    const matchesSearch =
      group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "전체" ||
      getCategoryLabel(group.category) === selectedCategory;

    return !isAlreadyJoined && matchesSearch && matchesCategory;
  });

  const handleJoinGroup = async (groupId: number) => {
    try {
      await joinGroup(groupId);

      // 참여 성공 후 내 그룹 목록 새로고침
      const updatedMyGroups = await getMyGroups();
      setMyGroups(updatedMyGroups);

      // 그룹 멤버 수 업데이트 (참여한 그룹의 멤버 수 증가)
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === groupId
            ? { ...group, numMember: group.numMember + 1 }
            : group
        )
      );

      alert("그룹에 성공적으로 참여했습니다!");
    } catch {
      alert("그룹 참여에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className={styles.groupSearch}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Link to="/main">
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
            {loading ? (
              <div className={styles.loading}>
                <p>그룹을 불러오는 중...</p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <Card key={group.id} className={styles.groupCard}>
                  <div className={styles.groupImage}>
                    {group.imageUrl ? (
                      <img
                        src={group.imageUrl}
                        alt={`${group.groupName} 그룹 이미지`}
                        className={styles.groupImageSrc}
                      />
                    ) : (
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
                    )}
                    <Badge className={styles.memberBadge}>
                      {group.numMember}명
                    </Badge>
                  </div>
                  <CardContent>
                    <div className={styles.groupContent}>
                      <div className={styles.groupHeader}>
                        <h3>{group.groupName}</h3>
                        <Badge variant="outline">
                          {getCategoryLabel(group.category)}
                        </Badge>
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
                          <span>{group.numMember}명 참여중</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleJoinGroup(group.id)}
                        >
                          참여하기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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

export default GroupSearch;
