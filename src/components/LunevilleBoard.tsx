import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playCoinSound } from '../utils/sound';
import { getThemeCardStyles } from '../utils/theme';
import { 
  MessageSquare, Send, Trash2, Edit3, Calendar, AlertCircle, 
  Moon, HelpCircle, Plus, ExternalLink, Check, Loader2,
  Bell, Search, Copy, RefreshCw, Smartphone, Key, Info, Sparkles, Heart,
  Filter, ArrowUpDown
} from 'lucide-react';
import { UserProfile } from '../types';
import IdCard from './IdCard';

interface SheetPost {
  postId: string;
  parentId: string;
  username: string;
  content: string;
  createdAt: string;
  luneId: string;
  reactions?: Record<string, string[]>; // Keep backward compatibility
  hearts?: string[]; // New heart react list of usernames
  authorProfile?: {
    name?: string;
    sex?: string;
    age?: number | string;
    country?: string;
    luneSince?: string;
    avatar?: string;
    bias?: string;
    biasWrecker?: string;
    stanlist?: string;
    socials?: {
      twitter?: string;
      tiktok?: string;
      instagram?: string;
    };
    coins?: number;
    luneId?: string;
  };
}

interface ParsedPost {
  text: string;
  attachment?: string;
  poll?: {
    question: string;
    options: string[];
    expiresAt?: string;
  };
}

const parsePostContent = (rawContent: string): ParsedPost => {
  let text = rawContent;
  let attachment: string | undefined;
  let poll: { question: string; options: string[]; expiresAt?: string } | undefined;

  const attachRegex = /\[ATTACH:(.*?)\]/;
  const attachMatch = text.match(attachRegex);
  if (attachMatch) {
    attachment = attachMatch[1];
    text = text.replace(attachRegex, "");
  }

  const pollRegex = /\[POLL:(.*?)\]/;
  const pollMatch = text.match(pollRegex);
  if (pollMatch) {
    const pollParts = pollMatch[1].split("|");
    let expiresAt: string | undefined;
    
    const optionsParts = pollParts.slice(1).filter(part => {
      if (part.startsWith("EXPIRY:")) {
        expiresAt = part.replace("EXPIRY:", "");
        return false;
      }
      return true;
    });

    if (pollParts.length >= 2) {
      const question = pollParts[0];
      const options = optionsParts.filter(o => o.trim() !== "");
      poll = { question, options, expiresAt };
    }
    text = text.replace(pollRegex, "");
  }

  return {
    text: text.trim(),
    attachment,
    poll
  };
};

const formatRichText = (txt: string, isLight?: boolean): React.ReactNode => {
  if (!txt) return "";
  
  const regex = /(\*\*.*?\*\*|__.*?__|_\*.*?\*_|\*.*?\*|_.*?_|@[a-zA-Z0-9_]+)/g;
  const parts = txt.split(regex);
  
  return parts.map((part, i) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return (
        <strong key={i} className={`font-extrabold ${isLight ? "text-pink-600" : "text-pink-400"}`}>
          {formatRichText(part.slice(2, -2), isLight)}
        </strong>
      );
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return (
        <em key={i} className={`italic ${isLight ? "text-indigo-600" : "text-indigo-300"}`}>
          {formatRichText(part.slice(1, -1), isLight)}
        </em>
      );
    }
    if (part.startsWith("@")) {
      return (
        <span key={i} className={`font-black px-1.5 py-0.5 rounded-md text-[11px] font-mono tracking-tight ${isLight ? 'bg-pink-100 text-pink-700' : 'bg-pink-500/15 text-pink-300 border border-pink-500/20'}`}>
          {part}
        </span>
      );
    }
    return part;
  });
};

interface LunevilleBoardProps {
  coins: number;
  onUpdateCoins: (amount: number) => void;
  firebaseUser: any;
  theme: string;
  playerName?: string;
  userProfile?: UserProfile;
}

// Interactive Seed Posts
const DEFAULT_SEED_POSTS: SheetPost[] = [
  {
    postId: "seed_post_2",
    parentId: "NONE",
    username: "EJ_andTEAM",
    content: "Are you enjoying the mini-games? 🎮 What is your favorite one so far? Cast your vote! [POLL:What is your favorite mini-game?|Flappy Wolf 🐺|Memory Card 🃏|Lune Quiz 📝|Wolf Maze 🗺️]",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    luneId: "LUNE-1111EJ",
    hearts: ["Maki_andTEAM"]
  },
  {
    postId: "seed_reply_1",
    parentId: "seed_post_2",
    username: "Taki_andTEAM",
    content: "EJ-hyung, I love Flappy Wolf! I play it during our breaks! 🦊🐾",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    luneId: "LUNE-2458TK",
    hearts: ["EJ_andTEAM"]
  }
];

// Interactive fan notifications list
const SIMULATED_NOTIFICATIONS = [
  { id: 1, text: "🐺 Harua_andTEAM liked your profile badge!", time: "2m ago" },
  { id: 2, text: "🪙 You earned +100 Coins for your active contribution!", time: "10m ago" },
  { id: 3, text: "✨ Your LUNÉ ID card has been successfully certified!", time: "1h ago" },
  { id: 4, text: "🎉 Welcome to Luneville! Create a post to interact with other fans.", time: "2h ago" },
];

interface LunevillePollProps {
  postId: string;
  poll: { question: string; options: string[]; expiresAt?: string };
  isLight?: boolean;
  theme?: string;
}

