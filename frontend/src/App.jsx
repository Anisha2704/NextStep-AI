import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store/store';
import AppRoutes from './routes/AppRoutes';
import { fetchCurrentUser } from './store/slices/authSlice';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  if (token && loading) {
    return <LoadingSpinner fullScreen message="Restoring session..." />;
  }

  return children;
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInitializer>
          <AppRoutes />
        </AppInitializer>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
