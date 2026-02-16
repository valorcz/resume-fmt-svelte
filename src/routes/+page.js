import Ajv from 'ajv-draft-04';
import addFormats from 'ajv-formats';
import { base } from '$app/paths';
import yaml from 'js-yaml';

export async function load({ fetch, url }) {
  const gistId = url.searchParams.get('gist');
  let resume = null;
  let format = 'yaml'; // Default to YAML for local loads

  try {
    // --- 1. FETCH & PARSE DATA ---
    if (gistId) {
      const res = await fetch(`https://api.github.com/gists/${gistId}`);
      if (!res.ok) throw new Error(`GitHub Gist not found (Status: ${res.status})`);
      
      const gistData = await res.json();
      
      // Smart file discovery: Look for .yaml, .yml, or .json
      const fileKey = Object.keys(gistData.files).find(k => k.match(/\.(ya?ml|json)$/i)) 
                   || Object.keys(gistData.files)[0];
      
      if (!fileKey) throw new Error("No files found in this Gist.");
      
      const rawContent = gistData.files[fileKey].content;
      
      try {
        // Detect format and parse accordingly
        if (fileKey.toLowerCase().endsWith('.json')) {
          format = 'json';
          resume = JSON.parse(rawContent);
        } else {
          format = 'yaml';
          resume = yaml.load(rawContent);
        }
      } catch (e) {
        throw new Error(`Failed to parse ${fileKey}. Ensure it is valid ${format.toUpperCase()}.`);
      }
    } else {
      // Local Fetch: Assumes you are using resume.yaml locally
      format = 'yaml';
      const res = await fetch(`${base}/resume.yaml`); 
      if (!res.ok) throw new Error(`Failed to load local resume.yaml (Status: ${res.status})`);
      
      const text = await res.text();
      resume = yaml.load(text);      
    }

    // --- 2. FETCH THE CONTEXT-AWARE SCHEMA ---
    const schemaUrl = format === 'json' 
      ? 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json'
      : 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json';
/*
      : 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json';
      : 'https://yamlresume.dev/schemas/v0.11.0/schema.json';
		*/

    const schemaRes = await fetch(schemaUrl);
    if (!schemaRes.ok) throw new Error(`Failed to fetch the validation schema from ${schemaUrl}`);
    
    const schema = await schemaRes.json();
    
    // Bypass strict versioning issues (works for both Draft-04 and newer YAML schemas)
    delete schema.$schema; 

    // --- 3. VALIDATE ---
    const ajv = new Ajv({ strict: false, allErrors: true }); 
    addFormats(ajv);
    
    const validate = ajv.compile(schema);
    const isValid = validate(resume);

    if (!isValid) {
      const schemaName = format === 'json' ? 'JSON Resume' : 'YAML Resume';
      return {
        error: true,
        message: `Your data does not match the official ${schemaName} schema.`,
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
