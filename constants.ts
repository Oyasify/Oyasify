import { Theme, Friend, Chat, User, AcademyLesson, AppUser } from './types';

export const OWNER_CREDENTIALS = {
  email: 'pojaum1@gmail.com',
  password: '169738161',
};

export const THEMES: Theme[] = [
    {
        key: 'sintonia',
        name: 'Sintonia',
        properties: {
            '--body-gradient': 'linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)',
            '--bg-primary': '#16213E',
            '--bg-secondary': '#1A1A2E',
            '--bg-tertiary': '#222E50',
            '--text-primary': '#E0E0E0',
            '--text-secondary': '#A9A9A9',
            '--accent-primary': '#0F3460',
            '--accent-secondary': '#E94560',
            '--status-online': '#57F287',
            '--status-offline': '#747F8D',
            '--danger': '#ED4245',
            '--scrollbar-track': '#16213E',
            '--scrollbar-thumb': '#E94560',
        },
        font: 'font-roboto-mono'
    },
    {
        key: 'vinil',
        name: 'Vinil',
        properties: {
            '--body-gradient': 'linear-gradient(180deg, #FDF8F0 0%, #F8EFE4 100%)',
            '--bg-primary': 'transparent',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#F0E6D9',
            '--text-primary': '#402E32',
            '--text-secondary': '#7A6B62',
            '--accent-primary': '#D97706',
            '--accent-secondary': '#F59E0B',
            '--status-online': '#4CAF50',
            '--status-offline': '#757575',
            '--danger': '#F44336',
            '--scrollbar-track': '#F8EFE4',
            '--scrollbar-thumb': '#D97706',
        },
        font: 'font-lato'
    },
    {
        key: 'neon',
        name: 'Neon',
        properties: {
            '--body-gradient': 'linear-gradient(180deg, #0D0D0D 0%, #1A1A1A 100%)',
            '--bg-primary': '#1A1A1A',
            '--bg-secondary': '#1F1F1F',
            '--bg-tertiary': '#2A2A2A',
            '--text-primary': '#FFFFFF',
            '--text-secondary': '#B3B3B3',
            '--accent-primary': '#39FF14',
            '--accent-secondary': '#00BFFF',
            '--status-online': '#39FF14',
            '--status-offline': '#747F8D',
            '--danger': '#FF073A',
            '--scrollbar-track': '#1A1A1A',
            '--scrollbar-thumb': '#39FF14',
        },
        font: 'font-roboto-mono'
    },
    {
        key: 'acustico',
        name: 'Acústico',
        properties: {
            '--body-gradient': 'linear-gradient(180deg, #FCFBF8 0%, #F5F1E9 100%)',
            '--bg-primary': 'transparent',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#EAE4D9',
            '--text-primary': '#3D3522',
            '--text-secondary': '#6B5E4A',
            '--accent-primary': '#8C6E4A',
            '--accent-secondary': '#A68B6A',
            '--status-online': '#558B2F',
            '--status-offline': '#8D6E63',
            '--danger': '#BF360C',
            '--scrollbar-track': '#F5F1E9',
            '--scrollbar-thumb': '#8C6E4A',
        },
        font: 'font-inter'
    },
    {
        key: 'rosa',
        name: 'Rosa',
        properties: {
            '--body-gradient': 'linear-gradient(180deg, #FEF6FA 0%, #FFEBF4 100%)',
            '--bg-primary': 'transparent',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#FFE4F0',
            '--text-primary': '#333333',
            '--text-secondary': '#828282',
            '--accent-primary': '#F72585',
            '--accent-secondary': '#D91C71',
            '--status-online': '#4CAF50',
            '--status-offline': '#757575',
            '--danger': '#F44336',
            '--scrollbar-track': '#FFEBF4',
            '--scrollbar-thumb': '#F72585',
        },
        font: 'font-poppins'
    },
    {
        key: 'oceano',
        name: 'Oceano',
        properties: {
            '--body-gradient': 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)',
            '--bg-primary': 'transparent',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#E0F2FE',
            '--text-primary': '#1F2937',
            '--text-secondary': '#6B7280',
            '--accent-primary': '#38BDF8',
            '--accent-secondary': '#0EA5E9',
            '--status-online': '#10B981',
            '--status-offline': '#9CA3AF',
            '--danger': '#EF4444',
            '--scrollbar-track': '#E0F2FE',
            '--scrollbar-thumb': '#38BDF8',
        },
        font: 'font-inter'
    },
    {
        key: 'solar',
        name: 'Solar',
        properties: {
            '--body-gradient': 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)',
            '--bg-primary': 'transparent',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#FEF3C7',
            '--text-primary': '#1F2937',
            '--text-secondary': '#6B7280',
            '--accent-primary': '#F59E0B',
            '--accent-secondary': '#D97706',
            '--status-online': '#10B981',
            '--status-offline': '#9CA3AF',
            '--danger': '#EF4444',
            '--scrollbar-track': '#FEF3C7',
            '--scrollbar-thumb': '#F59E0B',
        },
        font: 'font-inter'
    },
     {
        key: 'ametista',
        name: 'Ametista',
        properties: {
            '--body-gradient': 'linear-gradient(180deg, #F5F3FF 0%, #EDE9FE 100%)',
            '--bg-primary': 'transparent',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#EDE9FE',
            '--text-primary': '#1F2937',
            '--text-secondary': '#6B7280',
            '--accent-primary': '#8B5CF6',
            '--accent-secondary': '#7C3AED',
            '--status-online': '#10B981',
            '--status-offline': '#9CA3AF',
            '--danger': '#EF4444',
            '--scrollbar-track': '#EDE9FE',
            '--scrollbar-thumb': '#8B5CF6',
        },
        font: 'font-lato'
    },
    {
        key: 'rubi',
        name: 'Rubi',
        properties: {
            '--body-gradient': 'linear-gradient(180deg, #FFF1F2 0%, #FEE2E2 100%)',
            '--bg-primary': 'transparent',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#FEE2E2',
            '--text-primary': '#1F2937',
            '--text-secondary': '#6B7280',
            '--accent-primary': '#F43F5E',
            '--accent-secondary': '#E11D48',
            '--status-online': '#10B981',
            '--status-offline': '#9CA3AF',
            '--danger': '#EF4444',
            '--scrollbar-track': '#FEE2E2',
            '--scrollbar-thumb': '#F43F5E',
        },
        font: 'font-lato'
    },
    {
        key: 'floresta',
        name: 'Floresta',
        properties: {
            '--body-gradient': 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)',
            '--bg-primary': 'transparent',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#DCFCE7',
            '--text-primary': '#1F2937',
            '--text-secondary': '#6B7280',
            '--accent-primary': '#22C55E',
            '--accent-secondary': '#16A34A',
            '--status-online': '#10B981',
            '--status-offline': '#9CA3AF',
            '--danger': '#EF4444',
            '--scrollbar-track': '#DCFCE7',
            '--scrollbar-thumb': '#22C55E',
        },
        font: 'font-poppins'
    },
    {
        key: 'apoiador',
        name: 'Apoiador',
        properties: {
            '--body-gradient': 'linear-gradient(180deg, #1E1B2E 0%, #2A213C 100%)',
            '--bg-primary': '#2A213C',
            '--bg-secondary': '#3E3159',
            '--bg-tertiary': '#504170',
            '--text-primary': '#F3E5F5',
            '--text-secondary': '#CE93D8',
            '--accent-primary': '#D1C4E9',
            '--accent-secondary': '#B39DDB',
            '--status-online': '#AED581',
            '--status-offline': '#BDBDBD',
            '--danger': '#FFAB91',
            '--scrollbar-track': '#2A213C',
            '--scrollbar-thumb': '#504170',
        },
        font: 'font-poppins'
    },
];

