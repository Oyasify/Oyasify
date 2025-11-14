
import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Screen, AppUser, Friend, Chat, AcademyLesson, Message, Theme, User 
} from './types';
import { 
    THEMES, initialFriends, chats as initialChats, ACADEMY_LESSONS, initialUsersForDiscovery, OWNER_CREDENTIALS 
} from './constants';
import { generateScript, chatWithOyasifyAI } from './services/geminiService';
import { 
    Home, Mic, User as UserIcon, GraduationCap, Send, Plus, Paperclip, LogOut,
    X, Bell, Palette, Download, Link as LinkIcon, Heart, Shield, Crown, Flower2, Rocket, Sparkles, Pencil, MessageSquare, Droplet, Flame, Gem, Leaf, MicOff, Play, Pause, Check, Users, Search, Phone, ClipboardCopy
} from 'lucide-react';

// --- Local Storage Hooks ---
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // Fix: The caught error is of type 'unknown'. Cast to a string to log it.
            // FIX: Using template literal for descriptive error logging to resolve linter error.
            console.error(`Error reading from localStorage for key "${key}": ${String(error)}`);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // Fix: The caught error is of type 'unknown'. Cast to a string to log it.
            // FIX: Using template literal for descriptive error logging to resolve linter error.
            console.error(`Error writing to localStorage for key "${key}": ${String(error)}`);
        }
    };
    return [storedValue, setValue];
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

// --- Audio Player ---
const playSound = (type: 'click' | 'notification' | 'sent' | 'start_recording' | 'cancel_recording') => {
    let soundFile: string;
    switch (type) {
        case 'notification':
            soundFile = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZ4KSYXgA837/3wMRgBwA9A4+BsDP/y//4wMQaAEMAwwDEYEyP/DAAFFQz/wAY709//5x//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//-AANCLAmp96AAAADAAAAABhAAQN+8AAAACgAAATEFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTAAAAAAEAAANIAAD/AAAQAAAAAEgAAAAAAAAAEhQAAQAAAAAAAAAEAAADgAABAAAAAAAAAAAAAAA';
            break;
        case 'click':
        case 'sent':
        case 'start_recording':
        case 'cancel_recording':
        default:
            soundFile = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZ4JFdpKgdHVkXY8gAR//LgAAAAAAAAAAAABQTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-AAVERpqgA9QAL/8AAB//4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
            break;
    }
    // FIX: Refactored to handle promise rejection errors more explicitly, preventing a potential toolchain issue with the ternary operator.
    new Audio(soundFile).play().catch(e => {
        if (e instanceof Error) {
            console.error(`Error playing sound: ${e.message}`);
        } else {
            console.error(`An unknown error occurred while playing sound: ${String(e)}`);
        }
    });
};

// --- New Logo Component ---
const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M20 5C20 5 28.3333 6.66667 35 11.6667C35 21.6667 29.1667 31.6667 20 35C10.8333 31.6667 5 21.6667 5 11.6667C11.6667 6.66667 20 5 20 5Z" fill="currentColor" fillOpacity="0.2"/>
        <path d="M20 5C20 5 28.3333 6.66667 35 11.6667C35 21.6667 29.1667 31.6667 20 35V5Z" fill="currentColor"/>
    </svg>
);

// --- Theme Context ---
const ThemeContext = createContext({
    theme: THEMES[0],
    setTheme: (theme: Theme) => {},
});

