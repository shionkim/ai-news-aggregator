import Navbar from "@/components/organisms/Navbar";
import MainContent from "@/components/molecules/MainContent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row">
      <Navbar />
      <MainContent>{children}</MainContent>
    </div>
  );
}
