import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from "aws-amplify";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import '@aws-amplify/ui-react/styles.css';
import outputs from "../amplify_outputs.json";

import App from "./App.tsx";
import CreateNewGroup from "./CreateNewGroup.tsx"
import ManageGroup from "./ManageGroup.tsx"

Amplify.configure(outputs);

const router = createBrowserRouter([
  { path: "/", element: <App/> },
  { path: "/new-group", element: <CreateNewGroup/> },
  { path: "/manage-group", element: <ManageGroup/> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <Authenticator> */}
    <Authenticator hideSignUp={true} components={{SignUp: () => null}}>
      <RouterProvider router={router} />
    </Authenticator>
  </React.StrictMode>
);