const ThemeProvider: React.FC<{ children: React.ReactNode, initialThemeKey: string }> = ({ children, initialThemeKey }) => {
    const [theme, setThemeState] = useState(() => THEMES.find(t => t.key === initialThemeKey) || THEMES[0]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };
    
    useEffect(() => {
        const root = document.documentElement;
        Object.entries(theme.properties).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        document.body.className = `${theme.font} text-text-primary transition-colors duration-500`;
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// --- Welcome Screen ---
const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <LogoIcon className="text-accent-primary h-16 w-16" />
            <h1 className="text-4xl font-bold mt-5 text-text-primary">Bem-vindo ao Oyasify</h1>
            <p className="text-lg text-text-secondary mt-3 max-w-md">Sua jornada para o domínio criativo começa aqui. Evolua, crie e monetize seu talento.</p>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { playSound('click'); onStart(); }}
                className="mt-8 px-8 py-3 bg-accent-primary text-white font-bold rounded-xl hover:bg-accent-secondary transition-colors text-base shadow-lg"
            >
                Começar
            </motion.button>
        </motion.div>
    </div>
);

// --- Authentication Screen ---
const Auth: React.FC<{ onLogin: (session: any) => void }> = ({ onLogin }) => {
    const [users, setUsers] = useLocalStorage<(AppUser & { password?: string })[]>('oyasify-users', []);
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    useEffect(() => {
        // Pre-populates users if the list is empty, ensuring search is always functional.
        if (users.length === 0) {
            const initialUsersWithPasswords = initialUsersForDiscovery.map(u => ({
                ...u,
                password: u.password || 'password' 
            }));
            const ownerUser = {
                id: 0,
                name: 'Oyasu',
                avatarUrl: `https://i.pravatar.cc/150?u=${OWNER_CREDENTIALS.email}`,
                email: OWNER_CREDENTIALS.email,
                password: OWNER_CREDENTIALS.password,
                bio: 'Criador do Oyasify.',
                role: 'owner' as const,
                theme: 'oceano',
                isSupporter: true,
            };
            setUsers([ownerUser, ...initialUsersWithPasswords]);
        }
    }, []);

    const handleLogin = () => {
        playSound('click');
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            const { password, ...userToSave } = foundUser;
            onLogin({ user: userToSave });
        } else {
            setError('E-mail ou senha inválidos.');
        }
    };

    const handleRegister = () => {
        playSound('click');
        if (!name || !email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }
        if (users.find(u => u.email === email)) {
            setError('Este e-mail já está em uso.');
            return;
        }
        const newUser: AppUser = {
            id: Date.now(),
            name,
            email,
            avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
            bio: 'Novo criador no Oyasify!',
            role: 'user',
            theme: 'oceano',
            isSupporter: false,
        };
        setUsers([...users, { ...newUser, password }]);
        onLogin({ user: newUser });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (isLoginView) {
            handleLogin();
        } else {
            handleRegister();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm bg-bg-secondary p-8 rounded-2xl shadow-lg"
            >
                <div className="flex justify-center mb-4">
                    <LogoIcon className="text-accent-primary h-10 w-10"/>
                </div>
                <h1 className="text-2xl font-bold text-center text-text-primary mb-1">Bem-vindo(a)!</h1>
                <p className="text-center text-text-secondary mb-6 text-sm">{isLoginView ? 'Faça login para continuar' : 'Crie sua conta'}</p>
                {error && <p className="text-center bg-danger/20 text-danger p-2 rounded-md mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit}>
                    {!isLoginView && (
                        <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 mb-3 bg-bg-tertiary rounded-lg focus:outline-none focus:ring-2 ring-accent-primary text-sm" />
                    )}
                    <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 mb-3 bg-bg-tertiary rounded-lg focus:outline-none focus:ring-2 ring-accent-primary text-sm" />
                    <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 mb-5 bg-bg-tertiary rounded-lg focus:outline-none focus:ring-2 ring-accent-primary text-sm" />
                    <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full p-3 bg-accent-primary text-white font-bold rounded-lg hover:bg-accent-secondary transition-colors text-sm">
                        {isLoginView ? 'Entrar' : 'Cadastrar'}
                    </motion.button>
                </form>
                <p className="text-center mt-5 text-text-secondary text-sm">
                    {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button onClick={() => { playSound('click'); setIsLoginView(!isLoginView); setError(''); }} className="font-bold text-accent-primary ml-1 hover:underline">
                        {isLoginView ? 'Cadastre-se' : 'Faça Login'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

// --- Core UI Components ---
const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className, onClick }) => (
    <div
        onClick={onClick ? () => { playSound('click'); onClick(); } : undefined}
        className={`bg-bg-secondary rounded-2xl shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
        {children}
    </div>
);

const Modal: React.FC<{ title: string, children: React.ReactNode, onClose: () => void }> = ({ title, children, onClose }) => (
    <motion.div
