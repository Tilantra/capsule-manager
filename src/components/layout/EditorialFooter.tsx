import { Link } from "react-router-dom";
import { CHROME_STORE_URL } from "./EditorialHeader";
import CapsuleHubLogo from "@/components/assets/CapsuleHubLogo.png";

const footerLink =
    "editorial-label text-neutral-400 dark:text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors";

const EditorialFooter = () => {
    return (
        <footer className="bg-white dark:bg-[#0c0c0e] border-t border-neutral-200 dark:border-neutral-800">
            <div className="mx-auto max-w-[1320px] px-5 md:px-10 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-x-8 gap-y-3 flex-wrap">
                    <span className="flex items-center gap-2">
                        <img src={CapsuleHubLogo} alt="Capsule Hub" className="h-5 w-5 object-contain" />
                        <span className="text-sm font-bold tracking-[-0.02em] text-neutral-950 dark:text-white">Capsule Hub</span>
                    </span>
                    <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer" className={footerLink}>
                        Chrome Web Store
                    </a>
                    <Link to="/docs" className={footerLink}>
                        Docs
                    </Link>
                    <Link to="/docs/mcp" className={footerLink}>
                        MCP
                    </Link>
                    <Link to="/contact" className={footerLink}>
                        Contact
                    </Link>
                    <a
                        href="https://www.linkedin.com/company/tilantra/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={footerLink}
                    >
                        LinkedIn
                    </a>
                    <a href="mailto:tech@tilantra.com" className={footerLink}>
                        tech@tilantra.com
                    </a>
                    <Link to="/docs/privacy" className={footerLink}>
                        Privacy
                    </Link>
                </div>
                <p className="editorial-label text-neutral-300 dark:text-neutral-600">© 2026 Tilantra</p>
            </div>
        </footer>
    );
};

export default EditorialFooter;
