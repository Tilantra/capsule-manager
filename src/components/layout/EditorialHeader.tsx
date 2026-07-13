import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import CapsuleHubLogo from "@/components/assets/CapsuleHubLogo.png";

/* Smooth-scroll to an on-page section when we're on the landing page;
   navigate home first when we're not. */
const useSectionLink = () => {
    const location = useLocation();
    const navigate = useNavigate();
    return (id: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        if (location.pathname === "/") {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        } else {
            navigate(`/#${id}`);
        }
    };
};

/* Bold + red on hover; invisible bold twin reserves width so links don't shift */
const NavLabel = ({ children }: { children: string }) => (
    <span className="grid">
        <span className="col-start-1 row-start-1 group-hover:font-bold group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {children}
        </span>
        <span className="col-start-1 row-start-1 font-bold invisible" aria-hidden>
            {children}
        </span>
    </span>
);

const navLinkClass = "group editorial-label text-neutral-500 dark:text-neutral-400";

const ThemeToggle = () => {
    const { setTheme } = useTheme();
    const btnClass =
        "items-center justify-center w-10 h-10 text-3xl leading-none text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors";
    return (
        <>
            <button
                onClick={() => setTheme("dark")}
                aria-label="Switch to dark mode"
                title="Switch to dark mode"
                className={`flex dark:hidden ${btnClass}`}
            >
                {"☽︎"}
            </button>
            <button
                onClick={() => setTheme("light")}
                aria-label="Switch to light mode"
                title="Switch to light mode"
                className={`hidden dark:flex ${btnClass}`}
            >
                {"☀︎"}
            </button>
        </>
    );
};

export const CHROME_STORE_URL =
    "https://chromewebstore.google.com/detail/capsule-hub-by-tilantra/ngeoeefidomejcdhiecidpaalfoekjbh?hl=en-US&utm_source=ext_sidebar";

const EditorialHeader = ({ topOffset = 0 }: { topOffset?: number }) => {
    const sectionLink = useSectionLink();
    return (
        <header
            className="sticky z-50 bg-white dark:bg-[#0c0c0e] border-b border-neutral-200 dark:border-neutral-800"
            style={{ top: topOffset }}
        >
            <div className="mx-auto max-w-[1320px] px-5 md:px-10 h-16 flex items-center justify-between gap-4">
                <Link to="/" className="flex items-center gap-2.5 shrink-0">
                    <img src={CapsuleHubLogo} alt="CapsuleHub" className="h-8 w-8 object-contain" />
                    <span className="text-lg font-bold tracking-[-0.02em] text-neutral-950 dark:text-white">
                        Capsule Hub
                    </span>
                    <span className="editorial-label text-neutral-400 dark:text-neutral-500 hidden sm:block self-end pb-0.5">
                        by Tilantra
                    </span>
                </Link>

                <nav className="flex items-center gap-5 md:gap-8">
                    <a href="/#how" onClick={sectionLink("how")} className={`${navLinkClass} hidden md:block`}>
                        <NavLabel>How it works</NavLabel>
                    </a>
                    <a href="/#teams" onClick={sectionLink("teams")} className={`${navLinkClass} hidden md:block`}>
                        <NavLabel>Teams</NavLabel>
                    </a>
                    <Link to="/docs/plans" className={`${navLinkClass} hidden md:block`}>
                        <NavLabel>Pricing</NavLabel>
                    </Link>
                    <Link to="/login" className={`${navLinkClass} hidden sm:block`}>
                        <NavLabel>Sign in</NavLabel>
                    </Link>
                    <ThemeToggle />
                    <a
                        href={CHROME_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="editorial-label px-4 py-2 bg-orange-500 text-white hover:bg-neutral-950 dark:hover:bg-white dark:hover:text-neutral-950 transition-colors whitespace-nowrap"
                    >
                        Add to Chrome
                    </a>
                </nav>
            </div>
        </header>
    );
};

export default EditorialHeader;
