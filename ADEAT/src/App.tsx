import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  MoreVertical,
  Clock,
} from "lucide-react";
import {
  RichTextEditor,
  RichTextEditorRef,
} from "./components/RichTextEditor";
import { FormatToolbar } from "./components/FormatToolbar";
import { FormattingPanel } from "./components/FormattingPanel";
import { BottomNav } from "./components/BottomNav";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { Welcome } from "./components/Welcome";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { CloudSyncIndicator } from "./components/CloudSyncIndicator";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import { Button } from "./components/ui/button";
import { toast, Toaster } from "sonner@2.0.3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { createClient } from "@supabase/supabase-js";
import {
  projectId,
  publicAnonKey,
} from "./utils/supabase/info";

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-bd1430c4`;

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

type View = "list" | "editor";
type Tab = "notes" | "profile" | "settings";
type AuthView = "welcome" | "signin" | "signup";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("welcome");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<View>("list");
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [isSearching, setIsSearching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<
    number | undefined
  >(undefined);
  const [accessToken, setAccessToken] = useState<string | null>(
    null,
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<RichTextEditorRef>(null);
  const editorElementRef = useRef<HTMLDivElement | null>(null);
  const syncIntervalRef = useRef<number | null>(null);

  // Update editor element ref when editor is mounted
  useEffect(() => {
    if (editorRef.current) {
      editorElementRef.current =
        editorRef.current.getEditorElement();
    }
  }, [selectedNoteId]);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          setAccessToken(session.access_token);
          setUserId(session.user.id);
          setUserName(session.user.user_metadata?.name || "");
          setUserEmail(session.user.email || "");
          setIsAuthenticated(true);

          // Load notes after authentication
          await fetchNotes(session.access_token);
        }
      } catch (error) {
        console.log("Session check error:", error);
      }
    };

    checkSession();

    const savedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle(
        "dark",
        savedTheme === "dark",
      );
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark",
    );
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Set up real-time sync polling
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Poll for updates every 5 seconds
      syncIntervalRef.current = window.setInterval(() => {
        fetchNotes(accessToken, true); // Silent fetch
      }, 5000);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated, accessToken]);

  const fetchNotes = async (token: string, silent = false) => {
    try {
      if (!silent) setIsSyncing(true);

      const response = await fetch(`${API_BASE}/notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
        setLastSyncTime(Date.now());
      } else {
        const error = await response.json();
        console.log("Failed to fetch notes:", error);
      }
    } catch (error) {
      console.log("Error fetching notes:", error);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  const handleSignIn = async (
    email: string,
    password: string,
  ) => {
    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        toast.error(error.message || "Sign in failed");
        return;
      }

      if (data.session?.access_token) {
        setAccessToken(data.session.access_token);
        setUserId(data.user.id);
        setUserName(data.user.user_metadata?.name || "");
        setUserEmail(data.user.email || "");

        // Store in localStorage for profile
        localStorage.setItem(
          "userName",
          data.user.user_metadata?.name || "",
        );
        localStorage.setItem(
          "userEmail",
          data.user.email || "",
        );
        if (!localStorage.getItem("memberSince")) {
          localStorage.setItem(
            "memberSince",
            new Date().toISOString(),
          );
        }

        setIsAuthenticated(true);
        toast.success("Welcome back!");

        // Fetch notes after sign in
        await fetchNotes(data.session.access_token);
      }
    } catch (error) {
      console.log("Sign in error:", error);
      toast.error("An error occurred during sign in");
    }
  };

  const handleSignUp = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      // Create user via server
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Sign up failed");
        return;
      }

      // Now sign in with the new credentials
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        toast.error(
          "Account created but sign in failed. Please sign in manually.",
        );
        setAuthView("signin");
        return;
      }

      if (signInData.session?.access_token) {
        setAccessToken(signInData.session.access_token);
        setUserId(signInData.user.id);
        setUserName(name);
        setUserEmail(email);

        // Store in localStorage for profile
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        localStorage.setItem(
          "memberSince",
          new Date().toISOString(),
        );

        setIsAuthenticated(true);
        toast.success("Account created successfully!");

        // Fetch notes (will be empty for new user)
        await fetchNotes(signInData.session.access_token);
      }
    } catch (error) {
      console.log("Sign up error:", error);
      toast.error("An error occurred during sign up");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAccessToken(null);
      setUserId(null);
      setUserName("");
      setUserEmail("");
      setIsAuthenticated(false);
      setAuthView("welcome");
      setNotes([]);
      setSelectedNoteId(null);
      setCurrentView("list");
      setActiveTab("notes");

      // Clear sync interval
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }

      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  const createNote = async () => {
    if (!accessToken) return;

    try {
      setIsSyncing(true);

      const response = await fetch(`${API_BASE}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: "",
          content: "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        setSelectedNoteId(data.note.id);
        setCurrentView("editor");
        setLastSyncTime(Date.now());
        toast.success("New note created");
      } else {
        const error = await response.json();
        console.log("Failed to create note:", error);
        toast.error("Failed to create note");
      }
    } catch (error) {
      console.log("Error creating note:", error);
      toast.error("Error creating note");
    } finally {
      setIsSyncing(false);
    }
  };

  const updateNote = async (
    id: string,
    updates: Partial<Note>,
  ) => {
    if (!accessToken) return;

    // Optimistically update UI
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, ...updates } : note,
      ),
    );

    try {
      setIsSyncing(true);

      const response = await fetch(`${API_BASE}/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(
          notes.map((note) =>
            note.id === id ? data.note : note,
          ),
        );
        setLastSyncTime(Date.now());
      } else {
        const error = await response.json();
        console.log("Failed to update note:", error);
        toast.error("Failed to sync changes");
      }
    } catch (error) {
      console.log("Error updating note:", error);
      toast.error("Error syncing changes");
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/notes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const updatedNotes = notes.filter(
          (note) => note.id !== id,
        );
        setNotes(updatedNotes);
        if (selectedNoteId === id) {
          setSelectedNoteId(null);
          setCurrentView("list");
        }
        toast.success("Note deleted");
      } else {
        const error = await response.json();
        console.log("Failed to delete note:", error);
        toast.error("Failed to delete note");
      }
    } catch (error) {
      console.log("Error deleting note:", error);
      toast.error("Error deleting note");
    }
  };

  const clearAllNotes = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/notes`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setNotes([]);
        setSelectedNoteId(null);
        setCurrentView("list");
        setActiveTab("notes");
        toast.success("All notes cleared");
      } else {
        const error = await response.json();
        console.log("Failed to clear notes:", error);
        toast.error("Failed to clear notes");
      }
    } catch (error) {
      console.log("Error clearing notes:", error);
      toast.error("Error clearing notes");
    }
  };

  const selectNote = (id: string) => {
    setSelectedNoteId(id);
    setCurrentView("editor");
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "notes" && currentView === "editor") {
      setCurrentView("list");
    }
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query),
    );
  }, [notes, searchQuery]);

  const selectedNote =
    notes.find((note) => note.id === selectedNoteId) || null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours =
      (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const getPlainText = (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const getPreview = (html: string) => {
    const text = getPlainText(html);
    return text.length > 80
      ? text.substring(0, 80) + "..."
      : text;
  };

  const getTotalWords = () => {
    return notes.reduce((total, note) => {
      const text = getPlainText(note.content);
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      return total + words.length;
    }, 0);
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleImageInsert = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file && selectedNote && accessToken) {
      try {
        toast.loading("Uploading image...");

        // Upload to server
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `${API_BASE}/images/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          },
        );

        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.url;

          const imageHtml = `
            <div class="image-wrapper" style="position: relative; display: inline-block; margin: 16px 0; max-width: 100%;">
              <img src="${imageUrl}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
              <button class="remove-image-btn" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; line-height: 1;">×</button>
            </div>
          `;

          document.execCommand("insertHTML", false, imageHtml);

          const editorContent = document.querySelector(
            "[contenteditable]",
          ) as HTMLDivElement;
          if (editorContent) {
            updateNote(selectedNote.id, {
              content: editorContent.innerHTML,
              updatedAt: Date.now(),
            });
          }
          toast.success("Image uploaded");
        } else {
          const error = await response.json();
          console.log("Image upload failed:", error);
          toast.error("Failed to upload image");
        }
      } catch (error) {
        console.log("Error uploading image:", error);
        toast.error("Error uploading image");
      }
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Authentication Views
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Toaster position="top-center" richColors />
        <div className="w-full max-w-[430px] h-[932px] bg-white shadow-2xl rounded-[60px] overflow-hidden flex flex-col relative border-8 border-slate-900">
          <div className="h-11 bg-white flex items-center justify-center">
            <div className="text-slate-900">9:41</div>
          </div>

          <div className="flex-1 overflow-hidden">
            {authView === "welcome" && (
              <Welcome
                onGetStarted={() => setAuthView("signin")}
              />
            )}
            {authView === "signin" && (
              <SignIn
                onSignIn={handleSignIn}
                onBack={() => setAuthView("welcome")}
                onSwitchToSignUp={() => setAuthView("signup")}
              />
            )}
            {authView === "signup" && (
              <SignUp
                onSignUp={handleSignUp}
                onBack={() => setAuthView("welcome")}
                onSwitchToSignIn={() => setAuthView("signin")}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Profile Tab
  if (activeTab === "profile") {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <Toaster position="top-center" richColors />
        <div
          className={`w-full max-w-[430px] h-[932px] shadow-2xl rounded-[60px] overflow-hidden flex flex-col relative border-8 ${
            theme === "dark"
              ? "bg-slate-950 border-slate-800"
              : "bg-white border-slate-900"
          }`}
        >
          <div
            className={`h-11 flex items-center justify-center ${theme === "dark" ? "bg-slate-950" : "bg-white"}`}
          >
            <div
              className={
                theme === "dark"
                  ? "text-white"
                  : "text-slate-900"
              }
            >
              9:41
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <Profile
              notesCount={notes.length}
              totalWords={getTotalWords()}
            />
            <BottomNav
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
        </div>
      </div>
    );
  }

  // Settings Tab
  if (activeTab === "settings") {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <Toaster position="top-center" richColors />
        <div
          className={`w-full max-w-[430px] h-[932px] shadow-2xl rounded-[60px] overflow-hidden flex flex-col relative border-8 ${
            theme === "dark"
              ? "bg-slate-950 border-slate-800"
              : "bg-white border-slate-900"
          }`}
        >
          <div
            className={`h-11 flex items-center justify-center ${theme === "dark" ? "bg-slate-950" : "bg-white"}`}
          >
            <div
              className={
                theme === "dark"
                  ? "text-white"
                  : "text-slate-900"
              }
            >
              9:41
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <Settings
              onClearAllNotes={clearAllNotes}
              onLogout={handleLogout}
              theme={theme}
              onThemeChange={setTheme}
            />
            <BottomNav
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
        </div>
      </div>
    );
  }

  // Notes List View
  if (currentView === "list") {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <Toaster position="top-center" richColors />
        <div
          className={`w-full max-w-[430px] h-[932px] shadow-2xl rounded-[60px] overflow-hidden flex flex-col relative border-8 ${
            theme === "dark"
              ? "bg-slate-950 border-slate-800"
              : "bg-white border-slate-900"
          }`}
        >
          <div
            className={`h-11 flex items-center justify-center ${theme === "dark" ? "bg-slate-950" : "bg-white"}`}
          >
            <div
              className={
                theme === "dark"
                  ? "text-white"
                  : "text-slate-900"
              }
            >
              9:41
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-violet-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900">
            <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-pink-200 dark:border-purple-900/50 shadow-sm">
              <div className="px-6 py-4">
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsSearching(false);
                        setSearchQuery("");
                      }}
                      className="p-2"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                    <Input
                      type="text"
                      placeholder="Search notes..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      autoFocus
                      className="flex-1 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <h1 className="bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                      Notes
                    </h1>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSearching(true)}
                        className="p-2"
                      >
                        <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {notes.length > 0 && !isSearching && (
                <div className="px-6 pb-3 text-slate-500 dark:text-slate-400">
                  {notes.length}{" "}
                  {notes.length === 1 ? "note" : "notes"}
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 smooth-scroll">
              {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 via-purple-100 to-violet-100 dark:from-pink-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
                    <svg
                      className="w-10 h-10 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-slate-900 dark:text-white mb-2">
                    No notes yet
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {searchQuery
                      ? "No notes match your search"
                      : "Create your first note to get started"}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredNotes.map((note, index) => (
                    <div
                      key={note.id}
                      onClick={() => selectNote(note.id)}
                      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-pink-200 dark:border-purple-900/50 hover:shadow-lg hover:border-purple-300 dark:hover:border-pink-900/50 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationDuration: "400ms",
                        animationFillMode: "backwards",
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-slate-900 dark:text-white pr-2 line-clamp-1 flex-1">
                          {note.title || "Untitled Note"}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-slate-400 transition-all hover:scale-110"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="dark:bg-slate-900 dark:border-slate-800"
                          >
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNote(note.id);
                              }}
                              className="text-red-600 dark:text-red-400"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {note.content && (
                        <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                          {getPreview(note.content)}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formatDate(note.updatedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <button
              onClick={createNote}
              className="absolute bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl hover:scale-110 active:scale-95 transition-all animate-pulse"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>

          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    );
  }

  // Editor View
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <Toaster position="top-center" richColors />
      <div
        className={`w-full max-w-[430px] h-[932px] shadow-2xl rounded-[60px] overflow-hidden flex flex-col relative border-8 ${
          theme === "dark"
            ? "bg-slate-950 border-slate-800"
            : "bg-white border-slate-900"
        }`}
      >
        <div
          className={`h-11 flex items-center justify-center ${theme === "dark" ? "bg-slate-950" : "bg-white"}`}
        >
          <div
            className={
              theme === "dark" ? "text-white" : "text-slate-900"
            }
          >
            9:41
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-pink-50/30 via-purple-50/30 to-white dark:from-slate-950 dark:via-purple-950/10 dark:to-slate-950">
          <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-pink-200 dark:border-purple-900/50 shadow-sm">
            <div className="px-4 py-3 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView("list")}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Input
                type="text"
                value={selectedNote?.title || ""}
                onChange={(e) => {
                  if (selectedNote) {
                    updateNote(selectedNote.id, {
                      title: e.target.value,
                      updatedAt: Date.now(),
                    });
                  }
                }}
                placeholder="Note title..."
                className="flex-1 border-0 shadow-none focus-visible:ring-0 px-0 dark:bg-slate-950/0 dark:text-white bg-transparent"
              />
            </div>
            {selectedNote && (
              <div className="px-4 pb-2 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {formatDate(selectedNote.updatedAt)}
                  </span>
                </div>
                <CloudSyncIndicator
                  isSyncing={isSyncing}
                  lastSyncTime={lastSyncTime}
                />
              </div>
            )}
          </div>

          {selectedNote && (
            <>
              <div className="flex-1 overflow-auto smooth-scroll bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                <RichTextEditor
                  ref={editorRef}
                  content={selectedNote.content}
                  onChange={(content) => {
                    updateNote(selectedNote.id, {
                      content,
                      updatedAt: Date.now(),
                    });
                  }}
                  placeholder="Start typing..."
                />
              </div>
              <FormattingPanel
                onFormat={handleFormat}
                editorRef={editorElementRef}
              />
              <FormatToolbar
                onFormat={handleFormat}
                onImageInsert={handleImageInsert}
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </>
          )}
        </div>

        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}