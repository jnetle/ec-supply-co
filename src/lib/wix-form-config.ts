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
  about: "about_the_popup",
  city: "current_city",
  connection: "connection_to_el_cerrito",
  wholesale: "wholesale",
  pricing: "pricing",
} as const;

/** Stable Wix field targets for the Popup Application form. */
export const POPUP_FORM_FIELDS = {
  firstName: "first_name",
  lastName: "last_name",
  businessName: "business_name",
  email: "email",
  link: "website_or_social_media",
  about: "about",
  city: "city",
  connection: "connection",
  permit: "health_permit",
  payment: "accepts_payment",
} as const;
