import { useAuth } from "@clerk/react";
import axios from "axios";
import { Edit, Hash, Sparkles } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "Lifestyle",
    "Education",
    "Travel",
    "Food",
  ];

  const [selectedCategory, setSelectedCategory] = useState("General");
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken, isLoaded } = useAuth();

  const downloadTitles = () => {
    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${input}-titles.txt`;
    a.click();

    URL.revokeObjectURL(url);

    toast.success("Downloaded");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/ai/generate-blog-title",
        {
          keyword: input,
          category: selectedCategory,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );
      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };
  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200">
        {/* Added flex utilities to keep icon and text on the same line */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 text-[#8e37eb]" />
          <h1 className="text-lg font-semibold">AI Title Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium"> Keyword</p>

        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm
          rounded-md border border-gray-300"
          placeholder="The future of artificial intelligence is..."
          required
        />

        <p className="mt-4 text-sm font-medium">Category</p>

        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {blogCategories.map((item) => (
            <span
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 border rounded-full
        cursor-pointer ${selectedCategory === item ? "bg-purple-50 text-purple-700" : "text-gray-500 border-gray-300"}`}
              key={item}>
              {item}
            </span>
          ))}
        </div>
        <br />
        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer">
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Hash className="w-5" />
          )}
          {loading ? "Generating title..." : "Generate title"}
        </button>
      </form>
      {/* Right col */}
      <div className="w-full flex-1 bg-white rounded-xl border border-gray-200 flex flex-col h-[700px]">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-[#8e37eb]" />
            <h1 className="text-xl font-semibold">Generated Titles</h1>
          </div>

          {content && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(content);
                  toast.success("Copied");
                }}
                className="px-3 py-2 border rounded-lg hover:bg-gray-100">
                Copy
              </button>

              <button
                onClick={downloadTitles}
                className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-[#C341F6] to-[#8E37EB]">
                Download
              </button>
            </div>
          )}
        </div>

        {!content ? (
          <div className="flex flex-col justify-center items-center flex-1 text-gray-400">
            <Hash className="w-14 h-14 mb-5" />

            <h2 className="text-lg font-semibold">No Titles Generated</h2>

            <p className="mt-2">Enter a keyword and click Generate Title.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {content
                .split(/\n+/)
                .filter((title) => title.trim() !== "")
                .map((title, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-4 hover:border-purple-500 hover:bg-purple-50 transition">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-purple-700">
                        #{index + 1}
                      </span>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(title);
                          toast.success("Copied");
                        }}
                        className="text-sm text-purple-600">
                        Copy
                      </button>
                    </div>

                    <p className="mt-2 text-gray-700">
                      {title.replace(/^\d+\.\s*/, "")}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;
