import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "MicroMart Product Service",
    description: "API documentation for the MicroMart Product Service",
    version: "1.0.0",
  },
  host: "localhost:6002",
  schemes: ["http"],
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./routes/product-router.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
