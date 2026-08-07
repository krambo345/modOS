export function bootstrapBrowserDetect() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Firefox")) {
    return "Firefox";
  } else if (userAgent.includes("Edge")) {
    return "Edge";
  } else if (userAgent.includes("Safari")) {
    return "Safari";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    return "Opera";
  } else if (userAgent.includes("Chrome")) {
    return "Chrome";
  } else {
    return "Unknown";
  }
}
