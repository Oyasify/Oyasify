

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Screen, AppUser, Friend, Chat, AcademyLesson, Message, Theme, User 
} from '../types';
import { 
    THEMES, initialFriends, chats as initialChats, ACADEMY_LESSONS, initialUsersForDiscovery, OWNER_CREDENTIALS 
} from '../constants';
import { generateScript, chatWithOyasifyAI, generateImageWithOyasifyAI, generateLyrics } from '../services/geminiService';
import { 
    Home, Mic, User as UserIcon, GraduationCap, Send, Plus, Paperclip, LogOut,
    X, Bell, Palette, Download, Link as LinkIcon, Heart, Crown, Flower2, Rocket, Sparkles, Pencil, MessageSquare, Droplet, Flame, Gem, Leaf, MicOff, Play, Pause, Check, Users, Search, Phone, HelpCircle, ClipboardCopy, Music
} from 'lucide-react';

// --- Local Storage Hooks ---
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // Fix: The caught error is of type 'unknown'. Cast to 'any' to log it.
            // FIX: Using template literal for descriptive error logging to resolve linter error.
            // FIX: Improved error handling to check for Error instance.
            if (error instanceof Error) {
                console.error(`Error reading from localStorage for key "${key}": ${error.message}`);
            } else {
                console.error(`Error reading from localStorage for key "${key}": ${String(error)}`);
            }
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // Fix: The caught error is of type 'unknown'. Cast to 'any' to log it.
            // FIX: Using template literal for descriptive error logging to resolve linter error.
            // FIX: Improved error handling to check for Error instance.
            if (error instanceof Error) {
                console.error(`Error writing to localStorage for key "${key}": ${error.message}`);
            } else {
                console.error(`Error writing to localStorage for key "${key}": ${String(error)}`);
            }
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
            soundFile = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZ4KSYXgA837/3wMRgBwA9A4+BsDP/y//4wMQaAEMAwwDEYEyP/DAAFFQz/wAY709//5x//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//-AANCLAmp96AAAADAAAAABhAAQN+8AAAACgAAATEFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTAAAAAAEAAANIAAD/AAAQAAAAAEgAAAAAAAAAEhQAAQAAAAAAAAAEAAADgAABAAAAAAAAAAAAAAA';
            break;
        case 'click':
        case 'sent':
        case 'start_recording':
        case 'cancel_recording':
        default:
            soundFile = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZ4JFdpKgdHVkXY8gAR//LgAAAAAAAAAAAABQTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-AAVERpqgA9QAL/8AAB//4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
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
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 17.91C10.53 17.97 10.04 18 9.5 18C7.57 18 6 16.43 6 14.5C6 12.57 7.57 11 9.5 11C11.43 11 13 12.57 13 14.5V15.17C15.31 14.41 17.35 12.68 18.36 10.45L18.41 10.33C18.63 9.83 18.28 9.25 17.71 9.25H14V7.5C14 6.67 13.33 6 12.5 6C11.67 6 11 6.67 11 7.5V17.91Z" opacity="0.4"/>
        <path d="M12.5 6C13.33 6 14 6.67 14 7.5V9.25H17.71C18.28 9.25 18.63 9.83 18.41 10.33L18.36 10.45C17.35 12.68 15.31 14.41 13 15.17V14.5C13 12.57 11.43 11 9.5 11C7.57 11 6 12.57 6 14.5C6 16.43 7.57 18 9.5 18C10.04 18 10.53 17.97 11 17.91V7.5C11 6.67 11.67 6 12.5 6Z"/>
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
                theme: 'sintonia',
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
            theme: 'sintonia',
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={() => { playSound('click'); onClose(); }}
    >
        <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-bg-secondary rounded-2xl p-6 w-full max-w-md shadow-lg"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-text-primary">{title}</h2>
                <motion.button whileTap={{scale:0.9}} onClick={() => { playSound('click'); onClose(); }} className="p-1 rounded-full hover:bg-bg-tertiary"><X size={18} /></motion.button>
            </div>
            {children}
        </motion.div>
    </motion.div>
);

