import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 px-8">{children}</main>
    </div>
  );
}