export const initialUsersForDiscovery: (AppUser & { password?: string })[] = [
  { id: 101, name: 'Casey', email: 'casey@example.com', password: 'password', avatarUrl: 'https://i.pravatar.cc/150?u=casey', bio: 'Exploring new sounds.', role: 'user', theme: 'vinil', isSupporter: false },
  { id: 102, name: 'Riley', email: 'riley@example.com', password: 'password', avatarUrl: 'https://i.pravatar.cc/150?u=riley', bio: 'Just here to vibe.', role: 'user', theme: 'neon', isSupporter: true },
  { id: 103, name: 'Jess', email: 'jess@example.com', password: 'password', avatarUrl: 'https://i.pravatar.cc/150?u=jess', bio: 'Producer and vocalist.', role: 'user', theme: 'acustico', isSupporter: false },
  { id: 104, name: 'Quinn', email: 'quinn@example.com', password: 'password', avatarUrl: 'https://i.pravatar.cc/150?u=quinn', bio: 'Singer-songwriter.', role: 'user', theme: 'rosa', isSupporter: false },
  { id: 105, name: 'Morgan', email: 'morgan@example.com', password: 'password', avatarUrl: 'https://i.pravatar.cc/150?u=morgan', bio: 'DJ and music lover.', role: 'user', theme: 'rubi', isSupporter: false },
];

