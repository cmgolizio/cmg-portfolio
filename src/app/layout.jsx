import "./globals.css";
import Nav from "@/components/nav/Nav";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Christopher Golizio | Portfolio",
  description: "Handcrafted web experiences by Christopher Golizio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      {/* <body className='min-h-screen bg-[#FAF7F2] text-[#1A1A1A] antialiased'> */}
      <body
        className='min-h-screen bg-[#FAF7F2] text-[#1A1A1A]
  dark:bg-[#1A1A1A] dark:text-[#FAF7F2] antialiased'
      >
        <div className='flex min-h-screen flex-col'>
          <Nav />
          <main className='flex-1'>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
