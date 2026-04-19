"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { SearchResults } from "@/utils/types/apiTypes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/prism";
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await api.search(query);
      setResults(data.results);
    } catch (err) {
      console.error(err);
      alert("Search failed. Ensure your FastAPI server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      const res = await api.sync();
      alert(res.details);
    } catch (err) {
      alert("Sync failed. Check your GitHub CLI (gh) auth status.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              KodaLens <span className="text-blue-600">Knowledge Base</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Structured issue resolution logs for your team.</p>
          </div>
          <button
            onClick={handleSync}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-black transition-all shadow-sm active:scale-95"
          >
            <span>🔄</span> Sync Repositories
          </button>
        </div>

        {/* Search Section */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-12">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords or describe a problem..."
            className="w-full p-4 pl-5 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none transition-colors shadow-sm bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            {loading ? "..." : "Search"}
          </button>
        </form>

        {/* Results List */}
        <div className="space-y-8">
          {results.map((res, index) => {
            // Parse the JSON content from ChromaDB
            const data = JSON.parse(res.content);

            return (
              <div key={`${res.id}-${index}`} className="p-6 md:p-8 border border-gray-200 rounded-2xl shadow-sm bg-white">

                {/* Meta Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {data.category}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mt-2">{data.identifier}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                      Distance {res.distance}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-2 font-mono">{res.id}</p>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-6 text-gray-800 w-full">
                  <section>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">🔍 The Problem</h3>
                    <p className="text-lg leading-relaxed">{data.problem_description}</p>
                  </section>

                  <section className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">💡 Root Cause</h3>
                      <div className="text-sm prose prose-slate prose-sm">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {Array.isArray(data.resolution.root_cause)
                            ? data.resolution.root_cause.join("\n")
                            : data.resolution.root_cause}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">🛠 Implementation</h3>
                      <div className="text-sm prose prose-slate prose-sm">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {Array.isArray(data.resolution.technical_steps)
                            ? data.resolution.technical_steps.join("\n")
                            : data.resolution.technical_steps}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">✅ Verification</h3>
                    <p className="text-sm text-gray-600 italic">{data.resolution.verification}</p>
                  </section>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between text-[10px] text-gray-400">
                  <span>Processed: {data.date_processed}</span>
                  <span>Source File: {res.metadata.source}</span>
                </div>
              </div>
            );
          })}

          {hasSearched && results.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-400">
              No matching resolution logs found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}