export const initialFriends: Friend[] = [
    { id: 1, name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', online: true },
    { id: 2, name: 'Samira', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f', online: false },
    { id: 3, name: 'Jordan', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704g', online: true },
    { id: 4, name: 'Mika', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704h', online: true },
    { id: 5, name: 'Leo', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704i', online: false },
];

export const chats: Chat[] = [
    {
        friendId: 1,
        messages: [
            { id: 1, type: 'text', content: 'E aí, tudo certo?', senderId: 1, timestamp: '10:00' },
            { id: 2, type: 'text', content: 'Tudo ótimo! E com você?', senderId: 'me' as any, timestamp: '10:01' },
            { id: 3, type: 'text', content: 'Melhor agora! Viu o vídeo novo que postei?', senderId: 1, timestamp: '10:02' },
        ],
    },
    {
        friendId: 3,
        messages: [
            { id: 1, type: 'text', content: 'Bora fazer uma collab?', senderId: 3, timestamp: 'Ontem' },
        ],
    },
];

export const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: 1,
    title: 'Dominando o Controle Vocal',
    duration: '12:34',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTUwNnwwfDF8c2VhcmNofDEzfHxtdXNpYyUyMHN0dWRpb3xlbnwwfHx8fDE3MTc4NDE4MjV8MA&ixlib=rb-4.0.3&q=80&w=400',
    videoUrl: '',
  },
  {
    id: 2,
    title: 'A Arte da Composição',
    duration: '25:10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTUwNnwwfDF8c2VhcmNofDEwfHxtdXNpYyUyMHN0dWRpb3xlbnwwfHx8fDE3MTc4NDE4MjV8MA&ixlib=rb-4.0.3&q=80&w=400',
    videoUrl: '',
  },
    {
    id: 3,
    title: 'Técnicas de Edição Avançadas',
    duration: '45:20',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616442695529-fe2415a13370?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTUwNnwwfDF8c2VhcmNofDh8fHZpZGVvJTIwZWRpdGluZ3xlbnwwfHx8fDE3MTc4NDI4NTl8MA&ixlib=rb-4.0.3&q=80&w=400',
    videoUrl: '',
  },
    {
    id: 4,
    title: 'Crescendo Sua Audiência',
    duration: '30:05',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554177255-61502b352de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTUwNnwwfDF8c2VhcmNofDEyfHxzb2NpYWwlMjBtZWRpYXxlbnwwfHx8fDE3MTc4NDI4ODd8MA&ixlib=rb-4.0.3&q=80&w=400',
    videoUrl: '',
  },
];