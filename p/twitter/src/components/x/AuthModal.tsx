"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function AuthModal() {
  const { authModalOpen, closeAuthModal } = useAuth();

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ willChange: "opacity" }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Fechar"
            onClick={closeAuthModal}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="relative z-[101] max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-2xl border border-x-border bg-x-black shadow-2xl shadow-black/50"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-x-border px-4 py-3">
              <button
                type="button"
                onClick={closeAuthModal}
                className="btn-press flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-x-text transition-colors hover:bg-x-hover"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <div className="w-9" />
            </div>
            <div className="px-6 pb-10 pt-6 sm:px-14">
              <div className="mx-auto mb-6 flex justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="h-10 w-10 text-x-text"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <h2
                id="auth-modal-title"
                className="text-[26px] font-extrabold leading-8 tracking-tight text-x-text sm:text-[31px] sm:leading-9"
              >
                Join X today. Sign up to interact with this post.
              </h2>
              <div
                role="note"
                className="mt-4 rounded-xl border border-x-border bg-x-elevated/60 px-4 py-3 text-[14px] leading-relaxed text-x-muted sm:text-[15px]"
              >
                <p className="font-semibold text-x-text">About this prototype</p>
                <p className="mt-2">
                  This interface is a{" "}
                  <span className="text-x-text">limited visual and functional replica</span>{" "}
                  for demonstration purposes only. It is not possible to maintain a real social
                  network equivalent to X in this environment, due to{" "}
                  <span className="text-x-text">
                    operational costs, compliance, security, and infrastructure
                  </span>
                  . Therefore,{" "}
                  <span className="text-x-text">
                    login, sign up, and platform operations are not available
                  </span>{" "}
                  at this time and are not feasible within this scope.
                </p>
              </div>
                <p className="mt-4 text-[14px] text-x-muted sm:text-[15px]">
                  By signing up for a real product, you would agree to the Terms of
                  Service and Privacy Policy, including Cookie Usage. Here, the
                  buttons below are for illustration only.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    className="btn-press w-full min-h-[44px] rounded-full border border-x-border py-3 text-[15px] font-semibold text-x-text transition-colors hover:bg-x-hover"
                  >
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    className="btn-press w-full min-h-[44px] rounded-full border border-x-border py-3 text-[15px] font-semibold text-x-text transition-colors hover:bg-x-hover"
                  >
                    Continue with Apple
                  </button>
                  <div className="flex items-center gap-2 py-1">
                    <span className="h-px flex-1 bg-x-border" />
                    <span className="text-sm text-x-muted">or</span>
                    <span className="h-px flex-1 bg-x-border" />
                  </div>
                  <button
                    type="button"
                    className="btn-press w-full min-h-[44px] rounded-full bg-x-blue py-3 text-[15px] font-bold text-white transition-colors"
                  >
                    Create account
                  </button>
                </div>
                <p className="mt-6 text-[15px] text-x-muted">
                  Already have an account?{" "}
                  <button type="button" className="btn-press text-x-blue hover:underline">
                    Sign in
                  </button>
                </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
