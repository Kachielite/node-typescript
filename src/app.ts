import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import Controller from "./utils/interfaces/controller.interface";
import ErrorMiddleware from "./middleware/error.middleware";

class App {
  public express: Application;
  public port: number;

  constructor(controllers: Controller[], port: number) {
    this.express = express();
    this.port = port;

    this.initializeMiddleware();
    this.initializeControllers(controllers);
    this.initializeDatabaseConnection();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.express.use(cors());
    this.express.use(helmet());
    this.express.use(morgan("dev"));
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(compression());
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller: Controller) => {
      this.express.use("/api", controller.router);
    });
  }

  private initializeDatabaseConnection(): void {
    const { MONGO_PATH, MONGO_USER, MONGO_PASSWORD } = process.env;
    mongoose.connect(
      `mongo+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`
    );
  }

  private initializeErrorHandling(): void {
    this.express.use(ErrorMiddleware);
  }

  public listen(): void {
    this.express.listen(this.port, () => {
      console.log(`App is listening ${this.port}`);
    });
  }
}

export default App;
