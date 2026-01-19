import React from 'react';

export default function Footer() {
    return (
        <footer className="mt-auto py-8 bg-slate-900 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-slate-400">
                        Copyright © 2025 - 2026 Julian C Galotto
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>jcgalotto.github.io</span>
                        <a
                            href="https://www.linkedin.com/in/jcgalotto/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-blue-400 transition-colors hover:underline"
                        >
                            LinkedIn Profile
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
