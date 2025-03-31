import fs from "fs";
import path from "path";
import yaml from "yaml";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadYamlFiles = (directory: string): { paths: Record<string, any> } => {
  if (!fs.existsSync(directory)) {
    console.error(`❌ Directory not found: ${directory}`);
    return { paths: {} };
  }

  const files = fs.readdirSync(directory);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergedYaml: { paths: Record<string, any> } = { paths: {} };

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    if (fs.statSync(filePath).isDirectory()) {
      const subYaml = loadYamlFiles(filePath);
      Object.assign(mergedYaml.paths, subYaml.paths);
    } else if (file.endsWith(".yaml")) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf8");
        const parsedYaml = yaml.parse(fileContent);

        if (!parsedYaml || !parsedYaml.paths) {
          console.error(`❌ Invalid YAML structure in: ${filePath}`);
          return;
        }

        console.log(`✅ Loaded YAML file: ${filePath}`);
        Object.assign(mergedYaml.paths, parsedYaml.paths);
      } catch (error) {
        console.error(`❌ Error parsing YAML file: ${filePath}`, error);
      }
    }
  });

  return mergedYaml;
};

// Load and merge all YAML files
const yamlDocs = loadYamlFiles(path.join(__dirname, "../src/docs"));

// Write the merged YAML to a JSON file
const outputPath = path.join(__dirname, "../src/docs/swagger.json");
fs.writeFileSync(outputPath, JSON.stringify(yamlDocs, null, 2));

console.log("✅ Swagger JSON generated successfully!");
