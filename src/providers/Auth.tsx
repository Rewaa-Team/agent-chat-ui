"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import { ReactNode } from "react";


Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_POOL_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
          scopes: [
            "phone",
            "email",
            "openid",
            "profile",
            "aws.cognito.signin.user.admin",
          ],
          redirectSignIn: [getCurrentUrl() || ""],
          redirectSignOut: [getCurrentUrl() + "/login" || ""],
          responseType: process.env.NEXT_PUBLIC_COGNITO_RESPONSE_TYPE as
            | "token"
            | "code",
        },
      },
    },
  },
});

function getCurrentUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <Authenticator
      hideSignUp
      socialProviders={["google"]}
    >
      {children}
    </Authenticator>
  );
};