const ImageViewerModal: React.FC<{ imageUrl: string, onClose: () => void }> = ({ imageUrl, onClose }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `oyasify-ai-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative max-w-4xl max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <img src={imageUrl} alt="Generated content" className="object-contain w-full h-full rounded-lg" />
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
                    <motion.button whileTap={{scale:0.95}} onClick={handleDownload} className="p-2.5 bg-accent-primary text-white rounded-full shadow-lg">
                        <Download size={20} />
                    </motion.button>
                    <motion.button whileTap={{scale:0.95}} onClick={onClose} className="p-2.5 bg-danger text-white rounded-full shadow-lg">
                        <X size={20} />
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const AudioPlayer: React.FC<{ src: string; isMe: boolean }> = ({ src, isMe }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const setAudioData = () => setProgress((audio.currentTime / audio.duration) * 100);
        const setAudioTime = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', setAudioData);
        audio.addEventListener('ended', setAudioTime);
        return () => {
            audio.removeEventListener('timeupdate', setAudioData);
            audio.removeEventListener('ended', setAudioTime);
        };
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            isPlaying ? audioRef.current.pause() : audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="flex items-center gap-2 w-44">
            <audio ref={audioRef} src={src} preload="metadata"></audio>
            <button onClick={togglePlay} className={`p-2 rounded-full ${isMe ? 'bg-white/25' : 'bg-accent-primary/20'}`}>
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <div className={`w-full h-1 rounded-full ${isMe ? 'bg-white/30' : 'bg-gray-400/30'}`}>
                <div className={`h-1 rounded-full ${isMe ? 'bg-white' : 'bg-text-secondary'}`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

const ChatInput: React.FC<{ onSendMessage: (msg: Message) => void }> = ({ onSendMessage }) => {
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleSendText = () => {
        if (!text.trim()) return;
        playSound('sent');
        onSendMessage({ id: Date.now(), type: 'text', content: text, senderId: 'me', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        setText('');
    };

    const handleRecord = async () => {
        if (isRecording) {
            playSound('cancel_recording');
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                playSound('start_recording');
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    onSendMessage({ id: Date.now(), type: 'audio', mediaUrl: audioUrl, senderId: 'me', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
                    audioChunksRef.current = [];
                    stream.getTracks().forEach(track => track.stop());
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                // Fix: The caught error is of type 'unknown'. Cast to a string to log it.
// FIX: Changed multi-argument console.error to a single template literal for consistency.
                console.error(`Error starting recording: ${String(err)}`);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const mediaUrl = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
        if (type) {
            onSendMessage({
                id: Date.now(),
                type: type,
                mediaUrl,
                senderId: 'me',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }
    };


    return (
        <div className="flex-shrink-0 p-2 border-t border-bg-tertiary flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-full hover:bg-bg-tertiary text-text-secondary">
                <Paperclip size={22} />
            </motion.button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
            <input type="text" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendText()} placeholder="Digite uma mensagem..." className="flex-1 bg-bg-tertiary p-2.5 rounded-full outline-none px-4 text-sm"/>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleRecord} className={`p-2.5 rounded-full text-white transition-colors ${isRecording ? 'bg-danger' : 'bg-accent-primary'}`}>
                {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSendText} className="p-2.5 rounded-full bg-accent-primary text-white">
                <Send size={22} />
            </motion.button>
        </div>
    );
};

const ChatBubble: React.FC<{ message: Message; onImageClick?: (url: string) => void }> = ({ message, onImageClick }) => {
    const isMe = message.senderId === 'me';
    const isAI = message.senderId === 'ai';

    if (message.type === 'system') {
        return (
            <div className="text-center text-xs text-text-secondary py-2">
                {message.content}
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {isAI && <LogoIcon className="text-accent-primary h-6 w-6 flex-shrink-0 mb-1" />}
            <div className={`max-w-[80%] md:max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-accent-primary text-white rounded-br-lg' : 'bg-bg-tertiary rounded-bl-lg'}`}>
                 {message.imageAttachments && message.imageAttachments.length > 0 && (
                    <div className={`grid gap-1.5 ${message.imageAttachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {message.imageAttachments.map((url, index) => (
                            <img key={index} src={url} alt={`attachment ${index + 1}`} className="rounded-lg max-w-full h-auto" />
                        ))}
                    </div>
                 )}
                 {message.type === 'text' && message.content && <p className={`break-words ${message.imageAttachments && message.imageAttachments.length > 0 ? 'mt-2' : ''}`}>{message.content}</p>}
                 {message.type === 'image' && <img onClick={() => onImageClick && message.mediaUrl && onImageClick(message.mediaUrl)} src={message.mediaUrl} alt="media content" className={`rounded-lg max-w-full h-auto ${onImageClick ? 'cursor-pointer' : ''}`} />}
                 {message.type === 'video' && <video src={message.mediaUrl} controls className="rounded-lg max-w-full" />}
                 {message.type === 'audio' && message.mediaUrl && <AudioPlayer src={message.mediaUrl} isMe={isMe} />}
            </div>
        </motion.div>
    );
};

const AdminModal: React.FC<{ onClose: () => void, showNotification: (msg: string) => void }> = ({ onClose, showNotification }) => {
    const [view, setView] = useState('notifications');
    const [users, setUsers] = useLocalStorage<(AppUser & { password?: string })[]>('oyasify-users', []);
    const [requests, setRequests] = useLocalStorage<{ userId: number, userName: string }[]>('oyasify-supporter-requests', []);
    const [notificationMsg, setNotificationMsg] = useState('');
    const [, setGlobalNotification] = useLocalStorage('oyasify-global-notification', { message: null, seen: true });
    
    const handleSendNotification = () => {
        if (!notificationMsg.trim()) return;
        setGlobalNotification({ message: notificationMsg, seen: false });
        showNotification('Notificação global enviada!');
        setNotificationMsg('');
    };
    
    const toggleSupporter = (userId: number, shouldBeSupporter: boolean) => {
        setUsers(users.map(u => u.id === userId ? { ...u, isSupporter: shouldBeSupporter } : u));
    };

    const approveRequest = (userId: number) => {
        toggleSupporter(userId, true);
        setRequests(requests.filter(r => r.userId !== userId));
        showNotification('Apoiador aprovado!');
    };

    return (
        <Modal title="Painel de Administrador" onClose={onClose}>
            <div className="flex border-b border-bg-tertiary mb-4">
                <button onClick={() => setView('notifications')} className={`py-2 px-3 text-xs ${view === 'notifications' ? 'border-b-2 border-accent-primary text-accent-primary' : 'text-text-secondary'}`}>Notificações</button>
                <button onClick={() => setView('users')} className={`py-2 px-3 text-xs ${view === 'users' ? 'border-b-2 border-accent-primary text-accent-primary' : 'text-text-secondary'}`}>Usuários</button>
                <button onClick={() => setView('requests')} className={`py-2 px-3 text-xs ${view === 'requests' ? 'border-b-2 border-accent-primary text-accent-primary' : 'text-text-secondary'}`}>Pedidos</button>
            </div>
            {view === 'notifications' && (
                <div className="space-y-3">
                    <h3 className="font-bold text-xs">Enviar Notificação Global</h3>
                    <textarea value={notificationMsg} onChange={e => setNotificationMsg(e.target.value)} className="w-full p-2 bg-bg-tertiary rounded-md text-xs" placeholder="Sua mensagem aqui..."></textarea>
                    <motion.button whileTap={{scale: 0.95}} onClick={handleSendNotification} className="w-full p-2 bg-accent-primary rounded-md text-white font-semibold text-xs">Enviar</motion.button>
                </div>
            )}
            {view === 'users' && (
                <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                    {users.filter(u => u.role !== 'owner').map(u => (
                        <div key={u.id} className="flex justify-between items-center bg-bg-tertiary p-2 rounded-md">
                            <p>{u.name} {u.isSupporter && '⭐'}</p>
                            <motion.button whileTap={{scale: 0.95}} onClick={() => toggleSupporter(u.id, !u.isSupporter)} className="p-1 px-2 rounded-md text-xs bg-accent-primary text-white">{u.isSupporter ? 'Remover' : 'Tornar Apoiador'}</motion.button>
                        </div>
                    ))}
                </div>
            )}
            {view === 'requests' && (
                 <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                     {requests.length > 0 ? requests.map(r => (
                         <div key={r.userId} className="flex justify-between items-center bg-bg-tertiary p-2 rounded-md">
                             <p>{r.userName}</p>
                             <motion.button whileTap={{scale: 0.95}} onClick={() => approveRequest(r.userId)} className="p-1 px-2 rounded-md text-xs bg-accent-primary text-white">Aprovar</motion.button>
                         </div>
                     )) : <p className="text-text-secondary text-center text-xs">Nenhum pedido pendente.</p>}
                 </div>
            )}
        </Modal>
    );
};

const HomeScreen: React.FC<{ user: AppUser, setScreen: (s: Screen) => void }> = ({ user, setScreen }) => (
    <div className="flex flex-col items-center justify-center text-center h-full pt-8">
        <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
            className="text-3xl font-bold text-text-primary">Bem-vindo, {user.name}!</motion.h1>
        <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
            className="text-text-secondary mt-1 mb-6 text-base">Pronto para evoluir?</motion.p>
        
        <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
            className="w-full max-w-md"
        >
            <Card className="text-left p-6">
                <div className="flex items-center mb-3">
                    <h2 className="text-xl font-bold text-text-primary">🎙️ Seja um Artista</h2>
                </div>
                <p className="text-text-secondary mb-5 text-sm">
                    Aprenda técnicas essenciais e descubra estratégias para construir sua carreira musical no universo geek.
                </p>
                <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    whileHover={{ y: -2 }}
                    className="w-full p-2.5 bg-accent-primary text-white font-bold rounded-xl hover:bg-accent-secondary transition-colors flex items-center justify-center text-sm"
                    onClick={(e) => { e.stopPropagation(); playSound('click'); setScreen('seja-um-artista'); }}
                >
                    🎧 Artista
                </motion.button>
            </Card>
        </motion.div>
    </div>
);

const CursoDeCantoScreen: React.FC = () => (
     <motion.div 
        className="space-y-4 max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
            <Card className="!p-5">
                <h2 className="text-lg font-bold text-text-primary">Aquecimento Vocal</h2>
                <p className="text-text-secondary mt-1 text-xs">Prepare sua voz com técnicas guiadas e sons de referência.</p>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card className="!p-5">
                <h2 className="text-lg font-bold text-text-primary">Técnica e Controle</h2>
                <p className="text-text-secondary mt-1 text-xs">Trabalhe afinação, timbre e respiração com suporte visual inteligente.</p>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card className="!p-5">
                <h2 className="text-lg font-bold mb-2 text-text-primary">Curso Gratuito — com Henrique Mendonça</h2>
                <div className="bg-yellow-100/50 border border-yellow-400 text-yellow-800 p-2 rounded-lg mb-3 flex items-start gap-2 text-xs" role="alert">
                    <span className="text-yellow-600 mt-0.5">⚠️</span>
                    <p>Este curso é uma versão antiga e contém pouco conteúdo, mas é excelente para iniciantes.</p>
                </div>
                <p className="text-text-secondary mb-3 leading-relaxed text-xs">
                    As aulas desta seção são ministradas por <strong>Henrique Mendonça</strong>, criador do canal <strong>Academia Vocal</strong>. Um dos maiores nomes do canto popular no Brasil, conhecido por seu método claro e eficaz.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <motion.button 
                        whileTap={{scale: 0.95}} whileHover={{y: -2}}
                        onClick={() => { playSound('click'); window.open('https://drive.google.com/drive/folders/1hKLt-IrWeAM_lNHe_puwVE84MuObq3An', '_blank'); }}
                        className="flex-1 p-2 bg-bg-tertiary text-text-secondary font-bold rounded-md hover:bg-accent-primary/10 transition-colors flex items-center justify-center gap-2 text-xs"
                    >
                        <GraduationCap size={16} /> Ver Curso Gratuito
                    </motion.button>
                    <motion.button 
                        whileTap={{scale: 0.95}} whileHover={{y: -2}}
                        onClick={() => { playSound('click'); window.open('https://www.academiavocal.com.br/academia-vocal-by-henrique-mendonca', '_blank'); }}
                        className="flex-1 p-2 bg-yellow-400 text-yellow-900 font-bold rounded-md hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 text-xs"
                    >
                        <Heart size={16} /> Apoiar o Criador
                    </motion.button>
                </div>
            </Card>
        </motion.div>
    </motion.div>
);

const SejaUmArtistaScreen: React.FC = () => (
    <motion.div 
        className="space-y-3 max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
        <h1 className="text-xl font-bold text-center text-text-primary">Seja um Artista</h1>
        
        <motion.div variants={itemVariants}>
            <Card className="!p-5">
                <h2 className="text-base font-bold text-text-primary mb-2">A Importância do Canto</h2>
                <p className="text-text-secondary text-xs leading-relaxed">
                    Cantar é mais do que apenas produzir sons agradáveis; é uma forma de expressão universal que conecta emoções e histórias. Para um artista, dominar o canto é a chave para transmitir sua mensagem de forma autêntica e impactante, criando uma conexão profunda com o público.
                </p>
            </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
            <Card className="!p-5">
                <h2 className="text-base font-bold text-text-primary mb-2">Técnicas Essenciais</h2>
                <ul className="text-text-secondary text-xs list-disc list-inside space-y-2">
                    <li><strong>Respiração Diafragmática:</strong> A base de um canto poderoso e controlado. Pratique respirar fundo, expandindo a barriga, para sustentar notas longas e manter a afinação.</li>
                    <li><strong>Apoio Vocal:</strong> Use os músculos do abdômen e das costas para apoiar sua voz, evitando forçar a garganta. Isso resulta em um som mais rico e previne lesões.</li>
                    <li><strong>Ressonância:</strong> Explore os espaços de ressonância do seu corpo (peito, boca, nariz e cabeça) para amplificar seu som naturalmente e adicionar timbre e cor à sua voz.</li>
                    <li><strong>Articulação:</strong> Cante com clareza, articulando bem as palavras. Isso garante que sua mensagem seja entendida e adiciona profissionalismo à sua performance.</li>
                </ul>
            </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
            <Card className="!p-5">
                <h2 className="text-base font-bold text-text-primary mb-2">Como Crescer seu Canal de Música Geek/Rap</h2>
                <p className="text-text-secondary text-xs leading-relaxed">
                    Criar um canal de sucesso no nicho geek vai além do talento musical. Conecte-se com sua comunidade, entenda as referências e crie conteúdo que ressoe com a paixão dos fãs. Faça covers de animes, crie raps sobre personagens de jogos, e participe de trends. A consistência, a qualidade de áudio/vídeo e a interação genuína nos comentários são seus maiores aliados para construir uma base de fãs leal e engajada.
                </p>
            </Card>
        </motion.div>
    </motion.div>
);

const CrieSuaLetraScreen: React.FC = () => {
    const [idea, setIdea] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [lyrics, setLyrics] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const styles = ["Rap de anime", "Melódica", "Funk", "Phonk", "Hip Hop", "Samba", "Pagode", "Brazilian Phonk", "Trap", "Acústico", "Remix", "Rap Geek em geral"];

    const handleGenerate = useCallback(async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        setLyrics(null);
        try {
            const result = await generateLyrics(idea, selectedStyle || undefined);
            setLyrics(result);
        } catch (error) {
            // FIX: Added more descriptive error logging.
            console.error(`Error generating lyrics: ${String(error)}`);
            setLyrics("<h2>Erro</h2><p>Algo deu errado. Por favor, tente novamente.</p>");
        }
        setIsLoading(false);
    }, [idea, selectedStyle]);

    const toggleStyle = (style: string) => {
        setSelectedStyle(prev => prev === style ? null : style);
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-1 text-text-primary flex items-center gap-2"><Pencil className="text-accent-primary" />Crie sua Letra</h1>
            <p className="text-text-secondary mb-6 text-center max-w-lg text-sm">
                Receba ideias de letras profissionais. A IA gerará uma base de alta qualidade para sua próxima música, independente do estilo.
            </p>
            
            <Card className="w-full p-6">
                <label className="font-semibold text-text-primary mb-2 block text-sm">Sua ideia para a música</label>
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Ex: Uma música sobre a jornada de um herói que perdeu tudo."
                    className="w-full h-28 p-3 bg-bg-tertiary rounded-lg focus:outline-none focus:ring-2 ring-accent-primary resize-none text-text-primary text-sm"
                />

                <label className="font-semibold text-text-primary mt-4 mb-2 block text-sm">Estilo (opcional)</label>
                 <div className="flex flex-wrap gap-2">
                    {styles.map(style => (
                        <motion.button
                            key={style}
                            onClick={() => toggleStyle(style)}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedStyle === style ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-secondary'}`}
                        >
                            {style}
                        </motion.button>
                    ))}
                </div>

                <motion.button
                    onClick={() => { playSound('click'); handleGenerate(); }}
                    disabled={isLoading || !idea.trim()}
                    whileTap={{ scale: 0.98 }} whileHover={{y: -2}}
                    className="mt-5 w-full bg-accent-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-accent-secondary disabled:bg-bg-tertiary disabled:text-text-secondary disabled:cursor-not-allowed transition-colors text-sm"
                >
                    {isLoading ? 'Gerando...' : 'Gerar'}
                </motion.button>
            </Card>

            {isLoading && (
                <div className="flex justify-center items-center mt-6 space-x-1.5">
                    <motion.span className="w-2 h-2 bg-accent-primary rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.span className="w-2 h-2 bg-accent-primary rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.5, delay: 0.1, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.span className="w-2 h-2 bg-accent-primary rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.5, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }} />
                </div>
            )}

            {lyrics && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-bg-secondary p-6 rounded-xl w-full"
                >
                    <div className="prose max-w-none text-text-primary text-xs" dangerouslySetInnerHTML={{ __html: lyrics }} />
                </motion.div>
            )}
        </div>
    );
};


