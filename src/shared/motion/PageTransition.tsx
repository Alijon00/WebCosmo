import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pageVariants } from "./motion";

/** Wraps a route element in the shared fade+rise transition. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={pageVariants}
      initial={reduce ? false : "initial"}
      animate="enter"
      exit={reduce ? undefined : "exit"}
      style={{ minHeight: "60vh" }}
    >
      {children}
    </motion.div>
  );
}
