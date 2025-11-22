import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import "./global.css";

import App from "./App.jsx";
import Homepage from "./pages/Homepage.jsx";
import NotFound from "./pages/NotFound.jsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      errorElement: <NotFound />,

      children: [
        { index: true, element: <Homepage /> }
      ],
    },
  ],

  {
    basename: "/full_stack-jobtrace/"
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);