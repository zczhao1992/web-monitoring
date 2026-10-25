"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Lock, Key, Clipboard, Trash2, Loader2 } from "lucide-react";
import { getToken, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type KeyScope = "Full Access" | "Read Only" | "Write Only";
type KeyStatus = "Active" | "Revoked";

type KeyRow = {
  id: string;
  name: string;
  scope: KeyScope;
  created: string;
  lastUsed: string;
  status: KeyStatus;
};

const statusColors: Record<KeyStatus, string> = {
  Active: "#00C2A8",
  Revoked: "#6B7280",
};

const SCOPES: KeyScope[] = ["Full Access", "Read Only", "Write Only"];
type Expiry = "Never" | "30 Days" | "90 Days";
const EXPIRIES: Expiry[] = ["Never", "30 Days", "90 Days"];

export default function Page() {
  const t = useTranslations("ApiKeys");
  const tCommon = useTranslations("Common");

  // Remove hardcoded seed; load from API instead
  const [keys, setKeys] = React.useState<KeyRow[]>([]);
  const [selected, setSelected] = React.useState<KeyRow | null>(null);

  const [revealOpen, setRevealOpen] = React.useState(false);
  const [generatedSecret, setGeneratedSecret] = React.useState<string | null>(
    null
  );

  // New: creation loading state
  const [isCreating, setIsCreating] = React.useState(false);
  // New: loading state for fetching saved API keys
  const [isLoadingKeys, setIsLoadingKeys] = React.useState(true);
  // New: copied feedback state
  const [copied, setCopied] = React.useState(false);
  const { isLoaded, isSignedIn } = useUser();

  const queryClient = useQueryClient();
  const {
    data: apiKeysData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api-keys`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const res = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof res?.message === "string"
            ? res.message
            : "Unable to load API keys"
        );
      }
      return Array.isArray(res) ? res : [];
    },
    enabled: isLoaded && isSignedIn,
  });

  const apiKeys = Array.isArray(apiKeysData) ? apiKeysData : [];

  const createKey = async () => {
    setIsCreating(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) return;
      const { key } = await res.json();
      setGeneratedSecret(key);
      setRevealOpen(true);
    } finally {
      setIsCreating(false);
    }
  };

  const revokeSelected = async () => {
    if (!selected) return;

    // Prevent revoking the system-generated "Default" key
    if (selected.name === "Default") {
      toast.error(t("toast.cannotDeleteDefault"));
      return;
    }

    // Prevent revoking the last active key
    if (activeCount <= 1 && selected.status === "Active") {
      toast.error(t("toast.cannotRevokeLast"));
      return;
    }

    await fetch("/api/api-keys/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id }),
    });

    setSelected((sel) => (sel ? { ...sel, status: "Revoked" } : sel));
  };

  const copyGeneratedSecret = () => {
    if (!generatedSecret) return;
    navigator.clipboard.writeText(generatedSecret);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const activeCount = React.useMemo(
    () => keys.filter((k) => k.status === "Active").length,
    [keys]
  );

  const limitReached = activeCount >= 5;

  const revokedCount = React.useMemo(
    () => keys.filter((k) => k.status === "Revoked").length,
    [keys]
  );
  const lastGeneratedAgo = React.useMemo(() => {
    const timestamps = keys
      .map((k) => Date.parse(k.created))
      .filter((time) => !Number.isNaN(time));
    if (timestamps.length === 0) return "—";
    const latest = Math.max(...timestamps);
    const diffMs = Date.now() - latest;
    const secs = Math.floor(diffMs / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days >= 1) return t("timeAgo.days", { count: days });
    if (hours >= 1) return t("timeAgo.hours", { count: hours });
    if (mins >= 1) return t("timeAgo.minutes", { count: mins });
    return t("timeAgo.justNow");
  }, [keys, t]);

  const scopeLabel = (scope: KeyScope) => {
    const keys: Record<KeyScope, "fullAccess" | "readOnly" | "writeOnly"> = {
      "Full Access": "fullAccess",
      "Read Only": "readOnly",
      "Write Only": "writeOnly",
    };
    return t(`scope.${keys[scope]}`);
  };

  const expiryLabel = (expiry: Expiry) => {
    if (expiry === "Never") return t("generateDialog.never");
    return t("generateDialog.days", { count: Number.parseInt(expiry, 10) });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {/* Disable generate button at limit; show tooltip */}
        <span className="inline-flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-md"
                onClick={() => createKey()}
                disabled={limitReached}
              >
                <Plus className="h-4 w-4" />
                {t("generate")}
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              {limitReached ? t("tooltip.limit") : t("tooltip.create")}
            </TooltipContent>
          </Tooltip>
        </span>
      </div>

      {/* Info Card */}
      <div
        className="rounded-md border"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-start gap-3 p-6">
          <div className="mt-0.5">
            <Lock className="h-5 w-5 opacity-70" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium">{t("securityTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("securityDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Keys Table */}
      <div className="rounded-md border">
        {keys.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-sm font-medium">{t("yourKeys")}</h3>
            <span className="text-xs text-muted-foreground">
              {t("keyCount", { count: keys.length })}
            </span>
          </div>
        )}

        {keys.length === 0 ? (
          isLoadingKeys ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("loadingKeys")}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Key className="mr-2 h-4 w-4" />
              {t("noKeys")}
            </div>
          )
        ) : (
          <div className="relative">
            {/* Overlay spinner while refreshing keys list */}
            {isLoadingKeys && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("refreshing")}
                </div>
              </div>
            )}

            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.name")}</TableHead>
                  <TableHead>{t("table.scope")}</TableHead>
                  <TableHead>{t("table.created")}</TableHead>
                  <TableHead>{t("table.lastUsed")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k, idx) => (
                  <TableRow
                    key={`${k.name}-${idx}`}
                    className="cursor-pointer transition-colors hover:bg-white/5"
                    onClick={() => setSelected(k)}
                  >
                    <TableCell className="text-white/90">{k.name}</TableCell>
                    <TableCell className="text-white/80">
                      {scopeLabel(k.scope)}
                    </TableCell>
                    <TableCell className="text-white/70">{k.created}</TableCell>
                    <TableCell className="text-white/70">
                      {k.lastUsed}
                    </TableCell>
                    <TableCell
                      className="font-medium"
                      style={{ color: statusColors[k.status] }}
                    >
                      {t(
                        `status.${k.status === "Active" ? "active" : "revoked"}`
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {k.status !== "Revoked" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg"
                                  disabled={
                                    activeCount <= 1 && k.status === "Active"
                                  }
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (k.name === "Default") {
                                      toast.error(
                                        t("toast.cannotDeleteDefault")
                                      );
                                      return;
                                    }
                                    if (
                                      activeCount <= 1 &&
                                      k.status === "Active"
                                    ) {
                                      toast.error(t("toast.cannotRevokeLast"));
                                      return;
                                    }
                                    setSelected(k);
                                    await revokeSelected();
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {t("revoke")}
                                </Button>
                              </span>
                            </TooltipTrigger>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Key Detail Drawer (right side) */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="fixed right-0 top-0 h-full w-105 border-l p-4"
            style={{
              background: "#0E1117",
              borderColor: "rgba(255,255,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{t("detail.title")}</h3>
              <div className="flex gap-2">
                {selected.status !== "Revoked" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-md"
                          disabled={
                            (activeCount <= 1 &&
                              selected.status === "Active") ||
                            selected.name === "Default"
                          }
                          onClick={revokeSelected}
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("revoke")}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>
                      {selected.name === "Default"
                        ? t("detail.cannotDeleteDefault")
                        : activeCount <= 1 && selected.status === "Active"
                        ? t("detail.cannotRevokeLast")
                        : t("detail.revokeThis")}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("table.name")}</span>
                <span>{selected.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("table.scope")}
                </span>
                <span>{scopeLabel(selected.scope)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("table.created")}
                </span>
                <span>{selected.created}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("table.lastUsed")}
                </span>
                <span>{selected.lastUsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("table.status")}
                </span>
                <span style={{ color: statusColors[selected.status] }}>
                  {t(
                    `status.${
                      selected.status === "Active" ? "active" : "revoked"
                    }`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* One-time Secret Reveal Dialog */}
      <Dialog
        open={revealOpen}
        onOpenChange={(open: boolean) => {
          setRevealOpen(open);
          if (!open) setGeneratedSecret(null);
        }}
      >
        <DialogContent
          className="sm:max-w-130"
          overlayClassName="fixed inset-0 z-50 bg-black/30 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out"
        >
          <DialogHeader>
            <DialogTitle>{t("revealDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("revealDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-md border p-3 text-sm font-mono">
              <div className="text-xs text-muted-foreground mb-1">
                {t("revealDialog.secret")}
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="flex-1 min-w-0 break-all">
                  {generatedSecret ?? "—"}
                </span>
                <Tooltip open={copied}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={
                        "rounded-md " +
                        (copied
                          ? "text-emerald-400 border-emerald-400 hover:bg-transparent"
                          : "hover:bg-muted hover:text-muted-foreground")
                      }
                      onClick={copyGeneratedSecret}
                      disabled={!generatedSecret}
                    >
                      <Clipboard className="h-4 w-4" />
                      {copied
                        ? t("revealDialog.copied")
                        : t("revealDialog.copy")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    {t("revealDialog.copiedTooltip")}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {t("revealDialog.warning")}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                className="rounded-md"
                onClick={() => setRevealOpen(false)}
              >
                {t("revealDialog.confirm")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer status bar */}
      <div
        className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-6">
          <span className="text-muted-foreground">
            {t("footer.activeKeys")}
          </span>
          <span className="font-medium">{activeCount}</span>
          <span className="text-muted-foreground">{t("footer.revoked")}</span>
          <span className="font-medium">{revokedCount}</span>
          <span className="text-muted-foreground">
            {t("footer.lastGenerated")}
          </span>
          <span className="font-medium">{lastGeneratedAgo}</span>
        </div>
      </div>
    </div>
  );
}
