import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import "github-markdown-css/github-markdown.css";
import axios from "axios";
import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { Copy, Download, Edit } from "lucide-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Long (1200+ words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken, isLoaded } = useAuth();

  const downloadMarkdown = () => {
    if (!content) return;

    const blob = new Blob([content], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${input || "article"}.md`;
    link.click();

    URL.revokeObjectURL(url);

    toast.success("Article downloaded");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!isLoaded) {
      toast.error("Authentication is still loading. Please wait.");
      return;
    }

    if (!input.trim()) {
      toast.error("Please enter an article topic.");
      return;
    }

    try {
      setLoading(true);

      const token = await getToken({
        skipCache: true,
      });

      if (!token) {
        toast.error("Unable to authenticate. Please sign in again.");
        return;
      }

      const { data } = await axios.post(
        "/api/ai/generate-article",
        {
          topic: input,
          length: selectedLength.length,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-lg font-semibold">Article Configuration</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Article Topic</p>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="The future of Artificial Intelligence..."
          className="w-full p-2 px-3 mt-2 rounded-md border border-gray-300 outline-none"
          required
        />

        <p className="mt-4 text-sm font-medium">Article Length</p>

        <div className="mt-3 flex gap-3 flex-wrap">
          {articleLength.map((item) => (
            <button
              type="button"
              key={item.text}
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-4 py-1 border rounded-full transition ${
                selectedLength.text === item.text
                  ? "bg-blue-50 text-blue-700 border-blue-500"
                  : "text-gray-500 border-gray-300"
              }`}>
              {item.text}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-8 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              Generating...
            </>
          ) : (
            <>
              <Edit className="w-5 h-5" />
              Generate Article
            </>
          )}
        </button>
      </form>

      {/* Right */}
      <div className="w-full flex-1 bg-white rounded-xl border border-gray-200 flex flex-col h-[700px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Edit className="w-5 h-5 text-[#4A7AFF]" />
            <h1 className="text-xl font-semibold">Generated Article</h1>
          </div>

          {content && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(content);
                  toast.success("Article copied");
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-100 transition">
                <Copy className="w-4 h-4" />
                Copy
              </button>

              <button
                onClick={downloadMarkdown}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white rounded-lg bg-gradient-to-r from-[#226BFF] to-[#65ADFF] hover:opacity-90 transition">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          )}
        </div>

        {!content ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400 text-center p-6">
            <Edit className="w-16 h-16 mb-4 text-gray-300" />

            <h2 className="text-lg font-semibold text-gray-700">
              No Article Generated
            </h2>

            <p className="mt-2">Enter a topic and click</p>

            <span className="mt-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium">
              Generate Article
            </span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-white">
            <article className="markdown-body max-w-none p-8">
              <Markdown>{content}</Markdown>
            </article>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;
