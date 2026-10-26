"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
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
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "timeago.js";
import { getToken, useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/** 服务端返回的 API 密钥原始数据（字段与后端保持一致） */
type ApiKeyItem = {
  id: string;
  prefix: string;
  name?: string | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

/** 每个用户最多可拥有的活跃密钥数量 */
const ACTIVE_KEY_LIMIT = 5;

const statusColors: any = {
  Active: "#00C2A8",
  Revoked: "#6B7280",
};

export default function Page() {
  const t = useTranslations("ApiKeys");
  const locale = useLocale();
  // 详情抽屉当前展示的密钥，null 表示抽屉关闭
  const [selected, setSelected] = React.useState<ApiKeyItem | null>(null);
  const [revealOpen, setRevealOpen] = React.useState(false);
  // 新建密钥仅在创建时返回一次完整密钥，关闭弹窗后清空
  const [generatedSecret, setGeneratedSecret] = React.useState<string | null>(
    null
  );
  // 创建 / 吊销请求的加载状态
  const [isCreating, setIsCreating] = React.useState(false);
  const [isRevoking, setIsRevoking] = React.useState(false);
  // 复制按钮的短暂成功反馈
  const [copied, setCopied] = React.useState(false);

  const { isLoaded, isSignedIn } = useUser();
  const queryClient = useQueryClient();

  // 拉取当前用户的 API 密钥列表，登录态就绪后才发起请求
  const {
    data: apiKeys = [],
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
      const res = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          typeof res?.message === "string"
            ? res.message
            : t("errors.loadFailed")
        );
      }
      return Array.isArray(res) ? (res as ApiKeyItem[]) : [];
    },
    enabled: isLoaded && isSignedIn,
  });

  // 创建新密钥，成功后刷新列表并弹出一次性密钥展示框
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
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.message ?? t("errors.createFailed"));
        return;
      }
      setGeneratedSecret(data?.key ?? null);
      setRevealOpen(true);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    } catch {
      toast.error(t("errors.createFailed"));
    } finally {
      setIsCreating(false);
    }
  };

  // 吊销指定密钥，成功后刷新列表并关闭详情抽屉
  const revokeKey = async (keyId: string) => {
    setIsRevoking(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api-keys/${keyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        toast.error(error?.message ?? t("errors.revokeFailed"));
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setSelected(null);
    } catch {
      toast.error(t("errors.revokeFailed"));
    } finally {
      setIsRevoking(false);
    }
  };

  // 复制一次性密钥，并在 1.5s 后恢复按钮文案
  const copyGeneratedSecret = () => {
    if (!generatedSecret) return;
    navigator.clipboard.writeText(generatedSecret);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const activeCount = React.useMemo(
    () => apiKeys.filter((k) => k.revoked_at === null).length,
    [apiKeys]
  );

  const revokedCount = React.useMemo(
    () => apiKeys.filter((k) => k.revoked_at !== null).length,
    [apiKeys]
  );

  // 活跃密钥达到上限后禁止继续创建
  const limitReached = activeCount >= ACTIVE_KEY_LIMIT;

  // 最近一次生成密钥的相对时间（如 '3 小时前'）
  const lastGeneratedAgo = React.useMemo(() => {
    const timestamps = apiKeys
      .map((k: any) => Date.parse(k.created_at))
      .filter((t: any) => !Number.isNaN(t));
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
  }, [apiKeys, t]);

  // 首次加载中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t("loadingKeys")}
      </div>
    );
  }

  // 加载失败
  if (isError) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        {t("errors.loadFailed")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 页头：标题 + 生成密钥按钮 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <span className="inline-flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-md"
                onClick={createKey}
                disabled={isCreating || limitReached}
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

      {/* 安全提示卡片 */}
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

      {/* 密钥列表 */}
      <div className="rounded-md border">
        {apiKeys.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-sm font-medium">{t("yourKeys")}</h3>
            <span className="text-xs text-muted-foreground">
              {t("keyCount", { count: apiKeys.length })}
            </span>
          </div>
        )}

        {apiKeys.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Key className="mr-2 h-4 w-4" />
            {t("noKeys")}
          </div>
        ) : (
          <div className="relative">
            {/* 后台刷新时的半透明遮罩 */}
            {isLoading && (
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
                  <TableHead>{t("table.created")}</TableHead>
                  <TableHead>{t("table.lastUsed")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((item) => {
                  const isActive = item.revoked_at === null;

                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer transition-colors hover:bg-white/5"
                      onClick={() => setSelected(item)}
                    >
                      <TableCell className="text-white/90">
                        {item.prefix}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {format(item.created_at) ?? "—"}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {item.last_used_at ?? t("notUsedYet")}
                      </TableCell>
                      <TableCell
                        className="font-medium"
                        style={{
                          color: statusColors[isActive ? "Active" : "Revoked"],
                        }}
                      >
                        {isActive ? t("status.active") : t("status.revoked")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {isActive && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg"
                                    disabled={isRevoking || activeCount <= 1}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (activeCount <= 1) {
                                        toast.error(
                                          t("toast.cannotRevokeLast")
                                        );
                                        return;
                                      }
                                      revokeKey(item.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {t("revoke")}
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={6}>
                                {activeCount <= 1
                                  ? t("detail.cannotRevokeLast")
                                  : t("detail.revokeThis")}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* 密钥详情抽屉 */}
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
                {selected.revoked_at === null && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-md"
                          disabled={isRevoking || activeCount <= 1}
                          onClick={() => revokeKey(selected.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("revoke")}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>
                      {activeCount <= 1
                        ? t("detail.cannotRevokeLast")
                        : t("detail.revokeThis")}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.created")}
                </span>
                <span>{format(selected.created_at, locale) ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.lastUsed")}
                </span>
                <span>
                  {(selected.last_used_at, locale ?? t("notUsedYet"))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.status")}
                </span>
                <span
                  style={{
                    color:
                      statusColors[
                        selected.revoked_at === null ? "Active" : "Revoked"
                      ],
                  }}
                >
                  {selected.revoked_at === null
                    ? t("status.active")
                    : t("status.revoked")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 一次性密钥展示弹窗 */}
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

      {/* 底部统计栏 */}
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
