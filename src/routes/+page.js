// src/routes/+page.js
export async function load({ fetch }) {
  const res = await fetch('/index.json');
  if (!res.ok) {
    throw new Error(`Failed to load resume data: ${res.status}`);
  }
  const resume = await res.json();
  return { resume };
}