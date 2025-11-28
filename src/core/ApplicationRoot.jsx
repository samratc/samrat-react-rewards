import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import applicationRoutes from "../config/applicationRoutes.jsx";
import TopNavigationBar from "../ui/navigation/TopNavigationBar.jsx";

export default function ApplicationRoot() {
  const routeElements = useRoutes(applicationRoutes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      <TopNavigationBar />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                <div className="text-gray-600 text-lg font-medium">Loading…</div>
              </div>
            </div>
          }
        >
          {routeElements}
        </Suspense>
      </main>
    </div>
  );
}
