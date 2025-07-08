import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getKonfis } from '../services/konfi';
import { getActivities } from '../services/activity';
import { getBadges } from '../services/badge';
import { getActivityRequests } from '../services/activityRequest';
import { getJahrgaenge } from '../services/jahrgang';
import { checkAuth } from '../services/auth';

const AppContext = createContext();

const initialState = {
  user: checkAuth(),
  loading: false,
  error: '',
  success: '',
  
  konfis: [],
  activities: [],
  badges: [],
  activityRequests: [],
  jahrgaenge: [],
  
  loadingStates: {
    konfis: false,
    activities: false,
    badges: false,
    activityRequests: false,
    jahrgaenge: false
  },
  
  filters: {
    selectedJahrgang: 'alle',
    searchTerm: '',
    statusFilter: 'alle'
  },
  
  ui: {
    sidebarOpen: false,
    activeModal: null,
    selectedItem: null
  }
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
      
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_SUCCESS':
      return { ...state, success: action.payload };
      
    case 'SET_KONFIS':
      return { ...state, konfis: action.payload };
      
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
      
    case 'SET_BADGES':
      return { ...state, badges: action.payload };
      
    case 'SET_ACTIVITY_REQUESTS':
      return { ...state, activityRequests: action.payload };
      
    case 'SET_JAHRGAENGE':
      return { ...state, jahrgaenge: action.payload };
      
    case 'SET_LOADING_STATE':
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.key]: action.payload
        }
      };
      
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
      
    case 'UPDATE_UI':
      return {
        ...state,
        ui: { ...state.ui, ...action.payload }
      };
      
    case 'ADD_KONFI':
      return {
        ...state,
        konfis: [...state.konfis, action.payload]
      };
      
    case 'UPDATE_KONFI':
      return {
        ...state,
        konfis: state.konfis.map(k => 
          k.id === action.payload.id ? { ...k, ...action.payload } : k
        )
      };
      
    case 'REMOVE_KONFI':
      return {
        ...state,
        konfis: state.konfis.filter(k => k.id !== action.payload)
      };
      
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [...state.activities, action.payload]
      };
      
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(a => 
          a.id === action.payload.id ? { ...a, ...action.payload } : a
        )
      };
      
    case 'REMOVE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter(a => a.id !== action.payload)
      };
      
    case 'UPDATE_ACTIVITY_REQUEST':
      return {
        ...state,
        activityRequests: state.activityRequests.map(r => 
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        )
      };
      
    default:
      return state;
  }
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children, value: propValue }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setUser = (user) => dispatch({ type: 'SET_USER', payload: user });
  const setLoading = (loading) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error) => dispatch({ type: 'SET_ERROR', payload: error });
  const setSuccess = (success) => dispatch({ type: 'SET_SUCCESS', payload: success });

  const setLoadingState = (key, loading) => {
    dispatch({ type: 'SET_LOADING_STATE', key, payload: loading });
  };

  const updateFilters = (filters) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  };

  const updateUI = (uiState) => {
    dispatch({ type: 'UPDATE_UI', payload: uiState });
  };

  const loadKonfis = async () => {
    try {
      setLoadingState('konfis', true);
      const data = await getKonfis();
      dispatch({ type: 'SET_KONFIS', payload: data });
    } catch (err) {
      setError('Fehler beim Laden der Konfis');
    } finally {
      setLoadingState('konfis', false);
    }
  };

  const loadActivities = async () => {
    try {
      setLoadingState('activities', true);
      const data = await getActivities();
      dispatch({ type: 'SET_ACTIVITIES', payload: data });
    } catch (err) {
      setError('Fehler beim Laden der Aktivitäten');
    } finally {
      setLoadingState('activities', false);
    }
  };

  const loadBadges = async () => {
    try {
      setLoadingState('badges', true);
      const data = await getBadges();
      dispatch({ type: 'SET_BADGES', payload: data });
    } catch (err) {
      setError('Fehler beim Laden der Badges');
    } finally {
      setLoadingState('badges', false);
    }
  };

  const loadActivityRequests = async () => {
    try {
      setLoadingState('activityRequests', true);
      const data = await getActivityRequests();
      dispatch({ type: 'SET_ACTIVITY_REQUESTS', payload: data });
    } catch (err) {
      setError('Fehler beim Laden der Aktivitäts-Anfragen');
    } finally {
      setLoadingState('activityRequests', false);
    }
  };

  const loadJahrgaenge = async () => {
    try {
      setLoadingState('jahrgaenge', true);
      const data = await getJahrgaenge();
      dispatch({ type: 'SET_JAHRGAENGE', payload: data });
    } catch (err) {
      setError('Fehler beim Laden der Jahrgänge');
    } finally {
      setLoadingState('jahrgaenge', false);
    }
  };

  const refreshAll = async () => {
    if (state.user?.type === 'admin') {
      await Promise.all([
        loadKonfis(),
        loadActivities(),
        loadBadges(),
        loadActivityRequests(),
        loadJahrgaenge()
      ]);
    } else if (state.user?.type === 'konfi') {
      await Promise.all([
        loadActivities(),
        loadBadges()
      ]);
    }
  };

  useEffect(() => {
    if (state.user) {
      refreshAll();
    }
  }, [state.user]);

  const value = {
    ...state,
    dispatch,
    setUser,
    setLoading,
    setError,
    setSuccess,
    updateFilters,
    updateUI,
    loadKonfis,
    loadActivities,
    loadBadges,
    loadActivityRequests,
    loadJahrgaenge,
    refreshAll
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;