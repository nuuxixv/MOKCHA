const { widget } = figma;
const { AutoLayout, Text, useSyncedState, usePropertyMenu, useEffect, Rectangle, Input, SVG } = widget;

const ICONS = {
  SUN: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>`,
  MOON: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  EYE_ON: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  EYE_OFF: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`,
  REFRESH: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>`,
  SETTINGS: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  EDIT_PAGES: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
};

// --- 1. Configurations ---
const CIRCLE_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

type StatusType = 'HOLD' | 'WIP' | 'URGENT' | 'DONE' | 'ARCHIVE';

const STATUS_CONFIG = {
  HOLD: { 
      LIGHT: { bg: '#F5F5F3', text: '#9E9E9E', tagBg: '#F5F5F5' },
      DARK: { bg: '#252525', text: '#888888', tagBg: '#333333' }
  },
  WIP: { 
      LIGHT: { bg: '#FFFDE7', text: '#FBC02D', tagBg: '#FFF9C4' },
      DARK: { bg: '#3E3400', text: '#FDD835', tagBg: '#594A00' }
  },
  URGENT: { 
      LIGHT: { bg: '#FFEBEE', text: '#D32F2F', tagBg: '#FFEBEE' },
      DARK: { bg: '#3E1010', text: '#EF5350', tagBg: '#5C1D1D' }
  },
  DONE: { 
      LIGHT: { bg: '#F1F8E9', text: '#2E7D32', tagBg: '#E8F5E9' },
      DARK: { bg: '#102810', text: '#66BB6A', tagBg: '#1B3E1B' }
  },
  ARCHIVE: { 
      LIGHT: { bg: '#FAFAFA', text: '#BDBDBD', tagBg: '#EEEEEE' },
      DARK: { bg: '#1E1E1E', text: '#666666', tagBg: '#2C2C2C' }
  },
};

const SAFE_COLOR_PALETTE = [
  { bg: '#FFF3E0', text: '#FF383C' }, 
  { bg: '#FFF8E1', text: '#FF8D28' }, 
  { bg: '#F9FBE7', text: '#FFCC00' }, 
  { bg: '#F1F8E9', text: '#34C759' }, 
  { bg: '#E8F5E9', text: '#00C8B3' }, 
  { bg: '#E0F2F1', text: '#00C0E8' }, 
  { bg: '#E0F7FA', text: '#0088FF' }, 
  { bg: '#E1F5FE', text: '#01579B' }, 
  { bg: '#E3F2FD', text: '#6155F5' }, 
  { bg: '#E8EAF6', text: '#CB30E0' }, 
  { bg: '#F3E5F5', text: '#FF2D55' }, 
  { bg: '#EDE7F6', text: '#AC7F5E' }, 
];

type ThemeMode = 'LIGHT' | 'DARK';
type SizeMode = 'SMALL' | 'MEDIUM' | 'LARGE';

const THEME_CONFIG = {
    LIGHT: {
        bg: '#FFFFFF',
        text: '#111111',
        secondaryText: '#999999',
        divider: '#EEEEEE',
        hover: '#F5F5F5',
        stroke: '#E6E6E6',
        icon: '#555555',
        tooltipBg: '#333333',
        tooltipText: '#FFFFFF',
    },
    DARK: {
        bg: '#1E1E1E',
        text: '#FFFFFF',
        secondaryText: '#AAAAAA',
        divider: '#333333',
        hover: '#2C2C2C',
        stroke: '#444444', 
        icon: '#AAAAAA',
        tooltipBg: '#FFFFFF',
        tooltipText: '#111111',
    }
};

const SIZE_CONFIG = {
    SMALL: { baseFont: 12, padding: 16, width: 440 }, // Expanded padding & width
    MEDIUM: { baseFont: 16, padding: 24, width: 600 }, 
    LARGE: { baseFont: 24, padding: 32, width: 880 }, 
};

const getDeterministicColor = (name: string, theme?: ThemeMode) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SAFE_COLOR_PALETTE.length;
  const color = SAFE_COLOR_PALETTE[index];
  
  if (theme === 'DARK') {
      return { bg: '#333333', text: color.text };
  }
  return color;
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
  
  const [teamMembers, setTeamMembers] = useSyncedState<string[]>('teamMembers', ['미지정']);
  const [isSettingsOpen, setIsSettingsOpen] = useSyncedState<boolean>('isSettingsOpen', false);
  const [newMemberName, setNewMemberName] = useSyncedState<string>('newMemberName', '');
  const [memberColors, setMemberColors] = useSyncedState<{[key:string]: {bg:string, text:string}}>('memberColors', {});

  // --- New States for UI ---
  const [theme, setTheme] = useSyncedState<ThemeMode>('theme', 'LIGHT');
  const [size, setSize] = useSyncedState<SizeMode>('size', 'MEDIUM');
  const [showStatus, setShowStatus] = useSyncedState<boolean>('showStatus', true);

  // --- Management States ---
  const [activeTab, setActiveTab] = useSyncedState<'MEMBERS' | 'STATUS' | 'PAGES'>('activeTab', 'MEMBERS');
  interface StatusItem { id: string; label: string; color: { light: { bg: string, text: string }, dark: { bg: string, text: string } }; type: StatusType | 'CUSTOM'; }
  const [statusConfig, setStatusConfig] = useSyncedState<StatusItem[]>('statusConfig', []);

  // Initialize Status Config on first load
  useEffect(() => {
      if (statusConfig.length === 0) {
          const initialStatus: StatusItem[] = [
              { id: 'HOLD', label: '보류', type: 'HOLD', color: { light: STATUS_CONFIG.HOLD.LIGHT, dark: STATUS_CONFIG.HOLD.DARK } },
              { id: 'WIP', label: '진행중', type: 'WIP', color: { light: STATUS_CONFIG.WIP.LIGHT, dark: STATUS_CONFIG.WIP.DARK } },
              { id: 'URGENT', label: '급함', type: 'URGENT', color: { light: STATUS_CONFIG.URGENT.LIGHT, dark: STATUS_CONFIG.URGENT.DARK } },
              { id: 'DONE', label: '완료', type: 'DONE', color: { light: STATUS_CONFIG.DONE.LIGHT, dark: STATUS_CONFIG.DONE.DARK } },
              { id: 'ARCHIVE', label: '아카이브', type: 'ARCHIVE', color: { light: STATUS_CONFIG.ARCHIVE.LIGHT, dark: STATUS_CONFIG.ARCHIVE.DARK } },
          ];
          setStatusConfig(initialStatus);
      }
  }, []);

  const [newStatusName, setNewStatusName] = useSyncedState<string>('newStatusName', '');
  const [newStatusColorIdx, setNewStatusColorIdx] = useSyncedState<number>('newStatusColorIdx', 0);
  const [newPageName, setNewPageName] = useSyncedState<string>('newPageName', '');

  const C = THEME_CONFIG[theme];
  const S = SIZE_CONFIG[size];

  const getMemberColor = (name: string) => {
    if (name === '미지정') return { bg: theme === 'DARK' ? '#333' : '#F5F5F5', text: theme === 'DARK' ? '#AAA' : '#9E9E9E' };
    if (memberColors[name]) return memberColors[name];
    return getDeterministicColor(name, theme);
  };

  const getStatusColor = (statusId: string) => {
      // Find dynamic status first
      const found = statusConfig.find(s => s.id === statusId);
      if (found) {
          return theme === 'LIGHT' ? found.color.light : found.color.dark;
      }
      // Fallback to static config (for existing items before migration completes)
      if (STATUS_CONFIG[statusId as StatusType]) {
          return STATUS_CONFIG[statusId as StatusType][theme];
      }
      return { bg: '#eee', text: '#999', tagBg: '#eee' };
  };

  // --- Logic ---
  const addStatus = () => {
      if (!newStatusName.trim()) { figma.notify('상태 이름을 입력해주세요.'); return; }
      if (statusConfig.some(s => s.label === newStatusName.trim())) { figma.notify('이미 존재하는 상태입니다.'); return; }

      const colorPair = SAFE_COLOR_PALETTE[newStatusColorIdx];
      const newId = `CUSTOM_${Date.now()}`;
      // Derive Dark mode color: Dark background, same text color
      const darkColor = { bg: '#333333', text: colorPair.text }; 

      const newItem: StatusItem = {
          id: newId,
          label: newStatusName.trim(),
          type: 'CUSTOM',
          color: {
              light: { bg: colorPair.bg, text: colorPair.text },
              dark: { bg: darkColor.bg, text: darkColor.text }
          }
      };

      setStatusConfig([...statusConfig, newItem]);
      setNewStatusName('');
  };

  const removeStatus = (id: string) => {
      if (statusConfig.length <= 1) { figma.notify('최소 1개의 상태는 남겨야 합니다.'); return; }
      setStatusConfig(prev => prev.filter(s => s.id !== id));
  };

  const syncPages = () => {
    const actualPages = figma.root.children;
    const currentFileName = figma.root.name;
    setDocName(currentFileName);

    setItems((prevItems) => {
      return actualPages.map((page) => {
        const existing = prevItems.find((item) => item.pageId === page.id);
        const name = page.name;
        let autoDepth = 0;
        if (name.includes('↳')) autoDepth = 2;
        else if (CIRCLE_NUMBERS.some(num => name.includes(num))) autoDepth = 1;

        return {
          pageId: page.id,
          name: name,
          depth: autoDepth,
          status: existing ? existing.status : 'HOLD',
          assignee: existing ? existing.assignee : teamMembers[0], 
        };
      });
    });

    const now = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const hh = ('0' + now.getHours()).slice(-2);
    const min = ('0' + now.getMinutes()).slice(-2);
    setLastSynced(`${now.getFullYear()}-${('0' + (now.getMonth() + 1)).slice(-2)}-${('0' + now.getDate()).slice(-2)}(${days[now.getDay()]}) ${hh}:${min}`);
    figma.notify('✅ 동기화 완료');
  };

  const [fontsLoaded, setFontsLoaded] = useSyncedState<boolean>('fontsLoaded', false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Promise.all([
          figma.loadFontAsync({ family: "Noto Sans KR", style: "Regular" }),
          figma.loadFontAsync({ family: "Noto Sans KR", style: "Medium" }),
          figma.loadFontAsync({ family: "Noto Sans KR", style: "SemiBold" }),
          figma.loadFontAsync({ family: "Noto Sans KR", style: "Bold" }),
        ]);
        setFontsLoaded(true);
      } catch (err) {
        console.log('Font load error:', err);
        // Fallback: set loaded to true anyway to show *something*
        setFontsLoaded(true);
      }
    };
    
    // Only load if not already marked as loaded (though synced state persists, 
    // real font loading needs to happen per session potentially? 
    // Actually loadFontAsync is needed per session for Plugin API, but for Widget UI?
    // Let's force load every time widget mounts in this session context.
    loadFonts();

    // Initial Sync
    if (items.length === 0) {
        syncPages();
    }
  }, []);

  if (!fontsLoaded) {
      return (
          <AutoLayout 
              fill={THEME_CONFIG[theme].bg} 
              width={SIZE_CONFIG[size].width} 
              height={100} 
              cornerRadius={12} 
              stroke={THEME_CONFIG[theme].stroke}
              horizontalAlignItems="center"
              verticalAlignItems="center"
          >
              <Text fontFamily="Inter" fontSize={14} fill={THEME_CONFIG[theme].secondaryText}>Loading fonts...</Text>
          </AutoLayout>
      )
  }

  const toggleStatus = (index: number) => {
    setItems(current => {
      const newItems = [...current];
      const item = newItems[index];

      // Find current index in dynamic config
      const currentIndex = statusConfig.findIndex(s => s.id === item.status);
      
      let nextStatusId;
      if (currentIndex === -1) {
          // If current status not found (legacy/deleted), reset to first available
          nextStatusId = statusConfig.length > 0 ? statusConfig[0].id : 'HOLD';
      } else {
          // Cycle
          nextStatusId = statusConfig[(currentIndex + 1) % statusConfig.length].id;
      }
      
      item.status = nextStatusId as StatusType; 
      
      return newItems;
    });
  };

  const toggleAssignee = (index: number) => {
    setItems(current => {
      const newItems = [...current];
      const idx = teamMembers.indexOf(newItems[index].assignee);
      newItems[index].assignee = teamMembers[(idx === -1 ? 0 : idx + 1) % teamMembers.length];
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

  const addMember = (nameInput?: string) => {
    const nameToAdd = (typeof nameInput === 'string' ? nameInput : newMemberName).trim();
    if (!nameToAdd) return;
    if (teamMembers.includes(nameToAdd)) { figma.notify('이미 존재하는 이름입니다.'); return; }

    const usedColors = teamMembers.map(m => memberColors[m]?.bg).filter(Boolean);
    const available = SAFE_COLOR_PALETTE.filter(c => !usedColors.includes(c.bg));
    const pool = available.length > 0 ? available : SAFE_COLOR_PALETTE;
    const randomColor = pool[Math.floor(Math.random() * pool.length)];

    setMemberColors(prev => ({ ...prev, [nameToAdd]: randomColor }));
    setTeamMembers(prev => [...prev, nameToAdd]);
    setNewMemberName('');
  };

  const removeMember = (targetName: string) => {
    if (targetName === '미지정') { figma.notify('기본값은 삭제할 수 없습니다.'); return; }
    setTeamMembers(prev => prev.filter(m => m !== targetName));
  };

  const moveMember = (index: number, direction: 'up' | 'down') => {
      const newMembers = [...teamMembers];
      // '미지정' is always 0? No, '미지정' might be in the list.
      // Filter out '미지정' for UI display index, but here we work on full array?
      // Actually the UI filters '미지정'. Let's find index in full array.
      // But for simplicity, let's assume '미지정' is always index 0 and we only reorder the rest.
      
      // UI maps `teamMembers.filter(m => m !== '미지정')`.
      // Let's operate on the filtered list logic for safety.
      // But we need to update the main state.
      
      // Simplified: Just swap in main array.
      // Warning: '미지정' should stay at 0? 
      // If user moves something to index 0, it swaps with '미지정'.
      // Let's prevent moving before '미지정'.
      
      const targetIndex = index; // in the full array? No, index from UI map.
      // The UI code below: `teamMembers.filter(...).map((member, idx) => ...)`
      // The `idx` is from the filtered list.
      
      // We need to find the actual index in `teamMembers`.
      // Since map uses `member` string, let's find by name.
      // Wait, duplicate names not allowed. So name is unique key.
      
      // Re-write to take `name` and direction.
  };
  
  const moveMemberByName = (name: string, direction: 'up' | 'down') => {
      const idx = teamMembers.indexOf(name);
      if (idx === -1) return;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      
      // Boundary checks
      if (swapIdx < 0 || swapIdx >= teamMembers.length) return;
      
      // Don't swap with '미지정' if it is at 0?
      if (teamMembers[swapIdx] === '미지정' || name === '미지정') return; 

      const newMembers = [...teamMembers];
      [newMembers[idx], newMembers[swapIdx]] = [newMembers[swapIdx], newMembers[idx]];
      setTeamMembers(newMembers);
  };

  const moveStatus = (id: string, direction: 'up' | 'down') => {
      const idx = statusConfig.findIndex(s => s.id === id);
      if (idx === -1) return;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      
      if (swapIdx < 0 || swapIdx >= statusConfig.length) return;
      
      const newConfig = [...statusConfig];
      [newConfig[idx], newConfig[swapIdx]] = [newConfig[swapIdx], newConfig[idx]];
      setStatusConfig(newConfig);
  };

  // --- Page Management Logic ---
  const addPage = (nameInput?: string) => {
      const name = (typeof nameInput === 'string' ? nameInput : newPageName).trim();
      if (!name) return;
      
      const newPage = figma.createPage();
      newPage.name = name;
      figma.notify(`📄 페이지 '${name}' 생성됨`);
      setNewPageName('');
      syncPages();
  };

  const addDivider = () => {
      const newPage = figma.createPage();
      newPage.name = '----------------';
      figma.notify(`➖ 구분선 추가됨`);
      syncPages();
  };

  const movePage = (pageId: string, direction: 'up' | 'down') => {
      const pages = figma.root.children;
      const index = pages.findIndex(p => p.id === pageId);
      if (index === -1) return;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= pages.length) return;

      const page = pages[index];
      // Check if trying to move current widget page? (Optional safety)
      
      figma.root.insertChild(newIndex, page);
      syncPages();
  };

  // --- Property Menu ---
  usePropertyMenu(
    [
      {
        itemType: 'dropdown',
        propertyName: 'size',
        tooltip: '크기 변경',
        selectedOption: size,
        options: [
          { option: 'SMALL', label: '작게' },
          { option: 'MEDIUM', label: '보통' },
          { option: 'LARGE', label: '크게' },
        ],
      },
      {
        itemType: 'action',
        propertyName: 'theme',
        tooltip: theme === 'LIGHT' ? '다크 모드로 전환' : '라이트 모드로 전환',
        icon: theme === 'LIGHT' ? ICONS.MOON : ICONS.SUN, 
      },
      {
          itemType: 'action',
          propertyName: 'view',
          tooltip: showStatus ? '상태 숨기기' : '상태 표시하기',
          icon: showStatus ? ICONS.EYE_ON : ICONS.EYE_OFF,
      },
      { itemType: 'separator' },
      {
        itemType: 'action',
        propertyName: 'sync',
        tooltip: '페이지 동기화',
        icon: ICONS.REFRESH,
      },
      {
        itemType: 'separator'
      },
      {
          itemType: 'action',
          propertyName: 'edit_pages',
          tooltip: '페이지 편집',
          icon: ICONS.EDIT_PAGES
      },
      {
        itemType: 'action',
        propertyName: 'management',
        tooltip: '관리 패널',
        icon: ICONS.SETTINGS,
      },
    ],
    (e) => {
      console.log('Menu Event:', e);
      const { propertyName, propertyValue } = e;
      if (propertyName === 'size') {
        setSize(propertyValue as SizeMode);
      } else if (propertyName === 'theme') {
        setTheme(theme === 'LIGHT' ? 'DARK' : 'LIGHT');
      } else if (propertyName === 'view') {
        setShowStatus(!showStatus);
      } else if (propertyName === 'sync') {
        syncPages();
      } else if (propertyName === 'management') {
        setIsSettingsOpen(true);
        // setActiveTab('MEMBERS'); // Default to Members? Or keep last open tab
      } else if (propertyName === 'edit_pages') {
          setIsSettingsOpen(true);
          setActiveTab('PAGES');
      }
    },
  );


  // --- UI Components ---
  // Management View (Replaces SettingsView)
  const ManagementView = () => (
    <AutoLayout
        direction="vertical"
        padding={16}
        fill={C.bg}
        cornerRadius={12}
        stroke={C.stroke}
        width={300}
        effect={{ type: 'drop-shadow', color: { r: 0, g: 0, b: 0, a: 0.15 }, offset: { x: 0, y: 4 }, blur: 20 }}
        spacing={12}
        positioning="absolute"
        x={(S.width - 300) / 2}
        y={40}
    >
        {/* Header with Tabs */}
        <AutoLayout width="fill-parent" verticalAlignItems="center" spacing="auto">
            <AutoLayout spacing={12}>
                <AutoLayout onClick={() => setActiveTab('MEMBERS')} opacity={activeTab === 'MEMBERS' ? 1 : 0.4}>
                    <Text fontSize={16} fontWeight={700} fontFamily="Noto Sans KR" fill={C.text}>👥 팀원</Text>
                </AutoLayout>
                <Rectangle width={1} height={16} fill={C.divider} />
                <AutoLayout onClick={() => setActiveTab('STATUS')} opacity={activeTab === 'STATUS' ? 1 : 0.4}>
                     <Text fontSize={16} fontWeight={700} fontFamily="Noto Sans KR" fill={C.text}>🏷️ 상태</Text>
                </AutoLayout>
                <Rectangle width={1} height={16} fill={C.divider} />
                <AutoLayout onClick={() => setActiveTab('PAGES')} opacity={activeTab === 'PAGES' ? 1 : 0.4}>
                     <Text fontSize={16} fontWeight={700} fontFamily="Noto Sans KR" fill={C.text}>📄 페이지</Text>
                </AutoLayout>
            </AutoLayout>
            
            <AutoLayout onClick={() => setIsSettingsOpen(false)} padding={4} hoverStyle={{ fill: C.hover }} cornerRadius={4}>
                 <SVG src={`<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="${C.text}" stroke-width="2" stroke-linecap="round"/></svg>`} width={20} height={20}/>
            </AutoLayout>
        </AutoLayout>
        <Rectangle width="fill-parent" height={1} fill={C.divider} />

        {/* Content based on Tab */}
        {activeTab === 'MEMBERS' ? (
            <AutoLayout width="fill-parent" spacing={8} direction="vertical">
                <AutoLayout width="fill-parent" spacing={8} verticalAlignItems="center">
                    <Input
                        value={newMemberName}
                        placeholder="이름 입력"
                        onTextEditEnd={(e) => addMember(e.characters)}
                        width="fill-parent"
                        fontSize={14}
                        fontFamily="Noto Sans KR"
                        inputFrameProps={{ padding: 8, cornerRadius: 6, stroke: C.stroke, fill: theme === 'DARK' ? '#2C2C2C' : '#FAFAFA', color: C.text }} 
                    />
                    <AutoLayout onClick={() => addMember()} padding={{ vertical: 8, horizontal: 12 }} cornerRadius={6} fill="#2F80ED" hoverStyle={{ fill: '#2D75D8' }}>
                        <Text fill="#FFF" fontWeight={700} fontFamily="Noto Sans KR">추가</Text>
                    </AutoLayout>
                </AutoLayout>
                <AutoLayout direction="vertical" width="fill-parent" spacing={4}> 
                    {teamMembers.filter(member => member !== '미지정').map((member, idx, arr) => (
                        <AutoLayout key={member} width="fill-parent" verticalAlignItems="center" padding={8} cornerRadius={6} fill={getMemberColor(member).bg} spacing="auto">
                            <Text fontSize={14} fontFamily="Noto Sans KR" fill={getMemberColor(member).text} fontWeight={600}>{member}</Text>
                            <AutoLayout spacing={4} verticalAlignItems="center">
                                {/* Up Arrow */}
                                {idx > 0 && (
                                    <AutoLayout onClick={() => moveMemberByName(member, 'up')} padding={4} hoverStyle={{ fill: '#00000010' }} cornerRadius={4}>
                                        <SVG src={`<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 15L12 9L6 15" stroke="${getMemberColor(member).text}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`} width={12} height={12}/>
                                    </AutoLayout>
                                )}
                                {/* Down Arrow */}
                                {idx < arr.length - 1 && (
                                    <AutoLayout onClick={() => moveMemberByName(member, 'down')} padding={4} hoverStyle={{ fill: '#00000010' }} cornerRadius={4}>
                                        <SVG src={`<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="${getMemberColor(member).text}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`} width={12} height={12}/>
                                    </AutoLayout>
                                )}
                                {/* Delete */}
                                <AutoLayout onClick={() => removeMember(member)} padding={4} hoverStyle={{ fill: '#00000010' }} cornerRadius={4}>
                                    <Text fontSize={12} fill={getMemberColor(member).text} opacity={0.6}>✕</Text>
                                </AutoLayout>
                            </AutoLayout>
                        </AutoLayout>
                    ))}
                </AutoLayout>
            </AutoLayout>
        ) : activeTab === 'PAGES' ? (
             <AutoLayout width="fill-parent" spacing={8} direction="vertical">
                {/* 1. Add Page Form */}
                <AutoLayout width="fill-parent" spacing={8} verticalAlignItems="center">
                    <Input
                        value={newPageName}
                        placeholder="새 페이지 이름"
                        onTextEditEnd={(e) => setNewPageName(e.characters)}
                        width="fill-parent"
                        fontSize={14}
                        fontFamily="Noto Sans KR"
                        inputFrameProps={{ padding: 8, cornerRadius: 6, stroke: C.stroke, fill: theme === 'DARK' ? '#2C2C2C' : '#FAFAFA', color: C.text }} 
                    />
                    <AutoLayout onClick={() => addPage()} padding={{ vertical: 8, horizontal: 12 }} cornerRadius={6} fill="#2F80ED" hoverStyle={{ fill: '#2D75D8' }}>
                        <Text fill="#FFF" fontWeight={700} fontFamily="Noto Sans KR">추가</Text>
                    </AutoLayout>
                </AutoLayout>
                
                <AutoLayout width="fill-parent" onClick={addDivider} padding={8} cornerRadius={6} fill={C.hover} horizontalAlignItems="center" hoverStyle={{ stroke: C.stroke }}>
                     <Text fontSize={12} fill={C.secondaryText} fontFamily="Noto Sans KR">+ 구분선 추가</Text>
                </AutoLayout>

                <Rectangle width="fill-parent" height={1} fill={C.divider} />

                {/* 2. Page List (Mini Sync View) */}
                <AutoLayout direction="vertical" width="fill-parent" spacing={4} height={300} overflow="scroll">
                    {items.map((item, idx) => { // Use synced items as proxy for real pages
                        const isDivider = /^[-\s_—–]+$/.test(item.name) || item.name.includes('---');
                        return (
                            <AutoLayout key={item.pageId} width="fill-parent" verticalAlignItems="center" padding={8} cornerRadius={6} fill={C.bg} stroke={C.stroke} spacing="auto">
                                <AutoLayout spacing={8} verticalAlignItems="center" width="fill-parent">
                                    {isDivider ? (
                                        <Rectangle width={100} height={2} fill={C.secondaryText} />
                                    ) : (
                                        <Text fontSize={14} fontFamily="Noto Sans KR" fill={C.text} truncate={true} width={160}>{item.name}</Text>
                                    )}
                                </AutoLayout>
                                <AutoLayout spacing={4} verticalAlignItems="center">
                                    {/* Up Arrow */}
                                    {idx > 0 && (
                                        <AutoLayout onClick={() => movePage(item.pageId, 'up')} padding={4} hoverStyle={{ fill: C.hover }} cornerRadius={4}>
                                            <SVG src={`<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 15L12 9L6 15" stroke="${C.secondaryText}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`} width={12} height={12}/>
                                        </AutoLayout>
                                    )}
                                    {/* Down Arrow */}
                                    {idx < items.length - 1 && (
                                        <AutoLayout onClick={() => movePage(item.pageId, 'down')} padding={4} hoverStyle={{ fill: C.hover }} cornerRadius={4}>
                                            <SVG src={`<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="${C.secondaryText}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`} width={12} height={12}/>
                                        </AutoLayout>
                                    )}
                                </AutoLayout>
                            </AutoLayout>
                        )
                    })}
                </AutoLayout>
             </AutoLayout>
        ) : (
            <AutoLayout width="fill-parent" spacing={8} direction="vertical">
                {/* 1. Add Status Form */}
                <AutoLayout width="fill-parent" direction="vertical" spacing={8} padding={{ bottom: 8 }}>
                    <AutoLayout width="fill-parent" spacing={8} verticalAlignItems="center">
                        <Input
                            value={newStatusName}
                            placeholder="새 상태 이름"
                            onTextEditEnd={(e) => setNewStatusName(e.characters)}
                            width="fill-parent"
                            fontSize={14}
                            fontFamily="Noto Sans KR"
                            inputFrameProps={{ padding: 8, cornerRadius: 6, stroke: C.stroke, fill: theme === 'DARK' ? '#2C2C2C' : '#FAFAFA' }} 
                        />
                        <AutoLayout onClick={addStatus} padding={{ vertical: 8, horizontal: 12 }} cornerRadius={6} fill="#2F80ED" hoverStyle={{ fill: '#2D75D8' }}>
                            <Text fill="#FFF" fontWeight={700} fontFamily="Noto Sans KR">추가</Text>
                        </AutoLayout>
                    </AutoLayout>
                    
                    {/* Color Picker (Horizontal Scroll) */}
                    <AutoLayout width="fill-parent" spacing={6} overflow="scroll">
                        {SAFE_COLOR_PALETTE.slice(0, 10).map((color, idx) => (
                             <AutoLayout 
                                key={idx} 
                                width={20} height={20} 
                                 cornerRadius={10} 
                                fill={color.text}
                                stroke={C.text}
                                strokeWidth={newStatusColorIdx === idx ? 2 : 0}
                                onClick={() => setNewStatusColorIdx(idx)}
                             />
                        ))}
                    </AutoLayout>
                </AutoLayout>
                
                <Rectangle width="fill-parent" height={1} fill={C.divider} />

                {/* 2. Status List */}
                <AutoLayout direction="vertical" width="fill-parent" spacing={4}>
                    {statusConfig.map((status, idx) => {
                        const style = theme === 'LIGHT' ? status.color.light : status.color.dark;
                        return (
                            <AutoLayout key={status.id} width="fill-parent" verticalAlignItems="center" padding={8} cornerRadius={6} fill={C.hover} spacing="auto">
                                <AutoLayout spacing={8} verticalAlignItems="center">
                                    <AutoLayout width={12} height={12} cornerRadius={6} fill={style.text} />
                                    <Text fontSize={14} fontFamily="Noto Sans KR" fill={C.text} fontWeight={600}>{status.label}</Text>
                                </AutoLayout>
                                <AutoLayout spacing={4} verticalAlignItems="center">
                                    {/* Up Arrow */}
                                    {idx > 0 && (
                                        <AutoLayout onClick={() => moveStatus(status.id, 'up')} padding={4} hoverStyle={{ fill: '#00000010' }} cornerRadius={4}>
                                            <SVG src={`<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 15L12 9L6 15" stroke="${C.secondaryText}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`} width={12} height={12}/>
                                        </AutoLayout>
                                    )}
                                    {/* Down Arrow */}
                                    {idx < statusConfig.length - 1 && (
                                        <AutoLayout onClick={() => moveStatus(status.id, 'down')} padding={4} hoverStyle={{ fill: '#00000010' }} cornerRadius={4}>
                                            <SVG src={`<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="${C.secondaryText}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`} width={12} height={12}/>
                                        </AutoLayout>
                                    )}
                                    <AutoLayout onClick={() => removeStatus(status.id)} padding={4} hoverStyle={{ fill: '#00000010' }} cornerRadius={4}>
                                        <SVG src={`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3L9 9" stroke="${C.secondaryText}" stroke-width="1.5" stroke-linecap="round"/></svg>`} width={12} height={12}/>
                                    </AutoLayout>
                                </AutoLayout>
                            </AutoLayout>
                        );
                    })}
                </AutoLayout>
            </AutoLayout>
        )}
    </AutoLayout>
  );

  // --- Main Render ---
  const fileKey = figma.fileKey; 
  const currentStatusConfig = (s: StatusType) => STATUS_CONFIG[s][theme]; // Get config for current theme

  return (
    <AutoLayout direction="vertical" fill={C.bg} width={S.width} cornerRadius={12} stroke={C.stroke} spacing={0}>
        
        {/* === CONTENT AREA === */}
        <AutoLayout 
            direction="vertical" 
            width="fill-parent" 
            padding={S.padding} 
            spacing={S.padding / 2}
            opacity={isSettingsOpen ? 0.3 : 1}
        >
            {/* Header Info */}
            <AutoLayout width="fill-parent" spacing={2} direction="vertical">
                <Text fontSize={S.baseFont * 1.3} fontWeight={700} fill={C.text} fontFamily="Noto Sans KR">{docName}</Text>
                <Text fontSize={S.baseFont * 0.8} fill={C.secondaryText} fontFamily="Noto Sans KR">Last update: {lastSynced}</Text>
            </AutoLayout>

            {/* List Header */}
            <AutoLayout width="fill-parent" padding={{ top: 12, bottom: 8, horizontal: 12 }} spacing={12} verticalAlignItems="center">
                <Text fontSize={S.baseFont * 0.8} fontWeight={600} fill={C.secondaryText} width={30} fontFamily="Noto Sans KR">위계</Text>
                <Text fontSize={S.baseFont * 0.8} fontWeight={600} fill={C.secondaryText} width="fill-parent" fontFamily="Noto Sans KR">페이지명</Text>
                {showStatus && (
                    <AutoLayout width={116} spacing={8}>
                        <Text fontSize={S.baseFont * 0.8} fontWeight={600} fill={C.secondaryText} width={54} horizontalAlignText="center" fontFamily="Noto Sans KR">진행</Text>
                        <Text fontSize={S.baseFont * 0.8} fontWeight={600} fill={C.secondaryText} width={54} horizontalAlignText="center" fontFamily="Noto Sans KR">담당자</Text>
                    </AutoLayout>
                )}
            </AutoLayout>
            <Rectangle width="fill-parent" height={1} fill={C.divider} />

            {/* List Items */}
            <AutoLayout direction="vertical" width="fill-parent" spacing={0}>
                {items.map((item, index) => {
                    const name = item.name.trim();
                    const isDivider = /^[-\s_—–]+$/.test(name) || name.includes('---');
                    
                    if (isDivider) {
                        return (
                            <AutoLayout key={item.pageId} width="fill-parent" height={12} verticalAlignItems="center" padding={{ horizontal: 6 }}>
                                <Rectangle width="fill-parent" height={1} fill={C.divider} />
                            </AutoLayout>
                        );
                    }

                    const isDone = item.status === 'DONE';
                    const memberColor = getMemberColor(item.assignee);
                    const pageLink = `https://www.figma.com/design/${fileKey}/${encodeURIComponent(docName)}?node-id=${item.pageId}`;
                    const statusStyle = currentStatusConfig(item.status);

                    return (
                        <AutoLayout
                            key={item.pageId}
                            width="fill-parent"
                            padding={{ vertical: 8, horizontal: 12 }} 
                            spacing={12}
                            verticalAlignItems="center"
                            cornerRadius={6}
                            fill={C.bg}
                            hoverStyle={{ fill: C.hover }}
                        >
                            {/* Depth (Always visible) */}
                            <AutoLayout width={30} onClick={() => toggleDepth(index)} hoverStyle={{ fill: '#00000010' }} cornerRadius={4}>
                                <Text fontSize={S.baseFont * 0.8} fill={C.secondaryText} fontFamily="Noto Sans KR">
                                    {item.depth === 1 ? '①' : item.depth === 2 ? '↳' : '-'}
                                </Text>
                            </AutoLayout>

                            {/* Name */}
                            <AutoLayout width="fill-parent" padding={{ left: item.depth * 12 }} 
                                onClick={async () => {
                                    const target = figma.root.children.find(n => n.id === item.pageId);
                                    if (target && target.type === 'PAGE') {
                                        try { await figma.setCurrentPageAsync(target as PageNode); figma.notify(`✅ '${item.name}' 이동`); return; } catch(e){}
                                    }
                                    if (pageLink) figma.openExternal(pageLink);
                                }}>
                                <Text fontFamily="Noto Sans KR" fontSize={S.baseFont} fontWeight={item.depth === 0 ? 600 : 400} 
                                      fill={isDone ? C.secondaryText : C.text} 
                                      textDecoration={isDone ? 'strikethrough' : 'none'}
                                      width="fill-parent" hoverStyle={{ fill: '#2F80ED' }}>
                                    {item.name}
                                </Text>
                            </AutoLayout>

                            {showStatus && item.depth !== 0 && (
                                <AutoLayout width={116} spacing={8} verticalAlignItems="center">
                                    <AutoLayout onClick={() => toggleStatus(index)} fill={statusStyle.bg} padding={{ vertical: 4 }} cornerRadius={4} width={54} horizontalAlignItems="center">
                                        <Text fill={statusStyle.text} fontSize={S.baseFont * 0.8} fontWeight={700} fontFamily="Noto Sans KR">
                                            {
                                                statusConfig.find(s => s.id === item.status)?.label || item.status
                                            } 
                                        </Text>
                                    </AutoLayout>
                                    <AutoLayout onClick={() => toggleAssignee(index)} fill={memberColor.bg} padding={{ vertical: 4 }} cornerRadius={4} width={54} horizontalAlignItems="center">
                                         <Text fontSize={S.baseFont * 0.8} fill={memberColor.text} fontWeight={item.assignee === '미지정' ? 400 : 700} fontFamily="Noto Sans KR">
                                            {item.assignee}
                                        </Text>
                                    </AutoLayout>
                                </AutoLayout>
                            )}
                        </AutoLayout>
                    );
                })}
            </AutoLayout>
        </AutoLayout>

        {isSettingsOpen && <ManagementView />}
    </AutoLayout>
  );
}

widget.register(DashboardWidget);
