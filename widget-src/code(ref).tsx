const { widget } = figma;
const { AutoLayout, Text, useSyncedState, Rectangle, Input, SVG } = widget;

// --- 1. 설정값 ---
const CIRCLE_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

type StatusType = 'HOLD' | 'WIP' | 'URGENT' | 'DONE' | 'ARCHIVE';
const STATUS_CONFIG = {
  HOLD: { color: '#F5F5F5', text: '⏸ 홀딩', textColor: '#9E9E9E', bg: '#FFFFFF' },
  WIP: { color: '#FFF9C4', text: '🟡 진행', textColor: '#Fbc02d', bg: '#FFFDE7' },
  URGENT: { color: '#FFEBEE', text: '🔥 긴급', textColor: '#D32F2F', bg: '#FFEBEE' },
  DONE: { color: '#E8F5E9', text: '✅ 완료', textColor: '#2E7D32', bg: '#F1F8E9' },
  ARCHIVE: { color: '#EEEEEE', text: '📦 보관', textColor: '#BDBDBD', bg: '#FAFAFA' },
};


interface PageMeta {
  pageId: string;
  name: string;
  depth: number;
  status: StatusType;
  assignee: string;
}

function DashboardWidget() {
  const [items, setItems] = useSyncedState<PageMeta[]>('pageItems', []);
  const [lastSynced, setLastSynced] = useSyncedState<string>('lastSynced', '-');
  const [docName, setDocName] = useSyncedState<string>('docName', 'Project Dashboard');
  
  // [New] Dynamic Assignee State
  const [teamMembers, setTeamMembers] = useSyncedState<string[]>('teamMembers', ['미지정']);
  const [isSettingsOpen, setIsSettingsOpen] = useSyncedState<boolean>('isSettingsOpen', false);
  const [newMemberName, setNewMemberName] = useSyncedState<string>('newMemberName', '');

  // --- 2. 동기화 로직 ---
  const syncPages = () => {
    const actualPages = figma.root.children;
    const currentFileName = figma.root.name;
    setDocName(currentFileName);

    setItems((prevItems) => {
      return actualPages.map((page) => {
        const existing = prevItems.find((item) => item.pageId === page.id);
        const name = page.name;

        let autoDepth = 0;
        if (name.includes('↳')) {
          autoDepth = 2;
        } else if (CIRCLE_NUMBERS.some(num => name.includes(num))) {
          autoDepth = 1;
        }

        return {
          pageId: page.id,
          name: name,
          depth: autoDepth,
          status: existing ? existing.status : 'HOLD',
          assignee: existing ? existing.assignee : teamMembers[0], // Use first member (usually '미지정')
        };
      });
    });

    const now = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const yyyy = now.getFullYear();
    const mm = ('0' + (now.getMonth() + 1)).slice(-2);
    const dd = ('0' + now.getDate()).slice(-2);
    const ddd = days[now.getDay()];
    const hh = ('0' + now.getHours()).slice(-2);
    const min = ('0' + now.getMinutes()).slice(-2);
    const ss = ('0' + now.getSeconds()).slice(-2);
    
    setLastSynced(`${yyyy}-${mm}-${dd}(${ddd}) ${hh}:${min}:${ss}`);
    figma.notify('✅ 동기화 완료');
  };

  const toggleStatus = (index: number) => {
    const statusOrder: StatusType[] = ['HOLD', 'WIP', 'URGENT', 'DONE', 'ARCHIVE'];
    setItems(current => {
      const newItems = [...current];
      const currentStatusIdx = statusOrder.indexOf(newItems[index].status);
      const nextStatus = statusOrder[(currentStatusIdx + 1) % statusOrder.length];
      newItems[index].status = nextStatus;
      return newItems;
    });
  };

  const toggleAssignee = (index: number) => {
    setItems(current => {
      const newItems = [...current];
      const currentIdx = teamMembers.indexOf(newItems[index].assignee);
      // If removed member or not found, go to 0. Else next index.
      const nextIdx = (currentIdx === -1) ? 0 : (currentIdx + 1) % teamMembers.length;
      newItems[index].assignee = teamMembers[nextIdx];
      return newItems;
    });
  };

  const toggleDepth = (index: number) => {
    setItems(current => {
      const newItems = [...current];
      newItems[index].depth = (newItems[index].depth + 1) % 3;
      return newItems;
    });
  };

  // [New] Member Management Logic
  const addMember = () => {
    if (!newMemberName.trim()) return;
    if (teamMembers.includes(newMemberName.trim())) {
        figma.notify('이미 존재하는 이름입니다.');
        return;
    }
    setTeamMembers(prev => [...prev, newMemberName.trim()]);
    setNewMemberName('');
  };

  const removeMember = (targetName: string) => {
    if (targetName === '미지정') {
        figma.notify('기본값은 삭제할 수 없습니다.');
        return;
    }
    setTeamMembers(prev => prev.filter(m => m !== targetName));
  };


  // [핵심] 현재 파일의 URL Key 가져오기 (링크 생성용)
  const fileKey = figma.fileKey; 

  // --- View: Settings ---
  if (isSettingsOpen) {
    return (
        <AutoLayout
            direction="vertical"
            padding={16}
            fill="#FFFFFF"
            cornerRadius={12}
            stroke="#E6E6E6"
            width={300} // Settings width
            effect={{
                type: 'drop-shadow',
                color: { r: 0, g: 0, b: 0, a: 0.1 },
                offset: { x: 0, y: 4 },
                blur: 16,
            }}
            spacing={12}
        >
            <AutoLayout width="fill-parent" verticalAlignItems="center" spaceBetweenItems="auto">
                <Text fontSize={16} fontWeight={700} fontFamily="Noto Sans KR">⚙️ 팀원 관리</Text>
                <AutoLayout 
                    onClick={() => setIsSettingsOpen(false)}
                    padding={4}
                    cornerRadius={4}
                    hoverStyle={{ fill: '#F5F5F5' }}
                >
                    <Text fontSize={20}>✕</Text>
                </AutoLayout>
            </AutoLayout>

            <Rectangle width="fill-parent" height={1} fill="#EEEEEE" />

            <AutoLayout width="fill-parent" spacing={8} verticalAlignItems="center">
                <Input
                    value={newMemberName}
                    placeholder="이름 입력"
                    onTextEditEnd={(e) => setNewMemberName(e.characters)}
                    width="fill-parent"
                    fontSize={14}
                    fontFamily="Noto Sans KR"
                    inputFrameProps={{
                        padding: 8,
                        cornerRadius: 6,
                        stroke: "#E0E0E0",
                        fill: "#FAFAFA"
                    }}
                />
                <AutoLayout
                    onClick={addMember}
                    padding={{ vertical: 8, horizontal: 12 }}
                    cornerRadius={6}
                    fill="#2F80ED"
                    hoverStyle={{ fill: '#2D75D8' }}
                >
                    <Text fill="#FFF" fontWeight={700} fontFamily="Noto Sans KR">추가</Text>
                </AutoLayout>
            </AutoLayout>

            <AutoLayout direction="vertical" width="fill-parent" spacing={4}>
                {teamMembers.map((member) => (
                    <AutoLayout 
                        key={member} 
                        width="fill-parent" 
                        verticalAlignItems="center" 
                        padding={8} 
                        cornerRadius={6}
                        fill="#F9F9F9"
                        spaceBetweenItems="auto"
                    >
                        <Text fontSize={14} fontFamily="Noto Sans KR">{member}</Text>
                        {member !== '미지정' && (
                            <AutoLayout 
                                onClick={() => removeMember(member)}
                                padding={4}
                                hoverStyle={{ fill: '#FFEBEE', cornerRadius: 4 }}
                            >
                                <Text fontSize={12} fill="#D32F2F">삭제</Text>
                            </AutoLayout>
                        )}
                    </AutoLayout>
                ))}
            </AutoLayout>
        </AutoLayout>
    );
  }

  // --- View: Dashboard ---
  return (
    <AutoLayout
      direction="vertical"
      padding={16}
      fill="#FFFFFF"
      cornerRadius={12}
      stroke="#E6E6E6"
      width={520}
      effect={{
        type: 'drop-shadow',
        color: { r: 0, g: 0, b: 0, a: 0.08 },
        offset: { x: 0, y: 4 },
        blur: 16,
      }}
    >
      {/* 헤더 */}
      <AutoLayout 
        width="fill-parent" 
        horizontalAlignItems="center" 
        verticalAlignItems="center"
        padding={{ bottom: 16 }}
      >
        <AutoLayout direction="vertical" spacing={2} width="fill-parent">
          <Text fontSize={18} fontWeight={700} fill="#111" fontFamily="Noto Sans KR">{docName}</Text>
          <Text fontSize={11} fill="#999" fontFamily="Noto Sans KR">Last update: {lastSynced}</Text>
        </AutoLayout>

        <AutoLayout spacing={6}>
            {/* 설정 버튼 */}
            <AutoLayout
                onClick={() => setIsSettingsOpen(true)}
                padding={8}
                cornerRadius={6}
                fill="#F5F5F5"
                hoverStyle={{ fill: '#E0E0E0' }}
                verticalAlignItems="center"
            >
                <Text fontSize={12}>⚙️</Text>
            </AutoLayout>
            
            {/* 동기화 버튼 */}
            <AutoLayout
            onClick={syncPages}
            padding={{ vertical: 8, horizontal: 12 }}
            cornerRadius={6}
            fill="#111"
            hoverStyle={{ fill: '#333' }}
            verticalAlignItems="center"
            >
            <Text fill="#FFF" fontWeight={600} fontSize={12} fontFamily="Noto Sans KR">🔄 동기화</Text>
            </AutoLayout>
        </AutoLayout>
      </AutoLayout>

      {/* 컬럼 헤더 */}
      <AutoLayout 
        width="fill-parent" 
        padding={{ bottom: 8, left: 6, right: 6 }} 
        verticalAlignItems="center"
      >
        <Text fontSize={11} fontWeight={600} fill="#999" width={30} fontFamily="Noto Sans KR">위계</Text>
        <Text fontSize={11} fontWeight={600} fill="#999" width="fill-parent" fontFamily="Noto Sans KR">페이지명</Text>
        <AutoLayout width={116} spaceBetweenItems="auto">
            <Text fontSize={11} fontWeight={600} fill="#999" width={54} horizontalAlignText="center" fontFamily="Noto Sans KR">진행</Text>
            <Text fontSize={11} fontWeight={600} fill="#999" width={54} horizontalAlignText="center" fontFamily="Noto Sans KR">담당자</Text>
        </AutoLayout>
      </AutoLayout>

      {/* 구분선 */}
      <Rectangle width="fill-parent" height={1} fill="#EEEEEE" />
      <AutoLayout height={8} width="fill-parent"/>

      {/* 리스트 */}
      <AutoLayout direction="vertical" width="fill-parent" spacing={0}> 
        {items.map((item, index) => {
          
          // 구분선 체크: 대시(-), 언더바(_), 그리고 피그마가 자동 변환하는 Em Dash(—), En Dash(–) 모두 호환
          const name = item.name.trim();
          const isDivider = 
            name.includes('---') || 
            name.includes('___') ||
            name.startsWith('-') || 
            name.startsWith('_') || 
            name.startsWith('—') || // Em dash
            name.startsWith('–') || // En dash
            /^[-\s_—–]+$/.test(name); // 오직 구분자로만 이루어진 경우

          if (isDivider) {
            return (
               <AutoLayout 
                key={item.pageId} 
                width="fill-parent" 
                height={12} 
                verticalAlignItems="center"
                padding={{ horizontal: 6 }}
               >
                 <Rectangle width="fill-parent" height={1} fill="#EEEEEE" />
               </AutoLayout>
            );
          }

          const isDone = item.status === 'DONE';
          
          // [핵심 변경] 클릭 시 실행할 스크립트 대신, 이동할 URL 주소를 생성합니다.
          // 피그마 내부 프로토콜을 사용하여 해당 페이지(Node)로 바로 점프합니다.
          const pageLink = `https://www.figma.com/design/${fileKey}/${encodeURIComponent(docName)}?node-id=${item.pageId}`;

          return (
            <AutoLayout
              key={item.pageId}
              width="fill-parent"
              padding={{ vertical: 3, horizontal: 6 }} 
              spacing={8}
              verticalAlignItems="center"
              cornerRadius={6}
              fill={STATUS_CONFIG[item.status].bg}
              hoverStyle={{ stroke: '#BDBDBD' }}
            >
              {/* 위계 */}
              <AutoLayout 
                width={30} 
                verticalAlignItems="center"
                onClick={() => toggleDepth(index)}
                hoverStyle={{ fill: '#00000010' }}
              >
                 <Text fontSize={10} fill="#D1D1D1" fontFamily="Noto Sans KR">
                    {item.depth === 1 ? '①' : item.depth === 2 ? '↳' : '●'}
                 </Text>
              </AutoLayout>

              {/* 페이지 이름 (클릭 시 이동) */}
              <AutoLayout 
                width="fill-parent" 
                padding={{ left: item.depth * 12 }}
                onClick={() => {
                  const targetPage = figma.root.children.find(node => node.id === item.pageId);
                  
                  if (targetPage && targetPage.type === 'PAGE') {
                    const switchPage = async () => {
                        try {
                            await figma.setCurrentPageAsync(targetPage as PageNode);
                            figma.notify(`📄 '${item.name}' 이동 성공`);
                        } catch (err) {
                            try {
                                figma.currentPage = targetPage as PageNode;
                            } catch (e) {
                                figma.notify('❌ 이동 실패 (권한 부족)');
                            }
                        }
                    };
                    switchPage();
                  } else {
                    figma.notify('❌ 페이지를 찾을 수 없습니다.');
                  }
                }}
              >
                  <Text
                    fontFamily="Noto Sans KR"
                    fontSize={14}
                    fontWeight={item.depth === 0 ? 600 : 400}
                    fill={isDone ? '#BDBDBD' : '#333'}
                    textDecoration={isDone ? 'strikethrough' : 'none'}
                    width="fill-parent"
                    hoverStyle={{ fill: '#2F80ED' }} 
                >
                    {item.name}
                </Text>
              </AutoLayout>

              {/* 상태값 (Depth 0이면 숨김) */}
              {item.depth !== 0 && (
                <AutoLayout
                  onClick={() => toggleStatus(index)}
                  fill={STATUS_CONFIG[item.status].color}
                  padding={{ vertical: 4 }}
                  cornerRadius={4}
                  width={54}
                  horizontalAlignItems="center"
                  verticalAlignItems="center"
                >
                  <Text fill={STATUS_CONFIG[item.status].textColor} fontSize={11} fontWeight={700} fontFamily="Noto Sans KR">
                    {STATUS_CONFIG[item.status].text.split(' ')[1]} 
                  </Text>
                </AutoLayout>
              )}

              {/* 담당자 (Depth 0이면 숨김) */}
              {item.depth !== 0 && (
                 <AutoLayout
                  onClick={() => toggleAssignee(index)}
                  stroke={item.assignee === '미지정' ? '#E0E0E0' : '#2F80ED'}
                  fill={item.assignee === '미지정' ? '#F5F5F5' : '#F0F7FF'}
                  padding={{ vertical: 4 }}
                  cornerRadius={4}
                  width={54}
                  horizontalAlignItems="center"
                  verticalAlignItems="center"
                >
                  <Text 
                      fontSize={11} 
                      fill={item.assignee === '미지정' ? '#9E9E9E' : '#2F80ED'}
                      fontWeight={item.assignee === '미지정' ? 400 : 700}
                      fontFamily="Noto Sans KR"
                  >
                      {item.assignee}
                  </Text>
                </AutoLayout>
              )}

            </AutoLayout>
          );
        })}
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(DashboardWidget);