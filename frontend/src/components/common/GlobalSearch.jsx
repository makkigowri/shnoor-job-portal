import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch } from "../../services/searchService";
import { globalSearchAdmin } from "../../services/adminSearchService";

const GlobalSearch = ({ variant = "candidate", placeholder = "Search anything..." }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const fetcher = variant === "admin" ? globalSearchAdmin : globalSearch;
        const data = await fetcher(trimmed);
        setResults(data.results || []);
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, variant]);

  const handleSelect = (path) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    navigate(path);
  };

  const hasResults = results.some((group) => group.items.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7393D3] focus:border-transparent"
        />
      </div>
      {open && query.trim() && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-lg max-h-96 overflow-y-auto">
          {loading && <p className="px-4 py-3 text-sm text-gray-400">Searching...</p>}
          {!loading && !hasResults && (
            <p className="px-4 py-3 text-sm text-gray-400">No results found</p>
          )}
          {!loading &&
            hasResults &&
            results.map(
              (group) =>
                group.items.length > 0 && (
                  <div key={group.category} className="py-2">
                    <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {group.category}
                    </p>
                    {group.items.map((item) => (
                      <button
                        key={`${group.category}-${item.id}`}
                        type="button"
                        onClick={() => handleSelect(item.path)}
                        className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] transition-colors"
                      >
                        <p className="text-sm font-medium text-[#3E3A74] truncate">{item.label}</p>
                        {item.sublabel && (
                          <p className="text-xs text-gray-500 truncate">{item.sublabel}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )
            )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
