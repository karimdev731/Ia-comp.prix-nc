import Navbar2 from "@/components/Navbar2";
import PrivacyPolicy from "@/app/Terms/privacy-policy";
export default function Home() {
  return (
    <>
      <Navbar2 />
      <main className="min-h-screen bg-gray-200">
        <PrivacyPolicy />
      </main>
    </>
  );
}
