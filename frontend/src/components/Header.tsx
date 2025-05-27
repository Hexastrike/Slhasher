
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner"

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      // Redirect to the search results page with the query as a parameter
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search Failed: An error occurred while searching");
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center px-4 md:px-6 bg-background">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <form onSubmit={handleSearch} className="ml-4">
            <div className="relative">
              {/* TODO: <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search indicators or queries..." 
                className="h-10 w-48 md:w-64 lg:w-80 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              /> */}
            </div>
          </form>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
