import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
} from "@phosphor-icons/react";

const DEMOS = [
  {
    id: "docker",
    label: "Docker container",
    query: "run postgres container with custom volume and password",
    defaultVars: {
      password: "secretpassword",
      port: "5432",
      volume: "pg_data",
    },
    renderCommand: (vars: Record<string, string>) =>
      `docker run -d --name db -e POSTGRES_PASSWORD=${vars.password || "secretpassword"} -p ${vars.port || "5432"}:5432 -v ${vars.volume || "pg_data"}:/var/lib/postgresql/data postgres:16-alpine`,
  },
  {
    id: "git",
    label: "Git workflow",
    query: "safe force push with lease and verify remote branch",
    defaultVars: {
      remote: "origin",
      branch: "main",
    },
    renderCommand: (vars: Record<string, string>) =>
      `git push --force-with-lease ${vars.remote || "origin"} ${vars.branch || "main"}`,
  },
  {
    id: "nginx",
    label: "Nginx reverse proxy",
    query: "configure reverse proxy to upstream local port with headers",
    defaultVars: {
      domain: "api.example.com",
      upstreamPort: "8080",
    },
    renderCommand: (vars: Record<string, string>) =>
      `proxy_pass http://127.0.0.1:${vars.upstreamPort || "8080"};\nproxy_set_header Host ${vars.domain || "api.example.com"};\nproxy_set_header X-Forwarded-For $remote_addr;`,
  },
];

export function GlintTerminalDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [variables, setVariables] = useState<Record<string, string>>({
    password: "secretpassword",
    port: "5432",
    volume: "pg_data",
    remote: "origin",
    branch: "main",
    domain: "api.example.com",
    upstreamPort: "8080",
  });
  const [copied, setCopied] = useState(false);

  const currentDemo = DEMOS[activeTab];
  const generatedCommand = currentDemo.renderCommand(variables);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateVar = (key: string, val: string) => {
    setVariables((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <section id="demo" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="caption-3 text-neutral-400 uppercase tracking-widest mb-3">
          Interactive simulator
        </div>
        <h2 className="heading-2 text-white mb-4">
          Test drive dynamic command pills
        </h2>
        <p className="body-2 text-neutral-400 max-w-[680px] mx-auto">
          Notice how changing a variable updates the full command immediately.
        </p>
      </div>

      <div className="rounded-2xl bg-[#181818] border border-[#272727] p-4 sm:p-6 shadow-2xl">
        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[#272727] pb-4">
          {DEMOS.map((demo, idx) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => {
                setActiveTab(idx);
                setCopied(false);
              }}
              className={`button-sm px-3 py-1.5 rounded-full transition-colors ${
                activeTab === idx
                  ? "bg-white text-black"
                  : "bg-[#272727] text-neutral-300 hover:text-white hover:bg-[#313131]"
              }`}
            >
              {demo.label}
            </button>
          ))}
        </div>

        {/* Mock Query Prompt */}
        <div className="p-3 rounded-xl bg-[#131209] border border-[#272727] flex items-center gap-3 mb-6">
          <Terminal size={18} weight="bold" className="text-amber-400 shrink-0" />
          <div className="title-4 text-neutral-200 font-mono">
            {currentDemo.query}
          </div>
        </div>

        {/* Dynamic Variable Pill Inputs */}
        <div className="p-4 rounded-xl bg-[#1F1F1F] border border-[#272727] mb-6">
          <div className="caption-3 text-neutral-300 mb-3">
            Active parameter inputs
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {Object.keys(currentDemo.defaultVars).map((varKey) => (
              <label
                key={varKey}
                className="flex items-center gap-2 caption-3 text-neutral-300"
              >
                <span className="font-mono text-emerald-400">&#123;&#123;{varKey}&#125;&#125;:</span>
                <input
                  type="text"
                  value={variables[varKey] ?? ""}
                  onChange={(e) => updateVar(varKey, e.target.value)}
                  className="px-2.5 py-1 bg-[#131209] border border-[#272727] rounded text-white font-mono text-xs focus:outline-none focus:border-neutral-400"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Live Command Output Area */}
        <div className="p-4 rounded-xl bg-[#131209] border border-[#272727] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <pre className="font-mono text-xs text-neutral-200 whitespace-pre-wrap overflow-x-auto">
            {generatedCommand}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 py-2 px-3 rounded-lg bg-white text-black button-sm hover:bg-neutral-200 transition-colors active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check size={16} weight="bold" />
                <span>Copied to clipboard</span>
              </>
            ) : (
              <>
                <Copy size={16} weight="bold" />
                <span>Copy command</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
