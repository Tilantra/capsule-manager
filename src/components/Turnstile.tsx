import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/* Cloudflare Turnstile bot check.

   Rendered on the signup form only, so scripted signups have to solve a
   challenge before /users/register is called. Login and Google sign-in are
   deliberately left alone: the SDKs, the browser extension and repeated token
   generation call those, and the backend does not gate them. The widget is
   managed explicitly (render=explicit) so React owns its lifecycle.

   Set VITE_TURNSTILE_SITE_KEY to switch it on; with no key the widget is a
   no-op and the forms submit without a token, so local dev keeps working. */

export const TURNSTILE_SITE_KEY: string | undefined = import.meta.env.VITE_TURNSTILE_SITE_KEY;

/* The frontend can only prove "a human was here" — the backend must reject any
   request whose captcha_token is missing or fails siteverify, otherwise a bot
   can skip this page and post straight to the API. */
export const captchaEnabled = Boolean(TURNSTILE_SITE_KEY);

const SCRIPT_SRC =
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileOptions = {
    sitekey: string;
    action?: string;
    theme?: "auto" | "light" | "dark";
    callback?: (token: string) => void;
    "expired-callback"?: () => void;
    "error-callback"?: () => void;
};

declare global {
    interface Window {
        turnstile?: {
            render: (el: HTMLElement, options: TurnstileOptions) => string;
            reset: (widgetId?: string) => void;
            remove: (widgetId?: string) => void;
        };
    }
}

let scriptPromise: Promise<void> | null = null;

const loadTurnstile = () => {
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise<void>((resolve, reject) => {
        if (window.turnstile) {
            resolve();
            return;
        }
        const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${SCRIPT_SRC}"]`
        );
        const script = existing ?? document.createElement("script");
        script.addEventListener("load", () => resolve());
        script.addEventListener("error", () => {
            scriptPromise = null;
            reject(new Error("Failed to load Turnstile"));
        });
        if (!existing) {
            script.src = SCRIPT_SRC;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
    });
    return scriptPromise;
};

export type TurnstileHandle = { reset: () => void };

type Props = {
    /* Called with a fresh token, or null once it expires or errors out. */
    onVerify: (token: string | null) => void;
    /* Labels the challenge in Cloudflare analytics, e.g. "register". */
    action?: string;
    className?: string;
};

const Turnstile = forwardRef<TurnstileHandle, Props>(
    ({ onVerify, action, className }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const widgetIdRef = useRef<string | null>(null);
        /* Keep the latest callback without re-rendering the widget. */
        const onVerifyRef = useRef(onVerify);
        onVerifyRef.current = onVerify;

        useImperativeHandle(ref, () => ({
            reset: () => {
                if (widgetIdRef.current) {
                    window.turnstile?.reset(widgetIdRef.current);
                    onVerifyRef.current(null);
                }
            },
        }));

        useEffect(() => {
            if (!TURNSTILE_SITE_KEY) return;
            let cancelled = false;

            loadTurnstile()
                .then(() => {
                    if (cancelled || !containerRef.current || !window.turnstile) return;
                    widgetIdRef.current = window.turnstile.render(containerRef.current, {
                        sitekey: TURNSTILE_SITE_KEY,
                        action,
                        theme: "auto",
                        callback: (token) => onVerifyRef.current(token),
                        "expired-callback": () => onVerifyRef.current(null),
                        "error-callback": () => onVerifyRef.current(null),
                    });
                })
                .catch((err) => {
                    console.error("Turnstile failed to load:", err);
                    if (!cancelled) onVerifyRef.current(null);
                });

            return () => {
                cancelled = true;
                if (widgetIdRef.current) {
                    window.turnstile?.remove(widgetIdRef.current);
                    widgetIdRef.current = null;
                }
            };
        }, [action]);

        if (!TURNSTILE_SITE_KEY) return null;

        /* The widget is a fixed 300px wide, which is wider than the auth card
           on a phone, so shrink it slightly below sm. */
        return (
            <div className={className}>
                <div ref={containerRef} className="origin-center scale-90 sm:scale-100" />
            </div>
        );
    }
);

Turnstile.displayName = "Turnstile";

export default Turnstile;
