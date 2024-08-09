export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Streamline Your Financial Research</h2>
          <p className="text-xl text-gray-700 mb-8">
            Access, analyze, and annotate SEC filings for all US-listed companies in one place.
          </p>
          
          <a href="/register" className="inline-block bg-blue-600 text-white text-lg font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-300 mb-12">
            Start Your Research Now
          </a>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Comprehensive Filing Access</h3>
              <p className="text-gray-600">Browse and search through filings for all US-listed companies, ensuring you have the data you need at your fingertips.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Integrated Note-Taking</h3>
              <p className="text-gray-600">Take detailed notes on each filing, capturing your insights and observations directly alongside the source material.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Organized Research</h3>
              <p className="text-gray-600">Keep your notes and research organized, allowing you to focus on analysis without worrying about information management.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Flexible Sharing Options</h3>
              <p className="text-gray-600">Share your research insights with others, either publicly or privately, fostering collaboration and knowledge exchange.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}