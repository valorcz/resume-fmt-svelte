import fs from 'fs';
import yaml from 'js-yaml';

// Define your input and output paths (adjust if your JSON is named differently)
const inputFile = './static/index.json';
const outputFile = './static/resume.yaml';

console.log(`⏳ Converting ${inputFile} to YAML...`);

try {
  // 1. Read and parse the JSON file
  if (!fs.existsSync(inputFile)) {
    throw new Error(`Could not find ${inputFile}. Please check the path.`);
  }
  const rawJson = fs.readFileSync(inputFile, 'utf8');
  const resumeData = JSON.parse(rawJson);

  // 2. Convert to YAML with formatting rules
  const yamlContent = yaml.dump(resumeData, {
    // Prevent line-wrapping for long strings (keeps paragraphs intact)
    lineWidth: -1, 
    // Prevent js-yaml from creating *ref anchors if it sees duplicate strings
    noRefs: true,  
    // Force multi-line strings (like 'summary') to use the | block style automatically
    styles: {
      '!!str': 'folded' 
    }
  });

  // 3. Write the new YAML file
  fs.writeFileSync(outputFile, yamlContent, 'utf8');
  
  console.log(`✅ Success! Your YAML resume is ready at: ${outputFile}`);
  console.log(`💡 You can now safely delete the old .json file.`);

} catch (error) {
  console.error(`❌ Error during conversion: ${error.message}`);
}