import { Router } from "express";
import { adminRoutes } from "./adminRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { cartRoutes } from "./cartRoutes.js";
import { categoryRoutes } from "./categoryRoutes.js";
import { orderRoutes } from "./orderRoutes.js";
import { productRoutes } from "./productRoutes.js";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/products", productRoutes);
routes.use("/categories", categoryRoutes);
routes.use("/cart", cartRoutes);
routes.use("/orders", orderRoutes);
routes.use("/admin", adminRoutes);

export default routes;
