import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export async function load({ fetch, url }) {
  const gistId = url.searchParams.get('gist');
  let resume = null;

  try {
    // 1. Fetch from Gist OR local index.json
    if (gistId) {
      const res = await fetch(`https://api.github.com/gists/${gistId}`);
      if (!res.ok) throw new Error(`GitHub Gist not found or API limit reached (Status: ${res.status})`);
      
      const gistData = await res.json();
      
      // Look for a .json file in the gist, otherwise fallback to the first file
      const fileKey = Object.keys(gistData.files).find(k => k.endsWith('.json')) || Object.keys(gistData.files)[0];
      
      if (!fileKey) throw new Error("No files found in this Gist.");
      
      try {
        resume = JSON.parse(gistData.files[fileKey].content);
      } catch (e) {
        throw new Error("The Gist content is not valid JSON.");
      }
    } else {
      const res = await fetch('/index.json');
      if (!res.ok) throw new Error(`Failed to load local index.json (Status: ${res.status})`);
      resume = await res.json();
    }

    // 2. Fetch the Official JSONResume Schema
    const schemaRes = await fetch('https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json');
    const schema = await schemaRes.json();

    delete schema.$schema; // Forces Ajv to ignore the old Draft-04 requirement

    // 3. Initialize AJV Validator
    // { strict: false } prevents crashes from older JSON schema draft versions
    const ajv = new Ajv({ strict: false, allErrors: true }); 
    addFormats(ajv);
    
    const validate = ajv.compile(schema);
    const isValid = validate(resume);

    // 4. Handle Validation Failure
    if (!isValid) {
      return {
        error: true,
        message: "Your JSON data does not match the official JSONResume schema.",
        details: validate.errors
      };
    }

    return { resume, error: false };

  } catch (err) {
    return {
      error: true,
      message: err.message || "An unknown error occurred while loading the resume.",
      details: []
    };
  }
}
