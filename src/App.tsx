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
    X, Bell, Palette, Download, Link as LinkIcon, Heart, Shield, Crown, Flower2, Rocket, Sparkles, Pencil, MessageSquare, Droplet, Flame, Gem, Leaf, MicOff, Play, Pause, Check, Users, Search, Phone
} from 'lucide-react';

// --- Local Storage Hooks ---
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // Fix: The caught error is of type 'unknown'. Cast to 'any' to log it.
            console.error(error as any);
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
            console.error(error as any);
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
            soundFile = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZ4KSYXgA837/3wMRgBwA9A4+BsDP/y//4wMQaAEMAwwDEYEyP/DAAFFQz/wAY709//5x//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//8A//-AANCLAmp96AAAADAAAAABhAAQN+8AAAACgAAATEFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTAAAAAAEAAANIAAD+AAAQAAAAAEgAAAAAAAAAEhQAAQAAAAAAAAAEAAADgAABAAAAAAAAAAAAAAA';
            break;
        case 'click':
        case 'sent':
        case 'start_recording':
        case 'cancel_recording':
        default:
            soundFile = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZ4JFdpKgdHVkXY8gAR//LgAAAAAAAAAAAABQTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-AAVERpqgA9QAL/8AAB//4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
            break;
    }
    // Fix: The error object from a promise rejection is of type `unknown`.
    // Cast to 'any' to allow logging with console.error.
    // FIX: The error is of type unknown. Explicitly cast it to a string for logging to resolve the type error.
    new Audio(soundFile).play().catch(e => console.error('Error playing sound:', String(e)));
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
                <h2 className="text-lg font-bold text-text-primary">{title}</h2>
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
                // Fix: The caught error is of type 'unknown'. Cast to 'any' to log it.
                console.error("Error starting recording:", err as any);
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
                 {message.type === 'text' && <p className="break-words">{message.content}</p>}
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
                <button onClick={() => setView('notifications')} className={`py-2 px-3 text-sm ${view === 'notifications' ? 'border-b-2 border-accent-primary text-accent-primary' : 'text-text-secondary'}`}>Notificações</button>
                <button onClick={() => setView('users')} className={`py-2 px-3 text-sm ${view === 'users' ? 'border-b-2 border-accent-primary text-accent-primary' : 'text-text-secondary'}`}>Usuários</button>
                <button onClick={() => setView('requests')} className={`py-2 px-3 text-sm ${view === 'requests' ? 'border-b-2 border-accent-primary text-accent-primary' : 'text-text-secondary'}`}>Pedidos</button>
            </div>
            {view === 'notifications' && (
                <div className="space-y-3">
                    <h3 className="font-bold text-sm">Enviar Notificação Global</h3>
                    <textarea value={notificationMsg} onChange={e => setNotificationMsg(e.target.value)} className="w-full p-2 bg-bg-tertiary rounded-md text-sm" placeholder="Sua mensagem aqui..."></textarea>
                    <motion.button whileTap={{scale: 0.95}} onClick={handleSendNotification} className="w-full p-2 bg-accent-primary rounded-md text-white font-semibold text-sm">Enviar</motion.button>
                </div>
            )}
            {view === 'users' && (
                <div className="space-y-2 max-h-60 overflow-y-auto text-sm">
                    {users.filter(u => u.role !== 'owner').map(u => (
                        <div key={u.id} className="flex justify-between items-center bg-bg-tertiary p-2 rounded-md">
                            <p>{u.name} {u.isSupporter && '⭐'}</p>
                            <motion.button whileTap={{scale: 0.95}} onClick={() => toggleSupporter(u.id, !u.isSupporter)} className="p-1 px-2 rounded-md text-xs bg-accent-primary text-white">{u.isSupporter ? 'Remover' : 'Tornar Apoiador'}</motion.button>
                        </div>
                    ))}
                </div>
            )}
            {view === 'requests' && (
                 <div className="space-y-2 max-h-60 overflow-y-auto text-sm">
                     {requests.length > 0 ? requests.map(r => (
                         <div key={r.userId} className="flex justify-between items-center bg-bg-tertiary p-2 rounded-md">
                             <p>{r.userName}</p>
                             <motion.button whileTap={{scale: 0.95}} onClick={() => approveRequest(r.userId)} className="p-1 px-2 rounded-md text-xs bg-accent-primary text-white">Aprovar</motion.button>
                         </div>
                     )) : <p className="text-text-secondary text-center text-sm">Nenhum pedido pendente.</p>}
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
            className="text-4xl font-bold text-text-primary">Bem-vindo, {user.name}!</motion.h1>
        <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
            className="text-text-secondary mt-1 mb-6 text-lg">Pronto para evoluir?</motion.p>
        
        <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
            className="w-full max-w-md"
        >
            <Card className="text-left p-6">
                <div className="flex items-center mb-3">
                    <h2 className="text-2xl font-bold text-text-primary">🚀 Oyasify Academy</h2>
                </div>
                <p className="text-text-secondary mb-5 text-base">
                    Acesse cursos e conteúdos exclusivos para evoluir no mundo musical, crescer online e monetizar seu talento.
                </p>
                <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    whileHover={{ y: -2 }}
                    className="w-full p-3 bg-accent-primary text-white font-bold rounded-xl hover:bg-accent-secondary transition-colors flex items-center justify-center text-base"
                    onClick={(e) => { e.stopPropagation(); playSound('click'); setScreen('academy'); }}
                >
                    <GraduationCap size={20} className="mr-2"/> Academy
                </motion.button>
            </Card>
        </motion.div>
    </div>
);

const VocalScreen: React.FC = () => (
     <motion.div 
        className="space-y-4 max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
            <Card className="!p-5">
                <h2 className="text-xl font-bold text-text-primary">Aquecimento Vocal</h2>
                <p className="text-text-secondary mt-1 text-sm">Prepare sua voz com técnicas guiadas e sons de referência.</p>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card className="!p-5">
                <h2 className="text-xl font-bold text-text-primary">Técnica e Controle</h2>
                <p className="text-text-secondary mt-1 text-sm">Trabalhe afinação, timbre e respiração com suporte visual inteligente.</p>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card className="!p-5">
                <h2 className="text-xl font-bold mb-2 text-text-primary">Curso Gratuito — com Henrique Mendonça</h2>
                <div className="bg-yellow-100/50 border border-yellow-400 text-yellow-800 p-2 rounded-lg mb-3 flex items-start gap-2 text-xs" role="alert">
                    <span className="text-yellow-600 mt-0.5">⚠️</span>
                    <p>Este curso é uma versão antiga e contém pouco conteúdo, mas é excelente para iniciantes.</p>
                </div>
                <p className="text-text-secondary mb-3 leading-relaxed text-sm">
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

const AiScriptScreen = () => {
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
            // Fix: The caught error is of type 'unknown'. Cast to 'any' to log it.
            console.error(error as any);
            setScript("<h2>Erro</h2><p>Algo deu errado. Por favor, verifique o console para mais detalhes.</p>");
        }
        setIsLoading(false);
    }, [idea]);

    return (
        <div className="max-w-2xl mx-auto flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-1 text-text-primary flex items-center gap-2"><Sparkles className="text-accent-primary" />Roteiro AI</h1>
            <p className="text-text-secondary mb-6 text-center max-w-lg text-base">Gere roteiros criativos para seus vídeos, seja para YouTube, TikTok ou outra plataforma.</p>
            
            <Card className="w-full p-6">
                <label className="font-semibold text-text-primary mb-2 block text-base">Sua Ideia para o Roteiro</label>
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Ex: um roteiro para um vídeo no TikTok sobre 3 dicas para viajar barato."
                    className="w-full h-32 p-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none text-text-primary text-sm"
                />
                <motion.button
                    onClick={() => { playSound('click'); handleGenerate(); }}
                    disabled={isLoading || !idea.trim()}
                    whileTap={{ scale: 0.98 }} whileHover={{y: -2}}
                    className="mt-4 w-full bg-accent-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-accent-secondary disabled:bg-bg-tertiary disabled:text-text-secondary disabled:cursor-not-allowed transition-colors text-base"
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
                    <h2 className="text-xl font-bold mb-3">Seu Roteiro:</h2>
                    <div className="prose prose-sm max-w-none text-text-primary" dangerouslySetInnerHTML={{ __html: script }} />
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
            <h1 className="text-3xl font-bold text-center text-text-primary">Creator Academy</h1>
            
            <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">Recursos Essenciais</h2>
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
                                    <h3 className="font-bold text-base">{res.name}</h3>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">Nossos Cursos</h2>
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
                                 <img src={lesson.thumbnailUrl}