import swaggerAutogen from "swagger-autogen";


const doc = {

    info:{
        title: "MicroMart Auth Service",
        description: "API documentation for the MicroMart Auth Service",
        version: "1.0.0"
    },
    host: "localhost:6001",
    schemes: ["http"],


    }


    const outputFile = "./swagger.json";
    const endpointsFiles = ["./routes/auth.router.ts"];

    swaggerAutogen()(outputFile, endpointsFiles, doc)