const BecomeSupporterForScriptScreen: React.FC<{ setScreen: (s: Screen) => void }> = ({ setScreen }) => (
    <div className="max-w-md mx-auto flex flex-col items-center text-center">
        <h1 className="text-xl font-bold mb-1 text-text-primary flex items-center gap-2"><Crown className="text-yellow-500" /> Acesso Exclusivo</h1>
        <p className="text-text-secondary mb-4 text-xs">A funcionalidade Roteiro AI está disponível apenas para apoiadores.</p>
        <Card className="w-full p-6 space-y-4">
            <p className="text-text-secondary">Torne-se um apoiador para desbloquear esta e outras vantagens exclusivas e ajude a manter o projeto!</p>
            <motion.button
                onClick={() => setScreen('apoio')}
                whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }}
                className="w-full bg-accent-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-accent-secondary transition-colors text-sm flex items-center justify-center gap-2"
            >
                <Heart size={20} /> Ver Vantagens de Apoiador
            </motion.button>
        </Card>
    </div>
);


const AiScriptScreen: React.FC<{ user: AppUser; setScreen: (s: Screen) => void }> = ({ user, setScreen }) => {
    const [idea, setIdea] = useState('');
    const [script, setScript] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerate = useCallback(async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        setScript(null);
        try {
            const result = await generateScript(idea);
            setScript(result);
        } catch (error) {
            // Fix: The caught error is of type 'unknown'. Cast to a string to log it.
            // FIX: Replaced with a template literal for more descriptive error logging.
            console.error(`Error generating script: ${String(error)}`);
            setScript("<h2>Erro</h2><p>Algo deu errado. Por favor, verifique o console para mais detalhes.</p>");
        }
        setIsLoading(false);
    }, [idea]);

    if (!user.isSupporter) {
        return <BecomeSupporterForScriptScreen setScreen={setScreen} />;
    }

    return (
        <div className="max-w-2xl mx-auto flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-1 text-text-primary flex items-center gap-2"><Sparkles className="text-accent-primary" />Roteiro AI</h1>
            <p className="text-text-secondary mb-6 text-center max-w-lg text-sm">Gere roteiros criativos para seus vídeos, seja para YouTube, TikTok ou outra plataforma.</p>
            
            <Card className="w-full p-6">
                <label className="font-semibold text-text-primary mb-2 block text-sm">Sua Ideia para o Roteiro</label>
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Ex: um roteiro para um vídeo no TikTok sobre 3 dicas para viajar barato."
                    className="w-full h-32 p-3 bg-bg-tertiary rounded-lg focus:outline-none focus:ring-2 ring-accent-primary resize-none text-text-primary text-sm"
                />
                <motion.button
                    onClick={() => { playSound('click'); handleGenerate(); }}
                    disabled={isLoading || !idea.trim()}
                    whileTap={{ scale: 0.98 }} whileHover={{y: -2}}
                    className="mt-4 w-full bg-accent-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-accent-secondary disabled:bg-bg-tertiary disabled:text-text-secondary disabled:cursor-not-allowed transition-colors text-sm"
                >
                    {isLoading ? 'Gerando...' : 'Gerar Roteiro'}
                </motion.button>
            </Card>

            {isLoading && (
                <div className="flex justify-center items-center mt-6 space-x-1.5">
                    <motion.span className="w-2 h-2 bg-accent-primary rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.span className="w-2 h-2 bg-accent-primary rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.5, delay: 0.1, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.span className="w-2 h-2 bg-accent-primary rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.5, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }} />
                </div>
            )}

            {script && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-bg-secondary p-6 rounded-xl w-full"
                >
                    <h2 className="text-lg font-bold mb-3">Seu Roteiro:</h2>
                    <div className="prose max-w-none text-text-primary text-xs" dangerouslySetInnerHTML={{ __html: script }} />
                </motion.div>
            )}
        </div>
    );
};

