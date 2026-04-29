import { Plane, Calendar, MapPin, Users } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plane className="h-8 w-8" />
            <h1 className="text-2xl font-bold italic">SkyBound</h1>
          </div>
          <nav>
            <ul className="flex gap-6 font-medium">
              <li className="hover:text-accent cursor-pointer">Explore</li>
              <li className="hover:text-accent cursor-pointer">My Bookings</li>
              <li className="hover:text-accent cursor-pointer">Support</li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-5xl font-extrabold mb-6">Your Journey Starts Here</h2>
            <p className="text-xl mb-10 opacity-90">Find the best deals on flights worldwide with SkyBound.</p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-5xl mx-auto flex flex-wrap gap-4 items-end text-gray-800">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> From
                </label>
                <input type="text" placeholder="Origin City" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> To
                </label>
                <input type="text" placeholder="Destination City" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Date
                </label>
                <input type="date" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Travelers
                </label>
                <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                  <option>1 Adult</option>
                  <option>2 Adults</option>
                  <option>Family</option>
                </select>
              </div>
              <button className="bg-accent hover:bg-yellow-500 text-primary font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md">
                Search Flights
              </button>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <section className="container mx-auto py-16 px-4">
          <h3 className="text-3xl font-bold mb-8 text-gray-800 border-l-4 border-accent pl-4">Popular Destinations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl transition-shadow bg-white">
                <div className="h-48 bg-gray-200 relative">
                   <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-0 transition-opacity"></div>
                   <img src={`https://source.unsplash.com/random/800x600?city,${i}`} alt="City" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold mb-2">City Name {i}</h4>
                  <p className="text-gray-600 text-sm mb-4">Explore the beauty and culture of this amazing destination.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-bold text-lg">From $299</span>
                    <button className="text-secondary font-semibold hover:underline">View Deals</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white mb-4">
              <Plane className="h-6 w-6" />
              <span className="text-xl font-bold italic">SkyBound</span>
            </div>
            <p className="text-sm">Making world travel accessible and affordable for everyone.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li>About Us</li>
              <li>Careers</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Support</h5>
            <ul className="space-y-2 text-sm">
              <li>Help Center</li>
              <li>Contact Support</li>
              <li>Refund Policy</li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Newsletter</h5>
            <div className="flex">
              <input type="email" placeholder="Your email" className="bg-gray-800 p-2 rounded-l-lg outline-none w-full" />
              <button className="bg-primary text-white px-4 rounded-r-lg">Join</button>
            </div>
          </div>
        </div>
        <div className="container mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-xs">
          © 2026 SkyBound Airlines. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
