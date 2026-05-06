import Navbar from './Navbar';
import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>ChokDee - แพลตฟอร์มวิเคราะห์หวยและความเชื่อ</title>
        <meta name="description" content="All-in-One Platform ที่รวมสถิติและความเชื่อเข้าด้วยกัน" />
      </Head>
      <div className="min-h-screen pb-20 md:pb-0">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4">
          {children}
        </main>
      </div>
    </>
  );
}
