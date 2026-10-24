import type { ResourceCategoryId } from "./resourceCategories";

export type ArticleCtaService = "ai-consulting" | "microsoft-consulting";

// Article category -> houle service page that receives the mid-article CTA.
// Categories without a matching service (e.g. business-operations) fall back
// to the generic contact CTA.
export const categoryServicePath: Partial<
  Record<ResourceCategoryId, `/services/${ArticleCtaService}`>
> = {
  "ai-strategy-adoption": "/services/ai-consulting",
  "quality-governance": "/services/ai-consulting",
  "security-compliance": "/services/ai-consulting",
  "private-llm-rag": "/services/ai-consulting",
  "case-studies": "/services/ai-consulting",
  "microsoft-365-copilot": "/services/microsoft-consulting",
  "document-email-automation": "/services/microsoft-consulting",
  "workflow-automation": "/services/microsoft-consulting",
  "data-integration-analytics": "/services/microsoft-consulting",
};

export const getCategoryServicePath = (
  category: string | undefined,
): `/services/${ArticleCtaService}` | undefined =>
  category ? categoryServicePath[category as ResourceCategoryId] : undefined;

export const getCategoryService = (
  category: string | undefined,
): ArticleCtaService | undefined => {
  const path = getCategoryServicePath(category);
  return path ? (path.replace("/services/", "") as ArticleCtaService) : undefined;
};

// Split markdown near the middle, at a ## / ### heading, so a CTA can sit
// between the two halves. Returns second = null when no heading is found.
export function splitArticleAtMidpoint(content: string): {
  first: string;
  second: string | null;
} {
  const lines = content.split("\n");
  const targetIdx = Math.floor(lines.length / 2);
  let splitIdx = -1;
  for (let i = targetIdx; i >= Math.floor(lines.length * 0.3); i--) {
    if (/^#{2,3}\s/.test(lines[i])) {
      splitIdx = i;
      break;
    }
  }
  if (splitIdx === -1) {
    for (let i = targetIdx; i < Math.floor(lines.length * 0.7); i++) {
      if (/^#{2,3}\s/.test(lines[i])) {
        splitIdx = i;
        break;
      }
    }
  }
  if (splitIdx > 0) {
    return {
      first: lines.slice(0, splitIdx).join("\n"),
      second: lines.slice(splitIdx).join("\n"),
    };
  }
  return { first: content, second: null };
}