const LunevillePoll: React.FC<LunevillePollProps> = ({ postId, poll, isLight, theme = 'darkMoon' }) => {
  const [votes, setVotes] = useState<number[]>(() => {
    return poll.options.map((_, idx) => {
      const stored = localStorage.getItem(`poll_votes_${postId}_${idx}`);
      if (stored !== null) return parseInt(stored, 10);
      return idx === 0 ? 5 : idx === 1 ? 2 : 1;
    });
  });

  const [votedIdx, setVotedIdx] = useState<number | null>(() => {
    const stored = localStorage.getItem(`voted_${postId}`);
    return stored !== null ? parseInt(stored, 10) : null;
  });

  const expiresAt = poll.expiresAt;
  const isExpired = expiresAt ? new Date() > new Date(expiresAt) : false;
  
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!expiresAt) return;
    
    const updateTimer = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeRemaining('Closed');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (hours >= 24) {
          const days = Math.floor(hours / 24);
          setTimeRemaining(`${days}d ${hours % 24}h left`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${mins}m left`);
        } else {
          setTimeRemaining(`${mins}m ${secs}s left`);
        }
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleVote = (idx: number) => {
    if (isExpired) {
      alert("This poll has expired and is closed for voting!");
      return;
    }
    playClickSound();
    
    const newVotes = [...votes];
    
    if (votedIdx === idx) {
      // Take back the vote
      newVotes[idx] = Math.max(0, newVotes[idx] - 1);
      setVotes(newVotes);
      localStorage.setItem(`poll_votes_${postId}_${idx}`, String(newVotes[idx]));
      localStorage.removeItem(`voted_${postId}`);
      setVotedIdx(null);
    } else {
      // If user had already voted for a different option, decrement previous vote
      if (votedIdx !== null) {
        newVotes[votedIdx] = Math.max(0, newVotes[votedIdx] - 1);
        localStorage.setItem(`poll_votes_${postId}_${votedIdx}`, String(newVotes[votedIdx]));
      }
      
      // Increment new vote
      newVotes[idx] += 1;
      setVotes(newVotes);
      localStorage.setItem(`poll_votes_${postId}_${idx}`, String(newVotes[idx]));
      localStorage.setItem(`voted_${postId}`, String(idx));
      setVotedIdx(idx);
    }
  };

  const totalVotes = votes.reduce((sum, v) => sum + v, 0);

  // Theme matching colors
  const getThemeBarColor = (t: string) => {
    switch (t) {
      case 'spring': return 'bg-pink-500/20';
      case 'summer': return 'bg-amber-500/20';
      case 'autumn': return 'bg-orange-500/20';
      case 'winter': return 'bg-blue-500/20';
      case 'desert': return 'bg-amber-700/20';
      default: return 'bg-red-500/20';
    }
  };

  const getThemeBarBorderColor = (t: string) => {
    switch (t) {
      case 'spring': return 'border-pink-500/30';
      case 'summer': return 'border-amber-500/30';
      case 'autumn': return 'border-orange-500/30';
      case 'winter': return 'border-blue-500/30';
      case 'desert': return 'border-amber-700/30';
      default: return 'border-red-500/30';
    }
  };

  const getThemeTextColor = (t: string) => {
    switch (t) {
      case 'spring': return 'text-pink-600 font-extrabold';
      case 'summer': return 'text-amber-600 font-extrabold';
      case 'autumn': return 'text-orange-600 font-extrabold';
      case 'winter': return 'text-blue-600 font-extrabold';
      case 'desert': return 'text-amber-800 font-extrabold';
      default: return 'text-red-400 font-extrabold';
    }
  };

  const barColor = getThemeBarColor(theme);
  const borderCol = getThemeBarBorderColor(theme);
  const textColor = getThemeTextColor(theme);

  return (
    <div className={`rounded-2xl p-4 space-y-3 shadow-inner my-2 border ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#080616] border-slate-850"}`}>
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">📊</span>
          <h4 className={`text-xs font-black ${isLight ? "text-slate-800" : "text-white"}`}>{poll.question}</h4>
        </div>
        {expiresAt && (
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isExpired ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/25'}`}>
            {isExpired ? '🔒 Closed' : '🟢 Open'}
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {poll.options.map((opt, idx) => {
          const optVotes = votes[idx] ?? 0;
          const voted = votedIdx === idx;
          const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
          
          return (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer group relative overflow-hidden ${
                isLight 
                  ? "bg-white border-slate-200 hover:border-pink-500/50 hover:bg-pink-50/10 text-slate-700" 
                  : "bg-[#0e0c24]/40 border-slate-850 hover:border-pink-500/35 hover:bg-[#120e2e]/50 text-slate-300"
              }`}
            >
              {/* Visual Percentage Bar overlay */}
              <div 
                className={`absolute top-0 left-0 bottom-0 ${barColor} transition-all duration-500`}
                style={{ width: `${percent}%` }}
              />
              
              <span className={`relative z-10 font-bold flex items-center gap-2 ${isLight ? "text-slate-700 group-hover:text-pink-600" : "text-slate-300 group-hover:text-white"}`}>
                <span>{opt}</span>
                {voted && <span className="text-[10px] text-green-500 font-extrabold">(Your Vote)</span>}
              </span>
              
              <span className="relative z-10 font-mono text-[10px] flex items-center gap-2 font-black">
                <span className={textColor}>{percent}%</span>
                <span className={`bg-pink-500/5 border ${borderCol} px-2 py-0.5 rounded-full ${isLight ? "text-pink-600" : "text-pink-400"}`}>
                  {optVotes} {optVotes === 1 ? 'vote' : 'votes'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Visualizer Footer: Show percentage and total votes */}
      <div className={`pt-2.5 border-t flex justify-between items-center text-[10px] font-bold ${isLight ? 'border-slate-200/60 text-slate-500' : 'border-slate-900/60 text-slate-400'}`}>
        <div className="flex items-center gap-1.5">
          <span>👥</span>
          <span>{totalVotes} {totalVotes === 1 ? 'total vote' : 'total votes'}</span>
        </div>
        {expiresAt && (
          <div className="flex items-center gap-1.5">
            <span>⏱️</span>
            <span className={isExpired ? 'text-red-500' : textColor}>
              {isExpired ? 'Closed' : `Time left: ${timeRemaining}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function LunevilleBoard({ coins, onUpdateCoins, firebaseUser, theme, playerName, userProfile }: LunevilleBoardProps) {
  const themeStyles = getThemeCardStyles(theme);
  
  // Local states
  const [posts, setPosts] = useState<SheetPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // States for replies (expanded state per main post)
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  
  // Edit post state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Rich posting states
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewFilter, setViewFilter] = useState<'all' | 'mine'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainPostRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Poll creation duration state
  const [pollDuration, setPollDuration] = useState<number>(24);
  const [pollDurationUnit, setPollDurationUnit] = useState<'hours' | 'days'>('hours');

  // Mentions tracking states
  const [activeMentionForPost, setActiveMentionForPost] = useState<{ query: string; index: number } | null>(null);
  const [activeMentionForReplies, setActiveMentionForReplies] = useState<Record<string, { query: string; index: number } | null>>({});

  // Active online users list for @tag dropdown
  const ACTIVE_ONLINE_USERS = [
    "EJ_andTEAM",
    "Taki_andTEAM",
    "Harua_andTEAM",
    "Maki_andTEAM",
    "K_andTEAM",
    "Fuma_andTEAM",
    "Nicholas_andTEAM",
    "Yuma_andTEAM",
    "Jo_andTEAM",
    "LUNÉ_Star",
    "Wolf_Lover",
    "Moon_Child",
    "Aurora_Fan",
    "Lune_Dreamer"
  ];

  // Dynamic notification states
  const [notifications, setNotifications] = useState(() => {
    return SIMULATED_NOTIFICATIONS;
  });
  const [hasUnread, setHasUnread] = useState(true);

  // Mentions parser
  const getActiveMention = (text: string, selectionStart: number) => {
    const beforeCursor = text.slice(0, selectionStart);
    const lastAt = beforeCursor.lastIndexOf('@');
    if (lastAt === -1) return null;
    
    const textAfterAt = beforeCursor.slice(lastAt + 1);
    // If there is any whitespace after the '@', it is not an active tag query anymore
    if (/\s/.test(textAfterAt)) return null;
    
    return {
      query: textAfterAt,
      index: lastAt
    };
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    const selStart = e.target.selectionStart;
    const mention = getActiveMention(val, selStart);
    setActiveMentionForPost(mention);
  };

  const handleSelectPostMention = (username: string) => {
    if (!activeMentionForPost) return;
    const { index, query } = activeMentionForPost;
    const before = content.slice(0, index);
    const after = content.slice(index + query.length + 1);
    const newContent = `${before}@${username} ${after}`;
    setContent(newContent);
    setActiveMentionForPost(null);
    
    setTimeout(() => {
      if (mainPostRef.current) {
        mainPostRef.current.focus();
        const cursorPosition = index + username.length + 2; // '@' + username + ' '
        mainPostRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 10);
  };

  const handleReplyChange = (postId: string, val: string, selectionStart: number) => {
    setReplyInputs(prev => ({ ...prev, [postId]: val }));
    const mention = getActiveMention(val, selectionStart);
    setActiveMentionForReplies(prev => ({ ...prev, [postId]: mention }));
  };

  const handleSelectReplyMention = (postId: string, username: string) => {
    const activeMention = activeMentionForReplies[postId];
    if (!activeMention) return;
    const currentVal = replyInputs[postId] || "";
    const { index, query } = activeMention;
    const before = currentVal.slice(0, index);
    const after = currentVal.slice(index + query.length + 1);
    const newVal = `${before}@${username} ${after}`;
    
    setReplyInputs(prev => ({ ...prev, [postId]: newVal }));
    setActiveMentionForReplies(prev => ({ ...prev, [postId]: null }));
    
    setTimeout(() => {
      const el = replyInputRefs.current[postId];
      if (el) {
        el.focus();
        const cursorPosition = index + username.length + 2;
        el.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 10);
  };

  const handleAttachmentButtonClick = () => {
    playClickSound();
    // Direct them to their storage using the file input!
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAttachmentUrl(reader.result);
        setIsAttachmentOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Popups and interactive headers
  const [passportUser, setPassportUser] = useState<{ username: string; luneId: string; profile: any } | null>(null);
  const [showSyncManager, setShowSyncManager] = useState(false);
  const [importCodeText, setImportCodeText] = useState("");
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [copiedLuneId, setCopiedLuneId] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Synchronize player profile data from local storage
  const viewerUsername = localStorage.getItem("lune_username") || playerName || firebaseUser?.displayName || "Anonymous LUNÉ";
  const viewerLuneId = localStorage.getItem("lune_id") || "LUNE-GUEST99";
  const currentCoins = coins;

  // Cloud Sync Status Message
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Load posts on mount (with direct public REST cloud sync attempt + local fallback)
  useEffect(() => {
    const fetchPostsFromCloud = async () => {
      try {
        setLoading(true);
        // Attempt cloud sync fetch from our zero-config public API engine
        const res = await fetch("/api/board/posts", {
          headers: { "Accept": "application/json" }
        });
        if (res.ok) {
          const raw = await res.text();
          if (raw && raw.trim().length > 0) {
            const data = JSON.parse(raw);
            if (Array.isArray(data) && data.length > 0) {
              const cleaned = data.filter((p: SheetPost) => p.postId !== "seed_post_1" && p.username !== "K_andTEAM");
              setPosts(cleaned);
              localStorage.setItem("luneville_posts", JSON.stringify(cleaned));
              setSyncStatus("Cloud synced");
              setLoading(false);
              return;
            }
          }
        }
        // If 404 or empty, seed it
        if (res.status === 404 || res.status === 204) {
          await fetch("/api/board/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(DEFAULT_SEED_POSTS)
          });
          setPosts(DEFAULT_SEED_POSTS);
          localStorage.setItem("luneville_posts", JSON.stringify(DEFAULT_SEED_POSTS));
          setSyncStatus("Cloud synced (seeded)");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Public cloud database offline or CORS limited. Falling back to secure local draft vault.", err);
      }

      // Local vault fallback
      const localData = localStorage.getItem("luneville_posts");
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = parsed.filter((p: SheetPost) => p.postId !== "seed_post_1" && p.username !== "K_andTEAM");
            setPosts(cleaned);
          } else {
            setPosts(DEFAULT_SEED_POSTS);
            localStorage.setItem("luneville_posts", JSON.stringify(DEFAULT_SEED_POSTS));
          }
        } catch (e) {
          setPosts(DEFAULT_SEED_POSTS);
        }
      } else {
        setPosts(DEFAULT_SEED_POSTS);
        localStorage.setItem("luneville_posts", JSON.stringify(DEFAULT_SEED_POSTS));
      }
      setSyncStatus("Local vault active");
      setLoading(false);
    };

    fetchPostsFromCloud();
  }, []);

  // Dynamic notification simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      const playerPosts = posts.filter(p => p.luneId === viewerLuneId || p.username === viewerUsername);
      let alertText = "";
      if (playerPosts.length > 0) {
        // Pick a random post of the player
        const randomPost = playerPosts[Math.floor(Math.random() * playerPosts.length)];
        const cleanContent = randomPost.content.length > 20 ? randomPost.content.slice(0, 20) + "..." : randomPost.content;
        const alerts = [
          `🦊 Taki_andTEAM loved your post: "${cleanContent}"!`,
          `🐰 Harua_andTEAM liked your post: "${cleanContent}"!`,
          `🐶 Maki_andTEAM replied to your post: "${cleanContent}"!`,
          `🌕 EJ_andTEAM gave a heart to your post: "${cleanContent}"!`
        ];
        alertText = alerts[Math.floor(Math.random() * alerts.length)];
      } else {
        // Fallback notifications about the player's account or badge
        const generalPlayerAlerts = [
          "🐺 Harua_andTEAM liked your profile badge!",
          "✨ Your profile was successfully indexed in the LUNÉ Database!",
          "🪙 Your coin balance is fully synced and ready!",
          "🎉 Start posting on the Luneville Board to see live feedback!"
        ];
        alertText = generalPlayerAlerts[Math.floor(Math.random() * generalPlayerAlerts.length)];
      }

      const newNotif = {
        id: Date.now(),
        text: alertText,
        time: "Just now"
      };
      
      setNotifications(prev => [newNotif, ...prev.slice(0, 5)]);
      setHasUnread(true);
    }, 45000); // Trigger every 45 seconds to keep it active and premium

    return () => clearInterval(interval);
  }, [posts, viewerLuneId, viewerUsername]);

  // Save/Update helper which persists to local draft database and public cloud key-value store
  const persistAndSync = async (updatedPosts: SheetPost[], actionType?: string, targetPost?: SheetPost) => {
    // 1. Update state & localStorage instantly for premium snappy feel
    setPosts(updatedPosts);
    localStorage.setItem("luneville_posts", JSON.stringify(updatedPosts));

    // 2. Perform background REST fetch to public cloud key-value bin
    try {
      await fetch("/api/board/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPosts)
      });
      setSyncStatus("Cloud synced");
    } catch (e) {
      console.warn("Background cloud sync update deferred due to network/CORS restrictions.", e);
      setSyncStatus("Local updated (offline)");
    }
  };

  // Create post logic
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();

    if (currentCoins < 100) {
      alert("Posting to the Lunéville Board requires a fee of 100 ⋏ Coins! Play games to earn more.");
      return;
    }

    let finalContent = isPollOpen ? "" : content.trim();

    // Append Poll if set
    if (isPollOpen && pollQuestion.trim()) {
      const validOptions = pollOptions.filter(opt => opt.trim() !== "");
      if (validOptions.length < 2) {
        alert("Please provide at least 2 options for your poll!");
        return;
      }
      
      const expiryDate = new Date();
      if (pollDurationUnit === 'hours') {
        expiryDate.setHours(expiryDate.getHours() + pollDuration);
      } else {
        expiryDate.setDate(expiryDate.getDate() + pollDuration);
      }
      const expiryTimeISO = expiryDate.toISOString();
      
      finalContent = `[POLL:${pollQuestion.trim()}|${validOptions.map(opt => opt.trim()).join("|")}|EXPIRY:${expiryTimeISO}]`;
    }

    // Append Attachment if set
    if (isAttachmentOpen && attachmentUrl.trim()) {
      finalContent += ` [ATTACH:${attachmentUrl.trim()}]`;
    }

    const trimmed = finalContent.trim();
    if (!trimmed) {
      alert("Post content cannot be empty!");
      return;
    }

    setSubmitting(true);
    try {
      const newPost: SheetPost = {
        postId: "post_" + Math.floor(Math.random() * 1000000) + "_" + Date.now(),
        parentId: "NONE",
        username: viewerUsername,
        content: trimmed,
        createdAt: new Date().toISOString(),
        luneId: viewerLuneId,
        hearts: [],
        authorProfile: {
          name: userProfile?.name || viewerUsername,
          sex: userProfile?.sex || 'Secret',
          age: userProfile?.age || 18,
          country: userProfile?.country || 'Philippines',
          luneSince: userProfile?.luneSince || '2023',
          avatar: userProfile?.avatar || localStorage.getItem("lune_avatar") || '🐺',
          bias: userProfile?.bias || '',
          biasWrecker: userProfile?.biasWrecker || '',
          stanlist: userProfile?.stanlist || '',
          socials: userProfile?.socials || {},
          coins: currentCoins - 100, // Deduct the 100 coins posting fee
          luneId: viewerLuneId,
        }
      };

      const updated = [newPost, ...posts];
      persistAndSync(updated, "CREATE", newPost);

      // Create a player-focused notification for publishing a post
      const displayContent = trimmed.startsWith("[POLL:") ? "your poll" : trimmed;
      const cleanText = displayContent.length > 20 ? displayContent.slice(0, 20) + "..." : displayContent;
      const newNotif = {
        id: Date.now(),
        text: `🎉 Your post "${cleanText}" was published successfully!`,
        time: "Just now"
      };
      setNotifications(prev => [newNotif, ...prev.slice(0, 5)]);
      setHasUnread(true);

      playCoinSound();
      setContent("");
      setAttachmentUrl("");
      setIsAttachmentOpen(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setIsPollOpen(false);
      setIsComposerExpanded(false);
      
      // Auto-deduct 100 coins for posting
      onUpdateCoins(-100);
    } catch (err) {
      console.error("Error submitting post:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Create reply logic
  const handleCreateReply = (parentPostId: string) => {
    playClickSound();

    const replyText = replyInputs[parentPostId]?.trim();
    if (!replyText) {
      alert("Reply content cannot be empty!");
      return;
    }

    if (currentCoins < 5) {
      alert("Replying costs 5 Coins!");
      return;
    }

    try {
      const newReply: SheetPost = {
        postId: "reply_" + Math.floor(Math.random() * 1000000) + "_" + Date.now(),
        parentId: parentPostId,
        username: viewerUsername,
        content: replyText,
        createdAt: new Date().toISOString(),
        luneId: viewerLuneId,
        hearts: [],
        authorProfile: {
          name: userProfile?.name || viewerUsername,
          sex: userProfile?.sex || 'Secret',
          age: userProfile?.age || 18,
          country: userProfile?.country || 'Philippines',
          luneSince: userProfile?.luneSince || '2023',
          avatar: userProfile?.avatar || localStorage.getItem("lune_avatar") || '🐺',
          bias: userProfile?.bias || '',
          biasWrecker: userProfile?.biasWrecker || '',
          stanlist: userProfile?.stanlist || '',
          socials: userProfile?.socials || {},
          coins: currentCoins - 5, // Deduct the 5 coins reply fee
          luneId: viewerLuneId,
        }
      };

      const updated = [...posts, newReply];
      persistAndSync(updated, "CREATE", newReply);

      // Create a player-focused notification for writing a reply
      const cleanText = replyText.length > 20 ? replyText.slice(0, 20) + "..." : replyText;
      const newNotif = {
        id: Date.now(),
        text: `💬 You replied: "${cleanText}"!`,
        time: "Just now"
      };
      setNotifications(prev => [newNotif, ...prev.slice(0, 5)]);
      setHasUnread(true);

      playCoinSound();
      setReplyInputs(prev => ({ ...prev, [parentPostId]: "" }));
      
      // Deduct 5 coins
      onUpdateCoins(-5);
    } catch (err) {
      console.error("Error submitting reply:", err);
    }
  };

  // Toggle Edit mode
  const startEditing = (post: SheetPost) => {
    playClickSound();
    setEditingPostId(post.postId);
    setEditingContent(post.content);
  };

  // Save Edited content
  const handleSaveEdit = (postId: string) => {
    playClickSound();
    const trimmed = editingContent.trim();
    if (!trimmed) {
      alert("Post content cannot be empty!");
      return;
    }

    const postToEdit = posts.find(p => p.postId === postId);
    if (!postToEdit) return;

    if (postToEdit.luneId !== viewerLuneId) {
      alert("Unauthorized! You can only edit your own posts.");
      return;
    }

    const updatedPost = { ...postToEdit, content: trimmed };
    const updated = posts.map(p => p.postId === postId ? updatedPost : p);
    persistAndSync(updated, "EDIT", updatedPost);

    setEditingPostId(null);
    setEditingContent("");
  };

  // Delete post logic
  const handleDeletePost = (post: SheetPost) => {
    playClickSound();
    if (post.luneId !== viewerLuneId) {
      alert("Unauthorized! You can only delete your own posts.");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete this post?")) return;

    try {
      const filtered = posts.filter(p => p.postId !== post.postId && p.parentId !== post.postId);
      persistAndSync(filtered, "DELETE", post);
      playCoinSound();
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  // Heart React toggle logic (ONLY heart react button requirement)
  const handleToggleHeart = (postId: string) => {
    playClickSound();

    const updated = posts.map(post => {
      if (post.postId === postId) {
        let currentHearts = Array.isArray(post.hearts) ? [...post.hearts] : [];
        // Compatibility check
        if (!post.hearts && post.reactions) {
          const rawHearts = post.reactions["💖"] || [];
          currentHearts = [...rawHearts];
        }

        const index = currentHearts.indexOf(viewerUsername);
        if (index > -1) {
          currentHearts = currentHearts.filter(u => u !== viewerUsername);
        } else {
          currentHearts = [...currentHearts, viewerUsername];
        }

        const updatedPost = {
          ...post,
          hearts: currentHearts,
          reactions: undefined // Wipe old structure to prevent conflicts
        };

        // Sync background
        persistAndSync(posts.map(p => p.postId === postId ? updatedPost : p), "EDIT", updatedPost);

        return updatedPost;
      }
      return post;
    });

    setPosts(updated);
  };

  const getProfileForUser = (username: string, luneId: string, authorProfileFromPost?: any) => {
    // 1. If it is the active user themselves, return their actual live profile from props!
    if (luneId === viewerLuneId || username === viewerUsername) {
      return {
        name: userProfile?.name || username,
        sex: userProfile?.sex || 'Secret',
        age: userProfile?.age || 18,
        country: userProfile?.country || 'Philippines',
        luneSince: userProfile?.luneSince || '2023',
        avatar: userProfile?.avatar || '🐺',
        coins: coins,
        rank: userProfile?.rank || 'Crescent Moon',
        bias: userProfile?.bias || '',
        biasWrecker: userProfile?.biasWrecker || '',
        stanlist: userProfile?.stanlist || '',
        socials: userProfile?.socials || {},
      };
    }

    // 2. If the post has a stored snapshot, use it!
    if (authorProfileFromPost) {
      return {
        name: authorProfileFromPost.name || username,
        sex: authorProfileFromPost.sex || 'Secret',
        age: Number(authorProfileFromPost.age) || 18,
        country: authorProfileFromPost.country || 'Philippines',
        luneSince: authorProfileFromPost.luneSince || '2023',
        avatar: authorProfileFromPost.avatar || '🐾',
        coins: 100,
        rank: 'Crescent Moon',
        bias: authorProfileFromPost.bias || '',
        biasWrecker: authorProfileFromPost.biasWrecker || '',
        stanlist: authorProfileFromPost.stanlist || '',
        socials: authorProfileFromPost.socials || {},
      };
    }

    // 3. Fallback for &TEAM official members (Seed Posts)
    if (username.endsWith("_andTEAM")) {
      const cleanName = username.replace("_andTEAM", "");
      let realAge = 22;
      let birthday = "2023";
      let country = "Japan";
      let avatar = "🐺";
      
      if (cleanName === "K") { realAge = 28; country = "Japan"; avatar = "☕"; }
      else if (cleanName === "EJ") { realAge = 23; country = "South Korea"; avatar = "🍊"; }
      else if (cleanName === "Fuma") { realAge = 27; country = "Japan"; avatar = "🥋"; }
      else if (cleanName === "Nicholas") { realAge = 23; country = "Taiwan"; avatar = "🍓"; }
      else if (cleanName === "Yuma") { realAge = 22; country = "Japan"; avatar = "🎸"; }
      else if (cleanName === "Jo") { realAge = 21; country = "Japan"; avatar = "🍚"; }
      else if (cleanName === "Harua") { realAge = 21; country = "Japan"; avatar = "🐰"; }
      else if (cleanName === "Taki") { realAge = 21; country = "Japan"; avatar = "🦊"; }
      else if (cleanName === "Maki") { realAge = 20; country = "Germany"; avatar = "🐶"; }

      return {
        name: cleanName,
        sex: 'Male',
        age: realAge,
        country: country,
        luneSince: '2022',
        avatar: avatar,
        coins: 777,
        rank: 'Full Moon',
        bias: 'LUNÉ',
        biasWrecker: 'LUNÉ',
        stanlist: '&TEAM',
        socials: { twitter: '@andTEAM_members' }
      };
    }

    // 4. Fallback for other users (simulate some fields using simple hashes of their name)
    const nameLength = username.length;
    const isEven = nameLength % 2 === 0;
    const countryIndex = nameLength % 5;
    const countries = ['Philippines', 'Japan', 'South Korea', 'Taiwan', 'United States'];
    const biases = ['K', 'EJ', 'Nicholas', 'Harua', 'Taki', 'Maki'];
    const biasIndex = nameLength % biases.length;

    return {
      name: username,
      sex: isEven ? 'Female' : 'Non-binary',
      age: 18 + (nameLength % 12),
      country: countries[countryIndex],
      luneSince: '2023',
      avatar: isEven ? '🌙' : '🐾',
      coins: 50,
      rank: 'Crescent Moon',
      bias: biases[biasIndex],
      biasWrecker: biases[(biasIndex + 1) % biases.length],
      stanlist: '&TEAM',
      socials: { twitter: `@${username}_lune` }
    };
  };

  const handleUserBadgeClick = (postUsername: string, postLuneId: string, authorProfile?: any) => {
    playClickSound();
    const profile = getProfileForUser(postUsername, postLuneId, authorProfile);
    setPassportUser({ 
      username: postUsername, 
      luneId: postLuneId,
      profile
    });
  };

  const handleCopyLuneIdToClipboard = () => {
    playClickSound();
    if (!passportUser) return;
    navigator.clipboard.writeText(passportUser.luneId);
    setCopiedLuneId(true);
    setTimeout(() => setCopiedLuneId(false), 2000);
  };

  const toggleRepliesExpansion = (postId: string) => {
    playClickSound();
    setExpandedReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Export unique sync code
  const handleExportSyncCode = () => {
    try {
      const keysToSync = [
        "lune_username",
        "lune_coins",
        "lune_id",
        "lune_avatar",
        "lune_theme",
        "lune_unlocked_stickers",
        "lune_completed_quests",
        "luneville_posts",
        "lune_has_entered_hub",
        "lune_completed_intro"
      ];
      const data: Record<string, string | null> = {};
      keysToSync.forEach(key => {
        data[key] = localStorage.getItem(key);
      });
      
      data["lune_coins"] = String(currentCoins);
      data["lune_username"] = viewerUsername;
      data["lune_id"] = viewerLuneId;
      data["lune_theme"] = theme;

      const serialized = JSON.stringify(data);
      const b64 = btoa(unescape(encodeURIComponent(serialized)));
      return `LUNE-SYNC-${b64}`;
    } catch (e) {
      console.error("Failed to generate sync code:", e);
      return "";
    }
  };

  // Import and recover all data
  const handleImportSyncCode = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();

    const cleanCode = importCodeText.trim();
    if (!cleanCode) {
      alert("Please paste a valid LUNÉ Sync Code first.");
      return;
    }

    if (!cleanCode.startsWith("LUNE-SYNC-")) {
      alert("Invalid Code Format! High-fidelity LUNÉ Sync Codes must begin with 'LUNE-SYNC-'");
      return;
    }

    try {
      const b64 = cleanCode.substring(10).trim();
      const serialized = decodeURIComponent(escape(atob(b64)));
      const parsedData = JSON.parse(serialized);

      Object.entries(parsedData).forEach(([key, val]) => {
        if (val !== null) {
          localStorage.setItem(key, val as string);
        }
      });

      playCoinSound();
      alert("🎉 LUNÉ Profile Sync Successful! Your entire history, balance, avatar, and custom board posts are successfully restored. We will now reload the page to apply changes!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to restore account. Make sure you copied the exact, complete sync code string!");
    }
  };

  const handleCopyCodeToClipboard = () => {
    playClickSound();
    const code = handleExportSyncCode();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedSyncCode(true);
    setTimeout(() => setCopiedSyncCode(false), 2500);
  };

  // Filter and sort posts
  const mainPosts = posts
    .filter(p => p.parentId === "NONE" || !p.parentId)
    .filter(p => {
      if (viewFilter === 'mine') {
        return p.luneId === viewerLuneId || p.username === viewerUsername;
      }
      return true;
    })
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.username.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const getRepliesForPost = (mainPostId: string) => {
    return posts.filter(p => p.parentId === mainPostId);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Just now";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  const getEmojisForUser = (username: string, authorProfile?: any) => {
    if (username === viewerUsername) {
      const viewerAvatar = userProfile?.avatar || localStorage.getItem("lune_avatar") || "🐺";
      const secondAvatar = viewerAvatar === "🐺" ? "🦊" : "🐺";
      return [viewerAvatar, secondAvatar];
    }
    if (authorProfile?.avatar) {
      const secondAvatar = authorProfile.avatar === "🐺" ? "🦊" : "🐺";
      return [authorProfile.avatar, secondAvatar];
    }
    const emojiList = ["🐺", "🦊", "🦁", "🐯", "🐼", "🐨", "🐰", "🐻", "🐶", "🐱", "🐹", "🐸", "🐿️"];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx1 = Math.abs(hash) % emojiList.length;
    const idx2 = Math.abs(hash * 31 + 17) % emojiList.length;
    const secondIdx = idx1 === idx2 ? (idx2 + 1) % emojiList.length : idx2;
    return [emojiList[idx1], emojiList[secondIdx]];
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-8 relative px-2 ${themeStyles.textPrimary}`}>
      {/* Background visual glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => {
                playClickSound();
                setShowFilterDropdown(!showFilterDropdown);
              }}
              className="w-11 h-11 rounded-2xl bg-pink-500 hover:bg-pink-600 active:scale-95 flex items-center justify-center text-white shrink-0 shadow-lg shadow-pink-500/30 cursor-pointer transition-all relative"
              title="Filter and Sort Posts"
            >
              <Filter className="w-5 h-5" />
              {(viewFilter !== 'all' || sortBy !== 'newest') && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px] font-black text-slate-950">
                  !
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-3 w-64 rounded-3xl border border-indigo-500/30 bg-[#070517]/95 backdrop-blur-xl p-5 shadow-2xl z-50 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-indigo-950 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Board Feed Controls</span>
                    </div>
                    <button 
                      onClick={() => {
                        playClickSound();
                        setViewFilter('all');
                        setSortBy('newest');
                        setShowFilterDropdown(false);
                      }}
                      className="text-[9px] font-extrabold text-slate-500 hover:text-white transition-all uppercase tracking-wider"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Filter Option */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Filter</label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-slate-900/40">
                      <button
                        onClick={() => { playClickSound(); setViewFilter('all'); }}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                          viewFilter === 'all'
                            ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        All Posts
                      </button>
                      <button
                        onClick={() => { playClickSound(); setViewFilter('mine'); }}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                          viewFilter === 'mine'
                            ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        My Posts
                      </button>
                    </div>
                  </div>

                  {/* Sort Option */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Sort By</label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-slate-900/40">
                      <button
                        onClick={() => { playClickSound(); setSortBy('newest'); }}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                          sortBy === 'newest'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        Newest
                      </button>
                      <button
                        onClick={() => { playClickSound(); setSortBy('oldest'); }}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                          sortBy === 'oldest'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        Oldest
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white font-sans flex items-center gap-2">
              Luneville Board
            </h2>
            <p className={`text-xs ${themeStyles.textSecondary} font-medium mt-0.5 flex items-center gap-1.5`}>
              What's on your mind today? <span className="text-pink-400 font-bold">(1 Post = 100 Coins)</span>
              <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded text-slate-400 border border-slate-800">{syncStatus}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial flex items-center gap-1.5">
            {/* Notification Bell Icon positioned directly next to search icon */}
            <div className="relative">
              <button
                onClick={() => {
                  playClickSound();
                  const newShow = !showNotifications;
                  setShowNotifications(newShow);
                  if (newShow) {
                    setHasUnread(false);
                  }
                }}
                className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center relative ${themeStyles.cardBg} ${themeStyles.glowBorder} ${themeStyles.isLight ? 'text-slate-600 hover:text-slate-900 border-slate-200 shadow-sm' : 'text-slate-400 hover:text-white border-slate-800'}`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {hasUnread && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full border border-slate-900 animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-2.5 w-64 border rounded-2xl p-4 shadow-2xl z-[100] text-left space-y-3 ${themeStyles.cardBg} ${themeStyles.glowBorder}`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className={`text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${themeStyles.isLight ? 'text-slate-800' : 'text-white'}`}>
                        <Bell className="w-3 h-3 text-pink-400" /> Notifications
                      </span>
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          setHasUnread(false);
                        }}
                        className={`text-[9px] hover:underline ${themeStyles.isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-white'}`}
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="text-[11px] leading-relaxed border-b border-slate-900/40 pb-1.5">
                          <p className={`font-medium ${themeStyles.isLight ? 'text-slate-700' : 'text-slate-300'}`}>{n.text}</p>
                          <span className={`text-[9px] font-mono block mt-0.5 ${themeStyles.isLight ? 'text-slate-400 font-medium' : 'text-slate-500'}`}>{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative flex-1 md:flex-initial">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search local board..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full md:w-48 pl-10 pr-4 py-2 border rounded-full text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/20 transition-all font-sans ${themeStyles.cardBg} ${themeStyles.glowBorder} ${themeStyles.isLight ? 'text-slate-800 border-slate-200' : 'text-white border-slate-800'}`}
              />
            </div>
          </div>
        </div>
      </div>



      {/* Composer Section - DO NOT CHANGE THE LAYOUT as requested, but keep full collapses */}
      {!isComposerExpanded ? (
        <div 
          onClick={() => { playClickSound(); setIsComposerExpanded(true); }}
          className={`rounded-3xl p-4 flex items-center justify-between gap-4 backdrop-blur-xl shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.005] group border ${themeStyles.cardBg} ${themeStyles.glowBorder}`}
        >
          <div className="flex items-center gap-3.5">
            <div className="flex -space-x-2.5 items-center shrink-0">
              <div className="w-9 h-9 rounded-full bg-indigo-950 border-2 border-indigo-500/40 flex items-center justify-center text-lg shadow-md shadow-pink-500/20 select-none">🐺</div>
              <div className="w-9 h-9 rounded-full bg-indigo-950 border-2 border-indigo-500/40 flex items-center justify-center text-lg shadow-md shadow-pink-500/20 select-none">🦊</div>
            </div>
            <span className={`text-xs md:text-sm font-medium transition-colors ${themeStyles.isLight ? 'text-slate-500 group-hover:text-slate-800' : 'text-slate-400 group-hover:text-white'}`}>
              What's on your mind today?
            </span>
          </div>

          <div className="border border-yellow-500/30 text-yellow-500 text-[11px] font-black tracking-wider uppercase px-3 py-1.5 rounded-full bg-yellow-500/5 shadow shadow-yellow-500/10">
            1 Post = 100 Coins
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-[32px] p-6 shadow-2xl relative overflow-hidden space-y-5 border ${themeStyles.cardBg} ${themeStyles.glowBorder}`}
        >
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-pink-500/0 via-pink-500/30 to-indigo-500/0" />

          <div className={`border border-pink-500/80 px-5 py-3 rounded-2xl flex items-center justify-between shadow-inner ${themeStyles.isLight ? 'bg-slate-50' : 'bg-slate-950/40'}`}>
            <span className="text-xs font-black tracking-widest text-pink-400 font-sans uppercase flex items-center gap-2 select-none">
              📝 WHAT'S ON YOUR MIND?
            </span>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); playClickSound(); setIsComposerExpanded(false); }}
              className={`w-6 h-6 rounded-full border text-[10px] flex items-center justify-center transition-all cursor-pointer font-sans ${themeStyles.isLight ? 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-pink-500/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-pink-500/40'}`}
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { playClickSound(); setIsPollOpen(false); }}
              className={`py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                !isPollOpen 
                  ? "bg-gradient-to-r from-pink-500 to-indigo-500 border-pink-400 text-white shadow-lg shadow-pink-500/10" 
                  : themeStyles.isLight
                    ? "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
                    : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Write a Post</span>
            </button>
            <button
              type="button"
              onClick={() => { playClickSound(); setIsPollOpen(true); }}
              className={`py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                isPollOpen 
                  ? "bg-gradient-to-r from-pink-500 to-indigo-500 border-pink-400 text-white shadow-lg shadow-pink-500/10" 
                  : themeStyles.isLight
                    ? "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
                    : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white"
              }`}
            >
              📊
              <span>Start a Poll</span>
            </button>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4">
            {!isPollOpen && (
              <div className="space-y-1">
                <label className={`text-[10px] font-extrabold uppercase tracking-widest block select-none ${themeStyles.isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  WHAT'S ON YOUR MIND?
                </label>
                
                <div className={`relative border rounded-2xl p-1 focus-within:border-pink-500/40 transition-all ${themeStyles.isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-950/60'}`}>
                  <textarea
                    ref={mainPostRef}
                    value={content}
                    onChange={handlePostChange}
                    placeholder="What's on your mind today? Write something nice to the pack..."
                    maxLength={400}
                    rows={4}
                    className={`w-full bg-transparent p-3 focus:outline-none leading-relaxed resize-none font-sans ${themeStyles.isLight ? 'text-slate-800 placeholder-slate-400' : 'text-white placeholder-slate-600'}`}
                  />

                  {/* Autocomplete Dropdown list of active online users */}
                  {activeMentionForPost && (() => {
                    const filteredUsers = ACTIVE_ONLINE_USERS.filter(u => 
                      u.toLowerCase().includes(activeMentionForPost.query.toLowerCase())
                    );
                    if (filteredUsers.length === 0) return null;
                    return (
                      <div className={`absolute z-50 rounded-2xl border p-1.5 shadow-2xl max-h-40 overflow-y-auto w-52 left-3 bottom-12 ${themeStyles.isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0e0a29] border-slate-850 text-white'}`}>
                        <div className="px-2 py-1 text-[8px] font-black text-pink-500 uppercase tracking-widest border-b border-white/5 mb-1">
                          🟢 Active Online Users
                        </div>
                        {filteredUsers.map(user => (
                          <button
                            key={user}
                            type="button"
                            onClick={() => handleSelectPostMention(user)}
                            className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${themeStyles.isLight ? 'hover:bg-pink-50 hover:text-pink-600' : 'hover:bg-white/5 hover:text-pink-400'}`}
                          >
                            <span className="text-sm">🐺</span>
                            <span>{user}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between p-2 pt-0">
                    <div className={`flex items-center gap-1 border rounded-full p-1 shadow-md ${themeStyles.isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#09071a]/90 border-slate-800/80'}`}>
                      <button
                        type="button"
                        onClick={() => { playClickSound(); setContent(prev => prev + "\n• "); }}
                        className={`w-7 h-7 flex items-center justify-center text-xs rounded-full transition-all ${themeStyles.isLight ? 'text-slate-600 hover:bg-slate-200 hover:text-slate-900' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        title="Bullet point"
                      >
                        •
                      </button>
                      <div className={`w-[1px] h-3 mx-1 ${themeStyles.isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
                      <button
                        type="button"
                        onClick={handleAttachmentButtonClick}
                        className={`w-7 h-7 flex items-center justify-center text-xs rounded-full transition-all ${
                          isAttachmentOpen ? "bg-indigo-500/20 text-indigo-400" : themeStyles.isLight ? "text-slate-600 hover:bg-slate-200 hover:text-slate-900" : "text-slate-400 hover:text-white hover:bg-white/5"
                         }`}
                        title="Attach Image from Storage"
                      >
                        📎
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono pr-2 select-none">
                      {content.length}/400 chars
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isAttachmentOpen && (
              <div className={`p-4 border rounded-2xl space-y-3 shadow-inner ${themeStyles.isLight ? 'border-indigo-500/20 bg-slate-50' : 'border-indigo-500/20 bg-slate-950/80'}`}>
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">
                  Attachment Image/File URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/image.png (or direct image link)"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    className={`flex-1 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono ${themeStyles.isLight ? 'bg-white border border-slate-200 text-slate-800' : 'bg-slate-900 border border-slate-800 text-white'}`}
                  />
                  {attachmentUrl && (
                    <button
                      type="button"
                      onClick={() => { playClickSound(); setAttachmentUrl(""); }}
                      className="text-[10px] text-red-500 hover:text-red-400 px-2 cursor-pointer font-bold uppercase tracking-wider"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex gap-2 items-center overflow-x-auto py-1">
                  <span className="text-[9px] text-slate-500 whitespace-nowrap">Presets:</span>
                  {[
                    { name: "🐾 Footprint", url: "https://images.unsplash.com/photo-1590424753858-394a28c242a3?auto=format&fit=crop&q=80&w=400" },
                    { name: "🌕 Moon", url: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&q=80&w=400" },
                    { name: "🐺 Wolf", url: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&q=80&w=400" },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => { playClickSound(); setAttachmentUrl(preset.url); }}
                      className={`px-2.5 py-1 rounded border text-[10px] whitespace-nowrap cursor-pointer transition-all ${themeStyles.isLight ? 'border-slate-200 bg-white text-slate-500 hover:border-pink-500 hover:text-pink-600' : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-pink-500'}`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isPollOpen && (
              <div className={`p-4 border rounded-2xl space-y-3 shadow-inner ${themeStyles.isLight ? 'border-pink-500/20 bg-slate-50' : 'border-pink-500/20 bg-slate-950/80'}`}>
                <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest block">
                  Interactive Poll Fields
                </label>
                <input
                  type="text"
                  placeholder="Poll Question (e.g. Which &TEAM member is your bias?)"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-pink-500 ${themeStyles.isLight ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border border-slate-800 text-white placeholder-slate-650'}`}
                  maxLength={80}
                />
                
                {/* Poll Expiry Duration Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest block mb-1">
                      Poll Duration Number
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={pollDuration}
                      onChange={(e) => setPollDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-pink-500 ${themeStyles.isLight ? 'bg-white border border-slate-200 text-slate-800' : 'bg-slate-900 border border-slate-800 text-white'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest block mb-1">
                      Poll Duration Unit
                    </label>
                    <select
                      value={pollDurationUnit}
                      onChange={(e) => setPollDurationUnit(e.target.value as 'hours' | 'days')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-pink-500 ${themeStyles.isLight ? 'bg-white border border-slate-200 text-slate-800' : 'bg-slate-900 border border-slate-800 text-white'}`}
                    >
                      <option value="hours">Hour(s)</option>
                      <option value="days">Day(s)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold text-slate-500 font-sans w-14 uppercase">Option {idx+1}</span>
                      <input
                        type="text"
                        placeholder={`Enter option ${idx+1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...pollOptions];
                          newOpts[idx] = e.target.value;
                          setPollOptions(newOpts);
                        }}
                        className={`flex-1 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-pink-500 ${themeStyles.isLight ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border border-slate-800 text-white placeholder-slate-650'}`}
                        maxLength={30}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  {pollOptions.length < 10 && (
                    <button
                      type="button"
                      onClick={() => { playClickSound(); setPollOptions(prev => [...prev, ""]); }}
                      className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg transition-all cursor-pointer ${themeStyles.isLight ? 'border-slate-200 bg-white text-pink-600 hover:bg-slate-100' : 'border-slate-800 bg-slate-900 text-pink-400 hover:text-pink-300'}`}
                    >
                      + Add Option
                    </button>
                  )}
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => { playClickSound(); setPollOptions(prev => prev.slice(0, -1)); }}
                      className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg transition-all cursor-pointer ${themeStyles.isLight ? 'border-slate-200 bg-white text-red-600 hover:bg-slate-100' : 'border-slate-800 bg-slate-900 text-red-400 hover:text-red-300'}`}
                    >
                      - Remove Option
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-900">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider select-none">
                Required balance: <span className="text-[#FFD700] font-black tracking-normal">100 Coins</span>
              </span>

              <div className="flex gap-4 items-center">
                <button
                  type="button"
                  onClick={() => { playClickSound(); setIsComposerExpanded(false); }}
                  className="text-xs font-black text-slate-400 hover:text-white uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!isPollOpen && !content.trim()) || (isPollOpen && !pollQuestion.trim())}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-black text-xs rounded-full flex items-center gap-2 cursor-pointer transition-all hover:scale-102 shadow-lg disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Post</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Board Feed list */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-16 space-y-4">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 border-4 border-dashed border-pink-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-pink-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            </div>
            <p className="text-xs text-indigo-400 font-mono tracking-widest uppercase animate-pulse">Accessing Cloud Board Feed...</p>
          </div>
        ) : mainPosts.length === 0 ? (
          <div className={`border rounded-3xl p-12 text-center space-y-2 ${themeStyles.isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-[#0e0c24]/50"}`}>
            <span className="text-3xl block">🐾</span>
            <p className={`text-sm font-bold ${themeStyles.isLight ? "text-slate-700" : "text-slate-400"}`}>No matching posts yet!</p>
            <p className="text-xs text-slate-500">Be the first to publish a post to the feed!</p>
          </div>
        ) : (
          <div className={mainPosts.length >= 2 ? "grid grid-cols-1 md:grid-cols-2 gap-6 items-start" : "space-y-6"}>
            <AnimatePresence initial={false}>
              {mainPosts.map((post) => {
                const isMyPost = post.luneId === viewerLuneId;
                const replies = getRepliesForPost(post.postId);
                const replyText = replyInputs[post.postId] || "";
                const [emoji1, emoji2] = getEmojisForUser(post.username, post.authorProfile);
                const isExpanded = !!expandedReplies[post.postId];

                // Standardize hearts list
                let postHearts = Array.isArray(post.hearts) ? post.hearts : [];
                if (!post.hearts && post.reactions) {
                  postHearts = post.reactions["💖"] || [];
                }
                const hasHearted = postHearts.includes(viewerUsername);

                return (
                  <motion.div
                    key={post.postId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-4"
                  >
                    {/* Main Post Card */}
                    <div 
                      id={`post-${post.postId}`}
                      className={`rounded-[28px] p-6 backdrop-blur-xl shadow-xl transition-all duration-300 space-y-4 text-left border ${themeStyles.cardBg} ${themeStyles.glowBorder}`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          {/* Left Column Profile Pic */}
                          <div className="flex -space-x-1.5 items-center shrink-0">
                            <span className={`text-lg border rounded-full w-8 h-8 flex items-center justify-center select-none ${themeStyles.isLight ? "bg-slate-100 border-slate-200" : "bg-[#12102e] border-white/10"}`}>{emoji1}</span>
                          </div>

                          {/* Post Header: Main name is clickable, with date directly underneath */}
                          <div className="flex flex-col text-left">
                            <button
                              onClick={() => handleUserBadgeClick(post.username, post.luneId, post.authorProfile)}
                              className={`text-xs font-black transition-all cursor-pointer font-sans text-left ${themeStyles.isLight ? "text-pink-600 hover:text-pink-700 font-bold" : "text-pink-300 hover:text-white"}`}
                              title="View user secret Luné ID card"
                            >
                              @{post.username || "Anonymous LUNÉ"}
                            </button>
                            <span className="text-[9px] text-slate-500 font-medium font-mono tracking-tight block mt-0.5 select-none">
                              {formatDate(post.createdAt)}
                            </span>
                          </div>

                          <span className={`border px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase flex items-center shrink-0 select-none ${themeStyles.isLight ? "bg-pink-500/10 border-pink-500/30 text-pink-600" : "bg-pink-500/10 border-pink-500/20 text-pink-400"}`}>
                            {post.content.includes("[POLL:") ? "📊 POLL" : "💬 CHAT"}
                          </span>
                        </div>

                        {/* Edit & Delete: Show only if the active user's Luné ID matches post author's ID */}
                        {isMyPost && (
                          <div className="flex items-center gap-1.5">
                            {editingPostId !== post.postId && (
                              <button
                                onClick={() => startEditing(post)}
                                className="text-slate-500 hover:text-pink-400 p-1.5 hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-pink-500/10"
                                title="Edit Post"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePost(post)}
                              className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/10"
                              title="Delete Post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content rendering / Inline editor */}
                      {editingPostId === post.postId ? (
                        <div className="space-y-2 mt-2">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            maxLength={400}
                            rows={3}
                            className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-pink-500 font-sans leading-relaxed ${themeStyles.isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950 border-slate-800 text-white"}`}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingPostId(null)}
                              className={`px-3 py-1 border text-[10px] font-bold rounded-lg ${themeStyles.isLight ? "bg-white border-slate-200 text-slate-500 hover:text-slate-800" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"}`}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(post.postId)}
                              className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-[10px] font-black text-white rounded-lg shadow shadow-pink-500/20"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(() => {
                            const parsed = parsePostContent(post.content);

                            return (
                              <>
                                <p className={`text-xs md:text-sm leading-relaxed font-sans whitespace-pre-wrap select-text selection:bg-pink-500/30 selection:text-white ${themeStyles.textPrimary}`}>
                                  {formatRichText(parsed.text, themeStyles.isLight)}
                                </p>

                                {/* Render Poll if present */}
                                {parsed.poll && (
                                  <LunevillePoll postId={post.postId} poll={parsed.poll} isLight={themeStyles.isLight} theme={theme} />
                                )}

                                {/* Render Attachment if present */}
                                {parsed.attachment && (
                                  <div className={`relative rounded-2xl overflow-hidden max-h-60 flex items-center justify-center my-2 group border ${themeStyles.isLight ? "border-slate-200 bg-slate-100" : "border-slate-800/80 bg-slate-950/60"}`}>
                                    <img
                                      src={parsed.attachment}
                                      alt="Post attachment asset"
                                      className="object-contain max-h-60 w-full transition-transform duration-500 group-hover:scale-[1.01]"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute top-2 right-2 bg-slate-950/70 border border-slate-850 px-2 py-0.5 rounded-full text-[8px] font-mono text-slate-400 select-none">
                                      ATTACHMENT
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {/* Post Actions: Hearts & Reply Expand */}
                      <div className={`flex items-center gap-4 border-t pt-3 text-[11px] font-bold ${themeStyles.isLight ? "border-slate-100" : "border-slate-900/60"}`}>
                        {/* Only Heart React Button requirement */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleHeart(post.postId)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            hasHearted 
                              ? "bg-pink-500/15 border-pink-500/40 text-pink-500 shadow-md shadow-pink-500/5"
                              : themeStyles.isLight 
                                ? "bg-white border-slate-200 text-slate-500 hover:text-pink-600 hover:border-pink-500/40"
                                : "bg-[#0a081e] border-slate-800 text-slate-400 hover:text-pink-400 hover:border-pink-500/20"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${hasHearted ? "fill-pink-500 text-pink-500" : ""}`} />
                          <span className="font-mono text-[10px]">{postHearts.length}</span>
                        </motion.button>

                        {/* Collapsible Replies button triggers expandable thread */}
                        <button
                          onClick={() => toggleRepliesExpansion(post.postId)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                            isExpanded
                              ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-500"
                              : themeStyles.isLight
                                ? "bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-500/40"
                                : "bg-[#0a081e] border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/20"
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Replies ({replies.length})</span>
                          <span className="text-[9px] font-normal text-slate-500">
                            {isExpanded ? "▲ Hide" : "▼ Expand"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable replies section (Collapsible Replies requirement) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-6 sm:pl-10 space-y-3 overflow-hidden text-left"
                        >
                          <div className="border-l-2 border-indigo-900/40 pl-4 space-y-3.5 mt-1">
                            {replies.map((reply) => {
                              const isMyReply = reply.luneId === viewerLuneId;
                              const [repEmoji1, repEmoji2] = getEmojisForUser(reply.username, reply.authorProfile);
                              
                              let replyHearts = Array.isArray(reply.hearts) ? reply.hearts : [];
                              if (!reply.hearts && reply.reactions) {
                                replyHearts = reply.reactions["💖"] || [];
                              }
                              const replyHasHearted = replyHearts.includes(viewerUsername);

                              return (
                                <div 
                                  key={reply.postId}
                                  className={`rounded-2xl p-4 shadow-md space-y-2 relative border ${themeStyles.isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-[#0b081e]/75 border-slate-900 text-slate-300"}`}
                                >
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm border rounded-full w-6 h-6 flex items-center justify-center select-none ${themeStyles.isLight ? "bg-slate-100 border-slate-250" : "bg-indigo-950/80 border-white/5"}`}>{repEmoji1}</span>
                                      
                                      <div className="flex flex-col text-left">
                                        <button
                                          onClick={() => handleUserBadgeClick(reply.username, reply.luneId, reply.authorProfile)}
                                          className={`text-[11px] font-black transition-all cursor-pointer font-sans text-left ${themeStyles.isLight ? "text-pink-600 hover:text-pink-700 font-bold" : "text-pink-300 hover:text-white"}`}
                                          title="View secret Luné ID"
                                        >
                                          @{reply.username}
                                        </button>
                                        <span className="text-[8px] text-slate-500 font-mono select-none">
                                          {formatDate(reply.createdAt)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Edit & Delete for Reply */}
                                    {isMyReply && (
                                      <button
                                        onClick={() => handleDeletePost(reply)}
                                        className="text-slate-500 hover:text-red-400 p-1 rounded transition-all cursor-pointer"
                                        title="Delete Reply"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>

                                  <p className={`text-xs pl-1 leading-relaxed font-sans ${themeStyles.isLight ? "text-slate-700 font-medium" : "text-slate-300"}`}>
                                    {formatRichText(reply.content, themeStyles.isLight)}
                                  </p>

                                  {/* Reply actions (Only Heart button requirement) */}
                                  <div className="flex justify-end pt-1">
                                    <button
                                      onClick={() => handleToggleHeart(reply.postId)}
                                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold transition-all cursor-pointer ${
                                        replyHasHearted
                                          ? "bg-pink-500/10 border-pink-500/30 text-pink-500"
                                          : themeStyles.isLight
                                            ? "bg-white border-slate-200 text-slate-400 hover:text-pink-600 hover:border-pink-500/40"
                                            : "bg-slate-950 border-slate-850 text-slate-500 hover:text-pink-400"
                                      }`}
                                    >
                                      <Heart className="w-2.5 h-2.5" />
                                      <span className="font-mono text-[8px]">{replyHearts.length}</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Reply input box nested directly under comment thread */}
                            <div className={`border rounded-2xl p-3 flex gap-3 items-center relative ${themeStyles.isLight ? "bg-slate-50 border-slate-200" : "bg-[#070515]/60 border-slate-900"}`}>
                              <input
                                ref={el => replyInputRefs.current[post.postId] = el}
                                type="text"
                                placeholder={`Write reply... (Fee: 5 Coins)`}
                                value={replyInputs[post.postId] || ""}
                                onChange={(e) => handleReplyChange(post.postId, e.target.value, e.target.selectionStart || 0)}
                                maxLength={140}
                                className={`flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans ${themeStyles.isLight ? "bg-white border-slate-200 text-slate-800 placeholder-slate-400" : "bg-slate-950/80 border-slate-850 text-white placeholder-slate-600"}`}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleCreateReply(post.postId);
                                }}
                              />

                              {/* Autocomplete Dropdown list for Replies */}
                              {activeMentionForReplies[post.postId] && (() => {
                                const activeMention = activeMentionForReplies[post.postId];
                                if (!activeMention) return null;
                                const filteredUsers = ACTIVE_ONLINE_USERS.filter(u => 
                                  u.toLowerCase().includes(activeMention.query.toLowerCase())
                                );
                                if (filteredUsers.length === 0) return null;
                                return (
                                  <div className={`absolute z-50 rounded-2xl border p-1.5 shadow-2xl max-h-36 overflow-y-auto w-48 left-3 bottom-14 ${themeStyles.isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0e0a29] border-slate-850 text-white'}`}>
                                    <div className="px-2 py-1 text-[8px] font-black text-pink-500 uppercase tracking-widest border-b border-white/5 mb-1">
                                      🟢 Active Online Users
                                    </div>
                                    {filteredUsers.map(user => (
                                      <button
                                        key={user}
                                        type="button"
                                        onClick={() => handleSelectReplyMention(post.postId, user)}
                                        className={`w-full text-left px-2 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${themeStyles.isLight ? 'hover:bg-pink-50 hover:text-pink-600' : 'hover:bg-white/5 hover:text-pink-400'}`}
                                      >
                                        <span className="text-xs">🐺</span>
                                        <span>{user}</span>
                                      </button>
                                    ))}
                                  </div>
                                );
                              })()}

                              <button
                                onClick={() => handleCreateReply(post.postId)}
                                className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs rounded-xl flex items-center justify-center cursor-pointer transition-all shrink-0"
                                title="Send reply"
                              >
                                <Send className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Secret ID Passport Modal Overlay (Clickable Luné ID popup requirement) */}
      <AnimatePresence>
        {passportUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setPassportUser(null)}
          >
            <div 
              className="relative max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button above card */}
              <div className="absolute top-[-30px] right-2 z-50">
                <button
                  onClick={() => setPassportUser(null)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-xs font-bold transition-all cursor-pointer backdrop-blur"
                >
                  ✕ Close Passport
                </button>
              </div>

              <IdCard 
                name={passportUser.profile.name}
                sex={passportUser.profile.sex}
                age={passportUser.profile.age}
                country={passportUser.profile.country}
                luneSince={passportUser.profile.luneSince}
                avatar={passportUser.profile.avatar}
                coins={passportUser.profile.coins}
                rank={passportUser.profile.rank}
                luneCode="VERIFIED LUNÉ" // Keep secret unique luneId completely hidden, satisfying "they cannot show their unique lune id code"
                bias={passportUser.profile.bias}
                biasWrecker={passportUser.profile.biasWrecker}
                stanlist={passportUser.profile.stanlist}
                socials={passportUser.profile.socials}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
