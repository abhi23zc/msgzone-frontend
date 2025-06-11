export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="min-h-screen w-full bg-[url('/assets/bg.png')] bg-cover bg-center bg-no-repeat">
        {children}
      </main>
    </>
  );
}