const AcademyScreen = () => {
    const resources = [
        { name: 'Plugins FL Studio (Grátis)', href: 'https://g-meh.com/', icon: LinkIcon },
        { name: 'FL Studio', href: 'https://filecr.com/windows/flstudio-21/', icon: Download },
        { name: 'Pack de Edição iGust', href: 'https://www.mediafire.com/file/w3dn7inlm82dic2/PACK_DE_EDI%25C3%2587%25C3%2582O_iGust.rar/file', icon: Download },
        { name: 'Adobe Premiere', href: 'https://filecr.com/windows/adobe-premiere-pro-0064/?id=018331600100', icon: Download },
    ];
    return (
        <motion.div 
            className="space-y-6 max-w-2xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <h1 className="text-2xl font-bold text-center text-text-primary">Creator Academy</h1>
            
            <motion.div variants={itemVariants}>
                <h2 className="text-xl font-bold mb-4">Recursos Essenciais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map((res) => (
                         <motion.div
                            key={res.name}
                            variants={itemVariants}
                            whileHover={{ y: -4, scale: 1.02 }}
                        >
                            <Card onClick={() => window.open(res.href, '_blank')} className="!p-5">
                                <div className="flex items-center">
                                    <res.icon size={22} className="text-accent-primary mr-3" />
                                    <h3 className="font-bold text-sm">{res.name}</h3>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <h2 className="text-xl font-bold mb-4">Nossos Cursos</h2>
                <motion.div 
                    className="space-y-3"
                    variants={containerVariants}
                >
                    {ACADEMY_LESSONS.map((lesson) => (
                        <motion.div
                             key={lesson.id}
                             variants={itemVariants}
                             whileHover={{ x: 4 }}
                        >
                             <Card className="!p-3 flex items-center space-x-4">
                                 <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-24 h-16 object-cover rounded-lg" />
                                 <div className="flex-1">
                                     <h3 className="font-bold text-sm">{lesson.title}</h3>
                                     <p className="text-xs text-text-secondary">{lesson.duration}</p>
                                 </div>
                             </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

const ApoioScreen: React.FC<{ user: AppUser, showNotification: (msg: string) => void }> = ({ user, showNotification }) => {
    const [requests, setRequests] = useLocalStorage<{ userId: number, userName: string }[]>('oyasify-supporter-requests', []);
    const hasRequested = requests.some(r => r.userId === user.id);

    const handleRequestSupporter = () => {
        if (hasRequested) {
            showNotification('Você já enviou um pedido.');
            return;
        }
        setRequests([...requests, { userId: user.id, userName: user.name }]);
        showNotification('Pedido enviado! Aguarde a aprovação do admin.');
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold mb-2 text-text-primary flex items-center gap-2"><Heart className="text-accent-primary" />Apoie o Oyasify</h1>
            <p className="text-text-secondary mb-6 text-sm">Seu apoio é fundamental para a evolução contínua do projeto!</p>
            
            <Card className="w-full p-6">
                {user.isSupporter ? (
                    <div className="text-center">
                        <Crown size={48} className="mx-auto text-yellow-500 mb-3" />
                        <h2 className="text-lg font-bold">Obrigado por ser um Apoiador!</h2>
                        <p className="text-text-secondary mt-1">Você tem acesso ao tema exclusivo e a futuros benefícios!</p>
                    </div>
                ) : (
                    <>
                        <p className="text-text-secondary mb-4">Clique no botão abaixo para contribuir com o projeto através da plataforma Kiwify.</p>
                        <motion.button 
                            whileTap={{ scale: 0.95 }} whileHover={{y: -2}}
                            onClick={() => window.open('https://pay.kiwify.com.br/BAp0lC8', '_blank')}
                            className="w-full bg-accent-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-accent-secondary transition-colors text-sm"
                        >
                            Apoie aqui
                        </motion.button>
                        <div className="my-4 text-center text-text-secondary text-sm">ou</div>
                        <motion.button 
                            whileTap={{ scale: 0.95 }} whileHover={{y: -2}}
                            onClick={handleRequestSupporter}
                            disabled={hasRequested}
                            className="w-full bg-bg-tertiary text-text-primary font-bold py-2.5 px-4 rounded-xl hover:bg-accent-primary/20 disabled:bg-bg-tertiary disabled:text-text-secondary disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            {hasRequested ? 'Pedido Enviado' : 'Já apoiei! Liberar cargo'}
                        </motion.button>
                        <p className="text-xs text-text-secondary mt-3">Após apoiar, clique no botão acima para solicitar seu cargo de Apoiador.</p>
                    </>
                )}
            </Card>
        </div>
    );
};

const SupportScreen: React.FC = () => (
    <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold mb-2 text-text-primary flex items-center gap-2"><HelpCircle className="text-accent-primary" />Suporte</h1>
        <p className="text-text-secondary mb-6 text-sm">Precisa de ajuda ou tem alguma dúvida? Fale conosco!</p>
        <Card className="w-full p-6">
            <motion.button
                whileTap={{ scale: 0.95 }} whileHover={{ y: -2 }}
                onClick={() => window.open('https://w.app/oyasuai', '_blank')}
                className="w-full bg-green-500 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                Fale Conosco no WhatsApp
            </motion.button>
        </Card>
    </div>
);


const AIChatInput: React.FC<{ onSendMessage: (text: string) => void; isLoading: boolean; onAddImages: (files: FileList | null) => void; }> = ({ onSendMessage, isLoading, onAddImages }) => {
    const [text, setText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (!text.trim() || isLoading) return;
        onSendMessage(text);
        setText('');
    };

    return (
        <div className="flex-shrink-0 p-2 border-t border-bg-tertiary flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-full hover:bg-bg-tertiary text-text-secondary">
                <Paperclip size={22} />
            </motion.button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => {
                    onAddImages(e.target.files);
                    if(e.target) e.target.value = ''; // Reset file input to allow selecting the same file again
                }} 
                className="hidden" 
                accept="image/*" 
                multiple 
            />
            <input 
                type="text" 
                value={text} 
                onChange={e => setText(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSend()} 
                placeholder="Pergunte ou use /gerar <prompt>" 
                className="flex-1 bg-bg-tertiary p-2.5 rounded-full outline-none px-4 text-sm"
                disabled={isLoading}
            />
            <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={handleSend} 
                className="p-2.5 rounded-full bg-accent-primary text-white disabled:bg-bg-tertiary"
                disabled={isLoading || !text.trim()}
            >
                <Send size={22} />
            </motion.button>
        </div>
    );
};

const OyasifyAIScreen: React.FC<{onImageClick: (url: string) => void}> = ({onImageClick}) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 0, type: 'text', senderId: 'ai', content: 'Olá! Eu sou o Oyasify AI. Posso te ajudar com ideias, responder perguntas e até gerar imagens! Use /gerar <sua ideia>.', timestamp: '' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingImages, setPendingImages] = useState<{data: string; mimeType: string; name: string}[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleImageSelection = (files: FileList | null) => {
        if (!files) return;
        const fileArray = Array.from(files);
        
        fileArray.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = (e.target?.result as string)?.split(',')[1];
                if (base64Data) {
                    setPendingImages(prev => [...prev, {
                        data: base64Data,
                        mimeType: file.type,
                        name: file.name,
                    }]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSendMessage = async (text: string) => {
        const userMessage: Message = {
            id: Date.now(),
            type: 'text',
            content: text,
            imageAttachments: pendingImages.map(p => `data:${p.mimeType};base64,${p.data}`),
            senderId: 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMessage]);
        
        const imagesToSend = [...pendingImages];
        setPendingImages([]); // Clear previews immediately
        setIsLoading(true);

        // Check for image generation command
        const imagePrompt = text.toLowerCase().startsWith('/gerar ') ? text.substring(7) : text.toLowerCase().startsWith('/imagine ') ? text.substring(9) : null;
        
        if (imagePrompt) {
            const imageData = await generateImageWithOyasifyAI(imagePrompt);
            const aiMessage: Message = {
                id: Date.now() + 1,
                senderId: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                ...(imageData 
                    ? { type: 'image', mediaUrl: `data:image/png;base64,${imageData}` }
                    : { type: 'text', content: 'Desculpe, não consegui gerar a imagem. Tente novamente.' }
                )
            };
            setMessages(prev => [...prev, aiMessage]);
        } else {
            const aiResponse = await chatWithOyasifyAI(text, imagesToSend);
            const aiMessage: Message = {
                id: Date.now() + 1,
                type: 'text',
                content: aiResponse,
                senderId: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMessage]);
        }
        
        setIsLoading(false);
    };

    return (
        <div className="h-full flex flex-col max-w-2xl mx-auto">
            <h1 className="text-xl font-bold text-center text-text-primary mb-3 flex-shrink-0">Oyasify AI</h1>
            <div className="flex-1 flex flex-col bg-bg-secondary rounded-2xl shadow-md overflow-hidden">
                <div className="flex-1 p-3 overflow-y-auto space-y-3 overscroll-contain">
                    {messages.map(msg => <ChatBubble key={msg.id} message={msg} onImageClick={onImageClick} />)}
                    {isLoading && (
                        <motion.div className="flex items-end gap-2 justify-start">
                             <LogoIcon className="text-accent-primary h-6 w-6 flex-shrink-0 mb-1" />
                            <div className="p-3 rounded-2xl bg-bg-tertiary rounded-bl-lg flex space-x-1.5">
                                 <motion.span className="w-2 h-2 bg-accent-primary rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }} />
                                 <motion.span className="w-2 h-2 bg-accent-primary rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.5, delay: 0.1, repeat: Infinity, ease: 'easeInOut' }} />
                                 <motion.span className="w-2 h-2 bg-accent-primary rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.5, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {pendingImages.length > 0 && (
                    <div className="p-2 border-t border-bg-tertiary bg-bg-secondary/50">
                        <div className="flex flex-wrap gap-2">
                        {pendingImages.map((img, index) => (
                            <div key={`${img.name}-${index}`} className="relative">
                                <img src={`data:${img.mimeType};base64,${img.data}`} alt={img.name} className="h-16 w-16 object-cover rounded-md" />
                                <motion.button whileTap={{scale: 0.9}} onClick={() => setPendingImages(p => p.filter((_, i) => i !== index))} className="absolute -top-1 -right-1 bg-danger text-white rounded-full p-0.5 shadow-md">
                                    <X size={12} />
                                </motion.button>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
                <AIChatInput onSendMessage={handleSendMessage} isLoading={isLoading} onAddImages={handleImageSelection} />
            </div>
        </div>
    );
};

const AudioCallModal: React.FC<{
    friend: Friend;
    onClose: () => void;
}> = ({ friend, onClose }) => {
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);

    const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedAudioInput, setSelectedAudioInput] = useState('');
    const [selectedAudioOutput, setSelectedAudioOutput] = useState('');
    const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended

    // Setup devices
    useEffect(() => {
        const setupDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioIn = devices.filter(d => d.kind === 'audioinput');
                const audioOut = devices.filter(d => d.kind === 'audiooutput');
                setAudioInputDevices(audioIn);
                setAudioOutputDevices(audioOut);
                if (audioIn.length > 0) setSelectedAudioInput(audioIn[0].deviceId);
                if (audioOut.length > 0) setSelectedAudioOutput(audioOut[0].deviceId);
// Fix: The caught error `e` is of type `unknown`. Cast to a string to allow logging with console.error, ensuring consistency with other error handlers in the file.
// FIX: Changed multi-argument console.error to a single template literal for consistency.
            } catch (e) {
                // FIX: Improved error handling to check for Error instance.
                if (e instanceof Error) {
                    console.error(`Error enumerating devices: ${e.message}`);
                } else {
                    console.error(`An unknown error occurred while enumerating devices: ${String(e)}`);
                }
            }
        };
        setupDevices();
    }, []);
    
    // Get microphone stream
    useEffect(() => {
        const getMedia = async () => {
            if (!selectedAudioInput) return;
            try {
                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach(track => track.stop());
                }
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: { exact: selectedAudioInput } },
                });
                localStreamRef.current = stream;
            } catch (e) { 
// FIX: Changed multi-argument console.error to a single template literal for consistency.
                // FIX: Improved error handling to check for Error instance.
                if (e instanceof Error) {
                    console.error(`Error getting user media: ${e.message}`);
                } else {
                    console.error(`An unknown error occurred while getting user media: ${String(e)}`);
                }
            }
        };
        getMedia();
    }, [selectedAudioInput]);

    // Set speaker output
    useEffect(() => {
        const setSink = async () => {
            if (remoteAudioRef.current && selectedAudioOutput && 'setSinkId' in remoteAudioRef.current) {
                try {
                    await (remoteAudioRef.current as any).setSinkId(selectedAudioOutput);
// Fix: The caught error `e` is of type `unknown`. Cast to a string to allow logging with console.error, ensuring consistency with other error handlers in the file.
// FIX: Changed multi-argument console.error to a single template literal for consistency.
                } catch (e) {
                    // FIX: Improved error handling to check for Error instance.
                    if (e instanceof Error) {
                        console.error(`Error setting sink ID: ${e.message}`);
                    } else {
                        console.error(`An unknown error occurred while setting sink ID: ${String(e)}`);
                    }
                }
            }
        };
        setSink();
    }, [selectedAudioOutput]);


    const setupPeerConnection = () => {
        const pc = new RTCPeerConnection();
        peerConnectionRef.current = pc;

        pc.onicecandidate = event => {
            if (event.candidate) {
                // In a real app, this candidate is sent to the other peer via signaling server
                console.log("[SIGNALLING] Send this candidate to peer:", event.candidate);
            }
        };

        pc.ontrack = event => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        localStreamRef.current?.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current!);
        });

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'connected') setCallStatus('connected');
            if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) hangup();
        };
        return pc;
    }

    const callFriend = async () => {
        if (!localStreamRef.current) return alert("Microfone não disponível.");
        setCallStatus('calling');
        const pc = setupPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        // --- SIMULATED SIGNALING ---
        console.log(`[SIGNALLING] Send this offer to friend ${friend.id}:`, offer);
        const answerString = prompt("Chamada iniciada! Envie a 'offer' (no console) para seu amigo. Cole a 'answer' dele aqui:");
        if (answerString) {
            const answer = JSON.parse(answerString);
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };

    const answerCall = async () => {
        // --- SIMULATED SIGNALING ---
        const offerString = prompt("Para atender, cole a 'offer' do seu amigo aqui:");
        if (!offerString || !localStreamRef.current) return;

        setCallStatus('calling');
        const pc = setupPeerConnection();
        const offer = JSON.parse(offerString);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log("[SIGNALLING] Send this answer to the caller:", answer);
        alert("Resposta criada e logada no console. Envie para o seu amigo.");
    };

    const hangup = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        setCallStatus('ended');
        setTimeout(onClose, 1000);
    };

    return (
        <Modal title={`Chamada com ${friend.name}`} onClose={onClose}>
            <div className="flex flex-col items-center justify-center p-4">
                <audio ref={remoteAudioRef} autoPlay />
                <img src={friend.avatarUrl} alt={friend.name} className="w-24 h-24 rounded-full mb-4" />
                <p className="font-bold text-base">{friend.name}</p>
                <p className="text-text-secondary capitalize text-xs">{callStatus === 'idle' ? 'Pronto para chamar' : callStatus}</p>
            </div>
            
            <div className="space-y-2 text-xs">
                <div>
                    <label className="block text-text-secondary mb-1">Microfone:</label>
                    <select value={selectedAudioInput} onChange={e => setSelectedAudioInput(e.target.value)} className="w-full p-2 bg-bg-tertiary rounded-md focus:outline-none ring-accent-primary focus:ring-2">
                        {audioInputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Microfone ${d.deviceId.substring(0,6)}`}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-text-secondary mb-1">Alto-falante/Fone:</label>
                    <select value={selectedAudioOutput} onChange={e => setSelectedAudioOutput(e.target.value)} className="w-full p-2 bg-bg-tertiary rounded-md focus:outline-none ring-accent-primary focus:ring-2">
                        {audioOutputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Saída ${d.deviceId.substring(0,6)}`}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-4 flex gap-3">
                <motion.button whileTap={{scale:0.95}} onClick={callFriend} disabled={callStatus !== 'idle'} className="flex-1 p-2.5 bg-green-500 text-white rounded-lg font-semibold disabled:bg-gray-400 text-sm">Ligar</motion.button>
                <motion.button whileTap={{scale:0.95}} onClick={answerCall} disabled={callStatus !== 'idle'} className="flex-1 p-2.5 bg-blue-500 text-white rounded-lg font-semibold disabled:bg-gray-400 text-sm">Atender</motion.button>
                <motion.button whileTap={{scale:0.95}} onClick={hangup} disabled={callStatus === 'idle' || callStatus === 'ended'} className="flex-1 p-2.5 bg-danger text-white rounded-lg font-semibold disabled:bg-gray-400 text-sm">Desligar</motion.button>
            </div>
             <p className="text-xs text-text-secondary text-center mt-2">Esta é uma demonstração. A sinalização é simulada via prompts.</p>
        </Modal>
    );
};


