import "server-only";

/** Stable Wix field targets for the Newsletter Subscription form. */
export const NEWSLETTER_FORM_FIELDS = {
  email: "form_field_2415",
} as const;

/** Stable Wix field targets for the Maker Application form. */
export const MAKER_FORM_FIELDS = {
  firstName: "first_name",
  lastName: "last_name",
  businessName: "business_name",
  email: "email",
  workLink: "work_link",
  about: "about",
  city: "city",
  connection: "connection",
  wholesale: "wholesale",
  pricing: "pricing",
} as const;

/** Stable Wix field targets for the Popup Application form. */
export const POPUP_FORM_FIELDS = {
  firstName: "first_name",
  lastName: "last_name",
  businessName: "business_name",
  email: "email",
  link: "link",
  about: "about",
  city: "city",
  connection: "connection",
  permit: "health_permit",
  payment: "payment",
} as const;
