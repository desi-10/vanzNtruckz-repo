import fs from "fs";
import path from "path";
import yaml from "yaml";
import { createSwaggerSpec } from "next-swagger-doc";

const loadYamlFiles = (directory: string) => {
  if (!fs.existsSync(directory)) {
    console.error(`❌ Directory not found: ${directory}`);
    return { paths: {} };
  }

  const files = fs.readdirSync(directory);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergedYaml: any = { paths: {} };

  files.forEach((file) => {
    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory()) {
      const subYaml = loadYamlFiles(filePath);
      Object.keys(subYaml.paths || {}).forEach((path) => {
        if (!mergedYaml.paths[path]) {
          mergedYaml.paths[path] = {};
        }
        Object.assign(mergedYaml.paths[path], subYaml.paths[path]);
      });
    } else if (file.endsWith(".yaml")) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf8");
        const parsedYaml = yaml.parse(fileContent);

        if (!parsedYaml || !parsedYaml.paths) {
          console.error(`❌ Invalid YAML structure in: ${filePath}`);
          return;
        }

        console.log(`✅ Loaded YAML file: ${filePath}`);

        Object.keys(parsedYaml.paths).forEach((path) => {
          if (!mergedYaml.paths[path]) {
            mergedYaml.paths[path] = {};
          }

          // Merge HTTP methods under the same path
          Object.entries(parsedYaml.paths[path]).forEach(
            ([method, details]) => {
              mergedYaml.paths[path][method] = details;
            }
          );
        });
      } catch (error) {
        console.error(`❌ Error parsing YAML file: ${filePath}`, error);
      }
    }
  });

  return mergedYaml;
};

export const getApiDocs = async () => {
  const yamlDocs = loadYamlFiles(path.join("src/docs"));

  const spec = createSwaggerSpec({
    apiFolder: "./src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "VanzNTruckz API",
        description: "VanzNTruckz API Documentation",
        version: "1.0",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ BearerAuth: [] }],
      paths: yamlDocs.paths, // Merged paths from all YAML files
    },
  });

  return spec;
};
