import { Link } from "react-router-dom";

export const redirectTo = (to: string) => ({
  to,
  component: Link as any
});