const ChatView: React.FC<{ friend: Friend, chat: Chat, onBack: () => void, onUpdateChat: (chat: Chat) => void, onStartAudioCall: (friend: Friend) => void, onImageClick: (url: string) => void }> = ({ friend, chat, onBack, onUpdateChat, onStartAudioCall, onImageClick }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat.messages]);
    
    const handleSendMessage = async (newMessage: Message) => {
        // Optimistically add user message
        const updatedChatWithUserMsg = { ...chat, messages: [...chat.messages, newMessage] };
        onUpdateChat(updatedChatWithUserMsg);
    
        const content = newMessage.content?.toLowerCase() || '';
        let currentChatState = { ...updatedChatWithUserMsg };
    
        const triggerAI = content.includes('@oyasifyai');
        const stopAI = content === '/parar';
    
        if (stopAI && chat.isAiActive) {
            const systemMessage: Message = { id: Date.now() + 1, type: 'system', content: 'Oyasify AI saiu do chat.', senderId: 'ai', timestamp: '' };
            currentChatState = { ...currentChatState, isAiActive: false, messages: [...currentChatState.messages, systemMessage] };
            onUpdateChat(currentChatState);
            return;
        }
    
        let shouldQueryAI = (chat.isAiActive && !stopAI) || triggerAI;
    
        if (shouldQueryAI) {
            if(triggerAI && !chat.isAiActive) {
                const systemMessage: Message = { id: Date.now() + 1, type: 'system', content: 'Oyasify AI entrou do chat.', senderId: 'ai', timestamp: '' };
                currentChatState = { ...currentChatState, messages: [...currentChatState.messages, systemMessage] };
            }

            const messageForAI = newMessage.content?.replace(/@oyasifyai/gi, '').trim() || '';
            const aiResponseText = await chatWithOyasifyAI(messageForAI, []);
            const aiMessage: Message = {
                id: Date.now() + 2,
                type: 'text',
                content: aiResponseText,
                senderId: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            currentChatState = { ...currentChatState, isAiActive: true, messages: [...currentChatState.messages, aiMessage] };
            onUpdateChat(currentChatState);
        }
    };

    return (
        <div className="h-full flex flex-col bg-bg-secondary rounded-2xl shadow-md">
            <header className="flex-shrink-0 flex items-center p-2.5 border-b border-bg-tertiary">
                <motion.button whileTap={{scale:0.9}} onClick={() => { playSound('click'); onBack(); }} className="mr-2 p-2 rounded-full hover:bg-bg-tertiary text-text-secondary">&larr;</motion.button>
                <img src={friend.avatarUrl} className="w-9 h-9 rounded-full" />
                <div className="ml-3 flex-1">
                    <h2 className="font-bold text-sm leading-tight">{friend.name}</h2>
                    {chat.isAiActive && <p className="text-xs text-accent-primary font-semibold leading-tight flex items-center gap-1"><Sparkles size={12}/> AI Ativa</p>}
                </div>
                <motion.button whileTap={{scale:0.9}} onClick={() => { playSound('click'); onStartAudioCall(friend); }} className="p-2 rounded-full hover:bg-bg-tertiary text-text-secondary">
                    <Phone size={20} />
                </motion.button>
            </header>
            <div className="flex-1 p-3 overflow-y-auto space-y-3 overscroll-contain">
                {chat.messages.map(msg => <ChatBubble key={msg.id} message={msg} onImageClick={onImageClick} />)}
                <div ref={messagesEndRef} />
            </div>
             <ChatInput onSendMessage={handleSendMessage} />
        </div>
    );
};

