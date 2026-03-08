"use client";

import { useEffect, useMemo, useState } from "react";
import Toast from "@/components/Toast";
import CTAButton from "@/components/CTAButton";
import { SERVICE_ICON_OPTIONS } from "@/components/ServiceIcon";
import type {
  AboutTool,
  PackageTier,
  Project,
  ProjectCategory,
  Service,
  SiteContent,
  TeamMember,
  Testimonial,
} from "@/lib/siteContent";

function safeStringify(v: unknown) {
  return JSON.stringify(v, null, 2);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function setByPath(obj: Record<string, unknown>, pathStr: string, value: unknown) {
  const root = obj;
  const parts = pathStr.split(".").filter(Boolean);
  if (parts.length === 0) return root;
  let cur: Record<string, unknown> = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const next = cur[key];
    if (!isRecord(next)) {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]!] = value;
  return root;
}

const PROJECT_CATEGORIES: ProjectCategory[] = [
  "Design",
  "Photo",
  "Video",
  "Social",
  "Printing",
  "Web",
];

type ProjectForm = {
  slug: string;
  title: string;
  category: ProjectCategory;
  year: string;
  tagline: string;
  brief: string;
  deliverablesText: string;
  toolsText: string;
  resultsText: string;
  coverImage: string;
  galleryText: string;
  featured: boolean;
};

type TeamForm = {
  eyebrow: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
};

type TeamMemberForm = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
};

type PackagePricingForm = {
  id: string;
  name: string;
  bestFor: string;
  includesText: string;
  monthlyPriceFbu: string;
  priceNote: string;
};

type ServiceForm = {
  id: string;
  title: string;
  summary: string;
  inclusionsText: string;
  icon: "spark" | "layers" | "megaphone" | "globe" | "camera" | "chart";
};

type TestimonialForm = {
  name: string;
  title: string;
  company: string;
  quote: string;
  image: string;
};

type AboutToolForm = {
  name: string;
  logo: string;
};

export type AdminView =
  | "overview"
  | "content"
  | "services-content"
  | "testimonials"
  | "about-tools"
  | "media"
  | "clients"
  | "works"
  | "team"
  | "packages"
  | "json"
  | "all";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function projectToForm(project: Project): ProjectForm {
  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    year: project.year,
    tagline: project.tagline,
    brief: project.brief,
    deliverablesText: project.deliverables.join("\n"),
    toolsText: project.tools.join("\n"),
    resultsText: project.results.join("\n"),
    coverImage: project.coverImage,
    galleryText: project.gallery.join("\n"),
    featured: Boolean(project.featured),
  };
}

function emptyProjectForm(): ProjectForm {
  return {
    slug: "",
    title: "",
    category: "Design",
    year: String(new Date().getFullYear()),
    tagline: "",
    brief: "",
    deliverablesText: "",
    toolsText: "",
    resultsText: "",
    coverImage: "",
    galleryText: "",
    featured: false,
  };
}

function linesToList(input: string) {
  return input
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function emptyTeamMemberForm(): TeamMemberForm {
  return {
    id: "",
    name: "",
    role: "",
    bio: "",
    image: "",
  };
}

function teamMemberToForm(member: TeamMember): TeamMemberForm {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    bio: member.bio,
    image: member.image || "",
  };
}

function packageToPricingFormRow(pkg: PackageTier): PackagePricingForm {
  return {
    id: pkg.id,
    name: pkg.name,
    bestFor: pkg.bestFor || "",
    includesText: (pkg.includes || []).join("\n"),
    monthlyPriceFbu: pkg.monthlyPriceFbu ? String(pkg.monthlyPriceFbu) : "",
    priceNote: pkg.priceNote || "",
  };
}

function fallbackServiceIcon(serviceId: string): ServiceForm["icon"] {
  if (serviceId === "photo-video") return "camera";
  if (serviceId === "graphic-design") return "layers";
  if (serviceId === "social") return "megaphone";
  if (serviceId === "digital-marketing") return "chart";
  if (serviceId === "web-seo") return "globe";
  return "spark";
}

function serviceToFormRow(service: Service): ServiceForm {
  return {
    id: service.id,
    title: service.title,
    summary: service.summary,
    inclusionsText: (service.inclusions || []).join("\n"),
    icon: service.icon || fallbackServiceIcon(service.id),
  };
}

function emptyTestimonialForm(): TestimonialForm {
  return {
    name: "",
    title: "",
    company: "",
    quote: "",
    image: "",
  };
}

function testimonialToForm(item: Testimonial): TestimonialForm {
  return {
    name: item.name,
    title: item.title,
    company: item.company,
    quote: item.quote,
    image: item.image || "",
  };
}

function emptyAboutToolForm(): AboutToolForm {
  return {
    name: "",
    logo: "",
  };
}

function normalizeAboutTools(tools: Array<string | AboutTool> | undefined): AboutToolForm[] {
  if (!Array.isArray(tools)) return [];
  return tools
    .map((tool) => {
      if (typeof tool === "string") {
        const name = tool.trim();
        return name ? { name, logo: "" } : null;
      }
      const name = (tool?.name || "").trim();
      if (!name) return null;
      return {
        name,
        logo: (tool.logo || "").trim(),
      };
    })
    .filter((item): item is AboutToolForm => Boolean(item));
}

