import { WowIcon } from '@/assets/icons/WowIcon';
import { useEffect, useState } from 'react';

const useQueryParams = () => {
  const [params, setParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return params;
};

const App: React.FC = () => {
  const queryParams = useQueryParams();
  const [view, setView] = useState<string>('');

  useEffect(() => {
    const state = queryParams.get('state');
    const error = queryParams.get('error');

    if (state) {
      setView('success');
    } else if (error) {
      setView(error);
    }
  }, [queryParams]);

  return (
    <div className="w-full h-full font-sans">
      <div className="flex flex-row items-center bg-muted">
        <div className="self-start mt-1 ml-1 fixed">
          <WowIcon className="fill-blizzard-yellow" />
        </div>
        <div className="m-auto pb-5 pt-5">
          {view === 'success' ? (
            <div className="flex flex-col items-center">
              <p className="font-bold text-chart-2">Success!</p>
              <p>Blizzard account now linked.</p>
              <p>You may now close this window.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <p className="font-bold text-chart-1">Error!</p>
              <p>Something went wrong.</p>
              <p>Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
