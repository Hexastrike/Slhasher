import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight, Search, Clock, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useQueries } from "@/context/QueryContext";
import { formatDate } from "@/lib/api";
import logo from "@/assets/images/hx_symbol-150x150.png";

export function AppSidebar() {
    const { queries, loading } = useQueries();
    const location = useLocation();
    const currentPath = location.pathname;
    
    // Determine if the recent queries group should be expanded
    const isQueryPath = currentPath.startsWith("/queries/");
    // Change this to true to show recent queries by default
    const [recentQueriesOpen, setRecentQueriesOpen] = useState(true);

    // Determine if a NavLink is active
    const isActive = (path: string) => currentPath === path;
    
    // Get the NavLink class based on active state
    const getNavClass = ({ isActive }: { isActive: boolean }) => {
        return cn(
        "sidebar-link",
        isActive && "active"
        );
    };

    return (
        <div className="bg-sidebar w-[260px] flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 z-50">
            {/* Logo and title */}
            <div className="flex flex-col items-start px-3 py-2 h-14">
                <div className="flex items-center gap-2">
                    <img 
                        src={logo} 
                        alt="Hexastrike Logo" 
                        className="hexastrike-logo w-[35px] h-[35px]"
                    />
                    <div className="flex flex-col">
                        <h1 className="text-md font-semibold text-sidebar-foreground">Slasher</h1>
                        <p className="text-xs text-sidebar-muted-foreground">by Hexastrike Cybersecurity</p>
                    </div>
                </div>
            </div>

            <div className="py-2 flex-1 flex flex-col overflow-auto">
                {/* Main navigation */}
                <div className="px-2 py-2">
                    <NavLink to="/" className={getNavClass} end>
                        <Search className="h-5 w-5 text-sidebar-foreground" />
                        <span className="font-semibold text-sidebar-foreground">Queries</span>
                    </NavLink>
                </div>

                {/* Recent Queries */}
                <div className="px-2 py-2">
                    <div className="flex items-center gap-2 text-sidebar-muted-foreground">
                        <button
                            type="button"
                            onClick={() => setRecentQueriesOpen(!recentQueriesOpen)}
                            className="sidebar-recent-queries flex w-full items-center gap-2 px-3 py-2 text-sidebar-muted-foreground
                                    hover:text-sidebar-foreground cursor-pointer rounded-md"
                        >
                            <Clock className="h-4 w-4" />

                            {/* label sits in the flex flow, so clicking it triggers the button */}
                            <span className="flex-1 text-left">Recent Queries</span>

                            <ChevronRight
                            className={cn(
                                "h-4 w-4 transition-transform ml-auto",
                                recentQueriesOpen && "rotate-90"
                            )}
                            />
                        </button>
                    </div>

                    {recentQueriesOpen && (
                        <div className="mt-1">
                            {loading ? (
                                <div className="px-3 py-2 text-sm text-sidebar-muted-foreground">
                                Loading...
                                </div>
                            ) : queries.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-sidebar-muted-foreground">
                                No recent queries
                                </div>
                            ) : (
                                queries.slice(0, 10).map((query) => (
                                    <NavLink 
                                        key={query.id}
                                        to={`/queries/${query.uuid}`} 
                                        className={getNavClass}
                                        title={query.query_case_name}
                                    >
                                        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-pink mt-0.5" />
                                        <div className="flex flex-col truncate">
                                        <span className="truncate text-sm font-semibold text-sidebar-foreground">{query.query_case_name}</span>
                                        <span className="text-xs text-sidebar-muted-foreground truncate">
                                            {formatDate(query.query_date)}
                                        </span>
                                        </div>
                                        <ChevronRight className="h-4 w-12 ml-auto text-sidebar-foreground" />
                                    </NavLink>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Create a spacer to push the secondary links to the bottom */}
                <div className="flex-grow"></div>

                {/* Secondary links (bottom aligned) */}
                <div className="mt-auto px-2 py-4 text-sidebar-foreground">
                    <Separator className="bg-sidebar-muted mb-4" />
                    
                    <NavLink to="/feedback" className={getNavClass}>
                        <MessageSquare className="h-5 w-5" />
                        <span>Feedback</span>
                    </NavLink>
                    
                    <NavLink to="/settings" className={getNavClass}>
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </NavLink>
                </div>
            </div>
        </div>
    );
}