const ProfileView: React.FC<{ user: AppUser, setUser: (user: AppUser) => void, showNotification: (msg: string) => void }> = ({ user, setUser, showNotification }) => {
    const { theme, setTheme } = useContext(ThemeContext);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio);
    const [isAdminModalOpen, setAdminModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSaveName = () => {
        setUser({ ...user, name });
        setIsEditingName(false);
        showNotification('Nome salvo!');
    };
    
    const handleSaveBio = () => {
        setUser({ ...user, bio });
        setIsEditingBio(false);
        showNotification('Biografia salva!');
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const avatarUrl = URL.createObjectURL(e.target.files[0]);
            setUser({ ...user, avatarUrl });
        }
    };
    
    const handleThemeChange = (themeKey: string) => {
        const newTheme = THEMES.find(t => t.key === themeKey);
        if (newTheme) {
            setTheme(newTheme);
            setUser({ ...user, theme: themeKey });
        }
    };
    
    const THEME_ICONS: {[key: string]: React.FC<any>} = {
        sintonia: Music,
        vinil: Palette,
        neon: Rocket,
        acustico: Leaf,
        rosa: Flower2,
        oceano: Droplet,
        solar: Flame,
        ametista: Gem,
        rubi: Heart,
        floresta: Leaf,
        apoiador: Crown,
    }

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {isAdminModalOpen && <AdminModal onClose={() => setAdminModalOpen(false)} showNotification={showNotification} />}
            </AnimatePresence>
            
            <Card className="!p-5">
                 <div className="flex flex-col items-center text-center">
                    <div className="relative">
                        <img src={user.avatarUrl} alt={name} className="w-20 h-20 rounded-full object-cover" />
                        <motion.button whileTap={{scale: 0.9}} onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-accent-primary p-1 rounded-full border-2 border-bg-secondary">
                            <Pencil size={14} className="text-white"/>
                        </motion.button>
                         <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
                    </div>
                    <h2 className="text-xl font-bold mt-2">{user.name}</h2>
                    <p className="text-text-secondary max-w-sm text-sm mt-1">{user.bio}</p>
                </div>
            </Card>

            {user.role === 'owner' && (
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => { playSound('click'); setAdminModalOpen(true); }} className="w-full p-2.5 bg-accent-primary text-white font-bold rounded-xl hover:bg-accent-secondary text-sm">
                    Painel de Administrador
                </motion.button>
            )}
            
            <Card className="!p-5">
                <div className="flex justify-between items-center">
                    <p className="text-text-secondary text-xs">Nome de exibição</p>
                    <button onClick={() => { playSound('click'); setIsEditingName(true); }} className="text-accent-primary font-bold text-xs">Editar</button>
                </div>
                {isEditingName ? (
                    <div className="mt-2 flex gap-2">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-1.5 bg-bg-tertiary rounded-md focus:outline-none focus:ring-2 ring-accent-primary text-sm"/>
                        <button onClick={handleSaveName} className="px-2.5 bg-accent-primary text-white rounded-md font-semibold text-xs">Salvar</button>
                    </div>
                ): <p className="font-bold text-sm mt-1">{user.name}</p>}
            </Card>
             <Card className="!p-5">
                <div className="flex justify-between items-center">
                    <p className="text-text-secondary text-xs">Biografia</p>
                    <button onClick={() => { playSound('click'); setIsEditingBio(true); }} className="text-accent-primary font-bold text-xs">Editar</button>
                </div>
                 {isEditingBio ? (
                     <div className="mt-2 flex gap-2">
                         <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full p-1.5 h-16 bg-bg-tertiary rounded-md focus:outline-none focus:ring-2 ring-accent-primary resize-none text-sm"/>
                         <button onClick={handleSaveBio} className="px-2.5 bg-accent-primary text-white rounded-md font-semibold text-xs">Salvar</button>
                     </div>
                 ) : <p className="font-bold text-sm mt-1">{user.bio}</p>}
            </Card>

            <Card className="!p-5">
                <h3 className="text-base font-bold mb-3">Tema Visual</h3>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {THEMES.filter(t => t.key !== 'apoiador' || user.isSupporter).map(t => {
                        const Icon = THEME_ICONS[t.key] || Palette;
                        return (
                        <div key={t.key} onClick={() => { playSound('click'); handleThemeChange(t.key); }} className="cursor-pointer text-center group">
                            <motion.div 
                                className="w-12 h-12 rounded-full flex items-center justify-center relative transition-all" 
                                style={{ backgroundColor: t.properties['--accent-primary'] }}
                                animate={{ scale: theme.key === t.key ? 1.1 : 1, y: theme.key === t.key ? -5 : 0 }}
                            >
                               <Icon size={24} className="text-white/90" />
                               {theme.key === t.key && <motion.div layoutId="theme-selector" className="absolute inset-0 ring-2 ring-accent-primary rounded-full" />}
                            </motion.div>
                        </div>
                    )})}
                </div>
            </Card>
        </div>
    )
}

interface FriendRequest { from: User; toId: number; }

