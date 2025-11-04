import Navbar from "@/components/organisms/Navbar";
import NavbarMobile from "@/components/organisms/NavbarMobile";
import MainContent from "@/components/molecules/MainContent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row">
      <Navbar />
      <NavbarMobile />
      <MainContent>{children}</MainContent>
    </div>
  );
}
