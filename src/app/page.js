import { UrlShortenerForm } from '@/components/url-shortener-form';

export default function Home() {
  return (
    <div className="container py-12 md:py-24 lg:py-32">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Shorten, Share, and Track Your Links
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Create short, memorable links and gain valuable insights with our powerful analytics.
          </p>
        </div>
      </div>
      
      <UrlShortenerForm />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-4 bg-primary/10 rounded-full">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Easy Link Shortening</h3>
          <p className="text-muted-foreground">
            Transform long URLs into short, memorable links with just a click.
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-4 bg-primary/10 rounded-full">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 20v-6" />
              <path d="M6 20V10" />
              <path d="M18 20V4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Detailed Analytics</h3>
          <p className="text-muted-foreground">
            Track clicks, analyze geographic data, and measure link performance.
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-4 bg-primary/10 rounded-full">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Secure & Reliable</h3>
          <p className="text-muted-foreground">
            Your links are secure, fast, and always available when you need them.
          </p>
        </div>
      </div>
    </div>
  );
}
