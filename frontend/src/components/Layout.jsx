import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children, title }) {
  return (
    <div className="min-h-screen mesh-bg flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar title={title} />
        <main className="flex-1 p-6 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
