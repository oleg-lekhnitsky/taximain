import assert from "node:assert/strict";
import { applySharedSettings } from "../src/lib/cms/shared.ts";
const original = {
 headerSection: { faqLabel: "Questions", partnersLabel: "Local partners" },
 cookieSection: { message: [{ type: "paragraph", children: [{ type: "text", text: "Cookies" }] }] },
 featuresSection: { carouselLabel: "Carousel" },
 sharedBaseline: { header: { faqLabel: "Questions", partnersLabel: "Partners" }, accessibility: { carouselLabel: "Carousel" }, cookie: { message: [{ children: [{ text: "Cookies", type: "text" }], type: "paragraph" }] } },
};
const updated = applySharedSettings(original, { documentId: "settings", language: "ru", header: { faqLabel: "New questions", partnersLabel: "New partners" }, accessibility: { carouselLabel: "New carousel" }, cookie: { message: [{ type: "paragraph", children: [{ type: "text", text: "New cookies" }] }] } });
assert.equal(updated.headerSection.faqLabel, "New questions");
assert.equal(updated.headerSection.partnersLabel, "Local partners", "Country-specific override was overwritten");
assert.equal(updated.featuresSection.carouselLabel, "New carousel");
assert.equal(updated.cookieSection.message[0].children[0].text, "New cookies");
assert.equal(original.headerSection.faqLabel, "Questions", "Original page was mutated");
assert.equal(applySharedSettings(original), original);
console.log("Shared settings passed: inherited updates, country overrides, rich-text equality and immutable source.");
