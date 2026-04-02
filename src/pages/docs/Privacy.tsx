import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import DocsLayout from "./DocsLayout";

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 ring-1 ring-indigo-500/20 dark:from-indigo-500/25 dark:to-violet-500/25">
                <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">{children}</h1>
        </div>
    );
}

function Prose({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-6 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-slate-100 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2">
            {children}
        </div>
    );
}

function SubTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="mt-10 mb-4 text-xl font-bold text-slate-900 dark:text-slate-50">{children}</h2>;
}

function TertiaryTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="mt-6 mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{children}</h3>;
}

export default function Privacy() {
    return (
        <DocsLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="max-w-3xl"
            >
                <SectionTitle icon={Shield}>Privacy Policy</SectionTitle>
                <Prose>
                    <p className="text-sm text-slate-500 italic">Last updated: April 03, 2026</p>
                    
                    <p>
                        This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                    </p>

                    <p>
                        We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
                    </p>

                    <SubTitle>Interpretation and Definitions</SubTitle>
                    
                    <TertiaryTitle>Interpretation</TertiaryTitle>
                    <p>
                        The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
                    </p>

                    <TertiaryTitle>Definitions</TertiaryTitle>
                    <p>For the purposes of this Privacy Policy:</p>
                    <ul>
                        <li><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>
                        <li><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
                        <li><strong>AI Platform</strong> refers to supported third-party artificial intelligence services including ChatGPT (OpenAI), Google Gemini, Anthropic Claude, and DeepSeek where the Extension operates.</li>
                        <li><strong>Capsule</strong> means a user-generated collection of conversation messages and context that can be stored, managed, and reused across AI Platforms.</li>
                        <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Tilantra, operating at <a href="https://tilantra.com" className="text-indigo-600 hover:underline">https://tilantra.com</a> and <a href="https://guidera.tilantra.com" className="text-indigo-600 hover:underline">https://guidera.tilantra.com</a>.</li>
                        <li><strong>Country</strong> refers to the jurisdiction where Tilantra operates.</li>
                        <li><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                        <li><strong>Extension or Service</strong> refers to Capsule Hub by Tilantra, a Chrome browser extension that enables users to capture, process, and reuse AI conversation context across multiple platforms.</li>
                        <li><strong>Google Account</strong> refers to the authentication service provided by Google LLC used for OAuth authentication within the Extension.</li>
                        <li><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</li>
                        <li><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company.</li>
                        <li><strong>Team</strong> refers to a collaborative workspace within the Extension where multiple users can share and manage Capsules collectively.</li>
                        <li><strong>Transformer Models</strong> refers to advanced machine learning architectures utilized by the Extension to process, read, and understand conversation prompts and contexts efficiently.</li>
                        <li><strong>Usage Data</strong> refers to data collected automatically when using the Service, either generated by the use of the Service or from the Service infrastructure itself.</li>
                        <li><strong>Website</strong> refers to Capsule Hub's web presence, accessible from <a href="https://guidera.tilantra.com" className="text-indigo-600 hover:underline">https://guidera.tilantra.com</a> and <a href="https://tilantra.com" className="text-indigo-600 hover:underline">https://tilantra.com</a>.</li>
                        <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
                    </ul>

                    <SubTitle>Collecting and Using Your Personal Data</SubTitle>
                    <TertiaryTitle>Types of Data Collected</TertiaryTitle>
                    
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Personal Data</h4>
                    <p>
                        While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
                    </p>
                    <ul>
                        <li>Email address (when you sign in with email/password or Google OAuth)</li>
                        <li>Full name (when provided during registration or obtained from Google profile)</li>
                        <li>Username (created during registration or derived from Google account)</li>
                        <li>Profile information (obtained from Google OAuth, including profile photo URL)</li>
                        <li>Team membership information (teams you create, join, or administer)</li>
                        <li>Authentication tokens (OAuth access tokens and JWT bearer tokens for session management)</li>
                    </ul>

                    <TertiaryTitle>Capsule Content Data & Prompt Processing</TertiaryTitle>
                    <p>
                        To provide its core functionality, including continuous dynamic context tracking, context injection, and automated summary generation, Capsule Hub actively monitors and processes conversation content on supported AI Platforms. All collected data is encrypted, strictly maintaining user privacy.
                    </p>
                    
                    <p><strong>User Control: Dynamic Context Toggle</strong></p>
                    <p>
                        We believe in empowering our users with full control over their data. The Extension features a "Dynamic Context Toggle" that allows you to easily enable or disable continuous prompt capturing at any time.
                    </p>
                    <ul>
                        <li><strong>When Enabled:</strong> The Extension actively captures and processes your prompts to build ongoing context.</li>
                        <li><strong>When Disabled:</strong> The Extension completely stops monitoring, capturing, or processing new prompts, giving you the choice to decide exactly when your interactions are recorded.</li>
                    </ul>

                    <p><strong>What We Collect (When Enabled):</strong></p>
                    <ul>
                        <li><strong>Prompts and User Messages:</strong> We capture every prompt and text content you write and submit within supported AI chat interfaces. This continuous capturing is essential for compiling accurate historical context and generating robust Capsules.</li>
                        <li><strong>Assistant Responses:</strong> We collect AI-generated text responses from the supported platforms corresponding to your prompts.</li>
                        <li><strong>Conversation metadata:</strong> Platform source, conversation ID (for version tracking), and timestamp.</li>
                        <li><strong>Capsule tags:</strong> User-defined labels or auto-generated titles for organizing capsules.</li>
                        <li><strong>Team assignment:</strong> Whether a capsule is private or shared with a specific team.</li>
                    </ul>

                    <p><strong>How We Process Content:</strong></p>
                    <ul>
                        <li><strong>Transformer Models:</strong> We utilize Transformer-based algorithms to analyze, parse, and process your collected prompts and the AI assistant responses. This ensures that context mapping, relevance scoring, and generation of overarching capsules are highly accurate and tailored to your workflow.</li>
                    </ul>

                    <p><strong>What We Do NOT Collect:</strong></p>
                    <ul>
                        <li>We do NOT track your browsing history outside of the specifically supported AI platforms (e.g., ChatGPT, Claude, Gemini, DeepSeek).</li>
                        <li>We do NOT access conversations, chats, or content on unrelated websites or web pages.</li>
                        <li>We do NOT collect data from input fields not associated with standard AI conversation interfaces.</li>
                    </ul>

                    <TertiaryTitle>Storage Location Data</TertiaryTitle>
                    <p>The Extension uses Chrome's local storage API to store:</p>
                    <ul>
                        <li><strong>UI preferences:</strong> Selected team, filter settings, search history.</li>
                        <li><strong>Session cache:</strong> Temporary copies of team lists and capsule lists for faster loading.</li>
                        <li><strong>Authentication state:</strong> Login tokens, token expiration times, currently logged-in email.</li>
                        <li><strong>Temporary injection context:</strong> Capsule IDs queued for injection (cleared after use).</li>
                    </ul>
                    <p>
                        This data is stored locally in your browser and is only transmitted to our backend servers when necessary to fulfill your explicit actions, to secure continuous prompt tracking, or to fetch your capsule library.
                    </p>

                    <TertiaryTitle>Usage Data</TertiaryTitle>
                    <p>Usage Data is collected automatically when using the Service. Usage Data may include information such as:</p>
                    <ul>
                        <li>Browser type and version</li>
                        <li>Operating system</li>
                        <li>Extension version number</li>
                        <li>Frequency of capsule generation, injection, and library access</li>
                        <li>Error logs and debugging information</li>
                        <li>API request patterns</li>
                    </ul>
                    <p>We do NOT use Usage Data for advertising, behavioral profiling, or cross-site tracking.</p>

                    <TertiaryTitle>Information from Third-Party Social Media Services</TertiaryTitle>
                    <p>
                        The Company allows You to create an account and log in to use the Service through Google OAuth 2.0. If You decide to register through or otherwise grant us access to Google OAuth, We may collect Personal Data that is already associated with Your Google Account, such as Your email address, name, profile picture URL, and Google User ID.
                    </p>
                    <p>
                        <strong>Important:</strong> We only use Google OAuth for authentication purposes. We do NOT access your Gmail messages, Google Drive files, Calendar events, or any other Google services beyond basic profile information required for login.
                    </p>

                    <SubTitle>Usage of Your Personal Data</SubTitle>
                    <p>The Company may use Personal Data for the following purposes:</p>
                    
                    <TertiaryTitle>Core Service Functionality</TertiaryTitle>
                    <ul>
                        <li><strong>Real-time Prompt Processing:</strong> Using Transformer technology to continuously capture and analyze every prompt entered into supported AI platforms, providing seamless real-time context management.</li>
                        <li><strong>Capsule Generation and Storage:</strong> Processing captured conversations to create intelligent, reusable context summaries.</li>
                        <li><strong>Capsule Injection:</strong> Retrieving and programmatically injecting stored capsule context directly into your ongoing AI conversations.</li>
                        <li><strong>To provide and maintain our Service:</strong> Managing user authentication, storing capsules, and monitoring extension performance.</li>
                        <li><strong>To manage Your Account:</strong> Managing your registration and secure identity.</li>
                        <li><strong>Team Collaboration:</strong> Enabling secure, role-based sharing of capsules between designated team members.</li>
                    </ul>

                    <TertiaryTitle>Communication and Support</TertiaryTitle>
                    <ul>
                        <li><strong>To contact You:</strong> By email regarding updates, security alerts, product announcements, and account-related notifications.</li>
                        <li><strong>To provide You with news and special offers:</strong> Unless You have opted not to receive such information.</li>
                    </ul>

                    <TertiaryTitle>Product Improvement</TertiaryTitle>
                    <ul>
                        <li><strong>To manage Your requests:</strong> Fulfilling support inquiries, feature requests, and bug reports.</li>
                        <li><strong>For data analysis:</strong> Using aggregated, anonymized data to identify platform usage trends.</li>
                        <li><strong>To improve our Service:</strong> Refining our Transformer models, UI layouts, and logic based on aggregate usage patterns and active feedback.</li>
                    </ul>

                    <SubTitle>Sharing of Your Personal Data</SubTitle>
                    <p>We may share Your personal information in the following situations:</p>
                    <TertiaryTitle>Authorized Sharing</TertiaryTitle>
                    <ul>
                        <li><strong>With Service Providers:</strong> To monitor and analyze the use of our Service, securely host our backend infrastructure, provide customer support, and run our Transformer pipelines. We do NOT share your data with advertising networks or data brokers.</li>
                        <li><strong>With Your Team Members:</strong> If you join or create a Team, your username, email address, and specifically shared capsules will be visible to other team members. Private capsules are NEVER shared with team members.</li>
                        <li><strong>For business transfers:</strong> In connection with any merger, sale, financing, or acquisition of our business.</li>
                        <li><strong>With Your consent:</strong> For any other purpose with Your explicit consent.</li>
                    </ul>

                    <TertiaryTitle>What We Do NOT Share</TertiaryTitle>
                    <p>
                        We do NOT sell, rent, trade, or license personal data to third parties for monetary gain. We do NOT share Your data with advertising networks, marketing agencies, social media platforms (beyond OAuth authentication), or third-party data analytics firms.
                    </p>

                    <SubTitle>Retention of Your Personal Data</SubTitle>
                    <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy.</p>
                    <TertiaryTitle>Specific Retention Periods</TertiaryTitle>
                    <ul>
                        <li><strong>Capsules and Conversation Data:</strong> Persist indefinitely until you manually delete them from your account.</li>
                        <li><strong>Authentication tokens:</strong> Persist until you log out or the token expires (typically 30-90 days).</li>
                        <li><strong>Account data:</strong> Persists until you delete your account.</li>
                        <li><strong>Team data:</strong> Persists until the team admin deletes the team or you voluntarily leave the team.</li>
                        <li><strong>Usage logs and error reports:</strong> Retained for 90 days for debugging, monitoring, and security purposes.</li>
                    </ul>

                    <TertiaryTitle>Account Deletion</TertiaryTitle>
                    <p>When you delete your account:</p>
                    <ul>
                        <li>All capsules and associated prompt data you created are permanently deleted within 30 days.</li>
                        <li>Your authentication tokens are immediately invalidated.</li>
                        <li>Your email, username, and profile data are permanently deleted within 30 days.</li>
                        <li>Team memberships are revoked.</li>
                        <li>Cached local storage data in your browser is cleared.</li>
                    </ul>
                    <p>
                        You may delete your account by contacting us at <a href="mailto:tech@tilantra.com" className="text-indigo-600 hover:underline">tech@tilantra.com</a> with the subject line "Account Deletion Request", providing your registered email address for verification.
                    </p>

                    <SubTitle>Transfer and Disclosure</SubTitle>
                    <TertiaryTitle>Transfer of Your Personal Data</TertiaryTitle>
                    <p>
                        Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.
                    </p>
                    
                    <TertiaryTitle>Disclosure of Your Personal Data</TertiaryTitle>
                    <ul>
                        <li><strong>Business Transactions:</strong> If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. Notice will be provided before such transfer.</li>
                        <li><strong>Law Enforcement:</strong> Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities.</li>
                    </ul>

                    <SubTitle>Security of Your Personal Data</SubTitle>
                    <p>We prioritize the security of Your Personal Data. We employ:</p>
                    <ul>
                        <li><strong>Encryption in Transit:</strong> All backend communication uses HTTPS/TLS encryption.</li>
                        <li><strong>Encryption at Rest:</strong> Personal data in databases is encrypted using industry-standard algorithms.</li>
                        <li><strong>OAuth 2.0 & JWT:</strong> Secure login and short-lived cryptographically signed session tokens.</li>
                        <li><strong>Secure Local Storage:</strong> Chrome's local storage API is strictly isolated.</li>
                        <li><strong>Access Controls:</strong> Restricted API endpoints ensure precise data boundaries based on authentication.</li>
                    </ul>

                    <TertiaryTitle>Privacy-Specific Features</TertiaryTitle>
                    <ul>
                        <li><strong>Stealth Injection & Privacy Masking:</strong> Automatic privacy protection when injecting capsules avoids metadata leakage and prevents detection by AI host platforms.</li>
                        <li><strong>Continuous Parsing for Context Map:</strong> Prompt data captured by our extension is tightly mapped to active Conversation IDs for immediate availability, keeping full context flow organized without cross-contaminating discrete AI platforms.</li>
                    </ul>

                    <SubTitle>Other Provisions</SubTitle>
                    <TertiaryTitle>Children's Privacy</TertiaryTitle>
                    <p>
                        Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. Parents/guardians aware of such instances should contact <a href="mailto:tech@tilantra.com" className="text-indigo-600 hover:underline">tech@tilantra.com</a>.
                    </p>

                    <TertiaryTitle>Links to Other Websites</TertiaryTitle>
                    <p>Our Service may contain links to websites not operated by Us. We strongly advise You to review their separate Privacy Policies.</p>
                    <p>
                        <strong>Important Note on AI Platform Privacy:</strong> When you inject a capsule or enter a prompt into a third-party AI chat interface, that content is fundamentally subject to that platform's own privacy policy (e.g., OpenAI, Google, Anthropic), independent of our Service.
                    </p>

                    <SubTitle>Chrome Web Store Policy Compliance</SubTitle>
                    <p>
                        Capsule Hub strictly complies with the Google Chrome Web Store's User Data, Permissions, and Limited Use policies. To power our context capture and intelligent Transformer features, we require access to user input and page content on specific AI platforms. We certify that data collected is limited strictly to the core purpose of providing the Capsule Hub service.
                    </p>
                    <ul>
                        <li>✅ <strong>Explicit User Consent & Control:</strong> Continuous prompt tracking is governed by our Dynamic Context Toggle. Users have explicit power to turn off data capturing at their discretion.</li>
                        <li>✅ <strong>Strict Core Functionality Use:</strong> Processing every prompt and utilizing Transformer models directly supports the extension's primary function.</li>
                        <li>✅ <strong>No advertising or ad targeting:</strong> We do NOT use your data for advertising purposes.</li>
                        <li>✅ <strong>No behavioral profiling:</strong> We do NOT create behavioral profiles for marketing or outside analytics.</li>
                        <li>✅ <strong>No sale, rental, or licensing of data:</strong> We NEVER sell user data to any third party.</li>
                        <li>✅ <strong>No cross-user data exposure:</strong> Private Prompts, Capsules, and Contexts are never visible to other users.</li>
                        <li>✅ <strong>No data used for generic model training:</strong> AI and Transformer processing only occurs to provide you with the Service; we do NOT harvest your prompt inputs to train generalized foundation AI models.</li>
                    </ul>

                    <SubTitle>Changes and Contact</SubTitle>
                    <TertiaryTitle>Changes to this Privacy Policy</TertiaryTitle>
                    <p>We may update Our Privacy Policy from time to time. You will be notified by:</p>
                    <ul>
                        <li>Updating the "Last updated" date at the top of this Privacy Policy.</li>
                        <li>Sending an email notification (for material changes).</li>
                        <li>Displaying a prominent notice in the Extension popup.</li>
                    </ul>

                    <TertiaryTitle>Contact Us</TertiaryTitle>
                    <p>If you have any questions about this Privacy Policy, data deletion requests, or privacy concerns, You can contact us:</p>
                    <ul>
                        <li>Email: <a href="mailto:tech@tilantra.com" className="text-indigo-600 hover:underline">tech@tilantra.com</a></li>
                        <li>Website: <a href="https://tilantra.com" className="text-indigo-600 hover:underline">tilantra.com</a></li>
                    </ul>

                    <p className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                        By using Capsule Hub, you acknowledge that you have read and understood this Privacy Policy.
                        <br />
                        <span className="block mt-2 font-semibold">© 2026 Tilantra. All rights reserved.</span>
                    </p>
                </Prose>
            </motion.div>
        </DocsLayout>
    );
}
