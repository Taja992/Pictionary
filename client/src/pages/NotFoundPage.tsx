import { Link, useRouteError } from 'react-router-dom';
import { HomeRoute } from '../routeConstants';

export default function NotFoundPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Oops!</h1>
        <p className="text-xl mb-6">Sorry, an unexpected error has occurred.</p>
        <p className="text-gray-600 mb-6">
          {(error as Error)?.message || 'Page not found'}
        </p>
        <div className="flex gap-4 justify-center">
          <button 
            className="btn btn-outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
          <Link to={HomeRoute} className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}