export default function DashboardClient({
  initialView = "all",
}: {
  initialView?: AdminView;
}) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [raw, setRaw] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressUploads, setCompressUploads] = useState(true);
  const [target, setTarget] = useState<string>("home.hero.backgroundImage");
  const [picked, setPicked] = useState<File | null>(null);
  const [sharedBackgroundUrl, setSharedBackgroundUrl] = useState("");
  const [uploadingSharedBackground, setUploadingSharedBackground] = useState(false);
  const [deletingSharedBackgroundIndex, setDeletingSharedBackgroundIndex] = useState<number | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [newClientIndustry, setNewClientIndustry] = useState("");
  const [newClientLogo, setNewClientLogo] = useState<File | null>(null);
  const [addingClient, setAddingClient] = useState(false);
  const [deletingClientIndex, setDeletingClientIndex] = useState<number | null>(null);
  const [workForm, setWorkForm] = useState<ProjectForm>(() => emptyProjectForm());
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);
  const [savingWork, setSavingWork] = useState(false);
  const [uploadingWorkCover, setUploadingWorkCover] = useState(false);
  const [uploadingWorkGallery, setUploadingWorkGallery] = useState(false);
  const [deletingWorkIndex, setDeletingWorkIndex] = useState<number | null>(null);
  const [teamForm, setTeamForm] = useState<TeamForm>({
    eyebrow: "",
    title: "",
    subtitle: "",
    backgroundImage: "",
  });
  const [savingTeam, setSavingTeam] = useState(false);
  const [uploadingTeamBg, setUploadingTeamBg] = useState(false);
  const [teamMemberForm, setTeamMemberForm] = useState<TeamMemberForm>(() =>
    emptyTeamMemberForm(),
  );
  const [editingTeamMemberIndex, setEditingTeamMemberIndex] = useState<number | null>(null);
  const [savingTeamMember, setSavingTeamMember] = useState(false);
  const [deletingTeamMemberIndex, setDeletingTeamMemberIndex] = useState<number | null>(null);
  const [uploadingTeamMemberImage, setUploadingTeamMemberImage] = useState(false);
  const [serviceForm, setServiceForm] = useState<ServiceForm[]>([]);
  const [savingServices, setSavingServices] = useState(false);
  const [packagePricingForm, setPackagePricingForm] = useState<PackagePricingForm[]>([]);
  const [savingPackagePricing, setSavingPackagePricing] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialForm>(() =>
    emptyTestimonialForm(),
  );
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState<number | null>(null);
  const [savingTestimonials, setSavingTestimonials] = useState(false);
  const [deletingTestimonialIndex, setDeletingTestimonialIndex] = useState<number | null>(null);
  const [uploadingTestimonialImage, setUploadingTestimonialImage] = useState(false);
  const [aboutToolsForm, setAboutToolsForm] = useState<AboutToolForm[]>([]);
  const [aboutToolDraft, setAboutToolDraft] = useState<AboutToolForm>(() => emptyAboutToolForm());
  const [editingAboutToolIndex, setEditingAboutToolIndex] = useState<number | null>(null);
  const [savingAboutTools, setSavingAboutTools] = useState(false);
  const [deletingAboutToolIndex, setDeletingAboutToolIndex] = useState<number | null>(null);
  const [uploadingAboutToolLogo, setUploadingAboutToolLogo] = useState(false);
  const [currentAdminPassword, setCurrentAdminPassword] = useState("");
  const [nextAdminPassword, setNextAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [changingAdminPassword, setChangingAdminPassword] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({
    show: false,
    msg: "",
  });

  const parsed = useMemo(() => {
    try {
      return JSON.parse(raw) as SiteContent;
    } catch {
      return null;
    }
  }, [raw]);

  const clientLogoTargets = useMemo(() => {
    const src = parsed?.clients ?? content?.clients ?? [];
    return src.map((client, idx) => ({
      value: `clients.${idx}.logo`,
      label: `Client logo: ${client.name}`,
    }));
  }, [parsed, content]);

  const projectsSource = useMemo(() => {
    return parsed?.projects ?? content?.projects ?? [];
  }, [parsed, content]);

  const teamSource = useMemo(() => {
    return (
      parsed?.team ??
      content?.team ?? {
        eyebrow: "THE TEAM",
        title: "The minds behind DIXEL.",
        subtitle: "Founder-led, execution-focused creatives and strategists.",
        backgroundImage: "",
        members: [],
      }
    );
  }, [parsed, content]);

  const sharedBackgroundPool = useMemo(() => {
    return parsed?.home?.sharedBackgroundPool ?? content?.home?.sharedBackgroundPool ?? [];
  }, [parsed, content]);

  const servicesSource = useMemo(() => {
    return parsed?.services ?? content?.services ?? [];
  }, [parsed, content]);

  const packagesSource = useMemo(() => {
    return parsed?.packages ?? content?.packages ?? [];
  }, [parsed, content]);

  const testimonialsSource = useMemo(() => {
    return parsed?.testimonials ?? content?.testimonials ?? [];
  }, [parsed, content]);

  const showAll = initialView === "all";
  const showOverview = showAll || initialView === "overview";
  const showContent = showAll || initialView === "content";
  const showServicesContent = showAll || initialView === "services-content" || initialView === "content";
  const showTestimonials = showAll || initialView === "testimonials" || initialView === "content";
  const showAboutTools = showAll || initialView === "about-tools" || initialView === "content";
  const showContentPanels = showServicesContent || showTestimonials || showAboutTools;
  const contentPanelCount = [showServicesContent, showTestimonials, showAboutTools].filter(Boolean).length;
  const contentGridColsClass =
    contentPanelCount >= 3
      ? "xl:grid-cols-3"
      : contentPanelCount === 2
        ? "xl:grid-cols-2"
        : "xl:grid-cols-1";
  const showMedia = showAll || initialView === "media";
  const showClients = showAll || initialView === "clients";
  const showWorks = showAll || initialView === "works";
  const showTeam = showAll || initialView === "team";
  const showPackages = showAll || initialView === "packages";
  const showJson = showAll || initialView === "json";
  const overviewMediaPanelCount = [showOverview, showMedia].filter(Boolean).length;
  const overviewMediaGridColsClass = overviewMediaPanelCount >= 2 ? "xl:grid-cols-2" : "xl:grid-cols-1";
  const clientsWorksPanelCount = [showClients, showWorks].filter(Boolean).length;
  const clientsWorksGridColsClass = clientsWorksPanelCount >= 2 ? "xl:grid-cols-2" : "xl:grid-cols-1";

  async function load() {
    const res = await fetch("/api/admin/content", {
      cache: "no-store",
      credentials: "include",
    });
    if (res.status === 401) {
      window.location.href = "/admin";
      return;
    }
    const json = (await res.json()) as { ok: boolean; content?: SiteContent; error?: string };
    if (!json.ok || !json.content) {
      setToast({ show: true, msg: json.error || "Failed to load content." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
      return;
    }
    setContent(json.content);
    setRaw(safeStringify(json.content));
    if (json.content.projects.length > 0) {
      setEditingWorkIndex(0);
      setWorkForm(projectToForm(json.content.projects[0]!));
    } else {
      setEditingWorkIndex(null);
      setWorkForm(emptyProjectForm());
    }

    const team = json.content.team ?? {
      eyebrow: "THE TEAM",
      title: "The minds behind DIXEL.",
      subtitle: "Founder-led, execution-focused creatives and strategists.",
      backgroundImage: "",
      members: [],
    };
    setTeamForm({
      eyebrow: team.eyebrow,
      title: team.title,
      subtitle: team.subtitle,
      backgroundImage: team.backgroundImage || "",
    });
    if (team.members.length > 0) {
      setEditingTeamMemberIndex(0);
      setTeamMemberForm(teamMemberToForm(team.members[0]!));
    } else {
      setEditingTeamMemberIndex(null);
      setTeamMemberForm(emptyTeamMemberForm());
    }

    setServiceForm((json.content.services || []).map(serviceToFormRow));
    setPackagePricingForm((json.content.packages || []).map(packageToPricingFormRow));
    if (json.content.testimonials.length > 0) {
      setEditingTestimonialIndex(0);
      setTestimonialForm(testimonialToForm(json.content.testimonials[0]!));
    } else {
      setEditingTestimonialIndex(null);
      setTestimonialForm(emptyTestimonialForm());
    }
    const normalizedTools = normalizeAboutTools(json.content.about?.tools);
    setAboutToolsForm(normalizedTools);
    if (normalizedTools.length > 0) {
      setEditingAboutToolIndex(0);
      setAboutToolDraft(normalizedTools[0]!);
    } else {
      setEditingAboutToolIndex(null);
      setAboutToolDraft(emptyAboutToolForm());
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function persistContent(next: SiteContent, okMsg: string, failMsg: string) {
    setRaw(safeStringify(next));
    setContent(next);

    const saveRes = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: next }),
      credentials: "include",
    });
    if (saveRes.status === 401) {
      window.location.href = "/admin";
      return false;
    }
    const saveJson = (await saveRes
      .json()
      .catch(() => null)) as null | { ok?: boolean; error?: string };
    if (!saveRes.ok || !saveJson?.ok) {
      setToast({ show: true, msg: saveJson?.error || failMsg });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2800);
      return false;
    }

    setToast({ show: true, msg: okMsg });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
    return true;
  }

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("compress", compressUploads ? "1" : "0");
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    if (res.status === 401) {
      setToast({ show: true, msg: "Session expired. Please sign in again." });
      setTimeout(() => {
        setToast((t) => ({ ...t, show: false }));
        window.location.href = "/admin";
      }, 900);
      return null;
    }
    const json = (await res
      .json()
      .catch(() => null)) as null | {
      ok?: boolean;
      error?: string;
      url?: string;
      compressed?: boolean;
      originalBytes?: number;
      outputBytes?: number;
    };
    if (!res.ok || !json?.ok || !json.url) {
      setToast({ show: true, msg: json?.error || "Upload failed." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
      return null;
    }

    if (
      compressUploads &&
      json.compressed &&
      typeof json.originalBytes === "number" &&
      typeof json.outputBytes === "number" &&
      json.originalBytes > 0
    ) {
      const saved = Math.max(0, Math.round(((json.originalBytes - json.outputBytes) / json.originalBytes) * 100));
      setToast({ show: true, msg: `File compressed (${saved}% smaller).` });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 1800);
    }

    return json.url;
  }

  async function upload() {
    if (!picked) {
      setToast({ show: true, msg: "Pick an image first." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2000);
      return;
    }

    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) return;

    setUploading(true);
    try {
      const url = await uploadFile(picked);
      if (!url) return;

      setByPath(next as unknown as Record<string, unknown>, target, url);
      await persistContent(
        next,
        `Uploaded + saved: ${target}`,
        "Uploaded, but auto-save failed. Click Save.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function addSharedBackground(urlInput?: string) {
    const url = (urlInput ?? sharedBackgroundUrl).trim();
    if (!url) {
      setToast({ show: true, msg: "Paste a media URL first." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before adding shared media." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    if (!Array.isArray(next.home.sharedBackgroundPool)) {
      next.home.sharedBackgroundPool = [];
    }

    if (next.home.sharedBackgroundPool.includes(url)) {
      setToast({ show: true, msg: "This media is already in the stock." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    next.home.sharedBackgroundPool.push(url);
    const ok = await persistContent(
      next,
      "Added media to Home shared stock.",
      "Media added in editor, but auto-save failed. Click Save.",
    );
    if (!ok) return;
    setSharedBackgroundUrl("");
  }

  async function deleteSharedBackground(index: number) {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before deleting shared media." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    if (!Array.isArray(next.home.sharedBackgroundPool)) {
      next.home.sharedBackgroundPool = [];
    }
    const item = next.home.sharedBackgroundPool[index];
    if (!item) return;

    setDeletingSharedBackgroundIndex(index);
    try {
      next.home.sharedBackgroundPool.splice(index, 1);
      await persistContent(
        next,
        "Removed media from Home shared stock.",
        "Removed in editor, but auto-save failed. Click Save.",
      );
    } finally {
      setDeletingSharedBackgroundIndex(null);
    }
  }

  async function uploadSharedBackground(file: File) {
    setUploadingSharedBackground(true);
    try {
      const url = await uploadFile(file);
      if (!url) return;
      await addSharedBackground(url);
    } finally {
      setUploadingSharedBackground(false);
    }
  }

  async function addClient() {
    const name = newClientName.trim();
    const industry = newClientIndustry.trim();
    if (!name || !industry) {
      setToast({ show: true, msg: "Client name and industry are required." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before adding a client." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    setAddingClient(true);
    try {
      let logo: string | undefined;
      if (newClientLogo) {
        logo = await uploadFile(newClientLogo) ?? undefined;
        if (!logo) return;
      }

      const newClient: SiteContent["clients"][number] = { name, industry };
      if (logo) newClient.logo = logo;
      next.clients.push(newClient);
      const ok = await persistContent(
        next,
        `Added client: ${name}`,
        "Client added in editor, but auto-save failed. Click Save.",
      );
      if (!ok) return;

      setNewClientName("");
      setNewClientIndustry("");
      setNewClientLogo(null);
    } finally {
      setAddingClient(false);
    }
  }

  async function deleteClient(index: number) {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before deleting a client." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    const client = next.clients[index];
    if (!client) return;

    setDeletingClientIndex(index);
    try {
      next.clients.splice(index, 1);
      await persistContent(
        next,
        `Deleted client: ${client.name}`,
        "Client removed in editor, but auto-save failed. Click Save.",
      );
    } finally {
      setDeletingClientIndex(null);
    }
  }

  function editWork(index: number) {
    const project = projectsSource[index];
    if (!project) return;
    setEditingWorkIndex(index);
    setWorkForm(projectToForm(project));
  }

  function startNewWork() {
    setEditingWorkIndex(null);
    setWorkForm(emptyProjectForm());
  }

  async function saveWork() {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before saving work." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    const title = workForm.title.trim();
    const slugBase = (workForm.slug || slugify(title)).trim();
    if (!title || !slugBase || !workForm.tagline.trim() || !workForm.brief.trim()) {
      setToast({ show: true, msg: "Title, slug, tagline, and brief are required." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2400);
      return;
    }

    const deliverables = linesToList(workForm.deliverablesText);
    const tools = linesToList(workForm.toolsText);
    const results = linesToList(workForm.resultsText);
    let gallery = linesToList(workForm.galleryText);
    if (!workForm.coverImage.trim()) {
      setToast({ show: true, msg: "Cover image is required." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    if (!deliverables.length || !tools.length || !results.length) {
      setToast({ show: true, msg: "Deliverables, tools, and results need at least 1 item." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
      return;
    }

    if (!gallery.length) {
      gallery = [workForm.coverImage.trim()];
    }

    const normalizedSlug = slugify(slugBase);
    const conflict = next.projects.find(
      (p, idx) => p.slug === normalizedSlug && idx !== editingWorkIndex,
    );
    if (conflict) {
      setToast({ show: true, msg: `Slug already exists: ${normalizedSlug}` });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2400);
      return;
    }

    const project: Project = {
      slug: normalizedSlug,
      title,
      category: workForm.category,
      year: workForm.year.trim() || String(new Date().getFullYear()),
      tagline: workForm.tagline.trim(),
      brief: workForm.brief.trim(),
      deliverables,
      tools,
      results,
      coverImage: workForm.coverImage.trim(),
      gallery,
      featured: workForm.featured,
    };

    setSavingWork(true);
    try {
      if (editingWorkIndex === null) {
        next.projects.unshift(project);
        const ok = await persistContent(
          next,
          `Added work: ${project.title}`,
          "Work added in editor, but auto-save failed. Click Save.",
        );
        if (!ok) return;
        setEditingWorkIndex(0);
        setWorkForm(projectToForm(project));
        return;
      }

      next.projects[editingWorkIndex] = project;
      const ok = await persistContent(
        next,
        `Updated work: ${project.title}`,
        "Work updated in editor, but auto-save failed. Click Save.",
      );
      if (!ok) return;
      setWorkForm(projectToForm(project));
    } finally {
      setSavingWork(false);
    }
  }

  async function deleteWork(index: number) {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before deleting work." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    const work = next.projects[index];
    if (!work) return;

    setDeletingWorkIndex(index);
    try {
      next.projects.splice(index, 1);
      const ok = await persistContent(
        next,
        `Deleted work: ${work.title}`,
        "Work removed in editor, but auto-save failed. Click Save.",
      );
      if (!ok) return;

      if (next.projects.length === 0) {
        setEditingWorkIndex(null);
        setWorkForm(emptyProjectForm());
      } else {
        const safeIndex = Math.min(index, next.projects.length - 1);
        setEditingWorkIndex(safeIndex);
        setWorkForm(projectToForm(next.projects[safeIndex]!));
      }
    } finally {
      setDeletingWorkIndex(null);
    }
  }

  async function uploadWorkCover(file: File) {
    setUploadingWorkCover(true);
    try {
      const url = await uploadFile(file);
      if (!url) return;
      setWorkForm((prev) => ({ ...prev, coverImage: url }));
      setToast({ show: true, msg: "Cover uploaded. Click Save work." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
    } finally {
      setUploadingWorkCover(false);
    }
  }

  async function uploadWorkGallery(file: File) {
    setUploadingWorkGallery(true);
    try {
      const url = await uploadFile(file);
      if (!url) return;
      setWorkForm((prev) => ({
        ...prev,
        galleryText: prev.galleryText.trim() ? `${prev.galleryText}\n${url}` : url,
      }));
      setToast({ show: true, msg: "Gallery image uploaded. Click Save work." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
    } finally {
      setUploadingWorkGallery(false);
    }
  }

  function ensureTeam(next: SiteContent) {
    if (!next.team) {
      next.team = {
        eyebrow: "THE TEAM",
        title: "The minds behind DIXEL.",
        subtitle: "Founder-led, execution-focused creatives and strategists.",
        backgroundImage: "",
        members: [],
      };
    }
    return next.team;
  }

  function ensureAbout(next: SiteContent) {
    if (!next.about) {
      next.about = {
        eyebrow: "OUR STORY",
        title: "Be Visible. Be Digital.",
        intro: [],
        vision: "",
        mission: "",
        howWeWork: [],
        tools: [],
      };
    }
    if (!Array.isArray(next.about.tools)) {
      next.about.tools = [];
    }
    return next.about;
  }

  async function saveTeamSection() {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before saving team." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    const team = ensureTeam(next);
    team.eyebrow = teamForm.eyebrow.trim() || "THE TEAM";
    team.title = teamForm.title.trim() || "The minds behind DIXEL.";
    team.subtitle =
      teamForm.subtitle.trim() ||
      "Founder-led, execution-focused creatives and strategists.";
    team.backgroundImage = teamForm.backgroundImage.trim();

    setSavingTeam(true);
    try {
      await persistContent(
        next,
        "Team section updated.",
        "Team updated in editor, but auto-save failed. Click Save.",
      );
    } finally {
      setSavingTeam(false);
    }
  }

  function editTeamMember(index: number) {
    const member = teamSource.members[index];
    if (!member) return;
    setEditingTeamMemberIndex(index);
    setTeamMemberForm(teamMemberToForm(member));
  }

  function startNewTeamMember() {
    setEditingTeamMemberIndex(null);
    setTeamMemberForm(emptyTeamMemberForm());
  }

  async function saveTeamMember() {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before saving team member." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    const name = teamMemberForm.name.trim();
    const role = teamMemberForm.role.trim();
    const bio = teamMemberForm.bio.trim();
    if (!name || !role || !bio) {
      setToast({ show: true, msg: "Member name, role, and bio are required." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2400);
      return;
    }

    const team = ensureTeam(next);
    const member: TeamMember = {
      id: slugify(teamMemberForm.id.trim() || name),
      name,
      role,
      bio,
      image: teamMemberForm.image.trim() || undefined,
    };

    const conflict = team.members.find(
      (m, idx) => m.id === member.id && idx !== editingTeamMemberIndex,
    );
    if (conflict) {
      setToast({ show: true, msg: `Member ID already exists: ${member.id}` });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2400);
      return;
    }

    setSavingTeamMember(true);
    try {
      if (editingTeamMemberIndex === null) {
        team.members.push(member);
        const ok = await persistContent(
          next,
          `Added team member: ${member.name}`,
          "Member added in editor, but auto-save failed. Click Save.",
        );
        if (!ok) return;
        setEditingTeamMemberIndex(team.members.length - 1);
      } else {
        team.members[editingTeamMemberIndex] = member;
        const ok = await persistContent(
          next,
          `Updated team member: ${member.name}`,
          "Member updated in editor, but auto-save failed. Click Save.",
        );
        if (!ok) return;
      }
      setTeamMemberForm(teamMemberToForm(member));
    } finally {
      setSavingTeamMember(false);
    }
  }

  async function deleteTeamMember(index: number) {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before deleting team member." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    const team = ensureTeam(next);
    const member = team.members[index];
    if (!member) return;

    setDeletingTeamMemberIndex(index);
    try {
      team.members.splice(index, 1);
      const ok = await persistContent(
        next,
        `Deleted team member: ${member.name}`,
        "Member deleted in editor, but auto-save failed. Click Save.",
      );
      if (!ok) return;

      if (team.members.length === 0) {
        setEditingTeamMemberIndex(null);
        setTeamMemberForm(emptyTeamMemberForm());
      } else {
        const safe = Math.min(index, team.members.length - 1);
        setEditingTeamMemberIndex(safe);
        setTeamMemberForm(teamMemberToForm(team.members[safe]!));
      }
    } finally {
      setDeletingTeamMemberIndex(null);
    }
  }

  async function uploadTeamBackground(file: File) {
    setUploadingTeamBg(true);
    try {
      const url = await uploadFile(file);
      if (!url) return;
      setTeamForm((prev) => ({ ...prev, backgroundImage: url }));
      setToast({ show: true, msg: "Team background uploaded. Click Save team section." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
    } finally {
      setUploadingTeamBg(false);
    }
  }

  async function uploadTeamMemberImage(file: File) {
    setUploadingTeamMemberImage(true);
    try {
      const url = await uploadFile(file);
      if (!url) return;
      setTeamMemberForm((prev) => ({ ...prev, image: url }));
      setToast({ show: true, msg: "Team member image uploaded. Click Save member." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
    } finally {
      setUploadingTeamMemberImage(false);
    }
  }

  function updateServiceField(
    serviceId: string,
    field: "title" | "summary" | "inclusionsText" | "icon",
    value: string,
  ) {
    setServiceForm((prev) => {
      const exists = prev.some((row) => row.id === serviceId);
      if (!exists) return prev;
      return prev.map((row) =>
        row.id === serviceId ? { ...row, [field]: value } : row,
      ) as ServiceForm[];
    });
  }

  async function saveServices() {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before saving services." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    setSavingServices(true);
    try {
      next.services = (next.services || []).map((service) => {
        const row = serviceForm.find((item) => item.id === service.id);
        if (!row) return service;
        const normalizedIcon = SERVICE_ICON_OPTIONS.includes(row.icon) ? row.icon : "spark";
        return {
          ...service,
          title: row.title.trim() || service.title,
          summary: row.summary.trim() || service.summary,
          inclusions: linesToList(row.inclusionsText),
          icon: normalizedIcon,
        };
      });

      const ok = await persistContent(
        next,
        "Services updated.",
        "Services updated in editor, but auto-save failed. Click Save.",
      );
      if (!ok) return;
      setServiceForm((next.services || []).map(serviceToFormRow));
    } finally {
      setSavingServices(false);
    }
  }

  function updatePackagePricingField(
    packageId: string,
    field: "name" | "bestFor" | "includesText" | "monthlyPriceFbu" | "priceNote",
    value: string,
  ) {
    setPackagePricingForm((prev) => {
      const exists = prev.some((row) => row.id === packageId);
      if (!exists) return prev;
      return prev.map((row) =>
        row.id === packageId ? { ...row, [field]: value } : row,
      );
    });
  }

  async function savePackagePricing() {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before saving package pricing." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    setSavingPackagePricing(true);
    try {
      next.packages = (next.packages || []).map((pkg) => {
        const row = packagePricingForm.find((item) => item.id === pkg.id);
        if (!row) return pkg;

        const cleanNumber = row.monthlyPriceFbu.replace(/[^\d]/g, "");
        const parsedMonthly = cleanNumber ? Number(cleanNumber) : NaN;

        return {
          ...pkg,
          name: row.name.trim() || pkg.name,
          bestFor: row.bestFor.trim() || pkg.bestFor,
          includes: linesToList(row.includesText),
          monthlyPriceFbu:
            Number.isFinite(parsedMonthly) && parsedMonthly > 0 ? parsedMonthly : undefined,
          priceNote: row.priceNote.trim() || pkg.priceNote,
        };
      });

      const ok = await persistContent(
        next,
        "Packages updated.",
        "Packages updated in editor, but auto-save failed. Click Save.",
      );
      if (!ok) return;
      setPackagePricingForm((next.packages || []).map(packageToPricingFormRow));
    } finally {
      setSavingPackagePricing(false);
    }
  }

  function editTestimonial(index: number) {
    const item = testimonialsSource[index];
    if (!item) return;
    setEditingTestimonialIndex(index);
    setTestimonialForm(testimonialToForm(item));
  }

  function startNewTestimonial() {
    setEditingTestimonialIndex(null);
    setTestimonialForm(emptyTestimonialForm());
  }

  async function saveTestimonial() {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before saving testimonial." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    const item: Testimonial = {
      name: testimonialForm.name.trim(),
      title: testimonialForm.title.trim(),
      company: testimonialForm.company.trim(),
      quote: testimonialForm.quote.trim(),
      image: testimonialForm.image.trim() || undefined,
    };
    if (!item.name || !item.title || !item.company || !item.quote) {
      setToast({ show: true, msg: "Name, title, company, and quote are required." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2400);
      return;
    }

    setSavingTestimonials(true);
    try {
      if (editingTestimonialIndex === null) {
        next.testimonials.unshift(item);
        const ok = await persistContent(
          next,
          `Added testimonial: ${item.name}`,
          "Testimonial added in editor, but auto-save failed. Click Save.",
        );
        if (!ok) return;
        setEditingTestimonialIndex(0);
      } else {
        next.testimonials[editingTestimonialIndex] = item;
        const ok = await persistContent(
          next,
          `Updated testimonial: ${item.name}`,
          "Testimonial updated in editor, but auto-save failed. Click Save.",
        );
        if (!ok) return;
      }
      setTestimonialForm(testimonialToForm(item));
    } finally {
      setSavingTestimonials(false);
    }
  }

  async function deleteTestimonial(index: number) {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before deleting testimonial." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    const item = next.testimonials[index];
    if (!item) return;

    setDeletingTestimonialIndex(index);
    try {
      next.testimonials.splice(index, 1);
      const ok = await persistContent(
        next,
        `Deleted testimonial: ${item.name}`,
        "Testimonial removed in editor, but auto-save failed. Click Save.",
      );
      if (!ok) return;

      if (next.testimonials.length === 0) {
        setEditingTestimonialIndex(null);
        setTestimonialForm(emptyTestimonialForm());
      } else {
        const safe = Math.min(index, next.testimonials.length - 1);
        setEditingTestimonialIndex(safe);
        setTestimonialForm(testimonialToForm(next.testimonials[safe]!));
      }
    } finally {
      setDeletingTestimonialIndex(null);
    }
  }

  async function uploadTestimonialImage(file: File) {
    setUploadingTestimonialImage(true);
    try {
      const url = await uploadFile(file);
      if (!url) return;
      setTestimonialForm((prev) => ({ ...prev, image: url }));
      setToast({ show: true, msg: "Testimonial image uploaded. Click Add/Update." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
    } finally {
      setUploadingTestimonialImage(false);
    }
  }

  function editAboutTool(index: number) {
    const tool = aboutToolsForm[index];
    if (!tool) return;
    setEditingAboutToolIndex(index);
    setAboutToolDraft(tool);
  }

  function startNewAboutTool() {
    setEditingAboutToolIndex(null);
    setAboutToolDraft(emptyAboutToolForm());
  }

  async function saveAboutTool() {
    const name = aboutToolDraft.name.trim();
    if (!name) {
      setToast({ show: true, msg: "Tool name is required." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    const nextTools = [...aboutToolsForm];
    const nextItem: AboutToolForm = { name, logo: aboutToolDraft.logo.trim() };
    const conflict = nextTools.find(
      (tool, idx) => tool.name.toLowerCase() === name.toLowerCase() && idx !== editingAboutToolIndex,
    );
    if (conflict) {
      setToast({ show: true, msg: `Tool already exists: ${name}` });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    if (editingAboutToolIndex === null) {
      nextTools.unshift(nextItem);
      setEditingAboutToolIndex(0);
    } else {
      nextTools[editingAboutToolIndex] = nextItem;
    }
    setAboutToolsForm(nextTools);
    setAboutToolDraft(nextItem);
    await saveAboutTools(nextTools);
  }

  async function deleteAboutTool(index: number) {
    const existing = aboutToolsForm[index];
    if (!existing) return;
    const nextTools = [...aboutToolsForm];
    nextTools.splice(index, 1);

    setDeletingAboutToolIndex(index);
    try {
      setAboutToolsForm(nextTools);
      if (nextTools.length === 0) {
        setEditingAboutToolIndex(null);
        setAboutToolDraft(emptyAboutToolForm());
      } else {
        const safe = Math.min(index, nextTools.length - 1);
        setEditingAboutToolIndex(safe);
        setAboutToolDraft(nextTools[safe]!);
      }
      await saveAboutTools(nextTools);
    } finally {
      setDeletingAboutToolIndex(null);
    }
  }

  async function moveAboutTool(index: number, direction: "up" | "down" | "first") {
    const current = aboutToolsForm[index];
    if (!current) return;

    let targetIndex = index;
    if (direction === "first") targetIndex = 0;
    if (direction === "up") targetIndex = Math.max(0, index - 1);
    if (direction === "down") targetIndex = Math.min(aboutToolsForm.length - 1, index + 1);
    if (targetIndex === index) return;

    const nextTools = [...aboutToolsForm];
    const [moved] = nextTools.splice(index, 1);
    if (!moved) return;
    nextTools.splice(targetIndex, 0, moved);

    setAboutToolsForm(nextTools);

    if (editingAboutToolIndex !== null) {
      if (editingAboutToolIndex === index) {
        setEditingAboutToolIndex(targetIndex);
      } else if (index < editingAboutToolIndex && targetIndex >= editingAboutToolIndex) {
        setEditingAboutToolIndex(editingAboutToolIndex - 1);
      } else if (index > editingAboutToolIndex && targetIndex <= editingAboutToolIndex) {
        setEditingAboutToolIndex(editingAboutToolIndex + 1);
      }
    }

    await saveAboutTools(nextTools);
  }

  async function uploadAboutToolLogo(file: File) {
    setUploadingAboutToolLogo(true);
    try {
      const url = await uploadFile(file);
      if (!url) return;
      setAboutToolDraft((prev) => ({ ...prev, logo: url }));
      setToast({ show: true, msg: "Tool logo uploaded. Click Add/Update tool." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
    } finally {
      setUploadingAboutToolLogo(false);
    }
  }

  async function saveAboutTools(tools: AboutToolForm[]) {
    const next = parsed ? structuredClone(parsed) : content ? structuredClone(content) : null;
    if (!next) {
      setToast({ show: true, msg: "Fix invalid JSON before saving about tools." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    setSavingAboutTools(true);
    try {
      const about = ensureAbout(next);
      about.tools = tools.map((tool) => ({
        name: tool.name,
        logo: tool.logo || undefined,
      }));
      const ok = await persistContent(
        next,
        "About tools updated.",
        "About tools updated in editor, but auto-save failed. Click Save.",
      );
      if (!ok) return;
    } finally {
      setSavingAboutTools(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    window.location.href = "/admin";
  }

  async function changeAdminPassword() {
    if (!currentAdminPassword || !nextAdminPassword || !confirmAdminPassword) {
      setToast({ show: true, msg: "Fill current, new, and confirm password." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }
    if (nextAdminPassword.length < 8) {
      setToast({ show: true, msg: "New password must be at least 8 characters." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }
    if (nextAdminPassword !== confirmAdminPassword) {
      setToast({ show: true, msg: "New password and confirmation do not match." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
      return;
    }

    setChangingAdminPassword(true);
    try {
      const res = await fetch("/api/admin/account/password", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: currentAdminPassword,
          newPassword: nextAdminPassword,
          confirmPassword: confirmAdminPassword,
        }),
      });
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const json = (await res.json().catch(() => null)) as null | { ok?: boolean; error?: string };
      if (!res.ok || !json?.ok) {
        setToast({ show: true, msg: json?.error || "Failed to change password." });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
        return;
      }
      setCurrentAdminPassword("");
      setNextAdminPassword("");
      setConfirmAdminPassword("");
      setToast({ show: true, msg: "Admin password updated." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
    } finally {
      setChangingAdminPassword(false);
    }
  }

  async function save() {
    if (!parsed) {
      setToast({ show: true, msg: "Invalid JSON. Fix the JSON first." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: parsed }),
        credentials: "include",
      });
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const json = (await res
        .json()
        .catch(() => null)) as null | { ok?: boolean; error?: string };
      if (!res.ok || !json?.ok) {
        setToast({ show: true, msg: json?.error || "Save failed." });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
        return;
      }
      setContent(parsed);
      setToast({ show: true, msg: "Saved. Content updated." });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="font-display text-2xl font-semibold tracking-tight text-white">
            Site Content
          </div>
          <div className="text-sm text-white/70">
            Edit JSON, save, then refresh the public site to see updates.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <CTAButton
            onClick={logout}
            variant="secondary"
            size="sm"
            type="button"
          >
            Logout
          </CTAButton>
          <CTAButton
            onClick={save}
            variant="primary"
            type="button"
            size="sm"
          >
            {saving ? "Saving..." : "Save"}
          </CTAButton>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {(showOverview || showMedia) ? (
          <div className={`grid gap-6 ${overviewMediaGridColsClass}`}>
            {showOverview ? (
              <div className="admin-panel">
            <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
              QUICK CHECKS
            </div>
            <div className="space-y-2 text-sm text-white/75">
              <div className="flex items-start gap-2">
                <span
                  className={
                    parsed ? "mt-2 h-2 w-2 rounded-full bg-dixel-accent" : "mt-2 h-2 w-2 rounded-full bg-white/25"
                  }
                />
                <span>{parsed ? "JSON valid" : "JSON invalid"}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-white/25" />
                <span>
                  Featured projects:{" "}
                  {content?.projects?.filter((p) => p.featured)?.length ?? 0}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-white/25" />
                <span>Services: {content?.services?.length ?? 0}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-white/25" />
                <span>Clients: {content?.clients?.length ?? 0}</span>
              </div>
            </div>
              </div>
            ) : null}

            {showMedia ? (
              <div className="admin-panel">
            <div className="text-xs font-semibold tracking-[0.20em] text-white/70">
              ASSET UPLOAD
            </div>
            <div className="mt-3 space-y-3">
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="admin-select [&_optgroup]:bg-white [&_optgroup]:text-black [&_option]:bg-white [&_option]:text-black"
              >
                <optgroup label="Backgrounds">
                  <option value="home.hero.backgroundImage">
                    Home: Hero background
                  </option>
                  <option value="home.featuredWork.backgroundImage">
                    Home: Featured Work background
                  </option>
                  <option value="home.servicesSection.backgroundImage">
                    Home: Services background
                  </option>
                  <option value="home.testimonialsSection.backgroundImage">
                    Home: Testimonials background
                  </option>
                  <option value="home.bigCta.backgroundImage">
                    Home: Big CTA background
                  </option>
                  <option value="settings.footer.backgroundImage">
                    Footer background
                  </option>
                </optgroup>
                <optgroup label="Client Logos">
                  {clientLogoTargets.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className="text-xs text-white/60">
                Selected target: <span className="font-semibold text-white/85">{target}</span>
              </div>

              <input
                type="file"
                accept="image/*,.svg"
                onChange={(e) => setPicked(e.target.files?.[0] || null)}
                className="admin-file"
              />
              <label className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/4 px-3 py-2 text-xs text-white/75">
                <input
                  type="checkbox"
                  checked={compressUploads}
                  onChange={(e) => setCompressUploads(e.target.checked)}
                  className="h-4 w-4 accent-dixel-accent"
                />
                Compress uploads (images only)
              </label>

              <CTAButton
                onClick={upload}
                variant="secondary"
                className="w-full"
                type="button"
              >
                {uploading ? "Uploading..." : "Upload + set"}
              </CTAButton>
              <div className="text-xs text-white/65">
                Uploads go to <span className="font-semibold">/uploads/</span>{" "}
                on the server. Pick a target above, upload, then click Save.
              </div>
              <div className="text-xs text-white/55">
                This toggle applies to all upload buttons in admin. Videos and SVG files are kept as original.
              </div>
            </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {showMedia ? (
          <div className="admin-panel">
          <div className="text-xs font-semibold tracking-[0.20em] text-white/70">
            HOME SHARED BACKGROUND STOCK (IMAGE/VIDEO)
          </div>
          <div className="mt-3 grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <input
                value={sharedBackgroundUrl}
                onChange={(e) => setSharedBackgroundUrl(e.target.value)}
                placeholder="Paste media URL (image or mp4/webm/mov)"
                className="admin-input"
              />
              <CTAButton onClick={() => void addSharedBackground()} type="button" className="w-full">
                Add URL to stock
              </CTAButton>
              <input
                type="file"
                accept="image/*,.svg,video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadSharedBackground(file);
                }}
                className="admin-file"
              />
              <div className="text-xs text-white/60">
                {uploadingSharedBackground
                  ? "Uploading shared media..."
                  : "Upload or paste media. Home Hero + Ready section will pick one random item on each page reload."}
              </div>
            </div>

            <div className="admin-scroll space-y-2">
              {sharedBackgroundPool.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/4 px-3 py-3 text-sm text-white/65">
                  No stock items yet.
                </div>
              ) : (
                sharedBackgroundPool.map((item, idx) => (
                  <div
                    key={`${item}-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/4 px-3 py-2"
                  >
                    <div className="min-w-0 truncate text-xs text-white/80">{item}</div>
                    <button
                      type="button"
                      onClick={() => void deleteSharedBackground(idx)}
                      disabled={deletingSharedBackgroundIndex === idx}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/8 disabled:opacity-60"
                    >
                      {deletingSharedBackgroundIndex === idx ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        ) : null}

        {(showClients || showWorks) ? (
          <div className={`grid gap-6 ${clientsWorksGridColsClass}`}>
            {showClients ? (
              <div className="admin-panel">
            <div className="text-xs font-semibold tracking-[0.20em] text-white/70">
              CLIENTS MANAGER
            </div>
            <div className="mt-3 space-y-3">
                <input
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Client name"
                  className="admin-input"
                />
                <input
                  value={newClientIndustry}
                  onChange={(e) => setNewClientIndustry(e.target.value)}
                  placeholder="Industry (e.g. Banking)"
                  className="admin-input"
                />
                <input
                  type="file"
                  accept="image/*,.svg"
                  onChange={(e) => setNewClientLogo(e.target.files?.[0] || null)}
                  className="admin-file"
                />
                <CTAButton
                  onClick={addClient}
                  type="button"
                  className="w-full"
                >
                  {addingClient ? "Adding client..." : "Add new client"}
                </CTAButton>
            </div>

            <div className="admin-scroll mt-4 space-y-2">
              {(parsed?.clients ?? content?.clients ?? []).map((client, idx) => (
                <div
                  key={`${client.name}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/4 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white/90">
                      {client.name}
                    </div>
                    <div className="truncate text-xs text-white/60">
                      {client.industry}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteClient(idx)}
                    disabled={deletingClientIndex === idx}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/8 disabled:opacity-60"
                  >
                    {deletingClientIndex === idx ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))}
            </div>
              </div>
            ) : null}

            {showWorks ? (
              <div className="admin-panel">
            <div className="text-xs font-semibold tracking-[0.20em] text-white/70">
              WORKS MANAGER
            </div>
            <div className="mt-3 flex gap-2">
                <CTAButton
                  onClick={startNewWork}
                  type="button"
                  size="sm"
                  className="w-full"
                >
                  New work
                </CTAButton>
                <CTAButton
                  onClick={saveWork}
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="w-full"
                >
                  {savingWork ? "Saving..." : editingWorkIndex === null ? "Add work" : "Update work"}
                </CTAButton>
            </div>

            <div className="admin-scroll mt-3 space-y-2">
              {projectsSource.map((project, idx) => (
                <div
                  key={`${project.slug}-${idx}`}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                    editingWorkIndex === idx
                      ? "border-dixel-accent/70 bg-dixel-accent/12"
                      : "border-white/10 bg-white/4"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => editWork(idx)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="truncate text-sm font-semibold text-white/90">
                      {project.title}
                    </div>
                    <div className="truncate text-xs text-white/60">
                      /work/{project.slug}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteWork(idx)}
                    disabled={deletingWorkIndex === idx}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/8 disabled:opacity-60"
                  >
                    {deletingWorkIndex === idx ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3">
                <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-xs text-white/70">
                  These fields create the case study page at <span className="font-semibold text-white/85">/work/[slug]</span>.
                  Add cover image, gallery images, and text sections below.
                </div>
                <input
                  value={workForm.title}
                  onChange={(e) =>
                    setWorkForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Work title"
                  className="admin-input"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={workForm.slug}
                    onChange={(e) =>
                      setWorkForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="slug (auto from title if empty)"
                    className="admin-input"
                  />
                  <input
                    value={workForm.year}
                    onChange={(e) =>
                      setWorkForm((prev) => ({ ...prev, year: e.target.value }))
                    }
                    placeholder="Year"
                    className="admin-input"
                  />
                </div>
                <select
                  value={workForm.category}
                  onChange={(e) =>
                    setWorkForm((prev) => ({
                      ...prev,
                      category: e.target.value as ProjectCategory,
                    }))
                  }
                  className="admin-select [&_option]:bg-white [&_option]:text-black"
                >
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  value={workForm.tagline}
                  onChange={(e) =>
                    setWorkForm((prev) => ({ ...prev, tagline: e.target.value }))
                  }
                  placeholder="Tagline"
                  className="admin-input"
                />
                <textarea
                  value={workForm.brief}
                  onChange={(e) =>
                    setWorkForm((prev) => ({ ...prev, brief: e.target.value }))
                  }
                  placeholder="Brief"
                  className="admin-textarea"
                />
                <input
                  value={workForm.coverImage}
                  onChange={(e) =>
                    setWorkForm((prev) => ({ ...prev, coverImage: e.target.value }))
                  }
                  placeholder="Cover image URL"
                  className="admin-input"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadWorkCover(file);
                    }}
                    className="admin-file"
                  />
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadWorkGallery(file);
                    }}
                    className="admin-file"
                  />
                </div>
                <div className="text-xs text-white/60">
                  {uploadingWorkCover ? "Uploading cover..." : uploadingWorkGallery ? "Uploading gallery image..." : "Left upload sets cover. Right upload appends to gallery list."}
                </div>
                <textarea
                  value={workForm.deliverablesText}
                  onChange={(e) =>
                    setWorkForm((prev) => ({ ...prev, deliverablesText: e.target.value }))
                  }
                  placeholder={"Deliverables (one per line)\nConcept + edit\nMotion graphics"}
                  className="admin-textarea"
                />
                <textarea
                  value={workForm.toolsText}
                  onChange={(e) =>
                    setWorkForm((prev) => ({ ...prev, toolsText: e.target.value }))
                  }
                  placeholder={"Tools (one per line)\nPremiere Pro\nAfter Effects"}
                  className="admin-textarea"
                />
                <textarea
                  value={workForm.resultsText}
                  onChange={(e) =>
                    setWorkForm((prev) => ({ ...prev, resultsText: e.target.value }))
                  }
                  placeholder={"Results (one per line)\nPublished on channels"}
                  className="admin-textarea"
                />
                <textarea
                  value={workForm.galleryText}
                  onChange={(e) =>
                    setWorkForm((prev) => ({ ...prev, galleryText: e.target.value }))
                  }
                  placeholder={"Gallery URLs (one per line)\n/uploads/your-image-1.png"}
                  className="admin-textarea"
                />
                <label className="inline-flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={workForm.featured}
                    onChange={(e) =>
                      setWorkForm((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-white/25 bg-dixel-bg/70"
                  />
                  Featured project
                </label>
            </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {showTeam ? (
          <div className="admin-panel">
          <div className="text-xs font-semibold tracking-[0.20em] text-white/70">
            TEAM MANAGER
          </div>
          <div className="mt-3 grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <input
                value={teamForm.eyebrow}
                onChange={(e) =>
                  setTeamForm((prev) => ({ ...prev, eyebrow: e.target.value }))
                }
                placeholder="Team eyebrow"
                className="admin-input"
              />
              <input
                value={teamForm.title}
                onChange={(e) =>
                  setTeamForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Team title"
                className="admin-input"
              />
              <textarea
                value={teamForm.subtitle}
                onChange={(e) =>
                  setTeamForm((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                placeholder="Team subtitle"
                className="admin-textarea"
              />
              <input
                value={teamForm.backgroundImage}
                onChange={(e) =>
                  setTeamForm((prev) => ({ ...prev, backgroundImage: e.target.value }))
                }
                placeholder="Team page background image URL"
                className="admin-input"
              />
              <input
                type="file"
                accept="image/*,.svg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadTeamBackground(file);
                }}
                className="admin-file"
              />
              <div className="text-xs text-white/60">
                {uploadingTeamBg ? "Uploading team background..." : "Upload a background image or paste URL."}
              </div>
              <CTAButton onClick={saveTeamSection} type="button" className="w-full">
                {savingTeam ? "Saving team..." : "Save team section"}
              </CTAButton>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <CTAButton onClick={startNewTeamMember} type="button" size="sm" className="w-full">
                  New member
                </CTAButton>
                <CTAButton onClick={saveTeamMember} type="button" size="sm" variant="secondary" className="w-full">
                  {savingTeamMember ? "Saving..." : editingTeamMemberIndex === null ? "Add member" : "Update member"}
                </CTAButton>
              </div>

              <div className="admin-scroll space-y-2">
                {teamSource.members.map((member, idx) => (
                  <div
                    key={`${member.id}-${idx}`}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                      editingTeamMemberIndex === idx
                        ? "border-dixel-accent/70 bg-dixel-accent/12"
                        : "border-white/10 bg-white/4"
                    }`}
                  >
                    <button type="button" onClick={() => editTeamMember(idx)} className="min-w-0 flex-1 text-left">
                      <div className="truncate text-sm font-semibold text-white/90">{member.name}</div>
                      <div className="truncate text-xs text-white/60">{member.role}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteTeamMember(idx)}
                      disabled={deletingTeamMemberIndex === idx}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/8 disabled:opacity-60"
                    >
                      {deletingTeamMemberIndex === idx ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ))}
              </div>

              <input
                value={teamMemberForm.name}
                onChange={(e) =>
                  setTeamMemberForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Member name"
                className="admin-input"
              />
              <input
                value={teamMemberForm.id}
                onChange={(e) =>
                  setTeamMemberForm((prev) => ({ ...prev, id: e.target.value }))
                }
                placeholder="Member id (optional, auto from name)"
                className="admin-input"
              />
              <input
                value={teamMemberForm.role}
                onChange={(e) =>
                  setTeamMemberForm((prev) => ({ ...prev, role: e.target.value }))
                }
                placeholder="Role"
                className="admin-input"
              />
              <textarea
                value={teamMemberForm.bio}
                onChange={(e) =>
                  setTeamMemberForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Bio"
                className="admin-textarea"
              />
              <input
                value={teamMemberForm.image}
                onChange={(e) =>
                  setTeamMemberForm((prev) => ({ ...prev, image: e.target.value }))
                }
                placeholder="Image URL"
                className="admin-input"
              />
              <input
                type="file"
                accept="image/*,.svg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadTeamMemberImage(file);
                }}
                className="admin-file"
              />
              <div className="text-xs text-white/60">
                {uploadingTeamMemberImage
                  ? "Uploading member image..."
                  : "Upload member image or paste URL, then save member."}
              </div>
            </div>
          </div>
          </div>
        ) : null}

        {showContentPanels ? (
          <div className={`grid gap-6 ${contentGridColsClass}`}>
            {showTestimonials ? (
            <div className="admin-panel">
              <div className="text-xs font-semibold tracking-[0.20em] text-white/70">
                TESTIMONIALS MANAGER
              </div>
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <CTAButton onClick={startNewTestimonial} type="button" size="sm" className="w-full">
                    New
                  </CTAButton>
                  <CTAButton onClick={saveTestimonial} type="button" size="sm" variant="secondary" className="w-full">
                    {savingTestimonials ? "Saving..." : editingTestimonialIndex === null ? "Add" : "Update"}
                  </CTAButton>
                </div>

                <div className="admin-scroll space-y-2">
                  {testimonialsSource.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/4 px-3 py-3 text-sm text-white/65">
                      No testimonials yet.
                    </div>
                  ) : (
                    testimonialsSource.map((item, idx) => (
                      <div
                        key={`${item.name}-${item.company}-${idx}`}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                          editingTestimonialIndex === idx
                            ? "border-dixel-accent/70 bg-dixel-accent/12"
                            : "border-white/10 bg-white/4"
                        }`}
                      >
                        <button type="button" onClick={() => editTestimonial(idx)} className="min-w-0 flex-1 text-left">
                          <div className="truncate text-sm font-semibold text-white/90">{item.name}</div>
                          <div className="truncate text-xs text-white/60">
                            {item.title} - {item.company}
                          </div>
                          <div className="truncate text-[11px] text-white/50">
                            {item.image ? "Photo attached" : "Initials avatar"}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteTestimonial(idx)}
                          disabled={deletingTestimonialIndex === idx}
                          className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/8 disabled:opacity-60"
                        >
                          {deletingTestimonialIndex === idx ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <input
                  value={testimonialForm.name}
                  onChange={(e) =>
                    setTestimonialForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Client name"
                  className="admin-input"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={testimonialForm.title}
                    onChange={(e) =>
                      setTestimonialForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Client title"
                    className="admin-input"
                  />
                  <input
                    value={testimonialForm.company}
                    onChange={(e) =>
                      setTestimonialForm((prev) => ({ ...prev, company: e.target.value }))
                    }
                    placeholder="Company"
                    className="admin-input"
                  />
                </div>
                <textarea
                  value={testimonialForm.quote}
                  onChange={(e) =>
                    setTestimonialForm((prev) => ({ ...prev, quote: e.target.value }))
                  }
                  placeholder="Testimonial quote"
                  className="admin-textarea"
                />
                <input
                  value={testimonialForm.image}
                  onChange={(e) =>
                    setTestimonialForm((prev) => ({ ...prev, image: e.target.value }))
                  }
                  placeholder="Profile image URL (optional)"
                  className="admin-input"
                />
                <input
                  type="file"
                  accept="image/*,.svg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadTestimonialImage(file);
                  }}
                  className="admin-file"
                />
                <div className="text-xs text-white/60">
                  {uploadingTestimonialImage
                    ? "Uploading testimonial photo..."
                    : "Optional: add a profile picture. If empty, initials are shown."}
                </div>
              </div>
            </div>
            ) : null}

            {showServicesContent ? (
            <div className="admin-panel">
              <div className="text-xs font-semibold tracking-[0.20em] text-white/70">
                SERVICES MANAGER
              </div>
              <div className="mt-3 space-y-3">
                {servicesSource.map((service) => {
                  const row = serviceForm.find((item) => item.id === service.id) ??
                    serviceToFormRow(service);
                  return (
                    <div key={service.id} className="rounded-xl border border-white/10 bg-white/4 p-3">
                      <div className="text-xs font-semibold tracking-[0.18em] text-white/55">
                        ID: {service.id}
                      </div>
                      <div className="mt-2 grid gap-2">
                        <input
                          value={row.title}
                          onChange={(e) => updateServiceField(service.id, "title", e.target.value)}
                          placeholder="Service title"
                          className="admin-input"
                        />
                        <textarea
                          value={row.summary}
                          onChange={(e) => updateServiceField(service.id, "summary", e.target.value)}
                          placeholder="Short summary"
                          className="admin-textarea"
                        />
                        <select
                          value={row.icon}
                          onChange={(e) => updateServiceField(service.id, "icon", e.target.value)}
                          className="admin-select [&_option]:bg-white [&_option]:text-black"
                        >
                          {SERVICE_ICON_OPTIONS.map((icon) => (
                            <option key={icon} value={icon}>
                              {icon}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={row.inclusionsText}
                          onChange={(e) => updateServiceField(service.id, "inclusionsText", e.target.value)}
                          placeholder={"Includes (one per line)\nSocial posts\nPoster design"}
                          className="admin-textarea"
                        />
                      </div>
                    </div>
                  );
                })}
                <CTAButton onClick={saveServices} type="button" className="w-full">
                  {savingServices ? "Saving services..." : "Save services"}
                </CTAButton>
                <div className="text-xs text-white/60">
                  You can edit the service icon, title, summary, and bullet list here.
                </div>
              </div>
            </div>
            ) : null}

            {showAboutTools ? (
            <div className="admin-panel">
              <div className="text-xs font-semibold tracking-[0.20em] text-white/70">
                ABOUT TOOLS (TOOL CRAFT)
              </div>
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <CTAButton onClick={startNewAboutTool} type="button" size="sm" className="w-full">
                    New tool
                  </CTAButton>
                  <CTAButton onClick={saveAboutTool} type="button" size="sm" variant="secondary" className="w-full">
                    {savingAboutTools ? "Saving..." : editingAboutToolIndex === null ? "Add tool" : "Update tool"}
                  </CTAButton>
                </div>
                <div className="admin-scroll space-y-2">
                  {aboutToolsForm.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/4 px-3 py-3 text-sm text-white/65">
                      No tools yet.
                    </div>
                  ) : (
                    aboutToolsForm.map((tool, idx) => (
                      <div
                        key={`${tool.name}-${idx}`}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                          editingAboutToolIndex === idx
                            ? "border-dixel-accent/70 bg-dixel-accent/12"
                            : "border-white/10 bg-white/4"
                        }`}
                      >
                        <button type="button" onClick={() => editAboutTool(idx)} className="min-w-0 flex-1 text-left">
                          <div className="truncate text-sm font-semibold text-white/90">{tool.name}</div>
                          <div className="truncate text-xs text-white/60">
                            {tool.logo ? "Logo attached" : "No logo"}
                          </div>
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void moveAboutTool(idx, "first")}
                            disabled={savingAboutTools || idx === 0}
                            className="rounded-full border border-white/20 px-2 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/8 disabled:opacity-45"
                            title="Move first"
                          >
                            First
                          </button>
                          <button
                            type="button"
                            onClick={() => void moveAboutTool(idx, "up")}
                            disabled={savingAboutTools || idx === 0}
                            className="rounded-full border border-white/20 px-2 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/8 disabled:opacity-45"
                            title="Move up"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            onClick={() => void moveAboutTool(idx, "down")}
                            disabled={savingAboutTools || idx === aboutToolsForm.length - 1}
                            className="rounded-full border border-white/20 px-2 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/8 disabled:opacity-45"
                            title="Move down"
                          >
                            Down
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteAboutTool(idx)}
                            disabled={deletingAboutToolIndex === idx}
                            className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/8 disabled:opacity-60"
                          >
                            {deletingAboutToolIndex === idx ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <input
                  value={aboutToolDraft.name}
                  onChange={(e) => setAboutToolDraft((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Tool name"
                  className="admin-input"
                />
                <input
                  value={aboutToolDraft.logo}
                  onChange={(e) => setAboutToolDraft((prev) => ({ ...prev, logo: e.target.value }))}
                  placeholder="Tool logo URL (optional)"
                  className="admin-input"
                />
                <input
                  type="file"
                  accept="image/*,.svg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadAboutToolLogo(file);
                  }}
                  className="admin-file"
                />
                <div className="text-xs text-white/60">
                  {uploadingAboutToolLogo
                    ? "Uploading tool logo..."
                    : "Use First/Up/Down to control display order. Upload a logo or paste URL, then click Add/Update tool."}
                </div>
              </div>
            </div>
            ) : null}
          </div>
        ) : null}

        {showPackages ? (
          <div className="admin-panel">
          <div className="text-xs font-semibold tracking-[0.20em] text-white/70">
            PACKAGES MANAGER
          </div>
          <div className="mt-3 space-y-3">
            {packagesSource.map((pkg) => {
              const row = packagePricingForm.find((item) => item.id === pkg.id) ??
                packageToPricingFormRow(pkg);
              return (
                <div key={pkg.id} className="rounded-xl border border-white/10 bg-white/4 p-3">
                  <div className="text-xs font-semibold tracking-[0.18em] text-white/55">
                    ID: {pkg.id}
                  </div>
                  <div className="mt-2 grid gap-2">
                    <input
                      value={row.name}
                      onChange={(e) => updatePackagePricingField(pkg.id, "name", e.target.value)}
                      placeholder="Package title"
                      className="admin-input"
                    />
                    <input
                      value={row.bestFor}
                      onChange={(e) => updatePackagePricingField(pkg.id, "bestFor", e.target.value)}
                      placeholder="Best for (short description)"
                      className="admin-input"
                    />
                    <textarea
                      value={row.includesText}
                      onChange={(e) =>
                        updatePackagePricingField(pkg.id, "includesText", e.target.value)
                      }
                      placeholder={"Includes (one per line)\n8 social posts\n2 story sets"}
                      className="admin-textarea"
                    />
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <input
                      value={row.monthlyPriceFbu}
                      onChange={(e) => updatePackagePricingField(pkg.id, "monthlyPriceFbu", e.target.value)}
                      placeholder="Monthly price in FBU (e.g. 300000)"
                      className="admin-input"
                    />
                    <input
                      value={row.priceNote}
                      onChange={(e) => updatePackagePricingField(pkg.id, "priceNote", e.target.value)}
                      placeholder="Fallback note (e.g. Custom quote)"
                      className="admin-input"
                    />
                  </div>
                </div>
              );
            })}
            <CTAButton onClick={savePackagePricing} type="button" className="w-full">
              {savingPackagePricing ? "Saving packages..." : "Save packages"}
            </CTAButton>
            <div className="text-xs text-white/60">
              Edit package details and includes list here. Leave monthly price empty for custom packages.
            </div>
          </div>
          </div>
        ) : null}

        {showOverview ? (
          <div className="admin-panel text-sm text-white/70">
          Tip: Update WhatsApp number/prefill in{" "}
          <span className="font-semibold text-white/80">
            settings.contact
          </span>
          . Links will update automatically.
          </div>
        ) : null}

        {showOverview ? (
          <div className="admin-panel">
            <div className="text-xs font-semibold tracking-[0.20em] text-white/70">
              ADMIN SECURITY
            </div>
            <div className="mt-3 grid gap-3">
              <input
                type="password"
                value={currentAdminPassword}
                onChange={(e) => setCurrentAdminPassword(e.target.value)}
                className="admin-input"
              />
              <input
                type="password"
                value={nextAdminPassword}
                onChange={(e) => setNextAdminPassword(e.target.value)}
                className="admin-input"
              />
              <input
                type="password"
                value={confirmAdminPassword}
                onChange={(e) => setConfirmAdminPassword(e.target.value)}
                className="admin-input"
              />
              <CTAButton onClick={changeAdminPassword} type="button" className="w-full">
                {changingAdminPassword ? "Updating password..." : "Change admin password"}
              </CTAButton>
              <div className="text-xs text-white/60">
                Keep ADMIN_SECRET unchanged. This updates only the admin login password.
              </div>
            </div>
          </div>
        ) : null}

        {showJson ? (
          <div className="admin-panel">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
              JSON EDITOR
            </div>
            <div className="rounded-full border border-white/14 bg-white/4 px-3 py-1 text-xs font-semibold text-white/70">
              {parsed ? "Valid JSON" : "Invalid JSON"}
            </div>
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            spellCheck={false}
            className="admin-textarea min-h-[640px] font-mono text-[12px] leading-5"
          />
          </div>
        ) : null}
      </div>

      <Toast message={toast.msg} show={toast.show} />
    </>
  );
}

