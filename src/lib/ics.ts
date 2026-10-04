import "server-only";

export type IcsEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end?: Date;
  created?: Date;
  updated?: Date;
  url?: string;
  canceled?: boolean;
};

const encoder = new TextEncoder();

function toIcsDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function safeUri(value: string): string {
  return value.replace(/[\r\n]/g, "");
}

/** RFC 5545 lines are limited to 75 UTF-8 octets, including continuation space. */
function foldLine(line: string): string {
  const chunks: string[] = [];
  let chunk = "";
  let limit = 75;

  for (const character of line) {
    if (encoder.encode(chunk + character).length > limit && chunk) {
      chunks.push(chunk);
      chunk = character;
      limit = 74;
    } else {
      chunk += character;
    }
  }

  chunks.push(chunk);
  return chunks.join("\r\n ");
}

export function createCalendar(events: IcsEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//El Cerrito Supply Co//Wix Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:El Cerrito Supply Co. Events",
  ];

  for (const event of events) {
    const timestamp = event.updated ?? event.created ?? event.start;

    lines.push(
      "BEGIN:VEVENT",
      `UID:wix-event-${event.id}@elcerritosupplyco.com`,
      `DTSTAMP:${toIcsDate(timestamp)}`,
      `DTSTART:${toIcsDate(event.start)}`,
    );

    if (event.end) lines.push(`DTEND:${toIcsDate(event.end)}`);
    if (event.created) lines.push(`CREATED:${toIcsDate(event.created)}`);
    if (event.updated) lines.push(`LAST-MODIFIED:${toIcsDate(event.updated)}`);

    lines.push(`SUMMARY:${escapeText(event.title)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    }
    if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
    if (event.url) lines.push(`URL:${safeUri(event.url)}`);
    if (event.canceled) lines.push("STATUS:CANCELLED");

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
