"use client";
import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowUpCircle,
  Trash2,
  Check,
  Download,
  AlertTriangle,
} from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";

type PlanId = "free" | "starter" | "pro" | "enterprise";

const PLANS: PlanId[] = ["free", "starter", "pro", "enterprise"];

// Plan feature list per tier, in display order
const PLAN_FEATURES: Record<PlanId, string[]> = {
  free: ["logs", "retention", "search", "emailSupport", "apiAccess"],
  starter: ["logs", "retention", "search", "prioritySupport", "apiAccess"],
  pro: ["logs", "retention", "alerts", "support", "apiAccess"],
  enterprise: ["logs", "retention", "support", "sla", "security", "onPremise"],
};

export default function Page() {
  const t = useTranslations("Settings");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const { user, isLoaded } = useUser();
  const currentPlan: PlanId = "free";
  const [selectedPlan, setSelectedPlan] = React.useState<PlanId>(currentPlan);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const planOrder: Record<PlanId, number> = {
    free: 0,
    starter: 1,
    pro: 2,
    enterprise: 3,
  };
  const canUpgrade = planOrder[selectedPlan] > planOrder[currentPlan];

  const currentPlanDetails = {
    name: t(`plans.${currentPlan}.name`),
    features: PLAN_FEATURES[currentPlan].map((feature) =>
      t(`plans.${currentPlan}.features.${feature}`),
    ),
    logsLimit: t(`plans.${currentPlan}.logsLimit`),
  };

  // Design tokens for a premium look
  const TOKENS = {
    accent: "#00C2A8",
    border: "rgba(255,255,255,0.08)",
    radius: "12px",
    cardBg:
      "linear-gradient(180deg, rgba(16,20,27,0.92) 0%, rgba(16,20,27,0.78) 100%)",
    shadow: "0 10px 30px rgba(0,0,0,0.45)",
  };

  // Invoices mock data - dynamic based on plan
  const invoices: any[] = [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      {/* Tabs */}
      <Tabs defaultValue="billing" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="bg-transparent border-none shadow-none p-0 h-auto rounded-none flex gap-2">
            <TabsTrigger
              value="billing"
              className="px-3 py-2 text-sm font-medium rounded-none border-b-2 border-transparent text-muted-foreground hover:text-white/90 data-[state=active]:text-white data-[state=active]:border-b-[#00C2A8]"
            >
              {t("tabs.billing")}
            </TabsTrigger>
            <TabsTrigger
              value="project"
              className="px-3 py-2 text-sm font-medium rounded-none border-b-2 border-transparent text-muted-foreground hover:text-white/90 data-[state=active]:text-white data-[state=active]:border-b-[#00C2A8]"
            >
              {t("tabs.project")}
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="px-3 py-2 text-sm font-medium rounded-none border-b-2 border-transparent text-muted-foreground hover:text-white/90 data-[state=active]:text-white data-[state=active]:border-b-[#00C2A8]"
            >
              {t("tabs.account")}
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="px-3 py-2 text-sm font-medium rounded-none border-b-2 border-transparent text-muted-foreground hover:text-white/90 data-[state=active]:text-white data-[state=active]:border-b-[#00C2A8]"
            >
              {t("tabs.danger")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Billing & Plan */}
        <TabsContent value="billing">
          <div
            className="rounded-md border p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${TOKENS.border}`,
              borderRadius: TOKENS.radius,
            }}
          >
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("billing.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("billing.description")}
              </p>

              {/* Premium two-card layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="rounded-md border p-5 transition-all hover:border-white/20"
                  style={{
                    background: TOKENS.cardBg,
                    border: `1px solid ${TOKENS.border}`,
                  }}
                >
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("billing.currentPlan")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">
                      {!isLoaded ? tCommon("loading") : currentPlanDetails.name}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full border"
                      style={{
                        background: "rgba(0,194,168,0.12)",
                        borderColor: "rgba(0,194,168,0.35)",
                        color: TOKENS.accent,
                      }}
                    >
                      {t("billing.active")}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    {currentPlanDetails.features
                      .slice(0, 3)
                      .map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-white/85"
                        >
                          <Check className="h-4 w-4" color={TOKENS.accent} />
                          {feature}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Change Plan selector */}
                <div
                  className="rounded-md border p-5 transition-all hover:border-white/20"
                  style={{
                    background: TOKENS.cardBg,
                    border: `1px solid ${TOKENS.border}`,
                  }}
                >
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("billing.changePlan")}
                  </div>
                  <Select
                    value={selectedPlan}
                    onValueChange={(v) => setSelectedPlan(v as PlanId)}
                  >
                    <SelectTrigger className="w-full rounded-md">
                      <SelectValue placeholder={t("billing.selectPlan")} />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map((plan) => (
                        <SelectItem key={plan} value={plan}>
                          {t(`plans.${plan}.name`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {t("billing.usage")}
                      </div>
                      <div className="font-medium">
                        {currentPlanDetails.logsLimit}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {t("billing.nextInvoice")}
                      </div>
                      <div className="font-medium">
                        {currentPlan === "free"
                          ? t("billing.notApplicable")
                          : new Date("2025-11-30T00:00:00Z").toLocaleDateString(
                              locale,
                              { year: "numeric", month: "short", day: "numeric" },
                            )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <Button
                      className="rounded-md"
                      disabled={!canUpgrade}
                    >
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      {selectedPlan === currentPlan
                        ? t("billing.currentPlanButton")
                        : t("billing.upgradePlan")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Invoices table (polished) */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{t("billing.invoices")}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {t("billing.invoiceCount", { count: invoices.length })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg hover:bg-white/10"
                    >
                      <Download className="h-4 w-4" />
                      {t("billing.exportCsv")}
                    </Button>
                  </div>
                </div>
                <div
                  className="mt-2 rounded-md border"
                  style={{
                    border: `1px solid ${TOKENS.border}`,
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="border-b-[0.5px] border-white/10">
                        <TableHead className="text-xs text-white/60">
                          {t("billing.table.invoiceId")}
                        </TableHead>
                        <TableHead className="text-xs text-white/60">
                          {t("billing.table.date")}
                        </TableHead>
                        <TableHead className="text-xs text-white/60">
                          {t("billing.table.amount")}
                        </TableHead>
                        <TableHead className="text-xs text-white/60">
                          {t("billing.table.status")}
                        </TableHead>
                        <TableHead className="text-xs text-white/60">
                          {t("billing.table.actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices?.length > 0 ? (
                        <>
                          {invoices.map((inv) => (
                            <TableRow
                              key={inv.id}
                              className="group transition-all hover:bg-white/3"
                            >
                              <TableCell className="font-mono text-xs text-white/90">
                                {inv.id}
                              </TableCell>
                              <TableCell className="text-white/80">
                                {inv.date}
                              </TableCell>
                              <TableCell className="text-white/80">
                                {inv.amount}
                              </TableCell>
                              <TableCell>
                                <span
                                  className="text-[11px] px-2 py-0.5 rounded-full border"
                                  style={{
                                    background: "rgba(0,194,168,0.12)",
                                    borderColor: "rgba(0,194,168,0.35)",
                                    color: TOKENS.accent,
                                  }}
                                >
                                  {inv.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg opacity-80 group-hover:opacity-100 hover:bg-[rgba(0,194,168,0.15)]"
                                >
                                  <Download className="h-4 w-4" />
                                  {t("billing.downloadPdf")}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            {t("billing.noInvoices")}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Project Settings */}
        <TabsContent value="project">
          <div
            className="rounded-md border p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${TOKENS.border}`,
              borderRadius: TOKENS.radius,
            }}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium">{t("project.title")}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("project.description")}
                </p>
              </div>

              {/* Clean list-style layout */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white/90">
                      {t("project.name")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t("project.nameHint")}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {t("project.nameValue")}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white/90">
                      {t("project.region")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t("project.regionHint")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      {t("project.regionValue")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("project.regionDetail")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-white/90">
                      {t("project.timezone")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t("project.timezoneHint")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      {t("project.timezoneValue")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("project.timezoneDetail")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Account & Security */}
        <TabsContent value="account">
          <div
            className="rounded-md border p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${TOKENS.border}`,
              borderRadius: TOKENS.radius,
            }}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium">{t("account.title")}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("account.description")}
                </p>
              </div>

              {/* Clean list-style layout */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white/90">
                      {t("account.name")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t("account.nameHint")}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {user?.fullName || t("account.notSet")}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white/90">
                      {t("account.email")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t("account.emailHint")}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {user?.emailAddresses[0].emailAddress ||
                      t("account.notAvailable")}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white/90">
                      {t("account.joined")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t("account.joinedHint")}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(locale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : t("account.notAvailable")}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-white/90">
                      {t("account.plan")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t("account.planHint")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {currentPlanDetails.name}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full border"
                      style={{
                        background: "rgba(0,194,168,0.12)",
                        borderColor: "rgba(0,194,168,0.35)",
                        color: TOKENS.accent,
                      }}
                    >
                      {t(`plans.${currentPlan}.name`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger">
          <div
            className="rounded-md border p-6"
            style={{
              border: "1px solid rgba(248,113,113,0.3)",
              background: "rgba(248,113,113,0.05)",
              borderRadius: "12px",
            }}
          >
            <div className="space-y-3">
              <h3 className="text-sm font-medium">{t("danger.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("danger.description")}
              </p>
              <div className="flex justify-end pt-2">
                <Dialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="rounded-md">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("danger.deleteAccount")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-125">
                    <DialogHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-full p-3"
                          style={{
                            background: "rgba(248,113,113,0.15)",
                            border: "1px solid rgba(248,113,113,0.3)",
                          }}
                        >
                          <AlertTriangle className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                          <DialogTitle className="text-lg font-semibold">
                            {t("danger.dialog.title")}
                          </DialogTitle>
                        </div>
                      </div>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                        {t("danger.dialog.description")}
                      </DialogDescription>

                      <div
                        className="rounded-md border p-4 space-y-3"
                        style={{
                          background: "rgba(248,113,113,0.05)",
                          border: "1px solid rgba(248,113,113,0.2)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-red-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white/90">
                              {t("danger.dialog.holdTitle")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {t("danger.dialog.holdDescription")}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-red-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white/90">
                              {t("danger.dialog.purgeTitle")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {t("danger.dialog.purgeDescription")}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {t("danger.dialog.changeMind")}
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                        className="rounded-md hover:bg-black/10"
                      >
                        {tCommon("cancel")}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          console.log("Account deletion requested");
                          setDeleteDialogOpen(false);
                        }}
                        className="rounded-md"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("danger.dialog.confirm")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
