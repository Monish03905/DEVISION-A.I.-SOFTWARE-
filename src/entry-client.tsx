import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

import { getRouter } from "./router";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error('Missing root element with id "root"');
}

createRoot(rootElement).render(<RouterProvider router={getRouter()} />);