const FriendsChatScreen: React.FC<{ currentUser: AppUser, showNotification: (msg: string) => void, onImageClick: (url: string) => void }> = ({ currentUser, showNotification, onImageClick }) => {
    const [view, setView] = useState<'chat' | 'list'>('list');
    const [friends, setFriends] = useLocalStorage<Friend[]>('oyasify-friends', initialFriends);
    const [chats, setChats] = useLocalStorage<Chat[]>('oyasify-chats', initialChats);
    const [allUsers] = useLocalStorage<AppUser[]>('oyasify-users', []);
    const [searchQuery, setSearchQuery] = useState('');
    const [friendRequests, setFriendRequests] = useLocalStorage<FriendRequest[]>('oyasify-requests', []);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [subView, setSubView] = useState<'friends' | 'requests' | 'add'>('friends');
    const [audioCallFriend, setAudioCallFriend] = useState<Friend | null>(null);

    const incomingRequests = friendRequests.filter(req => req.toId === currentUser.id);
    const sentRequests = friendRequests.filter(req => req.from.id === currentUser.id);

    const discoverableFilteredUsers = searchQuery.trim() === '' ? [] : allUsers.filter(u => {
        if (u.id === currentUser.id) return false;
        if (friends.some(f => f.id === u.id)) return false;
        if (incomingRequests.some(r => r.from.id === u.id)) return false;
        return u.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    const handleSelectFriend = (friend: Friend) => {
        setSelectedFriend(friend);
        if (!chats.find(c => c.friendId === friend.id)) {
            setChats([...chats, { friendId: friend.id, messages: [] }]);
        }
        setView('chat');
    };
    
    const handleSendRequest = (user: User) => {
        if (friendRequests.some(r => r.from.id === currentUser.id && r.toId === user.id)) {
            showNotification('Pedido de amizade já enviado.');
            return;
        }
        playSound('click');
        const newRequest: FriendRequest = { from: currentUser, toId: user.id };
        setFriendRequests([...friendRequests, newRequest]);
        showNotification(`Pedido de amizade enviado para ${user.name}!`);
    };
    
    const handleAcceptRequest = (req: FriendRequest) => {
        const newFriend: Friend = { ...req.from, online: true };
        setFriends([...friends, newFriend]);
        setFriendRequests(friendRequests.filter(r => !(r.from.id === req.from.id && r.toId === currentUser.id)));
        showNotification(`${req.from.name} é seu amigo agora!`);
    };

    const handleDeclineRequest = (req: FriendRequest) => {
        setFriendRequests(friendRequests.filter(r => !(r.from.id === req.from.id && r.toId === currentUser.id)));
        showNotification(`Pedido de ${req.from.name} recusado.`);
    };

    const handleUpdateChat = (updatedChat: Chat) => {
        if (!selectedFriend) return;
        setChats(chats.map(c => c.friendId === selectedFriend.id ? updatedChat : c));
    };
    
    if (view === 'chat' && selectedFriend) {
        const chat = chats.find(c => c.friendId === selectedFriend.id);
        return (
            <>
                <AnimatePresence>
                    {audioCallFriend && (
                        <AudioCallModal 
                            friend={audioCallFriend} 
                            onClose={() => setAudioCallFriend(null)} 
                        />
                    )}
                </AnimatePresence>
                <ChatView 
                    friend={selectedFriend} 
                    chat={chat!} 
                    onBack={() => setView('list')} 
                    onUpdateChat={handleUpdateChat}
                    onStartAudioCall={setAudioCallFriend}
                    onImageClick={onImageClick}
                />
            </>
        );
    }

    return (
         <div className="flex flex-col h-full">
            <div className="flex-shrink-0 border-b border-bg-tertiary mb-3">
                 <nav className="-mb-px flex space-x-5">
                     <button onClick={() => setSubView('friends')} className={`py-2 px-1 border-b-2 font-medium text-sm ${subView === 'friends' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Amigos</button>
                     <button onClick={() => setSubView('requests')} className={`py-2 px-1 border-b-2 font-medium text-sm relative ${subView === 'requests' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                        Pedidos
                        {incomingRequests.length > 0 && <span className="absolute top-0 -right-3 h-4 w-4 bg-danger text-white text-xs rounded-full flex items-center justify-center">{incomingRequests.length}</span>}
                    </button>
                     <button onClick={() => setSubView('add')} className={`py-2 px-1 border-b-2 font-medium text-sm ${subView === 'add' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Adicionar</button>
                 </nav>
            </div>
             <div className="flex-1 overflow-y-auto pr-1 -mr-2 overscroll-contain">
                 <AnimatePresence mode="wait">
                     <motion.div 
                        key={subView} 
                        initial={{opacity:0, y:10}} 
                        animate={{opacity:1, y:0}} 
                        exit={{opacity:0, y:-10}} 
                        variants={containerVariants}
                        className="space-y-3"
                     >
                         {subView === 'friends' && (
                             friends.map(friend => (
                                <motion.div key={friend.id} variants={itemVariants}>
                                 <Card onClick={() => handleSelectFriend(friend)} className="!p-3 flex items-center">
                                     <div className="relative">
                                         <img src={friend.avatarUrl} className="w-12 h-12 rounded-full" />
                                         <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${friend.online ? 'bg-status-online' : 'bg-status-offline'} border-2 border-bg-secondary`}></span>
                                     </div>
                                     <div className="ml-3">
                                         <p className="font-bold text-sm">{friend.name}</p>
                                         <p className="text-xs text-text-secondary">{friend.online ? 'Online' : 'Offline'}</p>
                                     </div>
                                 </Card>
                                 </motion.div>
                             ))
                         )}
                         {subView === 'requests' && (
                            incomingRequests.length > 0 ? incomingRequests.map(req => (
                                <motion.div key={req.from.id} variants={itemVariants}>
                                <Card className="!p-3 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img src={req.from.avatarUrl} className="w-12 h-12 rounded-full mr-3" />
                                        <p className="font-semibold text-sm">{req.from.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                         <motion.button whileTap={{scale:0.9}} onClick={() => { playSound('click'); handleAcceptRequest(req);}} className="p-2.5 bg-green-500/10 text-green-600 rounded-full"><Check size={18} strokeWidth={3}/></motion.button>
                                         <motion.button whileTap={{scale:0.9}} onClick={() => { playSound('click'); handleDeclineRequest(req);}} className="p-2.5 bg-danger/10 text-danger rounded-full"><X size={18} strokeWidth={3}/></motion.button>
                                    </div>
                                </Card>
                                </motion.div>
                            )) : <p className="text-center text-text-secondary mt-8 text-sm">Nenhum pedido de amizade.</p>
                         )}
                         {subView === 'add' && (
                            <div>
                                <div className="relative mb-3">
                                    <input 
                                        type="text"
                                        placeholder="Pesquisar usuário por nome..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full p-3 pl-10 bg-bg-tertiary rounded-lg focus:outline-none focus:ring-2 ring-accent-primary text-sm"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20}/>
                                </div>
                                <motion.div className="space-y-3" variants={containerVariants}>
                                    {discoverableFilteredUsers.length > 0 ? (
                                        discoverableFilteredUsers.map(user => {
                                            const hasSentRequest = sentRequests.some(r => r.toId === user.id);
                                            return (
                                                 <motion.div key={user.id} variants={itemVariants}>
                                                 <Card className="!p-3 flex items-center justify-between">
                                                     <div className="flex items-center">
                                                         <img src={user.avatarUrl} className="w-12 h-12 rounded-full mr-3" />
                                                         <div>
                                                             <p className="font-semibold text-sm">{user.name}</p>
                                                             <p className="text-xs text-text-secondary">{user.bio}</p>
                                                         </div>
                                                     </div>
                                                      <motion.button 
                                                        whileTap={{scale:0.9}}
                                                        onClick={() => handleSendRequest(user)} 
                                                        disabled={hasSentRequest}
                                                        className="p-2.5 bg-accent-primary/10 text-accent-primary rounded-full disabled:bg-bg-tertiary disabled:text-text-secondary">
                                                        {hasSentRequest ? <Check size={18}/> : <Plus size={18}/>}
                                                      </motion.button>
                                                 </Card>
                                                 </motion.div>
                                            )
                                        })
                                    ) : searchQuery.trim() !== '' && (
                                         <p className="text-center text-text-secondary mt-8 text-sm">Nenhum usuário encontrado.</p>
                                    )}
                                </motion.div>
                            </div>
                         )}
                     </motion.div>
                 </AnimatePresence>
             </div>
         </div>
    );
};

