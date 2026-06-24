import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCopy, FiPlus, FiTrash2,FiCheck } from "react-icons/fi";
import axios from "axios";

const Builder = ({ user, setUser }) => {
  const THEMES = ["light", "dark", "glass", "neon"];
  const TONES = ["friendly", "professional", "sales"];

  const [editAssistant, setEditAssistant] = useState(!user?.isSetupComplete);

  const [assistantName, setAssistantName] = useState("");
  const [buisnessName, setBuisnessName] = useState("");
  const [buisnessType, setBuisnessType] = useState("");
  const [buisnessDescription, setBuisnessDescription] = useState("");
  const [theme, setTheme] = useState("dark");
  const [tone, setTone] = useState("friendly");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [pages, setPages] = useState([]);

  const [pageName, setPageName] = useState("");
  const [pagePath, setPagePath] = useState("");
  const [pageKeywords, setPageKeywords] = useState("");

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (user) {
      setAssistantName(user?.assistantName || "");
      setBuisnessName(user?.buisnessName || "");
      setBuisnessType(user?.buisnessType || "");
      setBuisnessDescription(user?.buisnessDescription || "");
      setTheme(user?.theme || "dark");
      setTone(user?.tone || "friendly");
      setGeminiApiKey(user?.geminiApiKey || "");
      setPages(user?.pages || []);
    }
  }, [user]);

  const addPages = () => {
    if (!pageName || !pagePath) {
      toast.error("Page name and path are required");
      return;
    }

    const newPage = {
      name: pageName,
      path: pagePath,
      keywords: pageKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k !== ""),
    };

    setPages([...pages, newPage]);

    setPageName("");
    setPagePath("");
    setPageKeywords("");
  };

  const removePage = (index) => {
    const updatedPages = pages.filter((_, i) => i !== index);
    setPages(updatedPages);
  };

  const saveAssistant = async () => {
    setLoading(true);

    try {
      const data = {
        assistantName,
        buisnessName,
        buisnessType,
        buisnessDescription,
        tone,
        theme,
        geminiApiKey,
        pages,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/user/save-assistant`,
        data,
        {
          withCredentials: true,
        },
      );

      setUser(res.data.data.user);
      console.log(res.data.data.user)
      setEditAssistant(false);

      toast.success("Assistant saved successfully");
    } catch (error) {
      console.log(
        "Error while assistant creation:",
        error?.response?.data || error.message,
      );

      toast.error("Failed to save assistant");
    } finally {
      setLoading(false);
    }
  };

  const embedCode = `<script src="${import.meta.env.VITE_CLIENT_URL}/assistant.js" data-user-id="${user?._id}"></script>`;



  const remainingMessages = Math.max(
    0,
    (user?.requestLimit || 0) - (user?.totalMessages || 0),
  );


  const remainingDays = user?.proExpiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.proExpiresAt) - new Date()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#081028]">
            Assistant Builder
          </h2>

          <p className="text-gray-500 mt-1">Customize your virtual assistant</p>
        </div>

        {user.isSetupComplete && !editAssistant && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
            <p className="text-sm text-gray-400">Assistant</p>

            <h2 className="text-3xl font-bold text-[#081028] mt-1">
              {user.assistantName}
            </h2>

            <p className="text-gray-500 mt-3 leading-7">
              Your assistant is ready to use on your website.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="rounded-2xl border border-gray-100 bg-[#f8fafc] p-4">
                <p className="text-sm text-gray-400">Current Plan</p>
                <h2 className="text-xl font-bold text-[#081028] mt-1 capitalize">
                  {user?.plan}
                </h2>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#f8fafc] p-4">
                <p className="text-sm text-gray-400">Gemini Status</p>
                <h2
                  className={`text-xl font-bold mt-1 capitalize ${
                    user?.geminiStatus === "active"
                      ? "text-emerald-600"
                      : user?.geminiStatus === "invalid"
                        ? "text-red-500"
                        : "text-amber-500"
                  }`}>
                  {user?.geminiStatus}
                </h2>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#f8fafc] p-4">
                <p className="text-sm text-gray-400">
                  {user?.plan === "free" ? "Messages Left" : "Plan Expiry"}
                </p>

                <h2 className="text-xl font-bold text-[#081028] mt-1 capitalize">
                  {user?.plan === "free"
                    ? remainingMessages
                    : `${remainingDays} Days`}
                </h2>
              </div>
            </div>

            <div className="mt-7">
              <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  Where to paste this script?
                </p>
                <p className="text-sm text-amber-700 mt-2 leading-6">
                  Paste this script before the closing{" "}
                  <span className="font-semibold">{"</body>"}</span> tag of your
                  website HTML file.
                  <br />
                  <br />
                  Example:
                </p>

                <pre className="mt-3 bg-[#0b1020] text-emerald-400 rounded-xl p-3 text-xs font-mono overflow-x-auto">
                  {`<body>

  Your Website Content

  <script src="${import.meta.env.VITE_CLIENT_URL}/assistant.js" data-user-id="${user?._id}"></script>

</body>`}
                </pre>
              </div>
              <p className="text-sm mt-3 font-medium text-[#081028] mb-3">
                {" "}
                Embed Code
              </p>
            </div>
            <div className="relative">
              <textarea
                readOnly
                value={embedCode}
                className="w-full h-20 bg-[#0b1020] text-emerald-400 rounded-2xl p-4 text-sm font-mono resize-none outline-none  overflow-x-auto"
              />

              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(embedCode);
                    toast.success("Script Copied");

                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (error) {
                    toast.error("Failed to copy");
                  }
                }}
                className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                  copied
                    ? "bg-emerald-500 text-white border-emerald-500 scale-105"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:scale-95"
                }`}>
                {copied ? (
                  <FiCheck className="w-5 h-5" />
                ) : (
                  <FiCopy className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              onClick={() => setEditAssistant(true)}
              className="mt-6 h-12 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-medium">
              Edit Assistant
            </button>
          </div>
        )}

        {editAssistant && (
          <div className="space-y-6">
            {/* BASIC INFO */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-5">Basic Information</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Assistant Name"
                  onChange={(e) => setAssistantName(e.target.value)}
                  value={assistantName}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="buisness Name"
                  onChange={(e) => setBuisnessName(e.target.value)}
                  value={buisnessName}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="buisness Type"
                  onChange={(e) => setBuisnessType(e.target.value)}
                  value={buisnessType}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3"
                />

                <textarea
                  rows={4}
                  placeholder="buisness Description"
                  value={buisnessDescription}
                  onChange={(e) => setBuisnessDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 resize-none"
                />
              </div>
            </div>

            {/* APPEARANCE */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-5">Appearance</h2>

              <div>
                <label className="text-sm text-gray-600 mb-3 block">
                  Theme
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {THEMES.map((item) => (
                    <button
                      key={item}
                      onClick={() => setTheme(item)}
                      className={`py-3 rounded-2xl border-2 capitalize transition-all ${
                        theme === item
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200"
                      }`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm text-gray-600 mb-3 block">Tone</label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TONES.map((item) => (
                    <button
                      key={item}
                      onClick={() => setTone(item)}
                      className={`py-3 rounded-2xl border-2 capitalize transition-all ${
                        tone === item
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200"
                      }`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* API KEY */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold">Gemini API Key</h2>

                  <p className="text-sm text-gray-400 mt-1">
                    Add your Gemini API key to power your assistant
                  </p>
                </div>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-[1.02] transition-all px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-emerald-500 text-white text-sm font-medium">
                  Get API Key
                </a>
              </div>

              <input
                type="password"
                placeholder="AIza..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3"
              />

              <p className="text-xs text-gray-400 mt-3 leading-6">
                Your API key is securely stored and only used for AI responses.
              </p>
            </div>

            {/* PAGES */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold">Navigation Pages</h2>

                  <p className="text-sm text-gray-400">
                    Assistant can redirect users
                  </p>
                </div>

                <button
                  onClick={addPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-emerald-500 text-white text-sm">
                  <FiPlus />
                  Add
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Page Name"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  className="border border-gray-200 rounded-2xl px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="/pricing"
                  value={pagePath}
                  onChange={(e) => setPagePath(e.target.value)}
                  className="border border-gray-200 rounded-2xl px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="Pricing, Plans"
                  value={pageKeywords}
                  onChange={(e) => setPageKeywords(e.target.value)}
                  className="border border-gray-200 rounded-2xl px-4 py-3"
                />
              </div>

              <div className="mt-5 space-y-3">
                {pages.length > 0 ? (
                  pages.map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border border-gray-100 rounded-2xl p-4">
                      <div>
                        <p className="font-medium">{page.name}</p>

                        <p className="text-sm text-gray-400">{page.path}</p>

                        {page.keywords?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {page.keywords.map((keyword, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removePage(index)}
                        className="text-red-500 hover:text-red-700">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No pages added yet</p>
                )}
              </div>
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={saveAssistant}
              disabled={loading ||
              !assistantName||
              !buisnessName||
              !buisnessType||
              !buisnessDescription||
              !geminiApiKey}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:opacity-50">
              {loading
                ? "Saving..."
                : user?.isSetupComplete
                  ? "Update Assistant"
                  : "Save Assistant"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Builder;