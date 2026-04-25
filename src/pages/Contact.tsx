import { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
                setSuccess("Thank you for your inquiry!");
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
        <div className="min-h-screen bg-background text-foreground bg-gradient-to-br from-gray-50 via-blue-50/55 to-purple-50/45 dark:from-[#040816] dark:via-[#060a1a] dark:to-[#040816] relative overflow-hidden">
            {/* Background decorative elements matching landing */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_0%_0%,rgba(124,58,237,0.14),transparent_60%),radial-gradient(900px_500px_at_100%_10%,rgba(37,99,235,0.14),transparent_60%)] dark:bg-[radial-gradient(1100px_600px_at_0%_0%,rgba(124,58,237,0.26),transparent_60%),radial-gradient(1100px_600px_at_100%_10%,rgba(37,99,235,0.24),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.18] [background-image:linear-gradient(rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />

            <Header />

            <main className="relative z-10 pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >

                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                                <span className="inline-block bg-gradient-to-r from-slate-900 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-white dark:via-indigo-400 dark:to-violet-400">
                                    Get in touch
                                </span>
                            </h1>
                            <div className="space-y-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                                <p>
                                    We're here to help you scale your AI operations. Whether you have questions
                                    about our solutions, need technical support, or want to discuss a custom
                                    integration, our team is ready to assist.
                                </p>
                                <p>
                                    Reach out to us and discover how Tilantra can streamline your workflows,
                                    optimize your performance, and accelerate your path to innovation.
                                </p>

                                <div className="pt-8 space-y-4">
                                    <motion.div
                                        whileHover={{ x: 10 }}
                                        className="flex items-center gap-4 group cursor-pointer"
                                    >
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                                            <Send className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Email Us</p>
                                            <p className="text-indigo-600 dark:text-indigo-400 font-medium">tilantra.technlogies@gmail.com</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white/80 dark:bg-slate-950/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold ml-1">Full Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="designation" className="text-sm font-semibold ml-1">Designation <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="designation"
                                        name="designation"
                                        placeholder="Product Manager"
                                        value={form.designation}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold ml-1">Email <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="john@company.com"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            className="h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-semibold ml-1">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className="h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-sm font-semibold ml-1">How can we help? <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="Tell us about your project or inquiry..."
                                        rows={4}
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 resize-none min-h-[120px]"
                                    />
                                </div>

                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center gap-3"
                                    >
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm font-semibold">{success}</p>
                                    </motion.div>
                                )}

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm font-semibold">{error}</p>
                                    </motion.div>
                                )}

                                <Button
                                    type="submit"
                                    variant="hero"
                                    size="lg"
                                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/20"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Send Inquiry
                                            <Send className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
