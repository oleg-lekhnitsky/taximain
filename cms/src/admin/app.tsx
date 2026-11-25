import designTokens from "./design-tokens.json";
import "./design-tokens.css";
import { markAuthLogoTheme } from "./auth-logo";
import { markPreviewSections } from "./preview-sections";
import { ContentChecksPanel } from "./components/ContentChecks";
import { markContentEditor } from "./content-editor";
import type { StrapiApp } from "@strapi/strapi/admin";
import type { ContentManagerPlugin } from "@strapi/content-manager/strapi-admin";
import { LivePreviewPanel } from "./components/LivePreview";
import { darkTheme, lightTheme } from "@strapi/design-system";
import authLogo from "./assets/wb-taxi-auth.svg";
import menuLogo from "./assets/wb-mark.svg";
import "./styles.css";
import { translateEditorLabels } from "./translations";
import { markLinkPresets } from "./link-presets";
import { markFieldLabels } from "./field-labels";

export default {
  config: {
    auth: { logo: authLogo },
    menu: { logo: menuLogo },
    locales: ["ru"],
    theme: {
      light: {
        ...lightTheme,
        borderRadius: designTokens["size-10"],
        colors: {
          ...lightTheme.colors,
          primary100: designTokens["color-fff0ff"],
          primary200: designTokens["color-control"],
          primary500: designTokens["color-c000d8"],
          primary600: designTokens["color-b000c8"],
          primary700: designTokens["color-8c00a3"],
          buttonPrimary500: designTokens["color-9900b0"],
          buttonPrimary600: designTokens["color-b000c8"],
          buttonNeutral0: designTokens["color-white"],
          alternative100: designTokens["color-f5edff"],
          alternative200: designTokens["color-e7d5ff"],
          alternative500: designTokens["color-link"],
          alternative600: designTokens["color-8421d4"],
          alternative700: designTokens["color-6615ac"],
          neutral100: designTokens["color-f5f5f5"],
          neutral150: designTokens["color-ededed"],
          neutral200: designTokens["color-e0e0e0"],
        },
        shadows: {
          ...lightTheme.shadows,
          focus: `0 0 0 ${designTokens["size-2"]} ${designTokens["color-control"]}`,
          focusShadow: `0 0 0 ${designTokens["size-2"]} ${designTokens["color-control"]}`,
          tableShadow: `0 ${designTokens["size-2"]} ${designTokens["size-12"]} ${designTokens["color-0-0-0-5"]}`,
        },
      },
      dark: {
        ...darkTheme,
        borderRadius: designTokens["size-10"],
        colors: {
          ...darkTheme.colors,
          primary100: designTokens["color-24153d"],
          primary200: designTokens["color-493078"],
          primary500: designTokens["color-violet-light"],
          primary600: designTokens["color-c3a6ff"],
          primary700: designTokens["color-dacaff"],
          buttonPrimary500: designTokens["color-violet"],
          buttonPrimary600: designTokens["color-5410df"],
          buttonNeutral0: designTokens["color-white"],
          alternative100: designTokens["color-24153d"],
          alternative200: designTokens["color-493078"],
          alternative500: designTokens["color-violet-light"],
          alternative600: designTokens["color-c3a6ff"],
          alternative700: designTokens["color-dacaff"],
          neutral0: designTokens["color-1c1c1c"],
          neutral100: designTokens["color-121212"],
          neutral150: designTokens["color-262626"],
          neutral200: designTokens["color-383838"],
        },
        shadows: {
          ...darkTheme.shadows,
          focus: `0 0 0 ${designTokens["size-2"]} ${designTokens["color-violet-light"]}`,
          focusShadow: `0 0 0 ${designTokens["size-2"]} ${designTokens["color-violet-light"]}`,
        },
      },
    },
    translations: {
      en: {
        "Auth.form.welcome.title": "WB Taxi CMS",
        "Auth.form.welcome.subtitle": "Manage pages, news and tariffs.",
        "app.components.LeftMenu.navbrand.title": "WB Taxi CMS",
        "app.components.LeftMenu.navbrand.workplace": "Content workspace",
        "app.components.LeftMenu.logo.alt": "WB Taxi",
      },
      ru: {
        "Auth.form.welcome.title": "WB Taxi CMS",
        "Auth.form.welcome.subtitle":
          "Страницы, новости и тарифы — в одном месте.",
        "app.components.LeftMenu.navbrand.title": "WB Taxi CMS",
        "app.components.LeftMenu.navbrand.workplace": "Управление контентом",
        "app.components.LeftMenu.logo.alt": "WB Taxi",
      },
    },
  },
  register(app: StrapiApp) {
    app.customFields.register({
      name: "story-kind", type: "enumeration",
      intlLabel: { id: "wb.story-kind", defaultMessage: "Content type" },
      intlDescription: { id: "wb.story-kind.description", defaultMessage: "Card, article or link" },
      components: { Input: () => import("./components/StoryKind") },
    });
    app.customFields.register({
      name: "country-select", type: "enumeration",
      intlLabel: { id: "wb.country", defaultMessage: "Country" },
      intlDescription: { id: "wb.country.description", defaultMessage: "Country for this content" },
      components: { Input: () => import("./components/CountrySelect") },
    });
    app.customFields.register({
      name: "country-language", type: "enumeration",
      intlLabel: { id: "wb.language", defaultMessage: "Language" },
      intlDescription: { id: "wb.language.description", defaultMessage: "Languages supported in the selected country" },
      components: { Input: () => import("./components/CountryLanguage") },
    });
  },
  bootstrap(app: StrapiApp) {
    const manager = app.getPlugin("content-manager")
      .apis as ContentManagerPlugin["config"]["apis"];
    manager.addEditViewSidePanel([LivePreviewPanel, ContentChecksPanel]);
    document.body.classList.add("wb-taxi-admin");
    const favicon =
      document.querySelector<HTMLLinkElement>('link[rel="icon"]') ||
      document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/svg+xml";
    favicon.href = menuLogo;
    document.head.appendChild(favicon);

    // Section labels are generated by Strapi; mark them without relying on
    // generated styled-components classes or changing ordinary field labels.
    const markSectionTitles = () => {
      document
        .querySelectorAll<HTMLLabelElement>("main label")
        .forEach((label) => {
          const text = (label.dataset.wbOriginalLabel || label.textContent?.replace(/\*/g, "").trim()) || "";
          label.toggleAttribute(
            "data-wb-section-title",
            /^(0[1-7]\.\s|Header and navigation$|Footer$|Cookie notice$|Шапка и навигация$|Подвал сайта$|Уведомление о cookies$)/.test(
              text,
            ),
          );
        });
    };
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        markAuthLogoTheme();
        markSectionTitles();
        markFieldLabels();
        markLinkPresets();
        translateEditorLabels();
        markContentEditor();
        markPreviewSections();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    markAuthLogoTheme();
    markSectionTitles();
    markFieldLabels();
    markLinkPresets();
    translateEditorLabels();
    markContentEditor();
    markPreviewSections();
  },
};
