import { useState } from "react";
import EditorialHeader from "@/components/layout/EditorialHeader";
import EditorialFooter from "@/components/layout/EditorialFooter";

const inputClass =
    "w-full px-4 py-3 text-sm bg-white dark:bg-[#111114] border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-950 dark:focus:border-white transition-colors";

const Contact = () => {
    const [form, setForm] = useState({
        name: "",
        designation: "",
        email: "",
        phone: "",
        message: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccess(null);
        setError(null);
        try {
            const response = await fetch("https://backend.tilantra.com/inquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (response.ok) {
                setSuccess("Thank you for your inquiry. We'll get back to you shortly.");
                setForm({ name: "", designation: "", email: "", phone: "", message: "" });
            } else {
                const err = await response.json();
                setError("Error: " + (err.detail || "Could not submit inquiry."));
            }
        } catch (error) {
            setError("Network error. Please try again later.");
        }
        setSubmitting(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="editorial min-h-screen">
            <EditorialHeader />
            <main>
                <section className="bg-white dark:bg-[#0c0c0e]">
                    <div className="mx-auto max-w-[1320px] px-5 md:px-10 pt-20 md:pt-28 pb-24 md:pb-32">
                        <div className="grid grid-cols-12 gap-6 md:gap-10">
                            {/* Left column — intro */}
                            <div className="col-span-12 md:col-span-5">
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="h-[3px] w-10 bg-orange-500" />
                                    <p className="editorial-label text-neutral-400 dark:text-neutral-500">
                                        Contact | Capsule Hub
                                    </p>
                                </div>
                                <h1 className="editorial-serif italic text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.06] text-neutral-950 dark:text-white">
                                    Get in touch.
                                </h1>
                                <div className="mt-8 space-y-5 text-base leading-relaxed text-neutral-500 dark:text-neutral-400 max-w-sm">
                                    <p>
                                        Questions about Capsule Hub, the extension, teams,
                                        or a custom integration. Our team reads everything.
                                    </p>
                                </div>

                                <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
                                    <div>
                                        <p className="editorial-label text-neutral-400 dark:text-neutral-500 mb-2">Email</p>
                                        <a
                                            href="mailto:tech@tilantra.com"
                                            className="text-sm text-neutral-950 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                        >
                                            tech@tilantra.com
                                        </a>
                                        <br />
                                        <a
                                            href="mailto:tilantra.technologies@gmail.com"
                                            className="text-sm text-neutral-950 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                        >
                                            tilantra.technologies@gmail.com
                                        </a>
                                    </div>
                                    <div>
                                        <p className="editorial-label text-neutral-400 dark:text-neutral-500 mb-2">Elsewhere</p>
                                        <a
                                            href="https://www.linkedin.com/company/tilantra/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-neutral-950 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                        >
                                            LinkedIn
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Right column — form */}
                            <div className="col-span-12 md:col-span-6 md:col-start-7">
                                <form
                                    onSubmit={handleSubmit}
                                    className="border border-neutral-200 dark:border-neutral-800 p-8 md:p-10 space-y-6"
                                >
                                    <div>
                                        <label htmlFor="name" className="editorial-label text-neutral-950 dark:text-white block mb-2">
                                            Full name <span className="text-orange-600 dark:text-orange-400">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            placeholder="John Doe"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="designation" className="editorial-label text-neutral-950 dark:text-white block mb-2">
                                            Designation <span className="text-orange-600 dark:text-orange-400">*</span>
                                        </label>
                                        <input
                                            id="designation"
                                            name="designation"
                                            placeholder="Product Manager"
                                            value={form.designation}
                                            onChange={handleChange}
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="email" className="editorial-label text-neutral-950 dark:text-white block mb-2">
                                                Email <span className="text-orange-600 dark:text-orange-400">*</span>
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="john@company.com"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="editorial-label text-neutral-950 dark:text-white block mb-2">
                                                Phone
                                            </label>
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                value={form.phone}
                                                onChange={handleChange}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="editorial-label text-neutral-950 dark:text-white block mb-2">
                                            How can we help? <span className="text-orange-600 dark:text-orange-400">*</span>
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            placeholder="Tell us about your project or inquiry..."
                                            rows={4}
                                            value={form.message}
                                            onChange={handleChange}
                                            required
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>

                                    {success && (
                                        <p className="border-l-2 border-neutral-950 dark:border-white pl-4 py-1 text-sm text-neutral-950 dark:text-white">
                                            {success}
                                        </p>
                                    )}

                                    {error && (
                                        <p className="border-l-2 border-orange-500 pl-4 py-1 text-sm text-orange-600 dark:text-orange-400">
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full inline-flex items-center justify-center gap-3 px-7 py-4 text-sm font-semibold bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-400 dark:hover:text-neutral-950 transition-colors disabled:opacity-50"
                                    >
                                        {submitting ? "Submitting..." : "Submit inquiry"} <span>→</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <EditorialFooter />
        </div>
    );
};

export default Contact;
