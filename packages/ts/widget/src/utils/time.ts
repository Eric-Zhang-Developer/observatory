import { debug } from "@/internal/logger";

// Naive check if string is valid date ("valid" here just means it looks like a date string)
function isValidDateString(maybeDateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  return regex.test(maybeDateString);
}

export const recursivelyInjectDateFields = (fields: unknown): unknown => {
  if (Array.isArray(fields)) {
    return fields.map((item) => recursivelyInjectDateFields(item));
  } else if (fields && typeof fields === "object") {
    const newFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === "string" && isValidDateString(value)) {
        try {
          newFields[key] = new Date(value);
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          debug(`Failed to parse date string "${value}": ${errorMsg}`);
          newFields[key] = value;
        }
      } else {
        newFields[key] = recursivelyInjectDateFields(value);
      }
    }
    return newFields;
  } else {
    return fields;
  }
};

export const getAgoString = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 1000) { // 1 second 
    return "just now";
  } else if (diff < 60000) { // 1 minute 
    return `${Math.floor(diff / 1000)}s ago`;
  } else if (diff < 3600000) {  // 1 hour 
    return `${Math.floor(diff / 60000)}m ago`;
  } else if (diff < 86400000) { // 1 day
    return `${Math.floor(diff / 3600000)}h ago`;
  } else if (diff < 604800000) { // 1 week
    return `${Math.floor(diff / 86400000)}d ago`;
  } else if (diff < 2592000000) {  // 1 month
    return `${Math.floor(diff / 604800000)}w ago`;
  } else if (diff < 31536000000) { // 1 year
    return `${Math.floor(diff / 2592000000)}mo ago`;
  } else { // Over 1 year 
    return `${Math.floor(diff / 31536000000)}y ago`;
  }
};

export const nanosToSeconds = (nanos: number, toFixed: number = 3) => {
  return Number((nanos / 1000000000).toFixed(toFixed));
};

export const getMsToFinish = (attributes: Record<string, unknown>) => {
  try {
    const msToFinish = attributes["ai.response.msToFinish"] as number;
    return msToFinish;
  } catch (error) {
    return null;
  }
};

export const formatDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
