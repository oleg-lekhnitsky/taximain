import type { Schema, Struct } from '@strapi/strapi';

export interface NewsSupportArticle extends Struct.ComponentSchema {
  collectionName: 'components_news_support_articles';
  info: {
    description: 'Structured content preserving the existing support article layout.';
    displayName: 'Support article';
  };
  attributes: {
    appLinkLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    contactParagraph: Schema.Attribute.Text & Schema.Attribute.Required;
    helpAfter: Schema.Attribute.Text & Schema.Attribute.Required;
    helpBefore: Schema.Attribute.Text & Schema.Attribute.Required;
    helpHeading: Schema.Attribute.Text & Schema.Attribute.Required;
    helpLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    intro: Schema.Attribute.Text & Schema.Attribute.Required;
    qualityAfter: Schema.Attribute.Text & Schema.Attribute.Required;
    qualityBefore: Schema.Attribute.Text & Schema.Attribute.Required;
    qualityStrong: Schema.Attribute.Text & Schema.Attribute.Required;
    resolutionAfter: Schema.Attribute.Text & Schema.Attribute.Required;
    resolutionBefore: Schema.Attribute.Text & Schema.Attribute.Required;
    resolutionHeading: Schema.Attribute.Text & Schema.Attribute.Required;
    resolutionStrong: Schema.Attribute.Text & Schema.Attribute.Required;
    selectTrip: Schema.Attribute.Text & Schema.Attribute.Required;
    signature: Schema.Attribute.Text & Schema.Attribute.Required;
    thanks: Schema.Attribute.Text & Schema.Attribute.Required;
    tripsLabel: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface PageCashback extends Struct.ComponentSchema {
  collectionName: 'components_page_cashback_sections';
  info: {
    description: 'Content for the Cashback block on the website.';
    displayName: '04. Cashback';
  };
  attributes: {
    downloadsLabel: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
    downloadsText: Schema.Attribute.Text;
    downloadsValue: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    headingLine1: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    headingLine2: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    rate: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
    ratePrefix: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
    ratePrefixAfter: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
    rateText: Schema.Attribute.String;
    subtitle: Schema.Attribute.Text & Schema.Attribute.Required;
    terms: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface PageCities extends Struct.ComponentSchema {
  collectionName: 'components_page_cities_sections';
  info: {
    description: 'Content for the Cities block on the website.';
    displayName: '03. Cities';
  };
  attributes: {
    cities: Schema.Attribute.Component<'site.city', true>;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    headingLine1: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    headingLine2: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
  };
}

export interface PageCookie extends Struct.ComponentSchema {
  collectionName: 'components_page_cookie_sections';
  info: {
    description: 'Content for the Cookie notice block on the website.';
    displayName: 'Cookie notice';
  };
  attributes: {
    accessibilityLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    buttonLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    message: Schema.Attribute.Blocks & Schema.Attribute.Required;
    textAfterLink: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    textBeforeLink: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
  };
}

export interface PageDownload extends Struct.ComponentSchema {
  collectionName: 'components_page_download_sections';
  info: {
    description: 'Content for the App download block on the website.';
    displayName: '05. App download';
  };
  attributes: {
    appStoreLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    buttonLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    googlePlayLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    headingLine1: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    headingLine2: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    qrImageDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    scanAppLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    scanLine1: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    scanLine2: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    scanText: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface PageFaq extends Struct.ComponentSchema {
  collectionName: 'components_page_faq_sections';
  info: {
    description: 'Content for the FAQ block on the website.';
    displayName: '06. FAQ';
  };
  attributes: {
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    headingLine1: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    headingLine2: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    items: Schema.Attribute.Component<'site.faq', true>;
  };
}

export interface PageFeatures extends Struct.ComponentSchema {
  collectionName: 'components_page_features_sections';
  info: {
    description: 'Content for the Features block on the website.';
    displayName: '02. Features';
  };
  attributes: {
    arrivalCardLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    carouselLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    carouselPositionLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    headingLine1: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    headingLine2Accent: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    headingLine2Text: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    headingLine3: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    nextSlideLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    previousSlideLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    servicesCardLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    tariffsCardLabel: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface PageFooter extends Struct.ComponentSchema {
  collectionName: 'components_page_footer_sections';
  info: {
    description: 'Content for the Footer block on the website.';
    displayName: 'Footer';
  };
  attributes: {
    legalHeading: Schema.Attribute.Text & Schema.Attribute.Required;
    privacyPolicyLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    serviceRulesLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    tariffsLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    userAgreementLabel: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface PageHeader extends Struct.ComponentSchema {
  collectionName: 'components_page_header_sections';
  info: {
    description: 'Content for the Header and navigation block on the website.';
    displayName: 'Header and navigation';
  };
  attributes: {
    closeMenuLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    countryAndLanguageLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    countryLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    faqLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    languageLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    navigationLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    openMenuLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    partnersLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    versionLabel: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface PageHero extends Struct.ComponentSchema {
  collectionName: 'components_page_hero_sections';
  info: {
    description: 'Content for the Hero block on the website.';
    displayName: '01. Hero';
  };
  attributes: {
    buttonLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    location: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
        'content-type-builder': {
          visible: false;
        };
      }>;
    retinaImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
  };
}

export interface PageNews extends Struct.ComponentSchema {
  collectionName: 'components_page_news_sections';
  info: {
    description: 'Content for the News block on the website.';
    displayName: '07. News';
  };
  attributes: {
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    relatedNewsHeading: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SiteAccessibility extends Struct.ComponentSchema {
  collectionName: 'components_site_accessibility';
  info: {
    displayName: 'Accessibility';
  };
  attributes: {
    appStoreLabel: Schema.Attribute.Text;
    carouselLabel: Schema.Attribute.Text;
    carouselPositionLabel: Schema.Attribute.Text;
    googlePlayLabel: Schema.Attribute.Text;
    nextSlideLabel: Schema.Attribute.Text;
    previousSlideLabel: Schema.Attribute.Text;
    qrImageDescription: Schema.Attribute.Text;
  };
}

export interface SiteCity extends Struct.ComponentSchema {
  collectionName: 'components_site_cities';
  info: {
    displayName: 'City';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SiteCopy extends Struct.ComponentSchema {
  collectionName: 'components_site_copies';
  info: {
    description: 'Text fields and ordered text arrays used by the existing site layout.';
    displayName: 'Localized copy';
  };
  attributes: {
    appStore: Schema.Attribute.Text & Schema.Attribute.Required;
    carousel: Schema.Attribute.JSON & Schema.Attribute.Required;
    cashback: Schema.Attribute.JSON & Schema.Attribute.Required;
    cashbackSubtitle: Schema.Attribute.Text & Schema.Attribute.Required;
    cashbackTerms: Schema.Attribute.Text & Schema.Attribute.Required;
    closeMenu: Schema.Attribute.Text & Schema.Attribute.Required;
    conditions: Schema.Attribute.Text & Schema.Attribute.Required;
    cookiesAfter: Schema.Attribute.Text & Schema.Attribute.Required;
    cookiesBefore: Schema.Attribute.Text & Schema.Attribute.Required;
    cookiesLabel: Schema.Attribute.Text & Schema.Attribute.Required;
    daily: Schema.Attribute.JSON & Schema.Attribute.Required;
    download: Schema.Attribute.JSON & Schema.Attribute.Required;
    downloadButton: Schema.Attribute.Text & Schema.Attribute.Required;
    downloads: Schema.Attribute.JSON & Schema.Attribute.Required;
    faqNav: Schema.Attribute.Text & Schema.Attribute.Required;
    faqTitle: Schema.Attribute.JSON & Schema.Attribute.Required;
    features: Schema.Attribute.JSON & Schema.Attribute.Required;
    footer: Schema.Attribute.JSON & Schema.Attribute.Required;
    hero: Schema.Attribute.Text & Schema.Attribute.Required;
    legal: Schema.Attribute.Text & Schema.Attribute.Required;
    location: Schema.Attribute.Text;
    navigation: Schema.Attribute.Text & Schema.Attribute.Required;
    news: Schema.Attribute.Text & Schema.Attribute.Required;
    okay: Schema.Attribute.Text & Schema.Attribute.Required;
    openMenu: Schema.Attribute.Text & Schema.Attribute.Required;
    order: Schema.Attribute.JSON & Schema.Attribute.Required;
    partners: Schema.Attribute.Text & Schema.Attribute.Required;
    picker: Schema.Attribute.JSON & Schema.Attribute.Required;
    play: Schema.Attribute.Text & Schema.Attribute.Required;
    qrAlt: Schema.Attribute.Text & Schema.Attribute.Required;
    related: Schema.Attribute.Text & Schema.Attribute.Required;
    scan: Schema.Attribute.JSON & Schema.Attribute.Required;
    scanApp: Schema.Attribute.Text & Schema.Attribute.Required;
    upTo: Schema.Attribute.Text & Schema.Attribute.Required;
    upToAfter: Schema.Attribute.Boolean & Schema.Attribute.Required;
    version: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SiteFaq extends Struct.ComponentSchema {
  collectionName: 'components_site_faqs';
  info: {
    displayName: 'FAQ';
  };
  attributes: {
    answer: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
    answerContent: Schema.Attribute.Blocks;
    linkHref: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
    linkLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SiteLinks extends Struct.ComponentSchema {
  collectionName: 'components_site_links';
  info: {
    displayName: 'Download and legal links';
  };
  attributes: {
    appStoreUrl: Schema.Attribute.String;
    googlePlayUrl: Schema.Attribute.String;
    privacyPolicyUrl: Schema.Attribute.String;
    serviceRulesUrl: Schema.Attribute.String;
    userAgreementUrl: Schema.Attribute.String;
  };
}

export interface TariffEntry extends Struct.ComponentSchema {
  collectionName: 'components_tariff_entries';
  info: {
    displayName: 'Tariff entry';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface TariffSection extends Struct.ComponentSchema {
  collectionName: 'components_tariff_sections';
  info: {
    displayName: 'Tariff section';
  };
  attributes: {
    entries: Schema.Attribute.Component<'tariff.entry', true>;
    sectionId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'news.support-article': NewsSupportArticle;
      'page.cashback': PageCashback;
      'page.cities': PageCities;
      'page.cookie': PageCookie;
      'page.download': PageDownload;
      'page.faq': PageFaq;
      'page.features': PageFeatures;
      'page.footer': PageFooter;
      'page.header': PageHeader;
      'page.hero': PageHero;
      'page.news': PageNews;
      'site.accessibility': SiteAccessibility;
      'site.city': SiteCity;
      'site.copy': SiteCopy;
      'site.faq': SiteFaq;
      'site.links': SiteLinks;
      'tariff.entry': TariffEntry;
      'tariff.section': TariffSection;
    }
  }
}
