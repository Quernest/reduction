import { LocationDescriptor } from "history";
import { Link } from "react-router-dom";

export const redirectTo = (to: LocationDescriptor) => ({
  to,
  component: Link as any
});
