import fs from 'fs';
import yaml from 'js-yaml';

const inputFile = './static.backup/index.json';
const outputFile = './static/resume.yaml';

console.log(`⏳ Converting ${inputFile} to the official YAML Resume format...`);

try {
  if (!fs.existsSync(inputFile)) {
    throw new Error(`Could not find ${inputFile}. Please check the path.`);
  }
  const rawJson = fs.readFileSync(inputFile, 'utf8');
  let resume = JSON.parse(rawJson);

  // --- RULE 1 & 2: Move location and profiles to root ---
  if (resume.basics) {
    if (resume.basics.location) {
      resume.location = resume.basics.location;
      delete resume.basics.location;
    }
    if (resume.basics.profiles) {
      resume.profiles = resume.basics.profiles;
      delete resume.basics.profiles;
    }
    
    // --- RULE 3: Rename label to headline ---
    if (resume.basics.label) {
      resume.basics.headline = resume.basics.label;
      delete resume.basics.label;
    }
  }

  // --- RULE 4: Rename education studyType to degree ---
  if (resume.education && Array.isArray(resume.education)) {
    resume.education = resume.education.map(edu => {
      if (edu.studyType) {
        edu.degree = edu.studyType;
        delete edu.studyType;
      }
      return edu;
    });
  }

  // --- RULE 5: Merge highlights into summary as Markdown lists ---
  const mergeHighlights = (section) => {
    if (resume[section] && Array.isArray(resume[section])) {
      resume[section] = resume[section].map(item => {
        if (item.highlights && Array.isArray(item.highlights) && item.highlights.length > 0) {
          // Convert the array into a Markdown bulleted list
          const highlightsText = item.highlights.map(h => `- ${h}`).join('\n');
          
          // Append it to the summary, or create the summary if it doesn't exist
          item.summary = item.summary 
            ? `${item.summary}\n\n${highlightsText}` 
            : highlightsText;
            
          delete item.highlights;
        }
        return item;
      });
    }
  };

  mergeHighlights('work');
  mergeHighlights('volunteer');
  mergeHighlights('projects');

  // Convert the newly restructured object to YAML
  const yamlContent = yaml.dump(resume, {
    lineWidth: -1, // Prevent line-wrapping for long strings
    noRefs: true,  // Prevent anchors (*ref) for duplicate strings
    styles: {
      '!!str': 'folded' // Force multi-line strings to use the | block style
    }
  });

  fs.writeFileSync(outputFile, yamlContent, 'utf8');
  
  console.log(`✅ Success! Your YAML resume is perfectly structured and ready at: ${outputFile}`);

} catch (error) {
  console.error(`❌ Error during conversion: ${error.message}`);
}
