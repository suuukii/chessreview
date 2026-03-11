import { Metadata } from "next";

export const metadata : Metadata = {
  title : 'ChesReview',

  icons : {
    icon : '/imgs/icon.png'
  },

  alternates : {
    languages : {
      'en-US' : 'en-US'
    }
  }
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
