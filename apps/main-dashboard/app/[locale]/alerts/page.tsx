"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Bell } from "lucide-react";
import { toast } from "sonner";

type AlertStatus = "active" | "resolved";
type AlertSeverity = "high" | "medium" | "low";

type AlertRow = {
  name: string;
  condition: string;
  status: AlertStatus;
  severity: AlertSeverity;
  lastTriggered: string;
};

const statusColors: Record<AlertStatus, string> = {
  active: "#00C2A8",
  resolved: "#6B7280",
};
const severityColors: Record<AlertSeverity, string> = {
  high: "#F87171",
  medium: "#FBBF24",
  low: "#34D399",
};

const SEVERITIES: AlertSeverity[] = ["low", "medium", "high"];
const THRESHOLDS = ["5m", "15m", "1h"] as const;

export default function Page() {
  const t = useTranslations("Alerts");
  const tCommon = useTranslations("Common");

  const initialAlerts: AlertRow[] = [];

  const [alerts, setAlerts] = React.useState<AlertRow[]>(initialAlerts);
  const [selected, setSelected] = React.useState<AlertRow | null>(null);
  const [newAlertOpen, setNewAlertOpen] = React.useState(false);

  const thresholdLabel = (value: (typeof THRESHOLDS)[number]) =>
    value === "1h"
      ? t("dialog.hour")
      : t("dialog.minutes", { count: Number.parseInt(value, 10) });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button
          className="rounded-xl"
          onClick={() => toast.error(t("comingSoon"))}
        >
          <Plus className="h-4 w-4" />
          {t("newAlert")}
        </Button>
      </div>

      {/* Alerts Table */}
      <div
        className="rounded-xl border"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >

        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">{t("emptyTitle")}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {t("emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="relative">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.name")}</TableHead>
                  <TableHead>{t("table.condition")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.severity")}</TableHead>
                  <TableHead>{t("table.lastTriggered")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((a, idx) => (
                  <TableRow
                    key={`${a.name}-${idx}`}
                    className="cursor-pointer transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}
                    onClick={() => setSelected(a)}
                  >
                    <TableCell className="text-white/90">{a.name}</TableCell>
                    <TableCell className="text-white/80">
                      {a.condition}
                    </TableCell>
                    <TableCell
                      className="font-medium"
                      style={{ color: statusColors[a.status] }}
                    >
                      {t(`status.${a.status}`)}
                    </TableCell>
                    <TableCell
                      className="font-medium"
                      style={{ color: severityColors[a.severity] }}
                    >
                      {t(`severity.${a.severity}`)}
                    </TableCell>
                    <TableCell className="text-white/60">
                      {a.lastTriggered}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Row hover tint */}
            <style>{`
              [data-slot="table-row"]:hover {
                background: rgba(255,255,255,0.05);
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Alert Detail Drawer (right side) */}


      {/* New Alert Modal */}
      <Dialog open={newAlertOpen} onOpenChange={setNewAlertOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>{t("dialog.title")}</DialogTitle>
            <DialogDescription>{t("dialog.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                {t("dialog.name")}
              </div>
              <Input
                placeholder={t("dialog.namePlaceholder")}
                className="rounded-xl"
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                {t("dialog.condition")}
              </div>
              <Input
                placeholder={t("dialog.conditionPlaceholder")}
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {t("dialog.severity")}
                </div>
                <Select defaultValue="medium">
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder={tCommon("select")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {t(`severity.${severity}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {t("dialog.channel")}
                </div>
                <Select defaultValue="Slack">
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder={tCommon("select")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Slack">Slack</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {t("dialog.threshold")}
                </div>
                <Select defaultValue="15m">
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder={tCommon("select")} />
                  </SelectTrigger>
                  <SelectContent>
                    {THRESHOLDS.map((threshold) => (
                      <SelectItem key={threshold} value={threshold}>
                        {thresholdLabel(threshold)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                className="rounded-xl"
                onClick={() => setNewAlertOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                className="rounded-xl"
                onClick={() => setNewAlertOpen(false)}
              >
                {t("dialog.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer status bar */}
      <div
        className="flex items-center justify-between rounded-xl border px-3 py-2 text-xs"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-6">
          <span className="text-muted-foreground">{t("footer.active")}</span>
          <span className="font-medium">0</span>
          <span className="text-muted-foreground">{t("footer.muted")}</span>
          <span className="font-medium">0</span>
          <span className="text-muted-foreground">{t("footer.resolved")}</span>
          <span className="font-medium">0</span>
        </div>
      </div>
    </div>
  );
}
