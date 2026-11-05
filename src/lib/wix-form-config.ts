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
  link: "website_or_social_media",
  about: "about_the_popup",
  city: "current_city",
  connection: "connection_to_el_cerrito",
  permit: "health_permit",
  payment: "accepts_payment",
} as const;

/** Stable Wix field targets for the Event Host Inquiry form. */
export const HOST_FORM_FIELDS = {
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  use: "use_of_space",
  when: "preferred_date_time",
  people: "people",
  catering: "outside_catering",
  needs: "space_needs",
  about: "about_the_event",
  notes: "additional_information",
} as const;
