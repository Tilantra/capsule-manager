import { motion } from "framer-motion";
import { HelpCircle, AlertCircle, RefreshCw, Mail, Clock, LogOut, Sparkles } from "lucide-react";
import DocsLayout from "./DocsLayout";

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 ring-1 ring-indigo-500/20 dark:from-indigo-500/25 dark:to-violet-500/25">
                <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">{children}</h2>
        </div>
    );
}

function Subheading({ icon: Icon, children }: { icon?: React.ElementType; children: React.ReactNode }) {
    return (
        <h3 className="mt-8 mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
            {children}
        </h3>
    );
}

function Prose({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-4 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 [&_strong]:font-semibold [&_strong]:text-slate-800 dark:[&_strong]:text-slate-100">
            {children}
        </div>
    );
}

export default function Troubleshooting() {
    return (
        <DocsLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <SectionTitle icon={HelpCircle}>Troubleshooting</SectionTitle>
                <Prose>
                    <p>
                        We understand that using a browser extension can sometimes be flaky due to the dynamic nature of AI platforms.
                        We are committed to providing the best possible support and ensuring your experience with Capsule Hub is smooth.
                    </p>
                    <p>
                        <strong>Please note that we currently only support the CHROME browser. Inter-browser operability features will be coming soon.</strong>
                    </p>
                </Prose>

                <Subheading icon={LogOut}>Invalid Token Error</Subheading>
                <Prose>
                    <p>
                        If you encounter an <strong>"Invalid token"</strong> error while using the extension:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Please <strong>log out</strong> of the Capsule Hub extension.</li>
                        <li><strong>Log in again</strong> to refresh your session and security credentials.</li>
                    </ul>
                </Prose>

                <Subheading icon={RefreshCw}>Failed to Generate Capsule</Subheading>
                <Prose>
                    <p>
                        If the extension shows <strong>"Failed to generate capsule"</strong>:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Please <strong>refresh your chat browser</strong> (the page where the AI chat is running).</li>
                        <li>Try the capture process again. This usually resolves temporary synchronization issues with the page.</li>
                    </ul>
                </Prose>

                <Subheading icon={Clock}>Processing Time</Subheading>
                <Prose>
                    <p>
                        Please note that <strong>long chats</strong> and <strong>chats with large attachments</strong> take a slightly longer time to capsule.
                        The system needs to process and summarize the additional context to ensure high-quality results.
                    </p>
                </Prose>

                <Subheading icon={Sparkles}>Pricing & Tiers</Subheading>
                <Prose>
                    <p>
                        We have implemented a <strong>freemium tier pricing plan</strong>. All new users automatically receive an 
                        <strong>Elite trial (our highest tier) for 3 days</strong>.
                    </p>
                    <p>
                        After the 3-day trial period:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>You will be moved to the <strong>Basic plan</strong>.</li>
                        <li>The Basic plan does not include support for <strong>attachments or teams</strong>.</li>
                        <li>You can continue to delete your capsules and create new ones on the Basic plan, with a limit of <strong>5 capsules at once</strong>.</li>
                    </ul>
                    <p className="mt-4 text-sm">
                        For more details on our tiers, please visit <a href="/docs/plans" className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium">capsulehub.tilantra.com/docs/plans</a>.
                    </p>
                </Prose>

                <Subheading icon={AlertCircle}>Error Codes (400 & 500)</Subheading>
                <Prose>
                    <div className="grid gap-4 mt-4">
                        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                            <p className="font-semibold text-red-600 dark:text-red-400">400 Bad Request</p>
                            <p className="text-sm mt-1">This usually means the request was malformed. Try refreshing the page and ensuring you are logged into both Capsule Hub and the AI platform.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
                            <p className="font-semibold text-orange-600 dark:text-orange-400">500 Internal Server Error</p>
                            <p className="text-sm mt-1">This indicates a temporary downtime. Please wait a few minutes and try again. If the issue persists, check our status banner or contact us.</p>
                        </div>
                    </div>
                </Prose>

                <Subheading icon={Mail}>Need More Help?</Subheading>
                <Prose>
                    <p>
                        If you have any other issues or questions, please reach out to us at:
                    </p>
                    <div className="flex flex-col gap-2 mt-2">
                        <a href="mailto:tilantra.technologies@gmail.com" className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium">tilantra.technologies@gmail.com</a>
                        <a href="mailto:tech@tilantra.com" className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium">tech@tilantra.com</a>
                    </div>
                    <p className="mt-4 font-medium">
                        We would be more than happy to help you out!
                    </p>
                </Prose>
            </motion.div>
        </DocsLayout>
    );
}
