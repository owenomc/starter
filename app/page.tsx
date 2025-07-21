"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from './components/navbar';

export default function LandingPage() {
  return (
    <main className="relative h-screen w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth bg-[var(--background)] text-[var(--foreground)] font-sans">
      <Navbar />

      {/* Home Section */}
      <section
        id="home"
        className="relative snap-start h-screen flex items-center justify-center text-center px-6 bg-gray-50 text-white"
      >
        {/* Background div with background image */}
        <div
          className="absolute inset-0 z-0 bg-no-repeat bg-center bg-contain"
          style={{
            backgroundImage:
              'url("https://resource.logitechg.com/w_1600,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x/pro-headset-gallery-1.png?v=1")',
          }}
        ></div>

        {/* Content on top */}
        <div className="relative z-10 max-w-5xl mx-auto ">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight bg-black/50">
            Pure Power.
          </h1>
          <div className="flex justify-center gap-4">
            <Link
              href="#features"
              className="px-8 py-3 text-lg font-medium rounded-xl border-white text-white hover:bg-blue-800 hover:text-white transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative bg-gray-50 snap-start h-screen flex flex-col px-6 text-center overflow-hidden"
      >
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center">
          <h2 className="text-5xl font-bold mb-4 text-black">Top Features</h2>
          <p className="text-xl md:text-2xl text-gray-700 max-w-xl mb-4">
            The very best in audio technology
          </p>

          {[
            "Advanced Audio Drivers",
            "Most Comfortable Headset",
            "Long Cord for Gaming",
          ].map((text, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center bg-white rounded-xl shadow-md hover:scale-105 transition transform duration-300 mb-4 bg-no-repeat bg-center bg-cover h-20 w-3/4"
              style={{
                backgroundImage:
                  'url("af55db80-ac80-4ae0-8112-69472c000fd0.__CR0,0,1464,600_PT0_SX1464_V1___.jpg")',
              }}
            >
              <p className="text-md md:text-xl text-white bg-black/60 px-4 py-2 rounded text-center">
                {text}
              </p>
            </div>
          ))}

          <div className="flex justify-center gap-4">
            <Link
              href="#reviews"
              className="px-8 py-3 text-lg font-medium rounded-xl border-white text-black hover:bg-blue-800 hover:text-white transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section
        id="reviews"
        className="bg-gray-50 snap-start h-screen flex flex-col px-6 text-center"
      >
        <div className="flex-grow flex flex-col items-center justify-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-4">
            What People Are Saying
          </h2>
          <p className="text-md md:text-xl text-gray-600 max-w-xl mb-4">
            Hear from customers about their experience.
          </p>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-6xl mb-4">
            <div className="bg-white rounded-xl p-4 shadow-md hover:scale-105 transition">
              <p className="text-gray-700">
                This headset makes gaming awesome!
              </p>
              <p className="font-semibold">- Alex P.</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover:scale-105 transition">
              <p className="text-gray-700">
                Stop looking for a headset and get this!
              </p>
              <p className="font-semibold">- Samantha H.</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover:scale-105 transition">
              <p className="text-gray-700">
                I have never heard audio soooo clear!
              </p>
              <p className="font-semibold">- Josh L.</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link
              href="#product"
              className="px-8 py-3 text-lg font-medium rounded-xl border-white text-black hover:bg-blue-800 hover:text-white transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section
        id="products"
        className="bg-gray-50 snap-start h-screen flex flex-col px-2 text-center"
      >
        <div className="flex-grow flex flex-col items-center justify-center">
          {/** Define product name **/}
          {(() => {
            const name = "Logitech G Pro X";

            return (
              <>
                <h2 className="text-5xl md:text-7xl font-bold mb-4">
                  Made for you!
                </h2>
                <p className="text-lg md:text-xl max-w-xl text-gray-600 mb-4">
                  Built for gamers, creators, developers
                </p>
                <div className="grid grid-cols-1 gap-6">
                  <a
                    href="https://amzn.to/46OjXTn" // Amazon link
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition block"
                  >
                    <div className="relative w-52 h-52 mx-auto">
                      <Image
                        src="/logitechgprox.png"
                        alt={name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold">{name}</h3>
                      <p className="text-black underline">Buy Now</p>
                    </div>
                  </a>
                </div>
              </>
            );
          })()}
        </div>

        {/* Footer */}
        <footer className="mt-auto text-gray-500 text-sm text-center mb-4">
          <p>Amazon Affiliate</p>
          <p>&copy; {new Date().getFullYear()}. All rights reserved.</p>
        </footer>
      </section>
    </main>
  );
}