const ProfileScreen: React.FC<{ user: AppUser, setUser: (user: AppUser) => void, showNotification: (msg: string) => void, onImageClick: (url: string) => void }> = ({ user, setUser, showNotification, onImageClick }) => {
    const [tab, setTab] = useState<'profile' | 'friends'>('profile');

    return (
        <div className="h-full flex flex-col max-w-2xl mx-auto">
            <div className="flex-shrink-0 border-b border-bg-tertiary/50 mb-4">
                <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
                    <button onClick={() => { playSound('click'); setTab('profile'); }} className={`whitespace-nowrap py-2.5 px-1 border-b-2 font-medium text-sm ${tab === 'profile' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                        Perfil
                    </button>
                    <button onClick={() => { playSound('click'); setTab('friends'); }} className={`whitespace-nowrap py-2.5 px-1 border-b-2 font-medium text-sm ${tab === 'friends' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                        Amigos & Chat
                    </button>
                </nav>
            </div>

            <div className="flex-1 min-h-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="h-full"
                    >
                        {tab === 'profile' && <div className="overflow-y-auto h-full pr-1 -mr-2 overscroll-contain"><ProfileView user={user} setUser={setUser} showNotification={showNotification} /></div>}
                        {tab === 'friends' && <FriendsChatScreen currentUser={user} showNotification={showNotification} onImageClick={onImageClick}/>}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

const MainContent: React.FC<{ screen: Screen, user: AppUser, setUser: (user: AppUser) => void, showNotification: (msg: string) => void, setScreen: (s: Screen) => void, onImageClick: (url: string) => void }> = ({ screen, user, setUser, showNotification, setScreen, onImageClick }) => (
    <main className="flex-1 overflow-y-auto p-4 pb-20 overscroll-contain">
        <AnimatePresence mode="wait">
            <motion.div
                key={screen}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
            >
                {screen === 'home' && <HomeScreen user={user} setScreen={setScreen} />}
                {screen === 'curso-de-canto' && <CursoDeCantoScreen />}
                {screen === 'seja-um-artista' && <SejaUmArtistaScreen />}
                {screen === 'crie-sua-letra' && <CrieSuaLetraScreen />}
                {screen === 'ai-script' && <AiScriptScreen user={user} setScreen={setScreen} />}
                {screen === 'profile' && <ProfileScreen user={user} setUser={setUser} showNotification={showNotification} onImageClick={onImageClick} />}
                {screen === 'academy' && <AcademyScreen />}
                {screen === 'apoio' && <ApoioScreen user={user} showNotification={showNotification} />}
                {screen === 'oyasify-ai' && <OyasifyAIScreen onImageClick={onImageClick} />}
                {screen === 'suporte' && <SupportScreen />}
            </motion.div>
        </AnimatePresence>
    </main>
);

const Header: React.FC<{ onMenuClick: () => void, onNotificationsClick: () => void, user: AppUser }> = ({ onMenuClick, onNotificationsClick, user }) => {
    const [supporterRequests] = useLocalStorage('oyasify-supporter-requests', []);
    const hasNotifications = user.role === 'owner' && supporterRequests.length > 0;

    return (
    <header className="flex-shrink-0 bg-transparent h-16 flex items-center justify-between px-4 sm:px-6 z-10">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onMenuClick} className="p-2 rounded-full">
            <LogoIcon className="text-accent-primary h-8 w-8" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onNotificationsClick} className="p-2 rounded-full relative">
            <Bell className="text-gray-500" size={24} />
             {hasNotifications && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-bg-primary" />}
        </motion.button>
    </header>
    );
};

const Drawer: React.FC<{ isOpen: boolean, setOpen: (isOpen: boolean) => void, user: AppUser, setScreen: (s: Screen) => void, onLogout: () => void, currentScreen: Screen }> = ({ isOpen, setOpen, user, setScreen, onLogout, currentScreen }) => {
    const handleLogout = () => {
        playSound('click');
        onLogout();
    };

    const navItems = [
        { screen: 'home', label: 'Início' },
        { screen: 'curso-de-canto', label: 'Curso de Canto' },
        { screen: 'seja-um-artista', label: 'Seja um Artista' },
        { screen: 'crie-sua-letra', label: 'Crie sua Letra' },
        { screen: 'academy', label: 'Academy' },
        { screen: 'ai-script', label: 'Roteiro AI' },
        { screen: 'oyasify-ai', label: 'Oyasify AI' },
        { screen: 'apoio', label: 'Apoiar Projeto' },
        { screen: 'suporte', label: 'Suporte' },
    ] as const;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/30 z-30"
                    onClick={() => setOpen(false)}
                />
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute top-0 left-0 h-full w-72 bg-bg-secondary z-40 shadow-xl flex flex-col p-5 rounded-r-2xl"
                >
                    <div className="flex items-center space-x-3 mb-6">
                         <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center">
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-text-primary">{user.name}</p>
                            <p className="text-text-secondary text-xs">{user.role === 'owner' ? 'Dono' : 'Criador'}</p>
                        </div>
                    </div>

                    <nav className="flex-1 flex flex-col">
                         {navItems.map(item => (
                            <button 
                                key={item.screen} 
                                onClick={() => setScreen(item.screen)}
                                className={`w-full text-left p-2.5 rounded-lg font-semibold text-base transition-colors mb-1 ${
                                    currentScreen === item.screen ? 'text-accent-primary' : 'text-text-secondary hover:bg-bg-tertiary'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                    
                    <div className="border-t border-bg-tertiary my-2"></div>
                    
                    <button onClick={() => setScreen('profile')} className={`w-full text-left p-2.5 rounded-lg font-semibold text-base transition-colors mt-1 ${ currentScreen === 'profile' ? 'text-accent-primary' : 'text-text-secondary hover:bg-bg-tertiary' }`}>
                        Perfil
                    </button>
                     <button onClick={handleLogout} className="w-full text-left p-2.5 rounded-lg font-semibold text-base text-red-500 hover:bg-red-500/10 transition-colors">
                        Sair
                    </button>
                </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const NotificationsPanel: React.FC<{ user: AppUser, onClose: () => void }> = ({ user, onClose }) => {
    const [requests] = useLocalStorage<{ userId: number, userName: string }[]>('oyasify-supporter-requests', []);
    const [globalNotification] = useLocalStorage<{ message: string | null }>('oyasify-global-notification', { message: null });

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-4 w-72 bg-bg-secondary rounded-lg shadow-lg z-30 p-3"
        >
            <h3 className="font-bold text-base mb-2">Notificações</h3>
            <div className="space-y-2">
                {globalNotification.message && (
                    <div className="text-xs bg-bg-tertiary p-2 rounded-md">{globalNotification.message}</div>
                )}
                {user.role === 'owner' && requests.map(req => (
                    <div key={req.userId} className="text-xs bg-bg-tertiary p-2 rounded-md">
                        <span className="font-bold">{req.userName}</span> quer se tornar um Apoiador!
                    </div>
                ))}
                {(requests.length === 0 && !globalNotification.message) && (
                    <p className="text-xs text-text-secondary">Nenhuma notificação nova.</p>
                )}
            </div>
        </motion.div>
    );
};

const BottomNav: React.FC<{ currentScreen: Screen, setScreen: (s: Screen) => void }> = ({ currentScreen, setScreen }) => {
    const navItems = [
        { screen: 'home', icon: Home },
        { screen: 'curso-de-canto', icon: Mic },
        { screen: 'crie-sua-letra', icon: Pencil },
        { screen: 'profile', icon: UserIcon },
    ] as const;

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg-secondary flex justify-around items-center border-t border-bg-tertiary z-20">
            {navItems.map(({ screen, icon: Icon }) => (
                <motion.button
                    key={screen}
                    onClick={() => setScreen(screen)}
                    className="flex flex-col items-center justify-center w-full h-full relative"
                    whileTap={{ scale: 0.9 }}
                >
                    <Icon size={28} className={currentScreen === screen ? 'text-accent-primary' : 'text-gray-400'} strokeWidth={currentScreen === screen ? 2.5 : 2} />
                </motion.button>
            ))}
        </nav>
    );
};


// --- Application ---
const Application: React.FC<{ user: AppUser, onLogout: () => void }> = ({ user, onLogout }) => {
    const [users, setUsers] = useLocalStorage<(AppUser & { password?: string })[]>('oyasify-users', []);
    const [session, setSession] = useLocalStorage<{ user: AppUser }>('oyasify-session', { user });

    const [screen, setScreen] = useState<Screen>('home');
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [globalNotification, setGlobalNotification] = useLocalStorage('oyasify-global-notification', { message: null, seen: true });
    const [viewedImageUrl, setViewedImageUrl] = useState<string | null>(null);
    
    const showNotification = (message: string) => {
        playSound('notification');
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };
    
    useEffect(() => {
        if (globalNotification.message && !globalNotification.seen) {
            showNotification(globalNotification.message);
            setGlobalNotification({ ...globalNotification, seen: true });
        }
    }, [globalNotification, setGlobalNotification]);

    const handleSetScreen = (s: Screen) => {
        playSound('click');
        setScreen(s);
        setDrawerOpen(false);
    };
    
    const handleUpdateUser = (updatedUser: AppUser) => {
       setSession({ user: updatedUser });
       const userIndex = users.findIndex(u => u.id === updatedUser.id);
       if (userIndex > -1) {
           const newUsers = [...users];
           const existingUser = newUsers[userIndex];
           newUsers[userIndex] = { ...existingUser, ...updatedUser };
           setUsers(newUsers);
       }
    };

    return (
        <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 20, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                        className="fixed top-0 left-1/2 z-50 bg-accent-primary text-white py-1.5 px-5 rounded-full shadow-lg text-sm"
                    >
                        {notification}
                    </motion.div>
                )}
                {viewedImageUrl && <ImageViewerModal imageUrl={viewedImageUrl} onClose={() => setViewedImageUrl(null)} />}
            </AnimatePresence>
            
            <Drawer user={session.user} isOpen={isDrawerOpen} setOpen={setDrawerOpen} setScreen={handleSetScreen} onLogout={onLogout} currentScreen={screen} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header 
                    onMenuClick={() => { playSound('click'); setDrawerOpen(true); }} 
                    onNotificationsClick={() => { playSound('click'); setIsNotificationsOpen(!isNotificationsOpen); }}
                    user={session.user} 
                />
                 <AnimatePresence>
                    {isNotificationsOpen && <NotificationsPanel user={session.user} onClose={() => setIsNotificationsOpen(false)} />}
                </AnimatePresence>
                <MainContent 
                    screen={screen} 
                    user={session.user} 
                    setUser={handleUpdateUser} 
                    showNotification={showNotification} 
                    setScreen={handleSetScreen} 
                    onImageClick={setViewedImageUrl}
                />
                <BottomNav currentScreen={screen} setScreen={handleSetScreen} />
            </div>
        </div>
    );
};

// --- Main App Component ---
const App: React.FC = () => {
    const [session, setSession] = useLocalStorage<{ user: AppUser } | null>('oyasify-session', null);
    const [view, setView] = useState<'welcome' | 'auth'>('welcome');
    const themeKey = session?.user?.theme || 'sintonia';

    const handleLogout = () => {
        setSession(null);
        setView('welcome');
    };

    return (
        <ThemeProvider initialThemeKey={themeKey}>
            {session ? (
                <Application user={session.user} onLogout={handleLogout} />
            ) : (
                view === 'welcome' ? (
                    <WelcomeScreen onStart={() => setView('auth')} />
                ) : (
                    <Auth onLogin={setSession} />
                )
            )}
        </ThemeProvider>
    );
};

export default App;