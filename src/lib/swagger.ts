import { createSwaggerSpec } from "next-swagger-doc";
import yamlDocs from "@/docs/swagger.json"; // Pre-generated JSON

export const getApiDocs = async () => {
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
      paths: yamlDocs.paths,
    },
  });

  return spec;
};
